// Success criterion 2 / Pitfall 1: the YAHYA letter boxes do not depend on the web font.
import { test, expect, type Page } from "@playwright/test";

type Box = [number, number, number, number];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
] as const;
const TOLERANCE_PX = 1;

async function letterBoxes(page: Page): Promise<Box[]> {
  await page.goto("/");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return page
    .locator('nav[aria-label="Sections"] a[data-glyph]')
    .evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return [r.x, r.y, r.width, r.height] as Box;
      }),
    );
}

for (const vp of VIEWPORTS) {
  test(`letter boxes match with and without the web font (${vp.name})`, async ({
    browser,
  }) => {
    const viewport = { width: vp.width, height: vp.height };

    const withFont = await browser.newContext({ viewport });
    const page = await withFont.newPage();
    const loaded = await letterBoxes(page);
    const fontLoaded = await page.evaluate(() =>
      [...document.fonts].some(
        (f) => f.status === "loaded" && f.family.includes("instrumentSans"),
      ),
    );
    expect(fontLoaded).toBe(true);
    await withFont.close();

    const ctx = await browser.newContext({ viewport });
    await ctx.route("**/*.woff2", (r) => r.abort());
    const fallback = await letterBoxes(await ctx.newPage());
    await ctx.close();

    expect(loaded).toHaveLength(5);
    expect(fallback).toHaveLength(loaded.length);
    loaded.forEach((box, i) => {
      box.forEach((v, j) => {
        expect(
          Math.abs(v - fallback[i][j]),
          `letter ${i} value ${j}`,
        ).toBeLessThanOrEqual(TOLERANCE_PX);
      });
    });
  });
}
