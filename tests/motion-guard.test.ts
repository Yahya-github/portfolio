// DSGN-04 / A11Y-04: one motion rule (no bounce, no overshoot) and every CSS duration from a token that reduced motion zeroes.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Y_LAG_MS } from "@/lib/letters/geometry";

const SCAN_DIRS = ["styles", "components", "app", "lib"] as const;
const TOKENS_FILE = "styles/tokens.css";
const BEZIER = /cubic-bezier\(\s*([^)]*)\)/g;
const TIMING_DECL = /(transition|animation)(-duration|-delay)?\s*:\s*([^;}]+)/g;
const LITERAL_TIME = /(^|[\s,(])\d*\.?\d+m?s\b/;
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

describe("motion-guard", () => {
  it("keeps every easing token inside the unit square", () => {
    const css = source(TOKENS_FILE);
    const beziers = [...css.matchAll(BEZIER)];
    expect(beziers.length).toBeGreaterThan(0);
    const bad = beziers
      .map((m) => ({
        raw: m[0],
        nums: m[1].split(",").map((n) => Number.parseFloat(n)),
      }))
      .filter(
        ({ nums }) => nums.length !== 4 || nums.some((n) => !(n >= 0 && n <= 1)),
      )
      .map(({ raw }) => raw);
    expect(bad).toEqual([]);
  });

  it("defines the settle ease and the Y lag", () => {
    const css = source(TOKENS_FILE);
    expect(css).toContain("--ease-settle: cubic-bezier(0.5, 0, 0.2, 1)");
    expect(css).toContain("--glide-y-lag: 100ms");
  });

  it("--glide-y-lag equals the glide's Y_LAG_MS", () => {
    expect(source(TOKENS_FILE)).toContain(`--glide-y-lag: ${Y_LAG_MS}ms`);
  });

  it("allows cubic-bezier only in styles/tokens.css", () => {
    expect(offenders((css) => css.match(/cubic-bezier\(/g) ?? [])).toEqual([]);
  });

  it("takes every CSS duration from a token, never a literal time", () => {
    const literal = offenders((css) =>
      [...css.matchAll(TIMING_DECL)]
        .map((m) => m[3].trim())
        .filter((value) => value !== "none" && LITERAL_TIME.test(value)),
    );
    expect(literal).toEqual([]);
  });

  it("zeroes the Y lag under reduced motion", () => {
    const css = source(TOKENS_FILE);
    const block = css.match(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/,
    );
    expect(block?.[0]).toContain("--glide-y-lag: 0ms");
  });
});
