// DSGN-01/02/06 visual baselines; run only in mcr.microsoft.com/playwright:v1.65.0-noble (Pitfall 6)
import { test, expect } from "@playwright/test";
import { sections } from "../content/site";

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "390x844", width: 390, height: 844 },
] as const;

for (const s of sections) {
  for (const vp of VIEWPORTS) {
    test(`${s.route} at ${vp.name} matches its baseline`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(s.route);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${s.slug}-${vp.name}.png`, {
        animations: "disabled",
        caret: "hide",
        maxDiffPixelRatio: 0.002,
      });
    });
  }
}
