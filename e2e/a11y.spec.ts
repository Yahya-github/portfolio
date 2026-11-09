// A11Y-03: axe finds no WCAG 2.0/2.1 A/AA violation on any route at desktop and phone sizes.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { sections } from "../content/site";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
] as const;

for (const s of sections) {
  for (const vp of VIEWPORTS) {
    test(`axe ${s.route} ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(s.route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
