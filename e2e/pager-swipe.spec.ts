// NAV-03 / D-07 / D-08 / Decision 3 (20px edge)
import { test, expect, type Page } from "@playwright/test";
import {
  GESTURE_GAP_WAIT_MS,
  landId,
  open,
  pathname,
  waitForLanded,
} from "./helpers/pager";
import { swipe } from "./helpers/swipe";

const SWIPE_LEFT = { from: { x: 300, y: 400 }, to: { x: 120, y: 405 } };

async function expectNoPage(page: Page, route: string, before: number) {
  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
  expect(pathname(page)).toBe(route);
  expect(await landId(page)).toBe(before);
}

test("a horizontal swipe pages forward and back", async ({ page }) => {
  await open(page, "/");
  let before = await landId(page);
  await swipe(page, SWIPE_LEFT.from, SWIPE_LEFT.to);
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/achievements/");
  expect(await page.evaluate(() => document.activeElement?.id)).toBe(
    "title-achievements",
  );

  before = await landId(page);
  await swipe(page, { x: 100, y: 400 }, { x: 300, y: 400 });
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/");
});

test("a swipe starting within 20px of the left edge does nothing", async ({
  page,
}) => {
  await open(page, "/achievements/");
  const before = await landId(page);
  await swipe(page, { x: 10, y: 400 }, { x: 250, y: 400 });
  await expectNoPage(page, "/achievements/", before);
});

test("a vertical swipe scrolls the page and never pages (D-07)", async ({
  page,
}) => {
  await open(page, "/projects/");
  const before = await landId(page);
  await swipe(page, { x: 200, y: 700 }, { x: 205, y: 200 });
  await expectNoPage(page, "/projects/", before);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
});

test("a short slow swipe does not page", async ({ page }) => {
  await open(page, "/");
  const before = await landId(page);
  await swipe(page, { x: 200, y: 400 }, { x: 170, y: 400 }, 10, 50);
  await expectNoPage(page, "/", before);
});

test("swiping past the last page does nothing", async ({ page }) => {
  await open(page, "/say-hi/");
  const before = await landId(page);
  await swipe(page, SWIPE_LEFT.from, SWIPE_LEFT.to);
  await expectNoPage(page, "/say-hi/", before);
});

test("a swipe from a scrolled page lands the next page at the top", async ({
  page,
}) => {
  await open(page, "/projects/");
  await page.evaluate(() =>
    window.scrollTo({ top: 400, left: 0, behavior: "instant" }),
  );
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  const before = await landId(page);
  await swipe(page, SWIPE_LEFT.from, SWIPE_LEFT.to);
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/experience/");
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(
    await page.locator("#page-projects").evaluate((el) => el.style.transform),
  ).toBe("");
});
