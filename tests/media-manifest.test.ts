// D-09: manifest <-> public/media consistency, size cap, metadata stripped.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { media } from "@/lib/media/manifest";

const MAX_FILE_BYTES = 150 * 1024;
const PUBLIC_DIR = join(process.cwd(), "public");
const MEDIA_DIR = join(PUBLIC_DIR, "media");

const entries = Object.entries(media).flatMap(([key, variants]) =>
  variants.map((variant) => ({ key, ...variant })),
);

const diskFiles = (): string[] =>
  readdirSync(MEDIA_DIR, { recursive: true, encoding: "utf8" })
    .map((name) => `/media/${name.split("\\").join("/")}`)
    .filter((url) => statSync(join(PUBLIC_DIR, url)).isFile());

describe("media manifest", () => {
  it("points every src at an existing file under public/", () => {
    const missing = entries.filter((e) => !existsSync(join(PUBLIC_DIR, e.src)));
    expect(missing).toEqual([]);
  });

  it("references every file under public/media exactly once", () => {
    const srcs = entries.map((e) => e.src);
    expect(new Set(srcs).size).toBe(srcs.length);
    expect([...srcs].sort()).toEqual(diskFiles().sort());
  });

  it("has positive integer dimensions", () => {
    for (const e of entries) {
      expect(Number.isInteger(e.width) && e.width > 0).toBe(true);
      expect(Number.isInteger(e.height) && e.height > 0).toBe(true);
    }
  });

  it("keeps every webp at most 150 KiB", () => {
    const tooBig = entries
      .filter((e) => e.src.endsWith(".webp"))
      .filter((e) => statSync(join(PUBLIC_DIR, e.src)).size > MAX_FILE_BYTES);
    expect(tooBig).toEqual([]);
  });

  it("carries no EXIF or XMP chunk in any webp", () => {
    const leaky = entries
      .filter((e) => e.src.endsWith(".webp"))
      .filter((e) => {
        const text = readFileSync(join(PUBLIC_DIR, e.src)).toString("latin1");
        return text.includes("EXIF") || text.includes("XMP ");
      });
    expect(leaky).toEqual([]);
  });
});
