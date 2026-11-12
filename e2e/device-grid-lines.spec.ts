// Device 1 (D-04): Index grid lines. Rest 0.45, full on letter hover/focus,
// instant under reduced motion, inert to pointers.
import { test, expect, type Page } from "@playwright/test";
import { open } from "./helpers/pager";
import { LETTERS } from "./helpers/letters";

const LAYER = '#page-index [aria-hidden="true"]:has(> span:nth-child(12))';

const opacity = (page: Page) =>
  page.locator(LAYER).evaluate((el) => getComputedStyle(el).opacity);

test.describe("grid lines", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("12 inert lines aligned to the page grid at rest", async ({ page }) => {
    await open(page, "/");
    const layer = page.locator(LAYER);
    await expect(layer.locator("> span")).toHaveCount(12);
    const style = await layer.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, pe: cs.pointerEvents };
    });
    expect(style.opacity).toBe("0.45");
    expect(style.pe).toBe("none");
    const edges = await page.evaluate((sel) => {
      const spans = [...document.querySelectorAll(`${sel} > span`)];
      const first = spans[0]!.getBoundingClientRect();
      const last = spans[spans.length - 1]!.getBoundingClientRect();
      const root = document
        .querySelector(sel)!
        .parentElement!.getBoundingClientRect();
      return {
        first: first.left,
        last: last.right,
        left: root.left,
        right: root.right,
      };
    }, LAYER);
    expect(Math.abs(edges.first - edges.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(edges.last - edges.right)).toBeLessThanOrEqual(1);
  });

  test("hover on a letter brightens, leaving restores", async ({ page }) => {
    await open(page, "/");
    await page.locator(`${LETTERS} > a`).first().hover();
    await expect.poll(() => opacity(page)).toBe("1");
    await page.mouse.move(5, 5);
    await expect.poll(() => opacity(page)).toBe("0.45");
  });

  test("keyboard focus on a letter brightens", async ({ page }) => {
    await open(page, "/");
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const onLetter = await page.evaluate(
        (sel) => !!document.activeElement?.matches(`${sel} > a`),
        LETTERS,
      );
      if (onLetter) break;
    }
    await expect.poll(() => opacity(page)).toBe("1");
  });

  test("reduced motion removes the transition", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "/");
    const dur = await page
      .locator(LAYER)
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(dur).toBe("0s");
  });

  test("lines never intercept pointers over the role line", async ({
    page,
  }) => {
    await open(page, "/");
    const hit = await page.evaluate((sel) => {
      const p = document.querySelector("#page-index p")!;
      const r = p.getBoundingClientRect();
      const spans = [...document.querySelectorAll(`${sel} > span`)];
      const x = spans
        .map((s) => s.getBoundingClientRect().left + 0.5)
        .find((sx) => sx > r.left + 2 && sx < r.right - 2);
      if (x === undefined) return "no-line-over-text";
      const el = document.elementFromPoint(x, r.top + r.height / 2);
      return el === p || p.contains(el) ? "text" : (el?.tagName ?? "null");
    }, LAYER);
    expect(["text", "no-line-over-text"]).toContain(hit);
  });

  test("Index has no document scroll at 1366x768", async ({ page }) => {
    await open(page, "/", { width: 1366, height: 768 });
    const m = await page.evaluate(() => ({
      sh: document.documentElement.scrollHeight,
      ch: document.documentElement.clientHeight,
    }));
    expect(m.sh).toBeLessThanOrEqual(m.ch);
  });
});

test("phone keeps one hairline per column start", async ({ page }) => {
  await open(page, "/", { width: 390, height: 844 });
  const widths = await page
    .locator(`${LAYER} > span`)
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).borderRightWidth));
  expect(widths).toHaveLength(12);
  expect(new Set(widths)).toEqual(new Set(["0px"]));
});
