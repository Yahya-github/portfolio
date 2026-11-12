// SEO-02 / D-04..D-06: committed share card size and template strings.
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { site } from "@/content/site";

const root = process.cwd();
const CARD = join(root, "public/share-card.png");
const html = readFileSync(join(root, "scripts/share-card/card.html"), "utf8");

describe("public/share-card.png", () => {
  it("is a 1200x630 PNG", async () => {
    const meta = await sharp(CARD).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(["png", 1200, 630]);
  });

  it("is under 300 KB", () => {
    expect(statSync(CARD).size).toBeLessThan(300 * 1024);
  });
});

describe("card.html", () => {
  it("carries the role line and the host from content/site.ts", () => {
    expect(html).toContain(site.roleLine);
    expect(html).toContain(new URL(site.origin).host);
  });

  it("uses only token colours and no accent", () => {
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(html).not.toContain("color-accent");
    expect(html).not.toMatch(/rgba?\(/);
  });
});
