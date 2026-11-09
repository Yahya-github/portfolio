// D-14 / D-13: ?debug overlay and trace recorder
import { test, expect, type Page } from "@playwright/test";
import { landId, open, pathname, waitForLanded } from "./helpers/pager";

const DESKTOP = { width: 1440, height: 900 };

type TraceWindow = Window & { __pagerTrace?: unknown[] };

const overlay = (page: Page) =>
  page.locator("dl[aria-hidden='true']").filter({ hasText: "Accum" });

const row = (page: Page, name: string) =>
  overlay(page)
    .locator("div")
    .filter({ has: page.locator(`dt:text-is("${name}")`) })
    .locator("dd");

test("without ?debug there is no overlay and no trace", async ({ page }) => {
  await open(page, "/", DESKTOP);
  await expect(overlay(page)).toHaveCount(0);
  const trace = await page.evaluate(
    () => typeof (window as TraceWindow).__pagerTrace,
  );
  expect(trace).toBe("undefined");
});

test("?debug shows the overlay and records wheel samples", async ({ page }) => {
  await open(page, "/?debug", DESKTOP);
  await expect(overlay(page)).toBeVisible({ timeout: 2000 });
  await expect(overlay(page)).toContainText("Index");
  await expect(overlay(page)).toContainText("Motion");
  await expect(row(page, "Motion")).toHaveText("full");

  await page.mouse.move(720, 450);
  const before = await landId(page);
  await page.mouse.wheel(0, 120);
  await waitForLanded(page, before);

  // Paging is unchanged by the flag (T-04-32).
  expect(pathname(page)).toBe("/achievements/");
  await expect(row(page, "Index")).toHaveText("1 → 1");
  expect(new URL(page.url()).search).toBe("?debug");

  const first = await page.evaluate(() => {
    const trace = (window as TraceWindow).__pagerTrace ?? [];
    return { length: trace.length, first: trace[0] };
  });
  expect(first.length).toBeGreaterThanOrEqual(1);
  const sample = first.first as Record<string, unknown>;
  for (const key of ["t", "dx", "dy", "mode"]) {
    expect(typeof sample[key]).toBe("number");
  }
});

test("the Motion row follows prefers-reduced-motion live (WR-08)", async ({
  page,
}) => {
  await open(page, "/?debug", DESKTOP);
  await expect(row(page, "Motion")).toHaveText("full");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(row(page, "Motion")).toHaveText("reduced");
});
