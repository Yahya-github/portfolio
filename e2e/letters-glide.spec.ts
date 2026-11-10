// LTR-03 / LTR-06 / DSGN-04: the letter glide between the hero and the rail, in a real browser.
import { test, expect, type Page } from "@playwright/test";
import { landId, open, waitForLanded } from "./helpers/pager";
import {
  LETTERS,
  letterAnimationCount,
  letterRects,
  startLetterSampler,
  stopLetterSampler,
  waitForGlideSettled,
  type LetterRect,
} from "./helpers/letters";

const DESKTOP = { width: 1440, height: 900 };
const LAPTOP = { width: 1366, height: 768 };
const PHONE = { width: 390, height: 844 };
const TOLERANCE = 0.5;
const PHONE_INSET = 24;
const GLIDE_BUDGET_MS = 1000;
const SYNC_FRAMES = 2;
const SCROLL_PROBE = 200;
const JUMP_TOLERANCE = 1;
const PROGRESS_SLACK = 0.02;

type Viewport = { width: number; height: number };

/** Rests are measured on a throwaway page of the same context so the page under test is untouched. */
async function restRects(
  page: Page,
  route: string,
  viewport: Viewport,
): Promise<LetterRect[]> {
  const probe = await page.context().newPage();
  try {
    await open(probe, route, viewport);
    return await letterRects(probe);
  } finally {
    await probe.close();
  }
}
const railRest = (page: Page, vp: Viewport) =>
  restRects(page, "/achievements/", vp);
const heroRest = (page: Page, vp: Viewport) => restRects(page, "/", vp);

function expectRects(actual: LetterRect[], expected: LetterRect[]): void {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((r, i) => {
    const e = expected[i];
    expect(Math.abs(r.left - e.left), `left ${i}`).toBeLessThanOrEqual(
      TOLERANCE,
    );
    expect(Math.abs(r.top - e.top), `top ${i}`).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(r.height - e.height), `height ${i}`).toBeLessThanOrEqual(
      TOLERANCE,
    );
  });
}

const mode = (page: Page) => page.locator(LETTERS).getAttribute("data-mode");

async function inlineMotionStyles(page: Page): Promise<string[]> {
  return page.evaluate(
    (sel) =>
      [...document.querySelectorAll<HTMLElement>(`${sel} > a`)].map(
        (a) => a.style.translate + a.style.transform,
      ),
    LETTERS,
  );
}

async function press(page: Page, key: string) {
  const before = await landId(page);
  await page.keyboard.press(key);
  await waitForLanded(page, before);
  await waitForGlideSettled(page);
}

test("leaving the Index the letters land exactly on the rail rest", async ({
  page,
}) => {
  const rest = await railRest(page, DESKTOP);
  await open(page, "/", DESKTOP);
  await press(page, "ArrowRight");
  expectRects(await letterRects(page), rest);
  expect(await letterAnimationCount(page)).toBe(0);
  expect(await mode(page)).toBe("rail");
  expect((await inlineMotionStyles(page)).every((s) => s === "")).toBe(true);
});

test("returning to the Index grows them back exactly", async ({ page }) => {
  const rest = await heroRest(page, DESKTOP);
  await open(page, "/achievements/", DESKTOP);
  const before = await landId(page);
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(`${LETTERS}[data-flight="in"]`)).toHaveCount(1);
  const captionOpacity = () =>
    page.evaluate(
      (sel) =>
        getComputedStyle(document.querySelector(`${sel} [data-tag]`)!).opacity,
      LETTERS,
    );
  expect(await captionOpacity()).toBe("0");
  await waitForLanded(page, before);
  await waitForGlideSettled(page);
  expectRects(await letterRects(page), rest);
  expect(await mode(page)).toBe("hero");
  await expect.poll(captionOpacity).toBe("1");
});

test("rail to rail never moves the rail", async ({ page }) => {
  await open(page, "/achievements/", DESKTOP);
  const start = await letterRects(page);
  await page.evaluate((sel) => {
    const w = window as unknown as { __flights: number };
    const nav = document.querySelector(sel)!;
    w.__flights = 0;
    new MutationObserver(() => {
      if (nav.hasAttribute("data-flight")) w.__flights += 1;
    }).observe(nav, { attributes: true, attributeFilter: ["data-flight"] });
  }, LETTERS);
  await press(page, "ArrowRight");
  const flights = await page.evaluate(
    () => (window as unknown as { __flights: number }).__flights,
  );
  expect(flights).toBe(0);
  expectRects(await letterRects(page), start);
});

test("fast repeated paging converges on the correct rest", async ({ page }) => {
  const hero = await heroRest(page, DESKTOP);
  const rail = await railRest(page, DESKTOP);
  await open(page, "/", DESKTOP);
  const idle = page.locator('main#content[data-phase="idle"]');

  for (const key of ["ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft"]) {
    await page.keyboard.press(key);
  }
  await expect.poll(() => mode(page)).toBe("hero");
  await expect(idle).toHaveCount(1);
  await waitForGlideSettled(page);
  expectRects(await letterRects(page), hero);

  for (const key of ["ArrowRight", "ArrowLeft", "ArrowRight"]) {
    await page.keyboard.press(key);
  }
  await expect.poll(() => mode(page)).toBe("rail");
  await expect(idle).toHaveCount(1);
  await waitForGlideSettled(page);
  expectRects(await letterRects(page), rail);
});

test("a resize mid-flight snaps to the new rest", async ({ page }) => {
  const rest = await railRest(page, LAPTOP);
  await open(page, "/", DESKTOP);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(`${LETTERS}[data-flight]`)).toHaveCount(1);
  await page.setViewportSize(LAPTOP);
  await expect.poll(() => mode(page)).toBe("rail");
  await waitForGlideSettled(page);
  expectRects(await letterRects(page), rest);
  expect(await letterAnimationCount(page)).toBe(0);
});

function checkTrip(
  frames: LetterRect[][],
  end: LetterRect[],
  label: string,
): void {
  const start = frames[0];
  const firstMove: number[] = [];
  start.forEach((s, i) => {
    const e = end[i];
    const dx = e.left - s.left;
    const dy = e.top - s.top;
    const minH = Math.min(s.height, e.height) - TOLERANCE;
    const maxH = Math.max(s.height, e.height) + TOLERANCE;
    let prevLeft = s.left;
    let moved = -1;
    frames.forEach((f, n) => {
      const r = f[i];
      const tag = `${label} letter ${i} frame ${n}`;
      if (
        moved < 0 &&
        (Math.abs(r.left - s.left) > TOLERANCE ||
          Math.abs(r.top - s.top) > TOLERANCE)
      ) {
        moved = n;
      }
      if (Math.abs(dx) > 1 && Math.abs(dy) > 1) {
        const px = (r.left - s.left) / dx;
        const py = (r.top - s.top) / dy;
        expect(px, `${tag}: X behind Y`).toBeGreaterThanOrEqual(
          py - PROGRESS_SLACK,
        );
      }
      if (Math.abs(dx) > 1) {
        const dir = Math.sign(dx);
        expect(
          (r.left - prevLeft) * dir,
          `${tag}: not monotonic`,
        ).toBeGreaterThanOrEqual(-TOLERANCE);
        expect(
          (r.left - e.left) * dir,
          `${tag}: overshoot`,
        ).toBeLessThanOrEqual(TOLERANCE);
      }
      expect(r.height, `${tag}: height`).toBeGreaterThanOrEqual(minH);
      expect(r.height, `${tag}: height`).toBeLessThanOrEqual(maxH);
      prevLeft = r.left;
    });
    firstMove.push(moved);
  });
  firstMove.forEach((m, i) =>
    expect(m, `${label} letter ${i} moved`).toBeGreaterThanOrEqual(0),
  );
  // Letter 0 (Y) already sits at the rail's left edge, so it only moves vertically, Y_LAG after X;
  // the reading-order stagger is asserted over the letters that travel horizontally.
  const travelling = start
    .map((s, i) => ({ i, dx: Math.abs(end[i].left - s.left) }))
    .filter((l) => l.dx > 1)
    .map((l) => l.i);
  for (let k = 1; k < travelling.length; k += 1) {
    expect(
      firstMove[travelling[k]],
      `${label} stagger ${travelling[k]}`,
    ).toBeGreaterThanOrEqual(firstMove[travelling[k - 1]]);
  }
}

test("horizontal leads, no overshoot, Y first (DSGN-04)", async ({ page }) => {
  const rail = await railRest(page, DESKTOP);
  const hero = await heroRest(page, DESKTOP);
  await open(page, "/", DESKTOP);

  await startLetterSampler(page);
  await press(page, "ArrowRight");
  checkTrip(await stopLetterSampler(page), rail, "out");

  await startLetterSampler(page);
  await press(page, "ArrowLeft");
  checkTrip(await stopLetterSampler(page), hero, "in");
});

test("the glide shares the track's start and ends under a second", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);
  const measured = page.evaluate(
    (sel) =>
      new Promise<{ ms: number; track: number; letter: number }>((resolve) => {
        const main = document.querySelector("main#content") as HTMLElement;
        const nav = document.querySelector(sel) as HTMLElement;
        // Letter 0 only moves vertically, 100ms after X, so the sync probe uses the first horizontal mover.
        const first = nav.querySelectorAll("a")[1] as HTMLElement;
        const m41 = () =>
          new DOMMatrixReadOnly(getComputedStyle(main).transform).m41;
        const m0 = m41();
        const r0 = first.getBoundingClientRect();
        let t0 = 0;
        let frame = 0;
        let track = -1;
        let letter = -1;
        window.addEventListener(
          "keydown",
          () => {
            t0 = performance.now();
          },
          { once: true, capture: true },
        );
        const tick = () => {
          frame += 1;
          if (t0 > 0) {
            if (track < 0 && Math.abs(m41() - m0) > 0.5) track = frame;
            const r = first.getBoundingClientRect();
            if (
              letter < 0 &&
              (Math.abs(r.left - r0.left) > 0.5 ||
                Math.abs(r.top - r0.top) > 0.5)
            ) {
              letter = frame;
            }
            if (
              track > 0 &&
              letter > 0 &&
              !nav.hasAttribute("data-flight") &&
              nav.getAttribute("data-mode") === "rail"
            ) {
              resolve({ ms: performance.now() - t0, track, letter });
              return;
            }
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    LETTERS,
  );
  await page.keyboard.press("ArrowRight");
  const { ms, track, letter } = await measured;
  expect(ms).toBeLessThan(GLIDE_BUDGET_MS);
  expect(Math.abs(letter - track)).toBeLessThanOrEqual(SYNC_FRAMES);
});

test("phone: the rail rests 24px from the left (LTR-06)", async ({ page }) => {
  const rest = await railRest(page, PHONE);
  await open(page, "/", PHONE);
  await press(page, "ArrowRight");
  const rects = await letterRects(page);
  expect(Math.abs(rects[0].left - PHONE_INSET)).toBeLessThanOrEqual(TOLERANCE);
  expectRects(rects, rest);
});

test("phone: a scrolled Index starts the glide with no jump (Pitfall 6)", async ({
  page,
}) => {
  await open(page, "/", PHONE);
  const scrolls = await page.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight,
  );
  test.skip(!scrolls, "the phone Index does not scroll at 390x844");
  await page.evaluate((y) => window.scrollTo(0, y), SCROLL_PROBE);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  const before = await letterRects(page);
  await startLetterSampler(page);
  await page.keyboard.press("ArrowRight");
  await waitForGlideSettled(page);
  const frames = await stopLetterSampler(page);
  frames[0].forEach((r, i) => {
    expect(Math.abs(r.top - before[i].top), `letter ${i}`).toBeLessThanOrEqual(
      JUMP_TOLERANCE,
    );
  });
});
