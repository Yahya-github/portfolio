// DSGN-01/02/06 + EXP-02 visual baselines; run only in mcr.microsoft.com/playwright:v1.65.0-noble (Pitfall 6)
import { test, expect, type Page } from "@playwright/test";
import { sections } from "../content/site";

// Motion is neutralised: devices still render and the walkthrough is a stepper showing frame 1.
test.use({ reducedMotion: "reduce" });

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "390x844", width: 390, height: 844 },
  { name: "320x568", width: 320, height: 568 },
] as const;

const ROUTES = [
  ...sections.map((s) => ({ name: s.slug, route: s.route })),
  { name: "facturo-deep-dive", route: "/projects/facturo/" },
  { name: "not-found", route: "/this-page-does-not-exist/" },
];

const SHOT = {
  animations: "disabled",
  caret: "hide",
  maxDiffPixelRatio: 0.002,
} as const;

/** Fonts and every image with a src in the live page are settled before a shot. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const live = document.querySelectorAll(
      "main section:not([inert]) img[src], main article img[src]",
    );
    await Promise.all(
      Array.from(live).map((img) => {
        const el = img as HTMLImageElement;
        return el.complete
          ? undefined
          : new Promise((r) => {
              el.onload = el.onerror = () => r(undefined);
            });
      }),
    );
  });
}

for (const r of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`${r.route} at ${vp.name} matches its baseline`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(r.route);
      await settle(page);
      await expect(page).toHaveScreenshot(`${r.name}-${vp.name}.png`, {
        ...SHOT,
        fullPage: r.name === "facturo-deep-dive",
      });
    });
  }
}

test.describe("interaction states at 1440x900", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("achievements focus", async ({ page }) => {
    await page.goto("/achievements/");
    await settle(page);
    await page
      .locator("#page-achievements [data-preview-trigger]")
      .first()
      .focus();
    await expect(page).toHaveScreenshot("state-achievements-focus.png", SHOT);
  });

  test("mame focus", async ({ page }) => {
    await page.goto("/projects/");
    await settle(page);
    await page.locator("#page-projects [data-preview-trigger]").first().focus();
    await expect(page).toHaveScreenshot("state-mame-focus.png", SHOT);
  });

  test("walkthrough held", async ({ page }) => {
    await page.goto("/projects/");
    await settle(page);
    await page.locator("#page-projects [data-walk]").focus();
    await expect(page).toHaveScreenshot("state-walkthrough-held.png", SHOT);
  });

  test("portrait pressed", async ({ page }) => {
    await page.goto("/about/");
    await settle(page);
    const toggle = page.locator("#page-about [data-portrait-toggle]");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await settle(page);
    await expect(page).toHaveScreenshot("state-portrait-pressed.png", SHOT);
  });

  test("experience hover", async ({ page }) => {
    await page.goto("/experience/");
    await settle(page);
    await page.locator("#page-experience [data-tap-colour]").first().hover();
    await expect(page).toHaveScreenshot("state-experience-hover.png", SHOT);
  });

  test("say hi copied", async ({ page }) => {
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
    await expect(page).toHaveScreenshot("state-say-hi-copied.png", SHOT);
  });
});
