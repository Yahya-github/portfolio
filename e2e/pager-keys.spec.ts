// NAV-02 / NAV-07 / WR-04 / A11Y-01: keyboard paging, scroll-first and guards.
import { test, expect, type Page } from "@playwright/test";
import { sections } from "../content/site";
import {
  GESTURE_GAP_WAIT_MS,
  landId,
  open,
  pathname,
  waitForLanded,
} from "./helpers/pager";

const DESKTOP = { width: 1440, height: 900 };
const REPEAT_GATE_MS = 600;

async function pressAndLand(page: Page, key: string, route: string) {
  const before = await landId(page);
  await page.keyboard.press(key);
  await waitForLanded(page, before);
  expect(pathname(page)).toBe(route);
}

async function scrollMetrics(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((el) => ({
    top: el.scrollTop,
    client: el.clientHeight,
    height: el.scrollHeight,
  }));
}

test("every paging key moves once and focus lands on the title", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);
  await pressAndLand(page, "ArrowRight", "/achievements/");
  expect(await page.evaluate(() => document.activeElement?.id)).toBe(
    "title-achievements",
  );
  await pressAndLand(page, "ArrowLeft", "/");
  await pressAndLand(page, "PageDown", "/achievements/");
  await pressAndLand(page, "PageUp", "/");
  await pressAndLand(page, "Space", "/achievements/");
  await pressAndLand(page, "Shift+Space", "/");
  await pressAndLand(page, "End", "/say-hi/");
  await pressAndLand(page, "Home", "/");
  await pressAndLand(page, "ArrowDown", "/achievements/");
  await pressAndLand(page, "ArrowUp", "/");
});

test("two fast right arrows land two pages on with one history entry", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);
  const length = await page.evaluate(() => history.length);
  const before = await landId(page);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => pathname(page)).toBe("/projects/");
  await waitForLanded(page, before);
  await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(1);
  expect(pathname(page)).toBe("/projects/");
  expect(await page.evaluate(() => history.length)).toBe(length + 1);

  const back = await landId(page);
  await page.goBack();
  await waitForLanded(page, back);
  expect(pathname(page)).toBe("/");
});

test("Space on a focused link does not page (WR-04)", async ({ page }) => {
  await open(page, "/", DESKTOP);
  const before = await landId(page);
  await page.locator('nav[aria-label="Sections"] a').first().focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
  expect(pathname(page)).toBe("/");
  expect(await landId(page)).toBe(before);
});

test("modified arrows are left to the browser", async ({ page }) => {
  await open(page, "/", DESKTOP);
  const before = await landId(page);
  await page.keyboard.press("Alt+ArrowRight");
  await page.keyboard.press("Control+ArrowRight");
  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
  expect(pathname(page)).toBe("/");
  expect(await landId(page)).toBe(before);
});

test("a held key under reduced motion pages at most once per 600ms", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/", DESKTOP);
  const t0 = Date.now();
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(30); // simulated OS auto-repeat
  }
  await page.keyboard.up("ArrowRight");
  const elapsed = Date.now() - t0;
  await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(1);
  const index = sections.findIndex((s) => s.route === pathname(page));
  expect(index).toBeGreaterThanOrEqual(1);
  expect(index).toBeLessThanOrEqual(1 + Math.floor(elapsed / REPEAT_GATE_MS));
});

test("Space and Page Down scroll an overflowing page before paging (NAV-07)", async ({
  page,
}) => {
  await open(page, "/projects/", { width: 1024, height: 500 });
  const start = await scrollMetrics(page, "page-projects");
  expect(start.height).toBeGreaterThan(start.client + 1);

  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.keyboard.press("Space");
  await expect
    .poll(async () => (await scrollMetrics(page, "page-projects")).top)
    .toBeGreaterThan(0);
  expect(pathname(page)).toBe("/projects/");

  for (let i = 0; i < 20; i += 1) {
    const m = await scrollMetrics(page, "page-projects");
    if (m.top + m.client >= m.height - 1) break;
    await page.keyboard.press("PageDown");
    await expect
      .poll(async () => (await scrollMetrics(page, "page-projects")).top)
      .toBeGreaterThan(m.top);
  }
  const end = await scrollMetrics(page, "page-projects");
  expect(end.top + end.client).toBeGreaterThanOrEqual(end.height - 1);
  expect(pathname(page)).toBe("/projects/");

  await pressAndLand(page, "PageDown", "/experience/");
  expect((await scrollMetrics(page, "page-experience")).top).toBe(0);
});
