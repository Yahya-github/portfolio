// PROOF-01 / D-17 to D-19: the row-to-deep-dive View Transition, its fallbacks and its safety.
import { test, expect, type Page } from "@playwright/test";

const PROJECTS = "/projects/";
const DIVES = ["facturo", "atlantis", "robot"] as const;
const DESKTOP = { width: 1440, height: 900 };

const pathname = (page: Page) => new URL(page.url()).pathname;
const rowLink = (page: Page, project: string) =>
  page.locator(`#page-projects a[href="/projects/${project}/"]`).first();

/** Records, per document, whether pagereveal carried a transition and whether it ran or was skipped. */
const RECORD_REVEAL = () => {
  addEventListener("pagereveal", (e) => {
    const v = (e as Event & { viewTransition: ViewTransition | null })
      .viewTransition;
    if (!v) {
      sessionStorage.setItem("vt", "none");
      return;
    }
    sessionStorage.setItem("vt", "pending");
    v.ready.then(
      () => sessionStorage.setItem("vt", "ran"),
      () => sessionStorage.setItem("vt", "skipped"),
    );
  });
};
const revealState = (page: Page) =>
  page.evaluate(() => sessionStorage.getItem("vt"));

const isCalm = (page: Page) =>
  page.evaluate(() => ({
    animations: document
      .getAnimations()
      .filter((a) =>
        String((a.effect as KeyframeEffect | null)?.pseudoElement).startsWith(
          "::view-transition",
        ),
      ).length,
    clip: document.querySelectorAll('[style*="clip-path"]').length,
    dive: document.querySelectorAll(
      '[class*="dive-"][style*="transform"], h1[style*="transform"]',
    ).length,
  }));

test.describe("row to deep dive transition", () => {
  test.use({ viewport: DESKTOP });

  for (const project of DIVES) {
    test(`${project}: forward focuses the h1 and settles`, async ({ page }) => {
      await page.goto(PROJECTS);
      await rowLink(page, project).click();
      await expect.poll(() => pathname(page)).toBe(`/projects/${project}/`);
      await expect(page.locator("h1")).toBeFocused();
      await expect
        .poll(async () => (await isCalm(page)).animations, { timeout: 1500 })
        .toBe(0);
    });

    test(`${project}: Back to Projects returns with nothing left inert`, async ({
      page,
    }) => {
      await page.goto(`/projects/${project}/`);
      await page.locator("footer a[href='/projects/']").click();
      await expect.poll(() => pathname(page)).toBe(PROJECTS);
      await expect(page.locator("#page-projects")).toBeVisible();
      await expect(page.locator("#page-projects")).not.toHaveAttribute(
        "inert",
        /.*/,
      );
      await expect
        .poll(async () => (await isCalm(page)).animations, { timeout: 1500 })
        .toBe(0);
    });

    test(`${project}: a key during the transition finishes it cleanly`, async ({
      page,
    }) => {
      await page.goto(PROJECTS);
      await rowLink(page, project).click();
      await page.waitForTimeout(100);
      await page.keyboard.press("ArrowDown");
      await expect.poll(() => pathname(page)).toBe(`/projects/${project}/`);
      await page.waitForTimeout(50);
      const calm = await isCalm(page);
      expect(calm).toEqual({ animations: 0, clip: 0, dive: 0 });
      await expect(page.locator("main [inert]")).toHaveCount(0);
    });

    test(`${project}: with the transition disabled it still navigates and focuses the h1`, async ({
      page,
    }) => {
      await page.goto(PROJECTS);
      await page.addStyleTag({
        content: "@view-transition { navigation: none; }",
      });
      await rowLink(page, project).click();
      await expect.poll(() => pathname(page)).toBe(`/projects/${project}/`);
      await expect(page.locator("h1")).toBeFocused();
      await expect(page.locator("h1")).toBeVisible();
    });
  }

  test("paused motion skips the transition", async ({ page }) => {
    await page.addInitScript(RECORD_REVEAL);
    await page.goto(PROJECTS);
    await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");
    await page.locator("[data-motion-toggle]").click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    await rowLink(page, "atlantis").click();
    await expect.poll(() => pathname(page)).toBe("/projects/atlantis/");
    await expect.poll(() => revealState(page)).toMatch(/skipped|none/);
    await expect(page.locator("h1")).toBeFocused();
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: DESKTOP, reducedMotion: "reduce" });

  test("navigation is instant with no view transition", async ({ page }) => {
    await page.addInitScript(RECORD_REVEAL);
    await page.goto(PROJECTS);
    await rowLink(page, "facturo").click();
    await expect.poll(() => pathname(page)).toBe("/projects/facturo/");
    await expect.poll(() => revealState(page)).toMatch(/skipped|none/);
    expect((await isCalm(page)).animations).toBe(0);
    await expect(page.locator("h1")).toBeFocused();
  });
});
