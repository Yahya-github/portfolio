// NAV-06: first-visit hint in the footer (D-07..D-10). NAV-05: footer controls keep tracking the page.
// Deep links only, so no opening runs and the hint waits the 1.5s no-opening delay on a fake clock.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { site } from "../content/site";
import { FRESH_VISITOR, HINT_KEY } from "./helpers/first-visit";
import { open } from "./helpers/pager";

test.use({ storageState: FRESH_VISITOR });

const HINT = "footer [data-hint]";
const NEXT = "footer a";
const DESKTOP = { width: 1440, height: 900 };

async function openFresh(
  page: Page,
  route = "/projects/",
  viewport = DESKTOP,
): Promise<void> {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await open(page, route, viewport);
}

async function showHint(page: Page): Promise<void> {
  await page.clock.fastForward(1600);
  await expect(page.locator(HINT)).toHaveAttribute("data-state", "shown");
}

test("server HTML carries neither hint string", async ({ page }) => {
  const html = await (await page.request.get("/projects/")).text();
  expect(html).not.toContain(site.hint.fine);
  expect(html).not.toContain(site.hint.coarse);
});

test("fine pointer: shows after 1.5s with the arrow-keys wording, then hides after 8s", async ({
  page,
}) => {
  await openFresh(page);
  await expect(page.locator(HINT)).toHaveText("");
  await page.clock.fastForward(1400);
  await expect(page.locator(HINT)).toHaveText("");
  await page.clock.fastForward(200);
  await expect(page.locator(HINT)).toHaveText(site.hint.fine);
  await expect(page.locator(HINT)).toHaveAttribute("data-state", "shown");
  expect(
    await page.evaluate((k) => localStorage.getItem(k), HINT_KEY),
  ).toBe("1");
  await page.clock.fastForward(8000);
  await expect(page.locator(HINT)).toHaveAttribute("data-state", "done");
  await page.clock.fastForward(300);
  await expect(page.locator(HINT)).toHaveText("");
});

test("the first page change dismisses it", async ({ page }) => {
  await openFresh(page);
  await showHint(page);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(HINT)).toHaveAttribute("data-state", "done");
});

test("it never returns", async ({ page }) => {
  await openFresh(page);
  await showHint(page);
  await page.reload();
  await page.clock.fastForward(10000);
  await expect(page.locator(HINT)).toHaveText("");
});

test("Next nudges once when the hint appears", async ({ page }) => {
  await openFresh(page);
  await page.clock.fastForward(1600);
  await expect(page.locator(HINT)).toHaveAttribute("data-state", "shown");
  const running = await page
    .locator(NEXT)
    .last()
    .evaluate((el) => el.getAnimations().length);
  expect(running).toBeGreaterThan(0);
});

test("reduced motion: no nudge, hint still shows", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFresh(page);
  await showHint(page);
  const running = await page
    .locator(NEXT)
    .last()
    .evaluate((el) => el.getAnimations().length);
  expect(running).toBe(0);
});

test.describe("touch", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("shows the swipe wording on one line without overlap", async ({
    page,
  }) => {
    await openFresh(page, "/projects/", { width: 390, height: 844 });
    await showHint(page);
    await expect(page.locator(HINT)).toHaveText(site.hint.coarse);
    const fits = await page
      .locator(HINT)
      .evaluate((el) => el.scrollWidth <= el.clientWidth);
    expect(fits).toBe(true);
    const hint = await page.locator(HINT).boundingBox();
    const next = await page.locator(NEXT).last().boundingBox();
    const bar = await page.locator('[data-pager="bar"]').boundingBox();
    const overlaps = (
      a: { x: number; y: number; width: number; height: number },
      b: { x: number; y: number; width: number; height: number },
    ): boolean =>
      a.x < b.x + b.width &&
      b.x < a.x + a.width &&
      a.y < b.y + b.height &&
      b.y < a.y + a.height;
    expect(hint).not.toBeNull();
    expect(next).not.toBeNull();
    expect(bar).not.toBeNull();
    expect(overlaps(hint!, next!)).toBe(false);
    expect(overlaps(hint!, bar!)).toBe(false);
  });
});

test("blocked storage is harmless", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  await openFresh(page);
  await showHint(page);
  await expect(page.locator(HINT)).toHaveText(site.hint.fine);
});

test("footer still tracks the page (NAV-05)", async ({ page }) => {
  await openFresh(page);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("footer")).toContainText("03 / 05");
  await expect(
    page.getByRole("link", { name: "Next, About" }),
  ).toHaveAttribute("href", "/about/");
  await expect(page.locator("main#content[data-phase=idle]")).toHaveCount(1);
  await expect(page.locator('[data-pager="bar"]')).toHaveCSS(
    "transform",
    /matrix/,
  );
  const index = await page
    .locator('[data-pager="bar"]')
    .evaluate((el) => (el as HTMLElement).style.getPropertyValue("--page-index"));
  expect(index).toBe("3");
});

test("axe finds no footer violations with the hint shown", async ({ page }) => {
  await openFresh(page);
  await showHint(page);
  await page.clock.resume(); // axe needs live timers
  const results = await new AxeBuilder({ page }).include("footer").analyze();
  expect(results.violations).toEqual([]);
});
