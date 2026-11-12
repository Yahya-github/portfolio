// NAV-06: first-visit hint in the footer (D-07..D-10). NAV-05: footer controls keep tracking the page.
// 05-12 gap closure: ink 16px centred hint, remembered only after paging or 3s visible, Next pulses
// twice by 12px 200ms after the hint appears.
// Deep links only, so no opening runs and the hint waits the 1.5s no-opening delay on a fake clock.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { site } from "../content/site";
import {
  FRESH_VISITOR,
  HINT_KEY,
  OPENING_KEY,
  SEEN_VALUE,
} from "./helpers/first-visit";
import { open } from "./helpers/pager";

test.use({ storageState: FRESH_VISITOR });

declare global {
  interface Window {
    __nudges: Animation[];
  }
}

const HINT = "footer [data-hint]";
const NEXT = "footer a";
const COUNTER = "footer > span";
const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const ROUTES = [
  "/",
  "/achievements/",
  "/projects/",
  "/experience/",
  "/about/",
  "/say-hi/",
];

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const overlaps = (a: Box, b: Box): boolean =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

async function openFresh(
  page: Page,
  route = "/projects/",
  viewport = DESKTOP,
): Promise<void> {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await open(page, route, viewport);
}

async function showHint(page: Page): Promise<void> {
  await page.clock.fastForward(1600);
  await expect(page.locator(HINT)).toHaveAttribute("data-state", "shown");
}

const stored = (page: Page): Promise<string | null> =>
  page.evaluate((k) => localStorage.getItem(k), HINT_KEY);

async function nextX(page: Page): Promise<number> {
  const box = await page.locator(NEXT).last().boundingBox();
  expect(box).not.toBeNull();
  return box!.x;
}

test("server HTML carries neither hint string", async ({ page }) => {
  const html = await (await page.request.get("/projects/")).text();
  expect(html).not.toContain(site.hint.fine);
  expect(html).not.toContain(site.hint.coarse);
});

test("fine pointer: shows after 1.5s with the arrow-keys wording, then hides after 8s", async ({
  page,
}) => {
  await openFresh(page);
  await expect(page.locator(HINT)).toHaveText("");
  await page.clock.fastForward(1400);
  await expect(page.locator(HINT)).toHaveText("");
  await page.clock.fastForward(200);
  await expect(page.locator(HINT)).toHaveText(site.hint.fine);
  await expect(page.locator(HINT)).toHaveAttribute("data-state", "shown");
  expect(await stored(page)).toBeNull();
  await page.clock.fastForward(8000);
  await expect(page.locator(HINT)).toHaveAttribute("data-state", "done");
  await expect.poll(() => stored(page)).toBe("1");
  await page.clock.fastForward(300);
  await expect(page.locator(HINT)).toHaveText("");
});

test("desktop: the hint is ink, 16px, one line, centred, clear of counter and Next", async ({
  page,
}) => {
  await openFresh(page);
  await showHint(page);
  const hint = page.locator(HINT);
  await expect(hint).toHaveCSS("color", "rgb(240, 240, 240)");
  await expect(hint).toHaveCSS("font-size", "16px");
  await expect
    .poll(() => hint.evaluate((el) => getComputedStyle(el).opacity))
    .toBe("1");
  const contrast = await hint.evaluate((el) => {
    const lum = (rgb: string): number => {
      const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map((v) => {
        const c = Number(v) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      }) as [number, number, number];
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const fg = lum(getComputedStyle(el).color);
    const footer = el.closest("footer") as HTMLElement;
    const bg = lum(getComputedStyle(footer).backgroundColor);
    const [hi, lo] = fg > bg ? [fg, bg] : [bg, fg];
    return (hi + 0.05) / (lo + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(7);
  const box = await hint.boundingBox();
  const footer = await page.locator("footer").boundingBox();
  const counter = await page.locator(COUNTER).first().boundingBox();
  const next = await page.locator(NEXT).last().boundingBox();
  expect(box).not.toBeNull();
  expect(footer).not.toBeNull();
  expect(counter).not.toBeNull();
  expect(next).not.toBeNull();
  expect(box!.height).toBeLessThanOrEqual(24);
  expect(Math.abs(box!.x + box!.width / 2 - 720)).toBeLessThanOrEqual(2);
  expect(box!.x).toBeGreaterThanOrEqual(footer!.x);
  expect(box!.x + box!.width).toBeLessThanOrEqual(footer!.x + footer!.width);
  expect(box!.y).toBeGreaterThanOrEqual(footer!.y);
  expect(box!.y + box!.height).toBeLessThanOrEqual(footer!.y + footer!.height);
  expect(overlaps(box!, counter!)).toBe(false);
  expect(overlaps(box!, next!)).toBe(false);
});

test("Next does not move when the hint appears", async ({ page }) => {
  await openFresh(page);
  const before = await nextX(page);
  await showHint(page);
  await page.clock.fastForward(1000);
  await page.clock.resume();
  await page.waitForTimeout(1000); // real time: the 920ms nudge has finished
  expect(Math.abs((await nextX(page)) - before)).toBeLessThanOrEqual(0.5);
});

test("Next nudges twice by about 12px, 200ms after the hint appears, and returns to rest", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__nudges = [];
    const orig = Element.prototype.animate;
    Element.prototype.animate = function (
      this: Element,
      ...args: Parameters<Element["animate"]>
    ): Animation {
      const a = orig.apply(this, args);
      if (this.matches("footer a")) window.__nudges.push(a);
      return a;
    };
  });
  await openFresh(page);
  const rest = await nextX(page);
  await showHint(page);
  const r = await page.evaluate(() => {
    const anim = window.__nudges[0]!;
    anim.pause();
    const timing = anim.effect!.getTiming();
    const end = anim.effect!.getComputedTiming().endTime as number;
    const link = document.querySelector("footer a:last-of-type") as HTMLElement;
    const samples: { t: number; x: number }[] = [];
    for (let t = 0; t <= end; t += 10) {
      anim.currentTime = t;
      samples.push({ t, x: link.getBoundingClientRect().x });
    }
    anim.currentTime = end;
    samples.push({ t: end, x: link.getBoundingClientRect().x });
    return { count: window.__nudges.length, delay: timing.delay, end, samples };
  });
  expect(r.count).toBe(1);
  expect(r.delay).toBe(200);
  expect(r.end).toBeCloseTo(920, 3);
  for (const s of r.samples.filter((p) => p.t < 200)) {
    expect(Math.abs(s.x - rest)).toBeLessThanOrEqual(0.5);
  }
  const xs = r.samples.map((s) => s.x);
  expect(Math.max(...xs) - rest).toBeGreaterThan(9);
  expect(Math.max(...xs) - rest).toBeLessThanOrEqual(12.5);
  expect(Math.min(...xs)).toBeGreaterThanOrEqual(rest - 0.5);
  let crossings = 0;
  for (let i = 1; i < xs.length; i++) {
    if (xs[i - 1]! < rest + 6 && xs[i]! >= rest + 6) crossings++;
  }
  expect(crossings).toBe(2);
  expect(
    Math.abs(r.samples[r.samples.length - 1]!.x - rest),
  ).toBeLessThanOrEqual(0.5);
  await page.evaluate(() => window.__nudges[0]!.cancel());
  expect(Math.abs((await nextX(page)) - rest)).toBeLessThanOrEqual(0.5);
});

test("the first page change dismisses it and remembers it", async ({
  page,
}) => {
  await openFresh(page);
  await showHint(page);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(HINT)).toHaveAttribute("data-state", "done");
  await expect.poll(() => stored(page)).toBe("1");
});

test("paging before it shows remembers it", async ({ page }) => {
  await openFresh(page);
  await page.clock.fastForward(500);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => stored(page)).toBe("1");
  await page.clock.fastForward(10000);
  await expect(page.locator(HINT)).toHaveText("");
});

test("a reload before paging still shows it", async ({ page }) => {
  await openFresh(page);
  await showHint(page);
  expect(await stored(page)).toBeNull();
  await page.reload();
  await page.clock.fastForward(1600);
  await expect(page.locator(HINT)).toHaveAttribute("data-state", "shown");
  await expect(page.locator(HINT)).toHaveText(site.hint.fine);
});

test("after 3s visible it never returns", async ({ page }) => {
  await openFresh(page);
  await showHint(page);
  await page.clock.fastForward(2800);
  expect(await stored(page)).toBeNull();
  await page.clock.fastForward(200);
  await expect.poll(() => stored(page)).toBe("1");
  await page.reload();
  await page.clock.fastForward(10000);
  await expect(page.locator(HINT)).toHaveText("");
});

test("reduced motion: no nudge, hint still shows", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFresh(page);
  const rest = await nextX(page);
  await showHint(page);
  await page.clock.fastForward(1000);
  const running = await page
    .locator(NEXT)
    .last()
    .evaluate((el) => el.getAnimations().length);
  expect(running).toBe(0);
  expect(Math.abs((await nextX(page)) - rest)).toBeLessThanOrEqual(0.5);
});

test.describe("touch", () => {
  test.use({ hasTouch: true, viewport: PHONE });

  for (const route of ROUTES) {
    test(`shows the swipe wording in ink on one line without overlap on ${route}`, async ({
      page,
    }) => {
      // The home route would run the opening first; mark it seen so the hint keeps the 1.5s delay.
      await page.addInitScript(
        ([k, v]) => localStorage.setItem(k!, v!),
        [OPENING_KEY, SEEN_VALUE],
      );
      await openFresh(page, route, PHONE);
      await showHint(page);
      const hint = page.locator(HINT);
      await expect(hint).toHaveText(site.hint.coarse);
      await expect(hint).toHaveCSS("color", "rgb(240, 240, 240)");
      await expect(hint).toHaveCSS("font-size", "16px");
      const fits = await hint.evaluate(
        (el) => el.scrollWidth <= el.clientWidth,
      );
      expect(fits).toBe(true);
      const box = await hint.boundingBox();
      const counter = await page.locator(COUNTER).first().boundingBox();
      const next = await page.locator(NEXT).last().boundingBox();
      const bar = await page.locator('[data-pager="bar"]').boundingBox();
      expect(box).not.toBeNull();
      expect(counter).not.toBeNull();
      expect(next).not.toBeNull();
      expect(bar).not.toBeNull();
      expect(overlaps(box!, counter!)).toBe(false);
      expect(overlaps(box!, next!)).toBe(false);
      expect(overlaps(box!, bar!)).toBe(false);
    });
  }
});

test("blocked storage is harmless", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  await openFresh(page);
  await showHint(page);
  await expect(page.locator(HINT)).toHaveText(site.hint.fine);
});

test("footer still tracks the page (NAV-05)", async ({ page }) => {
  await openFresh(page);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("footer")).toContainText("03 / 05");
  await expect(page.getByRole("link", { name: "Next, About" })).toHaveAttribute(
    "href",
    "/about/",
  );
  await expect(page.locator("main#content[data-phase=idle]")).toHaveCount(1);
  await expect(page.locator('[data-pager="bar"]')).toHaveCSS(
    "transform",
    /matrix/,
  );
  const index = await page
    .locator('[data-pager="bar"]')
    .evaluate((el) =>
      (el as HTMLElement).style.getPropertyValue("--page-index"),
    );
  expect(index).toBe("3");
});

test("html[data-hint] is set until the hint is done, then removed", async ({
  page,
}) => {
  await openFresh(page);
  await expect(page.locator("html")).toHaveAttribute("data-hint", "pending");
  await showHint(page);
  await expect(page.locator("html")).toHaveAttribute("data-hint", "pending");
  await page.clock.fastForward(8000);
  await page.clock.fastForward(300);
  await expect(page.locator("html")).not.toHaveAttribute("data-hint", /.*/);
});

test("a seeded visitor never gets html[data-hint]", async ({ page }) => {
  await page.addInitScript(
    ([k, v]) => localStorage.setItem(k as string, v as string),
    [HINT_KEY, SEEN_VALUE],
  );
  await open(page, "/projects/", DESKTOP);
  await expect(page.locator("html")).not.toHaveAttribute("data-hint", /.*/);
});

test("axe finds no footer violations with the hint shown", async ({ page }) => {
  await openFresh(page);
  await showHint(page);
  await page.clock.resume(); // axe needs live timers
  const results = await new AxeBuilder({ page }).include("footer").analyze();
  expect(results.violations).toEqual([]);
});
