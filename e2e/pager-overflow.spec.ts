// NAV-07 / D-05 / D-06 / D-07a / Pitfalls 3 and 11: overflowing pages scroll first; only a fresh gesture at the edge pages.
import { test, expect, type Page } from "@playwright/test";
import { sections } from "../content/site";
import {
  GESTURE_GAP_WAIT_MS,
  landId,
  open,
  pathname,
  waitForLanded,
} from "./helpers/pager";

const STREAM_STEP_MS = 30; // < GESTURE_GAP_MS (160): consecutive events form one gesture
const MOMENTUM_EVENTS = 6;
const WHEEL_STEP = 100;
const SHORT_DESKTOP = { width: 1024, height: 500 };
const FIT_DESKTOP = { width: 1366, height: 768 };

/** One continuous wheel gesture of `count` events. */
async function streamWheel(page: Page, dy: number, count: number) {
  for (let i = 0; i < count; i += 1) {
    await page.mouse.wheel(0, dy);
    await page.waitForTimeout(STREAM_STEP_MS);
  }
}

async function docMetrics(page: Page) {
  return page.evaluate(() => {
    const el = document.scrollingElement ?? document.documentElement;
    return {
      y: window.scrollY,
      x: window.scrollX,
      inner: window.innerHeight,
      height: el.scrollHeight,
    };
  });
}

async function sectionMetrics(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((el) => ({
    top: el.scrollTop,
    client: el.clientHeight,
    height: el.scrollHeight,
    overflowY: getComputedStyle(el).overflowY,
  }));
}

test.describe("200% zoom on 1366x768 (document scroll)", () => {
  test.use({ viewport: { width: 683, height: 384 }, deviceScaleFactor: 2 });

  const cases = [
    { route: "/projects/", slug: "projects", next: "/experience/" },
    { route: "/experience/", slug: "experience", next: "/about/" },
  ] as const;

  for (const c of cases) {
    test(`${c.route} scrolls to the bottom, momentum never pages, a fresh gesture does`, async ({
      page,
    }) => {
      await open(page, c.route);
      const start = await docMetrics(page);
      expect(start.height).toBeGreaterThan(start.inner + 1);
      const section = await sectionMetrics(page, `page-${c.slug}`);
      expect(section.overflowY).not.toBe("auto");

      await page.mouse.move(340, 200);
      const before = await landId(page);
      const needed =
        Math.ceil((start.height - start.inner) / WHEEL_STEP) + MOMENTUM_EVENTS;
      await streamWheel(page, WHEEL_STEP, needed);
      await expect
        .poll(async () => {
          const m = await docMetrics(page);
          return m.y + m.inner >= m.height - 1;
        })
        .toBe(true);
      expect(pathname(page)).toBe(c.route);
      expect(await landId(page)).toBe(before);

      await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
      await page.mouse.wheel(0, WHEEL_STEP);
      await waitForLanded(page, before);
      expect(pathname(page)).toBe(c.next);
      const landed = await docMetrics(page);
      expect(landed.y).toBe(0);
      expect(landed.x).toBe(0);

      const back = await landId(page);
      await page.keyboard.press("ArrowLeft");
      await waitForLanded(page, back);
      expect(pathname(page)).toBe(c.route);
      const previous = await docMetrics(page);
      expect(previous.y).toBe(0);
      expect(previous.x).toBe(0);
    });
  }
});

test("short desktop screen: the page scroller reaches its end before paging", async ({
  page,
}) => {
  await open(page, "/projects/", SHORT_DESKTOP);
  const start = await sectionMetrics(page, "page-projects");
  expect(start.height).toBeGreaterThan(start.client + 1);
  expect(start.overflowY).toBe("auto");

  await page.mouse.move(600, 250);
  const before = await landId(page);
  const needed =
    Math.ceil((start.height - start.client) / WHEEL_STEP) + MOMENTUM_EVENTS;
  await streamWheel(page, WHEEL_STEP, needed);
  await expect
    .poll(async () => {
      const m = await sectionMetrics(page, "page-projects");
      return m.top + m.client >= m.height - 1;
    })
    .toBe(true);
  expect(pathname(page)).toBe("/projects/");
  expect(await landId(page)).toBe(before);

  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
  await page.mouse.wheel(0, WHEEL_STEP);
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/experience/");
  expect((await sectionMetrics(page, "page-experience")).top).toBe(0);
  expect(await page.evaluate(() => window.scrollX)).toBe(0);
});

test("a horizontal wheel mid-scroll pages at once", async ({ page }) => {
  await open(page, "/projects/", SHORT_DESKTOP);
  await page.locator("#page-projects").evaluate((el) => {
    el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2);
  });
  expect((await sectionMetrics(page, "page-projects")).top).toBeGreaterThan(0);
  await page.mouse.move(600, 250);
  const before = await landId(page);
  await page.mouse.wheel(120, 0);
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/experience/");
  expect(await page.evaluate(() => window.scrollX)).toBe(0);
});

for (const s of sections) {
  test(`${s.route} fits one screen at 1366x768 with the pager on`, async ({
    page,
  }) => {
    await open(page, s.route, FIT_DESKTOP);
    const m = await sectionMetrics(page, `page-${s.slug}`);
    expect(m.height).toBeLessThanOrEqual(m.client + 1);
  });
}
