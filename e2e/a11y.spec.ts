// A11Y-03: axe finds no WCAG 2.0/2.1 A/AA violation on any route at desktop and phone sizes.
// Direct loads only; the same axe pass after real page changes (inert pages excluded) lives in pager-a11y.spec.ts.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { sections } from "../content/site";
import { open } from "./helpers/pager";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
] as const;

const ROUTES = [
  ...sections.map((s) => s.route),
  "/projects/facturo/",
  "/this-page-does-not-exist/",
];

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`axe ${route} ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test.describe("axe with interaction states", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  async function expectClean(page: Page) {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }

  test("achievements with a preview shown", async ({ page }) => {
    await open(page, "/achievements/");
    await page
      .locator("#page-achievements [data-preview-trigger]")
      .first()
      .focus();
    await expectClean(page);
  });

  test("projects with the walkthrough held", async ({ page }) => {
    await open(page, "/projects/");
    await page.locator("#page-projects [data-walk]").focus();
    await expectClean(page);
  });

  test("projects with the MAME link focused", async ({ page }) => {
    await open(page, "/projects/");
    await page.locator("#page-projects [data-preview-trigger]").first().focus();
    await expectClean(page);
  });

  test("about with the portrait pressed", async ({ page }) => {
    await open(page, "/about/");
    const toggle = page.locator("#page-about [data-portrait-toggle]");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expectClean(page);
  });

  test("say hi after a successful copy", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: () => Promise.resolve() },
        configurable: true,
      });
    });
    await page.goto("/say-hi/");
    const email = page.locator("#page-say-hi a[data-copy-email]");
    await expect(email).toHaveAttribute(
      "aria-describedby",
      "copy-email-description",
    );
    await email.click();
    await expect(
      page.locator("#page-say-hi [data-copy-status]"),
    ).not.toBeEmpty();
    await expectClean(page);
  });
});
