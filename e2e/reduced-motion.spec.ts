// A11Y-04: every Phase 5 animation is instant under prefers-reduced-motion, including a live switch.
import { expect, test, type Page } from "@playwright/test";
import { FRESH_VISITOR, OPENING_KEY } from "./helpers/first-visit";
import {
  LETTERS,
  letterAnimationCount,
  letterRects,
} from "./helpers/letters";
import { open, waitForLanded, landId } from "./helpers/pager";

const DESKTOP = { width: 1440, height: 900 };
const NAV = LETTERS;

declare global {
  interface Window {
    __openingValues?: string[];
  }
}

test.describe("reduced motion on from the start", () => {
  test.use({ reducedMotion: "reduce", viewport: DESKTOP });

  test("the glide is an instant change", async ({ page }) => {
    await open(page, "/", DESKTOP);
    const before = await landId(page);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(NAV)).toHaveAttribute("data-mode", "rail", {
      timeout: 100,
    });
    await expect(page.locator(NAV)).not.toHaveAttribute("data-flight", /.*/);
    expect(await letterAnimationCount(page)).toBe(0);
    await waitForLanded(page, before);
    const rects = await letterRects(page);
    const again = await letterRects(page);
    expect(again).toEqual(rects);
  });

  test("the cursor shape changes are instant", async ({ page }) => {
    await open(page, "/achievements/", DESKTOP);
    await page.mouse.move(400, 300);
    const letter = page.locator(`${NAV} a`).nth(2);
    const b = await letter.boundingBox();
    if (!b) throw new Error("no box");
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await expect(page.locator('[data-cursor-part="root"]')).toHaveAttribute(
      "data-snapped",
      "",
    );
    const state = await page
      .locator('[data-cursor-part="line"]')
      .first()
      .evaluate((el) => ({
        duration: getComputedStyle(el).transitionDuration,
        running: el.getAnimations().length,
      }));
    expect(state.duration.split(",").every((d) => d.trim() === "0s")).toBe(
      true,
    );
    expect(state.running).toBe(0);
  });
});

test.describe("fresh visitor with reduced motion", () => {
  test.use({
    storageState: FRESH_VISITOR,
    reducedMotion: "reduce",
    viewport: DESKTOP,
  });

  test("no opening for a first visit, flag still written", async ({ page }) => {
    await page.addInitScript(() => {
      window.__openingValues = [];
      const read = (): void => {
        const v = document.documentElement?.dataset.opening;
        if (v !== undefined) window.__openingValues?.push(v);
      };
      read();
      new MutationObserver(read).observe(document, {
        attributes: true,
        subtree: true,
        attributeFilter: ["data-opening"],
      });
    });
    await open(page, "/", DESKTOP);
    expect(await page.evaluate(() => window.__openingValues)).not.toContain(
      "running",
    );
    await expect(page.locator("html[data-opening]")).toHaveCount(0);
    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), OPENING_KEY))
      .toBe("1");
  });

  test("the hint shows with no nudge", async ({ page }) => {
    await page.clock.install({ time: 0 });
    await page.clock.pauseAt(1000);
    await open(page, "/projects/", DESKTOP);
    await page.clock.fastForward(1600);
    const hint = page.locator("footer [data-hint]");
    await expect(hint).toHaveAttribute("data-state", "shown");
    expect(
      await page
        .locator("footer a")
        .last()
        .evaluate((el) => el.getAnimations().length),
    ).toBe(0);
    const d = await hint.evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(d.split(",").every((x) => x.trim() === "0s")).toBe(true);
  });
});

test.describe("switching reduced motion on live", () => {
  test.use({ reducedMotion: "no-preference", viewport: DESKTOP });

  test("mid-flight snaps everything", async ({ page }) => {
    await open(page, "/", DESKTOP);
    const before = await landId(page);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(NAV)).toHaveAttribute("data-flight", /.*/);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect
      .poll(
        async () =>
          (await letterAnimationCount(page)) === 0 &&
          (await page.locator(NAV).getAttribute("data-flight")) === null &&
          (await page.locator(NAV).getAttribute("data-mode")) === "rail",
        { timeout: 100 + 1000 },
      )
      .toBe(true);
    await waitForLanded(page, before);
  });
});

test.describe("switching it on mid-opening", () => {
  test.use({
    storageState: FRESH_VISITOR,
    reducedMotion: "no-preference",
    viewport: DESKTOP,
  });

  test("ends the opening", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('html[data-opening="running"]')).toHaveCount(1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html[data-opening]")).toHaveCount(0);
    await expect.poll(() => letterAnimationCount(page)).toBe(0);
  });
});
