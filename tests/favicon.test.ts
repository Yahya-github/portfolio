// SEO-02 / D-07: favicon from the real glyph, centred, token colours.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { fitPath, parsePath, pathBounds } from "../scripts/lib/glyph-path.mjs";

const root = process.cwd();
const glyph = JSON.parse(
  readFileSync(join(root, "scripts/favicon/y-path.json"), "utf8"),
) as { d: string };
const VERIFIED = "M182 0V306L8 720H164L298 344H229L362 720H498L324 306V0Z";

describe("fitPath", () => {
  it("fits the 32px icon centred with a 24px tall Y", () => {
    const [x0, y0, x1, y1] = pathBounds(
      fitPath(glyph, { size: 32, top: 4, height: 24 }),
    );
    expect(x0).toBeCloseTo(7.833, 2);
    expect(x1).toBeCloseTo(24.167, 2);
    expect(y0).toBeCloseTo(4, 2);
    expect(y1).toBeCloseTo(28, 2);
    expect(x0).toBeCloseTo(32 - x1, 2);
  });

  it("fits the 180px apple icon centred, y 36..144", () => {
    const [x0, y0, x1, y1] = pathBounds(
      fitPath(glyph, { size: 180, top: 36, height: 108 }),
    );
    expect(y0).toBeCloseTo(36, 2);
    expect(y1).toBeCloseTo(144, 2);
    expect(x0).toBeCloseTo(180 - x1, 2);
  });
});

describe("parsePath", () => {
  it("throws on commands other than absolute M, L, H, V, Z", () => {
    expect(() => parsePath("M0 0C1 1 2 2 3 3Z")).toThrow();
    expect(() => parsePath("m0 0l1 1z")).toThrow();
  });
});

describe("generated files", () => {
  it("pins the verified glyph path", () => {
    expect(glyph.d).toBe(VERIFIED);
  });

  it("icon.svg uses token colours, one rect, one path, no text", () => {
    const svg = readFileSync(join(root, "app/icon.svg"), "utf8");
    expect(svg).toContain('viewBox="0 0 32 32"');
    expect(svg.match(/<rect /g)).toHaveLength(1);
    expect(svg.match(/<path /g)).toHaveLength(1);
    expect(svg).toContain('<rect width="32" height="32" fill="#0b0b0b"/>');
    expect(svg).toContain('<path fill="#f0f0f0"');
    expect(svg).not.toContain("<text");
  });

  it("apple-icon.png is 180x180 with a ground-coloured corner", async () => {
    const img = sharp(join(root, "app/apple-icon.png"));
    const meta = await img.metadata();
    expect([meta.width, meta.height]).toEqual([180, 180]);
    const { data } = await img.raw().toBuffer({ resolveWithObject: true });
    expect([data[0], data[1], data[2]]).toEqual([11, 11, 11]);
  });
});
