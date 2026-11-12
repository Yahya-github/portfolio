// EXP-01: the opening (D-01..D-06), once ever; D-10 hint timing after it; NAV-05 footer state after it.
import { expect, test, type Page } from "@playwright/test";
import { FRESH_VISITOR, HINT_KEY, OPENING_KEY } from "./helpers/first-visit";
import { LETTERS, letterAnimationCount, letterRects } from "./helpers/letters";
import { open, pathname, waitForLanded, landId } from "./helpers/pager";

test.use({ storageState: FRESH_VISITOR });

const DESKTOP = { width: 1440, height: 900 };
const RUNNING = 'html[data-opening="running"]';

declare global {
  interface Window {
    __openingStates?: string[];
    __openingRunningAt?: number;
    __openingDoneAt?: number;
    __hintShownAt?: number;
    __lefts?: number[];
  }
}

/** Records opening states, running/done times, hint-shown time and letter 0's left every frame. */
async function installRecorder(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__openingStates = [];
    window.__lefts = [];
    const read = (): void => {
      const v = document.documentElement?.dataset.opening;
      if (v === undefined) return;
      const states = window.__openingStates as string[];
      if (states[states.length - 1] !== v) states.push(v);
      if (v === "running" && window.__openingRunningAt === undefined) {
        window.__openingRunningAt = performance.now();
      }
    };
    read();
    new MutationObserver(read).observe(document, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-opening"],
    });
    document.addEventListener("yh:opening-done", () => {
      window.__openingDoneAt = performance.now();
    });
    document.addEventListener("DOMContentLoaded", () => {
      const hint = document.querySelector("footer [data-hint]");
      if (hint) {
        new MutationObserver(() => {
          if (
            hint.getAttribute("data-state") === "shown" &&
            window.__hintShownAt === undefined
          ) {
            window.__hintShownAt = performance.now();
          }
        }).observe(hint, { attributes: true, attributeFilter: ["data-state"] });
      }
    });
    const tick = (): void => {
      const a = document.querySelector('nav[data-pager="letters"] > a');
      if (a) (window.__lefts as number[]).push(a.getBoundingClientRect().left);
      if (performance.now() < 6000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function seededRestRects(page: Page, baseURL: string) {
  const browser = page.context().browser();
  if (!browser) throw new Error("no browser");
  const ctx = await browser.newContext({
    viewport: DESKTOP,
    storageState: {
      cookies: [],
      origins: [
        {
          origin: new URL(baseURL).origin,
          localStorage: [{ name: OPENING_KEY, value: "1" }],
        },
      ],
    },
  });
  const p = await ctx.newPage();
  await open(p, "/", DESKTOP);
  const rects = await letterRects(p);
  await ctx.close();
  return rects;
}

const opacityOf = (page: Page, sel: string): Promise<string> =>
  page.evaluate(
    (s) => getComputedStyle(document.querySelector(s)!).opacity,
    sel,
  );

async function waitDone(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => window.__openingDoneAt !== undefined))
    .toBe(true);
}

test("a first visit to / plays the opening under 1 second", async ({
  page,
  baseURL,
}) => {
  await installRecorder(page);
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await waitDone(page);
  const states = await page.evaluate(() => window.__openingStates);
  expect(states?.slice(0, 2)).toEqual(["pending", "running"]);
  const span = await page.evaluate(
    () => (window.__openingDoneAt ?? 0) - (window.__openingRunningAt ?? 0),
  );
  expect(span).toBeLessThan(1000);
  await expect(page.locator("html[data-opening]")).toHaveCount(0);
  expect(await letterAnimationCount(page)).toBe(0);
  for (const sel of ["header", "footer", "#page-index"]) {
    expect(await opacityOf(page, sel)).toBe("1");
  }
  const rest = await seededRestRects(page, baseURL!);
  const now = await letterRects(page);
  now.forEach((r, i) => {
    expect(Math.abs(r.left - rest[i].left)).toBeLessThan(0.5);
    expect(Math.abs(r.top - rest[i].top)).toBeLessThan(0.5);
  });
  expect(await page.evaluate((k) => localStorage.getItem(k), OPENING_KEY)).toBe(
    "1",
  );
});

test("letters start offscreen right and travel left", async ({ page }) => {
  await installRecorder(page);
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await waitDone(page);
  const lefts = (await page.evaluate(() => window.__lefts)) ?? [];
  const slide = lefts.slice(lefts.findIndex((l) => l >= 1440));
  expect(slide.length).toBeGreaterThan(2);
  expect(slide[0]).toBeGreaterThanOrEqual(1440);
  for (let i = 1; i < slide.length; i += 1) {
    if (slide[i] > slide[i - 1] + 0.5) {
      // allowed only once the opening is over (rest place never exceeds start)
      expect(slide[i]).toBeLessThan(1440);
    }
  }
});

test("a key skips without paging", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await expect(page.locator(RUNNING)).toHaveCount(1);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => letterAnimationCount(page)).toBe(0);
  await expect(page.locator("html[data-opening]")).toHaveCount(0);
  const land = await landId(page);
  await expect
    .poll(async () => (await landId(page)) === land && pathname(page) === "/", {
      timeout: 700,
    })
    .toBe(true);
  await expect.poll(() => pathname(page), { timeout: 700 }).toBe("/");
});

test("a click skips without navigating", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await expect(page.locator(RUNNING)).toHaveCount(1);
  const target = page.locator(`${LETTERS} a[href="/achievements/"]`);
  const box = await target.boundingBox();
  if (!box) throw new Error("no box");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator("html[data-opening]")).toHaveCount(0);
  const seen = new Set<string>();
  for (let i = 0; i < 7; i += 1) {
    seen.add(pathname(page));
    await page.waitForFunction(
      (t) => performance.now() > t,
      (await page.evaluate(() => performance.now())) + 100,
    );
  }
  expect([...seen]).toEqual(["/"]);
});

test("Tab is never intercepted", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await expect(page.locator(RUNNING)).toHaveCount(1);
  await page.keyboard.press("Tab");
  expect(await letterAnimationCount(page)).toBeGreaterThan(0);
  expect(
    await page.evaluate(() => document.activeElement !== document.body),
  ).toBe(true);
});

test("it never plays again", async ({ page }) => {
  await installRecorder(page);
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await waitDone(page);
  await page.reload();
  await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(1);
  const states = await page.evaluate(() => window.__openingStates);
  expect(states).not.toContain("pending");
  expect(states).not.toContain("running");
});

test("a deep link does not use it up; the first paged arrival at the Index plays it from the left", async ({
  page,
}) => {
  await installRecorder(page);
  await open(page, "/projects/", DESKTOP);
  expect(await page.evaluate(() => window.__openingStates)).not.toContain(
    "pending",
  );
  expect(
    await page.evaluate((k) => localStorage.getItem(k), OPENING_KEY),
  ).toBeNull();
  for (let i = 0; i < 2; i += 1) {
    const before = await landId(page);
    await page.keyboard.press("ArrowLeft");
    await waitForLanded(page, before);
  }
  await waitDone(page);
  const lefts = (await page.evaluate(() => window.__lefts)) ?? [];
  expect(Math.min(...lefts)).toBeLessThan(0);
  expect(await page.evaluate((k) => localStorage.getItem(k), OPENING_KEY)).toBe(
    "1",
  );
  await expect(page.locator(LETTERS)).toHaveAttribute("data-mode", "hero");
});

test("blocked storage hides nothing", async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    const boom = (): never => {
      throw new Error("blocked");
    };
    Storage.prototype.getItem = boom;
    Storage.prototype.setItem = boom;
  });
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await expect(page.locator('html[data-opening="pending"]')).toHaveCount(0);
  expect(await opacityOf(page, "header")).toBe("1");
  await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(1);
  const rest = await seededRestRects(page, baseURL!);
  const now = await letterRects(page);
  now.forEach((r, i) =>
    expect(Math.abs(r.left - rest[i].left)).toBeLessThan(0.5),
  );
});

test("reduced motion shows the final state and writes the flag", async ({
  page,
}) => {
  await installRecorder(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/", DESKTOP);
  expect(await page.evaluate(() => window.__openingStates)).not.toContain(
    "pending",
  );
  await expect
    .poll(() => page.evaluate((k) => localStorage.getItem(k), OPENING_KEY))
    .toBe("1");
});

test("a failed bundle cannot keep content hidden (failsafe)", async ({
  page,
}) => {
  await installRecorder(page);
  await page.route("**/_next/static/**/*.js", (r) => r.abort());
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  expect(await page.evaluate(() => window.__openingStates)).toContain(
    "pending",
  );
  await expect(page.locator("html[data-opening]")).toHaveCount(0, {
    timeout: 3500,
  });
  expect(await opacityOf(page, "header")).toBe("1");
});

test("the hint follows the opening by about a second (D-10)", async ({
  page,
}) => {
  await installRecorder(page);
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await waitDone(page);
  await expect(
    page.locator('footer [data-hint][data-state="shown"]'),
  ).toHaveCount(1, {
    timeout: 4000,
  });
  const gap = await page.evaluate(
    () => (window.__hintShownAt ?? 0) - (window.__openingDoneAt ?? 0),
  );
  expect(gap).toBeGreaterThan(900);
  expect(gap).toBeLessThan(1600);
  // 05-12: remembered only after paging or 3s visible, not at show time.
  expect(
    await page.evaluate((k) => localStorage.getItem(k), HINT_KEY),
  ).toBeNull();
  await expect
    .poll(() => page.evaluate((k) => localStorage.getItem(k), HINT_KEY), {
      timeout: 5000,
    })
    .toBe("1");
});

test("the footer is right after the opening (NAV-05)", async ({ page }) => {
  await installRecorder(page);
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  await waitDone(page);
  await expect(page.locator("footer .tnum")).toHaveText("00 / 05");
  const idx = await page.evaluate(() =>
    getComputedStyle(document.querySelector('[data-pager="bar"]')!)
      .getPropertyValue("--page-index")
      .trim(),
  );
  expect(idx).toBe("0");
  await expect(page.locator("footer a").last()).toHaveAttribute(
    "href",
    "/achievements/",
  );
});
