// CONT-06 / D-02: the shipped resume PDF agrees with the site facts; any re-export fails here until re-checked.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// After a re-export: rerun pdftotext -layout, update this hash, re-check 07-FACT-CHECK.md.
const RESUME_SHA256 =
  "b7b7bf90a32d40d4df12f83c4f052d641f8ecf1740dfa2c6d01cb313efa6dbfa";

// Resolve from the Vitest root: jsdom gives import.meta.url a non-file scheme.
const PUBLIC_PDF = join(process.cwd(), "public", "yahya-hallani-resume.pdf");
const DOCS_PDF = join(process.cwd(), "docs", "material", "resume-public.pdf");
const EXTRACT = join(process.cwd(), "docs", "material", "resume-public.txt");

// Resume substrings that back site facts. The F-1 range is added in plan 07-06.
const FACT_STRINGS: readonly string[] = [
  "May 2025 - Present",
  "12 projects for 9 clients",
  "700+ tests",
  "Sep 2026 - Present",
  "Feb 2026 - Present",
  "75/75",
];

const PHONE_PATTERN = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;

function normalise(text: string): string {
  return text.replace(/\s+/g, " ");
}

describe("public resume", () => {
  it("matches the pinned SHA-256", () => {
    const hash = createHash("sha256")
      .update(readFileSync(PUBLIC_PDF))
      .digest("hex");
    expect(hash).toBe(RESUME_SHA256);
  });

  it("is byte-identical to the docs copy", () => {
    expect(readFileSync(PUBLIC_PDF).equals(readFileSync(DOCS_PDF))).toBe(true);
  });

  it.each(FACT_STRINGS)("extract contains %s", (fact) => {
    const text = normalise(readFileSync(EXTRACT, "utf8"));
    expect(text).toContain(fact);
  });

  it("extract contains no phone number", () => {
    expect(readFileSync(EXTRACT, "utf8")).not.toMatch(PHONE_PATTERN);
  });
});
