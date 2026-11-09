// The Index page must never scroll on desktop: a scrollbar steals width and
// makes every 100vw page spill sideways (clipped by overflow-x).
import { test, expect } from "@playwright/test";
import { open } from "./helpers/pager";

const DESKTOPS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
];

for (const viewport of DESKTOPS) {
  test(`Index has no document scroll at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await open(page, "/", viewport);
    const metrics = await page.evaluate(() => {
      const el = document.documentElement;
      return {
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      };
    });
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
}
