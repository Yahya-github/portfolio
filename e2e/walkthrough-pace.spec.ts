// Regression: the minified CSS stores --walk-hold: 5000ms as `5s`; a bare parseFloat
// read 5 ms and the walkthrough raced through all ten frames. No --walk-hold override
// here on purpose (walkthrough.spec.ts shortens it, which hid the bug).
import { expect, test } from "@playwright/test";
import { open } from "./helpers/pager";

const SETTLE_MS = 1200;

test("walkthrough runs one 5s clock and holds frame 1 at a steady pace", async ({
  page,
}) => {
  await open(page, "/projects/", { width: 1440, height: 900 });
  await expect(page.locator("[data-walk]")).toHaveAttribute(
    "data-walk",
    "ready",
  );
  await page.waitForTimeout(SETTLE_MS);

  const clocks = await page.evaluate(() =>
    document
      .getAnimations()
      .filter(
        (a) =>
          a.constructor.name === "Animation" &&
          a.effect instanceof KeyframeEffect &&
          (a.effect.target as HTMLElement | null)?.hasAttribute("data-frame"),
      )
      .map((a) => ({
        duration: Number(a.effect?.getTiming().duration),
        state: a.playState,
      })),
  );
  const running = clocks.filter((c) => c.state === "running");
  expect(running).toHaveLength(1);
  expect(running[0].duration).toBe(5000);

  // No CSS opacity transition on a frame may still be running after the fade settled.
  const fades = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (a) =>
            a instanceof CSSTransition &&
            (
              (a.effect as KeyframeEffect | null)?.target as HTMLElement | null
            )?.hasAttribute("data-frame"),
        ).length,
  );
  expect(fades).toBe(0);

  // Frame 1 started ~SETTLE_MS ago; it must not have advanced across 2.5 s more.
  const counter = page.locator("[data-walk-counter]");
  const start = await counter.textContent();
  await page.waitForTimeout(2500);
  expect(await counter.textContent()).toBe(start);
});
