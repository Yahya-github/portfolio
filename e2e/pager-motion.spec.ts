// D-01 / D-03 / D-11 / WR-08: motion contract
import { test, expect, type Page } from "@playwright/test";
import { landId, open, pathname, waitForLanded } from "./helpers/pager";
import {
  LETTERS,
  letterAnimationCount,
  waitForGlideSettled,
} from "./helpers/letters";

const DESKTOP = { width: 1440, height: 900 };
const SLIDE_MS = 600;
const RETARGET_AFTER_MS = 200;

declare global {
  interface Window {
    __samples?: number[];
    __sampling?: boolean;
  }
}

interface TimingSnapshot {
  readonly duration: number | null;
  readonly easing: string | undefined;
  readonly startTime: number | null;
}

/** Waits until the track's slide animation has run for more than `ms`. */
async function waitForTrackTime(page: Page, ms: number): Promise<void> {
  await page.waitForFunction((min) => {
    const a = document.querySelector("main#content")?.getAnimations()[0];
    return Number(a?.currentTime ?? 0) > min;
  }, ms);
}

async function trackTiming(page: Page): Promise<TimingSnapshot | null> {
  return page.evaluate(() => {
    const a = document.querySelector("main#content")?.getAnimations()[0];
    if (!a) return null;
    const t = a.effect?.getTiming();
    return {
      duration: typeof t?.duration === "number" ? t.duration : null,
      easing: t?.easing,
      startTime: Number(a.startTime),
    };
  });
}

/** Numeric control points, so the minified token (".77") and the WAAPI string ("0.77") compare equal. */
const bezier = (value: string | undefined): number[] =>
  (value ?? "").match(/-?\d*\.?\d+/g)?.map(Number) ?? [];

async function easeToken(page: Page, name: string): Promise<number[]> {
  const raw = await page.evaluate(
    (n) =>
      getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name,
  );
  return bezier(raw);
}

async function startSampler(page: Page): Promise<void> {
  await page.evaluate(() => {
    const main = document.querySelector("main#content") as HTMLElement;
    const m41 = (el: Element) =>
      new DOMMatrixReadOnly(getComputedStyle(el).transform).m41;
    window.__samples = [];
    window.__sampling = true;
    const tick = () => {
      if (!window.__sampling) return;
      window.__samples?.push(m41(main));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function stopSampler(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    window.__sampling = false;
    return window.__samples ?? [];
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
});

test("a mid-slide retarget continues from the rendered position (D-01)", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);
  const before = await landId(page);
  await startSampler(page);
  await page.keyboard.press("ArrowRight");
  await waitForTrackTime(page, RETARGET_AFTER_MS);

  const jump = await page.evaluate(() => {
    const main = document.querySelector("main#content") as HTMLElement;
    const m41 = (el: Element) =>
      new DOMMatrixReadOnly(getComputedStyle(el).transform).m41;
    const from = m41(main);
    const init = { key: "ArrowRight", bubbles: true };
    window.dispatchEvent(new KeyboardEvent("keydown", init));
    const to = m41(main);
    return { from, to };
  });
  expect(Math.abs(jump.to - jump.from) <= 4).toBe(true);

  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/projects/");
  const samples = await stopSampler(page);
  const width = await page.evaluate(() => window.innerWidth);

  expect(samples.length).toBeGreaterThan(10);
  for (let i = 1; i < samples.length; i += 1) {
    // Travelling to higher indices means moving left; never step right.
    expect(samples[i] - samples[i - 1]).toBeLessThanOrEqual(0.5);
  }
  expect(Math.abs(samples[samples.length - 1] + 2 * width)).toBeLessThan(1);
});

test("a retarget uses --ease-retarget and a fresh slide uses --ease-page", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);
  const pageEase = await easeToken(page, "--ease-page");
  const retarget = await easeToken(page, "--ease-retarget");

  const before = await landId(page);
  await page.keyboard.press("ArrowRight");
  expect(pageEase).toHaveLength(4);
  expect(bezier((await trackTiming(page))?.easing)).toEqual(pageEase);
  await waitForTrackTime(page, RETARGET_AFTER_MS);
  await page.keyboard.press("ArrowRight");
  expect(bezier((await trackTiming(page))?.easing)).toEqual(retarget);
  await waitForLanded(page, before);
});

test("track and progress bar share start time, duration and easing (D-11)", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);
  const before = await landId(page);
  await page.keyboard.press("ArrowRight");
  const pair = await page.evaluate(async () => {
    const track = document.querySelector("main#content")!.getAnimations()[0];
    const bar = document
      .querySelector('[data-pager="bar"]')!
      .getAnimations()[0];
    await Promise.all([track.ready, bar.ready]);
    const timing = (a: Animation) => a.effect!.getTiming();
    return {
      trackDuration: timing(track).duration,
      barDuration: timing(bar).duration,
      trackEasing: timing(track).easing,
      barEasing: timing(bar).easing,
      trackStart: Number(track.startTime),
      barStart: Number(bar.startTime),
    };
  });
  expect(pair.trackDuration).toBe(SLIDE_MS);
  expect(pair.barDuration).toBe(SLIDE_MS);
  expect(pair.barEasing).toBe(pair.trackEasing);
  expect(Math.abs(pair.trackStart - pair.barStart)).toBeLessThan(1);
  await waitForLanded(page, before);
});

test("a long jump still takes one 600ms slide (D-03)", async ({ page }) => {
  await open(page, "/", DESKTOP);
  const before = await landId(page);
  await page.keyboard.press("End");
  expect((await trackTiming(page))?.duration).toBe(SLIDE_MS);
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/say-hi/");
});

test("a same-target intent does not restart the slide", async ({ page }) => {
  await open(page, "/", DESKTOP);
  const before = await landId(page);
  await page.keyboard.press("End");
  await page.evaluate(async () => {
    await document.querySelector("main#content")!.getAnimations()[0].ready;
  });
  const first = await trackTiming(page);
  await page.keyboard.press("End");
  const second = await page.evaluate(() => {
    const list = document.querySelector("main#content")!.getAnimations();
    return { count: list.length, startTime: Number(list[0]?.startTime) };
  });
  expect(second.count).toBe(1);
  expect(second.startTime).toBe(first?.startTime);
  await waitForLanded(page, before);
});

test("switching reduced motion mid-session applies without a reload (WR-08)", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);
  let before = await landId(page);
  await page.keyboard.press("ArrowRight");
  await waitForLanded(page, before);

  // Listeners fire in registration order, so once this later-registered one has
  // run, PagerProvider's change listener has already told the controller.
  await page.evaluate(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    (window as unknown as { __mqChanged: Promise<void> }).__mqChanged =
      new Promise((resolve) =>
        mq.addEventListener("change", () => resolve(), { once: true }),
      );
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  before = await landId(page);
  const reduced = await page.evaluate(async () => {
    await (window as unknown as { __mqChanged: Promise<void> }).__mqChanged;
    const init = { key: "ArrowLeft", bubbles: true };
    window.dispatchEvent(new KeyboardEvent("keydown", init));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return {
      animations: document
        .getAnimations()
        .filter(
          (a) => (a.effect as KeyframeEffect | null)?.target?.id === "content",
        ).length,
      land: Number(
        document.querySelector("main#content")?.getAttribute("data-land"),
      ),
    };
  });
  expect(reduced.animations).toBe(0);
  expect(reduced.land).toBeGreaterThan(before);
  expect(pathname(page)).toBe("/");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  before = await landId(page);
  await page.keyboard.press("ArrowRight");
  expect(await trackTiming(page)).not.toBeNull();
  await waitForLanded(page, before);
});

test("at rest the track has no animations and --track-index is the landed index", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);
  const before = await landId(page);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/projects/");
  const rest = await page.evaluate(() => {
    const main = document.querySelector("main#content") as HTMLElement;
    return {
      running: main.getAnimations().length,
      index: main.style.getPropertyValue("--track-index"),
    };
  });
  expect(rest.running).toBe(0);
  expect(rest.index).toBe("2");
});

test("leaving 00 the glide ends on the rail with nothing left behind", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);
  const before = await landId(page);
  await page.keyboard.press("ArrowRight");
  await waitForLanded(page, before);
  await waitForGlideSettled(page);

  expect(await letterAnimationCount(page)).toBe(0);
  const inline = await page.evaluate(
    (sel) =>
      [...document.querySelectorAll(`${sel} > a`)].map((a) => ({
        translate: (a as HTMLElement).style.translate,
        transform: (a as HTMLElement).style.transform,
      })),
    LETTERS,
  );
  for (const letter of inline) {
    expect(letter.translate).toBe("");
    expect(letter.transform).toBe("");
  }
  const nav = page.locator(LETTERS);
  await expect(nav).toHaveAttribute("data-mode", "rail");
  await expect(nav).not.toHaveAttribute("data-flight", /.*/);
  await expect(
    page.locator(`${LETTERS} a[aria-current="page"]`),
  ).toHaveAttribute("href", "/achievements/");
});
