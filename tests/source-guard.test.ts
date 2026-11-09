import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const DIRS = ["app", "components"] as const;

const LITERAL_A11Y_ATTR = /\b(aria-label|alt|title)="[^"]/;
const USE_CLIENT = /["']use client["']/;
const NEXT_VALUE_IMPORT =
  /^import\s+(?!type\b)[^;]*from\s+["']next\/(link|image)["']/m;

// Exact list (plan 04-11): every Phase 4 client file exists, so a new
// "use client" file must be added here deliberately.
const CLIENT_ALLOWLIST: readonly string[] = [
  join("components", "frame", "Header.tsx"),
  join("components", "frame", "Footer.tsx"),
  join("components", "letters", "LetterNav.tsx"),
  join("components", "pages", "Heading.tsx"),
  join("components", "pages", "PageLevel.tsx"),
  join("components", "shell", "PagerContext.tsx"),
  join("components", "shell", "PagerProvider.tsx"),
  join("components", "shell", "PageSection.tsx"),
  join("components", "shell", "LiveRegion.tsx"),
  join("components", "shell", "DebugOverlay.tsx"),
];

function listTsx(): readonly string[] {
  return DIRS.flatMap((dir) => {
    const abs = join(ROOT, dir);
    if (!existsSync(abs)) return [];
    return readdirSync(abs, { recursive: true, encoding: "utf8" })
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => join(dir, f));
  });
}

function sources(): readonly { file: string; text: string }[] {
  return listTsx().map((file) => ({
    file,
    text: readFileSync(join(ROOT, file), "utf8"),
  }));
}

function offenders(pattern: RegExp): readonly string[] {
  return sources()
    .filter(({ text }) => pattern.test(text))
    .map(({ file }) => file);
}

describe("source guard (CONT-09, T-03-12, T-03-13)", () => {
  it("finds component sources to scan", () => {
    expect(listTsx().length).toBeGreaterThan(0);
  });

  it("has no literal aria-label, alt or title strings", () => {
    expect(offenders(LITERAL_A11Y_ATTR)).toEqual([]);
  });

  it("has exactly the Phase 4 client components", () => {
    expect([...offenders(USE_CLIENT)].sort()).toEqual(
      [...CLIENT_ALLOWLIST].sort(),
    );
  });

  it("has no value imports from next/link or next/image", () => {
    expect(offenders(NEXT_VALUE_IMPORT)).toEqual([]);
  });

  it("patterns catch violations and allow the safe forms", () => {
    expect(LITERAL_A11Y_ATTR.test('<img alt="x" />')).toBe(true);
    expect(LITERAL_A11Y_ATTR.test('<a aria-label="Home" />')).toBe(true);
    expect(LITERAL_A11Y_ATTR.test("<img alt={copy.alt} />")).toBe(false);
    expect(USE_CLIENT.test("'use client';")).toBe(true);
    expect(NEXT_VALUE_IMPORT.test('import Link from "next/link";')).toBe(true);
    expect(NEXT_VALUE_IMPORT.test('import Image from "next/image";')).toBe(
      true,
    );
    expect(
      NEXT_VALUE_IMPORT.test(
        'import type { StaticImageData } from "next/image";',
      ),
    ).toBe(false);
  });
});
