import { expect, type Page } from "@playwright/test";

export const LETTERS = 'nav[data-pager="letters"]';

export interface LetterRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

declare global {
  interface Window {
    __letterSamples?: LetterRect[][];
    __letterSampling?: boolean;
  }
}

/** Viewport rects of the five letter links in reading order (Y A H Y A). */
export async function letterRects(page: Page): Promise<LetterRect[]> {
  return page.evaluate((sel) => {
    return [...document.querySelectorAll(`${sel} > a`)].map((a) => {
      const r = a.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    });
  }, LETTERS);
}

/** Glide settled: no data-flight on the nav and no non-CSS (WAAPI) animation left on any letter. */
export async function waitForGlideSettled(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate((sel) => {
        const nav = document.querySelector(sel);
        if (!nav || nav.hasAttribute("data-flight")) return false;
        const letters = [...nav.querySelectorAll(":scope > a")];
        return letters.every(
          (a) =>
            a
              .getAnimations()
              .filter(
                (x) =>
                  !(x instanceof CSSTransition) && !(x instanceof CSSAnimation),
              ).length === 0,
        );
      }, LETTERS),
    )
    .toBe(true);
}

/** Starts a rAF loop that pushes all five rects every frame into window.__letterSamples. */
export async function startLetterSampler(page: Page): Promise<void> {
  await page.evaluate((sel) => {
    window.__letterSamples = [];
    window.__letterSampling = true;
    const tick = () => {
      if (!window.__letterSampling) return;
      const frame = [...document.querySelectorAll(`${sel} > a`)].map((a) => {
        const r = a.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
      });
      window.__letterSamples?.push(frame);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, LETTERS);
}

/** Stops the loop and returns the frames. */
export async function stopLetterSampler(page: Page): Promise<LetterRect[][]> {
  return page.evaluate(() => {
    window.__letterSampling = false;
    return window.__letterSamples ?? [];
  });
}

/** Count of WAAPI (non-CSSTransition, non-CSSAnimation) animations on the letters. */
export async function letterAnimationCount(page: Page): Promise<number> {
  return page.evaluate((sel) => {
    return [...document.querySelectorAll(`${sel} > a`)].reduce(
      (n, a) =>
        n +
        a
          .getAnimations()
          .filter(
            (x) => !(x instanceof CSSTransition) && !(x instanceof CSSAnimation),
          ).length,
      0,
    );
  }, LETTERS);
}
