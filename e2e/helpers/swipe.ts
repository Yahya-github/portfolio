import type { Page } from "@playwright/test";

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** A real touch gesture via CDP. The per-step wait sets the finger speed (input timing, not a landing wait). */
export async function swipe(
  page: Page,
  from: Point,
  to: Point,
  steps = 8,
  stepMs = 16,
): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: from.x, y: from.y }],
  });
  for (let i = 1; i <= steps; i += 1) {
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y }],
    });
    await page.waitForTimeout(stepMs);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await cdp.detach();
}
