import { expect, type Page } from "@playwright/test";

export const pathname = (page: Page): string => new URL(page.url()).pathname;

export async function landId(page: Page): Promise<number> {
  return Number(await page.locator("main#content").getAttribute("data-land"));
}

/** Opens a route and waits for hydration (data-phase only exists client-side) and fonts. */
export async function open(
  page: Page,
  route: string,
  viewport?: { width: number; height: number },
): Promise<void> {
  if (viewport) await page.setViewportSize(viewport);
  await page.goto(route);
  await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(1);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/** Waits until a landing newer than `before` has happened and the pager is idle. No fixed sleeps. */
export async function waitForLanded(page: Page, before: number): Promise<void> {
  await expect.poll(() => landId(page)).toBeGreaterThan(before);
  await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(1);
}

export const GESTURE_GAP_WAIT_MS = 200; // > GESTURE_GAP_MS (160) between separate wheel gestures
