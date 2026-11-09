// DSGN-01 / DSGN-02: one source of colour, one family.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCAN_DIRS = ["styles", "components", "app"] as const;
const TOKENS_FILE = "styles/tokens.css";
const ONLY_FAMILY = "var(--font-sans)";
const RAW_HEX = /#[0-9a-fA-F]{3,8}\b/g;
const FONT_FAMILY = /font-family\s*:\s*([^;}]+)/g;
const FONT_SHORTHAND = /(?:^|[\s;{])font\s*:/g;
const COMMENT = /\/\*[\s\S]*?\*\//g;

// process.cwd(): jsdom breaks import.meta.url (see tests/vercel-config.test.ts).
const listCss = (dir: string): string[] => {
  const abs = join(process.cwd(), dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs, { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith(".css"))
    .map((name) => join(dir, name).split("\\").join("/"));
};

const guardedFiles = (): string[] =>
  SCAN_DIRS.flatMap(listCss).filter((file) => file !== TOKENS_FILE);

const source = (file: string): string =>
  readFileSync(join(process.cwd(), file), "utf8").replace(COMMENT, "");

const offenders = (pick: (css: string) => string[]): string[] =>
  guardedFiles().flatMap((file) =>
    pick(source(file)).map((hit) => `${file}: ${hit}`),
  );

describe("css-guard", () => {
  it("allows raw hex colours only in styles/tokens.css", () => {
    expect(offenders((css) => css.match(RAW_HEX) ?? [])).toEqual([]);
  });

  it("uses no font-family other than var(--font-sans)", () => {
    const stray = offenders((css) =>
      [...css.matchAll(FONT_FAMILY)]
        .map((m) => m[1].trim())
        .filter((value) => value !== ONLY_FAMILY),
    );
    expect(stray).toEqual([]);
  });

  it("never uses the font shorthand (it resets font-stretch)", () => {
    expect(
      offenders((css) => [...css.matchAll(FONT_SHORTHAND)].map((m) => m[0])),
    ).toEqual([]);
  });
});
