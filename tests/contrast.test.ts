// D-14 / A11Y-03: every text token must meet WCAG AA on the ground, and no grey text may be darker than #8a8a8a.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const TEXT_TOKENS = [
  "ink",
  "dim",
  "accent",
  "accent-facturo",
  "accent-atlantis",
  "accent-robot",
] as const;
const DIVE_PROJECTS = ["facturo", "atlantis", "robot"] as const;
const AA_NORMAL = 4.5;
const MIN_GREY = 0x8a;
const MAX_RATIO = 21;

// process.cwd(): jsdom breaks import.meta.url (see tests/vercel-config.test.ts).
const readTokens = (): string =>
  readFileSync(join(process.cwd(), "styles/tokens.css"), "utf8");

const token = (name: string, source: string = readTokens()): string => {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(source);
  if (!m) throw new Error(`token --color-${name} missing`);
  return m[1].toLowerCase();
};

const lum = (hex: string): number => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a: string, b: string): number => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("contrast helpers", () => {
  it("returns 21 for black on white", () => {
    expect(ratio("#000000", "#ffffff")).toBeCloseTo(MAX_RATIO, 2);
  });

  it("throws when a token is missing", () => {
    expect(() => token("nope", ":root { --color-ink: #f0f0f0; }")).toThrow(
      "token --color-nope missing",
    );
  });
});

describe("text tokens on the ground", () => {
  it.each(TEXT_TOKENS)("%s meets WCAG AA", (t) => {
    expect(ratio(token(t), token("ground"))).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it.each(TEXT_TOKENS)("%s, if grey, is not darker than #8a8a8a", (t) => {
    const hex = token(t);
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    expect(r === g && g === b ? r : MIN_GREY).toBeGreaterThanOrEqual(MIN_GREY);
  });
});

describe("per-project accent overrides", () => {
  const base = readFileSync(join(process.cwd(), "styles/base.css"), "utf8");
  it.each(DIVE_PROJECTS)("base.css sets the %s accent on [data-dive]", (p) => {
    const re = new RegExp(
      `\\[data-dive="${p}"\\]\\s*\\{[^}]*--color-accent:\\s*var\\(--color-accent-${p}\\)`,
    );
    expect(base).toMatch(re);
  });
});
