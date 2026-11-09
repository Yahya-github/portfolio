// NAV-01 / D-04 / Pitfall 6: one wheel gesture = one page, both axes, ends swallowed.
import { test, expect } from "@playwright/test";
import {
  GESTURE_GAP_WAIT_MS,
  landId,
  open,
  pathname,
  waitForLanded,
} from "./helpers/pager";

const DESKTOP = { width: 1440, height: 900 };

test("a vertical wheel notch pages forward and back", async ({ page }) => {
  await open(page, "/", DESKTOP);
  await page.mouse.move(720, 450);

  let before = await landId(page);
  await page.mouse.wheel(0, 120);
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/achievements/");

  await page.waitForTimeout(GESTURE_GAP_WAIT_MS); // separates two gestures
  before = await landId(page);
  await page.mouse.wheel(0, -120);
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/");
});

test("a horizontal wheel gesture pages too (D-04)", async ({ page }) => {
  await open(page, "/", DESKTOP);
  await page.mouse.move(720, 450);

  let before = await landId(page);
  await page.mouse.wheel(120, 0);
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/achievements/");

  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
  before = await landId(page);
  await page.mouse.wheel(-120, 0);
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/");
});

test("a continuous stream of small deltas moves exactly one page", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);
  await page.mouse.move(720, 450);

  const before = await landId(page);
  for (let i = 0; i < 12; i += 1) {
    await page.mouse.wheel(0, 40);
  }
  await waitForLanded(page, before);
  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
  await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(1);
  expect(pathname(page)).toBe("/achievements/");
  expect(await landId(page)).toBe(before + 1);
});

test("at the last page a wheel gesture does nothing and is still prevented", async ({
  page,
}) => {
  await open(page, "/say-hi/", DESKTOP);
  await page.mouse.move(720, 450);
  await page.evaluate(() => {
    const w = window as unknown as { __prevented: boolean[] };
    w.__prevented = [];
    window.addEventListener("wheel", (e) =>
      w.__prevented.push(e.defaultPrevented),
    );
  });

  const before = await landId(page);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
  await page.mouse.wheel(120, 0);
  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);

  expect(pathname(page)).toBe("/say-hi/");
  expect(await landId(page)).toBe(before);
  const prevented = await page.evaluate(
    () => (window as unknown as { __prevented: boolean[] }).__prevented,
  );
  expect(prevented.length).toBeGreaterThan(0);
  expect(prevented.every(Boolean)).toBe(true);
});
