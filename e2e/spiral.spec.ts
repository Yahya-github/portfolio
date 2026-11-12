// Device 5, the Say hi spiral (D-04): gated by the shared motion flags (06-15), pausable (WCAG 2.2.2),
// clear of the links and the address at a full loop, a still spiral under reduced motion and with JS off.
import { expect, test, type Locator, type Page } from "@playwright/test";
import { FRESH_VISITOR } from "./helpers/first-visit";
import { open, waitForLanded, landId } from "./helpers/pager";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const TOGGLE = "footer button[data-motion-toggle]";
const LOOP_MS = 55000;
const STEP_MS = 2500;
const WORDS = "#page-say-hi [data-say-hi-spiral-layer] svg[viewBox]";

const words = (page: Page): Locator => page.locator(WORDS);

const states = (page: Page): Promise<string[]> =>
  page.evaluate(
    (sel) =>
      [...document.querySelectorAll(sel)].map(
        (el) => el.getAnimations()[0]?.playState ?? "none",
      ),
    WORDS,
  );

async function ready(page: Page): Promise<void> {
  await expect(page.locator("html[data-motion-ready]")).toHaveCount(1);
}

async function allState(page: Page, want: string): Promise<void> {
  await expect
    .poll(async () => (await states(page)).every((s) => s === want))
    .toBe(true);
}

test("runs on Say hi", async ({ page }) => {
  await open(page, "/say-hi/", DESKTOP);
  await ready(page);
  await expect(words(page)).toHaveCount(22);
  await expect(
    page.locator("#page-say-hi [data-say-hi-spiral-layer]"),
  ).toHaveAttribute("aria-hidden", "true");
  await allState(page, "running");
});

test("Pause motion stops it with the names, Play restarts both", async ({
  page,
}) => {
  await open(page, "/say-hi/", DESKTOP);
  await ready(page);
  await allState(page, "running");
  const strip = page.locator("#page-say-hi [data-names-strip]");
  const stripState = () =>
    strip.evaluate((el) => el.getAnimations()[0]?.playState ?? "none");
  await page.locator(TOGGLE).click();
  await allState(page, "paused");
  await expect.poll(stripState).toBe("paused");
  await page.locator(TOGGLE).click();
  await allState(page, "running");
  await expect.poll(stripState).toBe("running");
});

test("paused off the page and in a hidden tab", async ({ page }) => {
  await open(page, "/say-hi/", DESKTOP);
  await ready(page);
  await allState(page, "running");
  const before = await landId(page);
  await page.keyboard.press("ArrowLeft");
  await waitForLanded(page, before);
  await expect(page.locator("#page-say-hi")).toHaveAttribute("inert", "");
  await allState(page, "paused");
  const back = await landId(page);
  await page.keyboard.press("ArrowRight");
  await waitForLanded(page, back);
  await allState(page, "running");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("html")).toHaveAttribute("data-tab-hidden", "");
  await allState(page, "paused");
});

for (const vp of [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  test(`never behind the content over a full loop at ${vp.width}x${vp.height}`, async ({
    page,
  }) => {
    await open(page, "/say-hi/", vp);
    await ready(page);
    const hits = await page.evaluate(
      ({ sel, loop, step }) => {
        const layer = document.querySelector(
          "#page-say-hi [data-say-hi-spiral-layer]",
        )!;
        const bad0: string[] = [];
        // The word boxes are rotated bounding rects that may poke left of the layer; the layer clips them.
        if (getComputedStyle(layer).overflow !== "clip")
          bad0.push("not clipped");
        const ws = [...document.querySelectorAll(sel)];
        const guards = [
          ...document.querySelectorAll(
            "#page-say-hi a, #page-say-hi [data-copy-line], footer button[data-motion-toggle]",
          ),
        ].map((el) => ({
          name: (el.textContent ?? "").trim().slice(0, 20),
          r: el.getBoundingClientRect(),
        }));
        const bad: string[] = [...bad0];
        for (let t = 0; t < loop; t += step) {
          for (const w of ws) {
            for (const a of w.getAnimations()) {
              a.pause();
              a.currentTime = t;
            }
          }
          ws.forEach((w, i) => {
            const r = w.getBoundingClientRect();
            if (r.width === 0) return;
            for (const g of guards) {
              const hit =
                r.left < g.r.right &&
                r.right > g.r.left &&
                r.top < g.r.bottom &&
                r.bottom > g.r.top;
              if (hit) bad.push(`t=${t} w${i} over ${g.name}`);
            }
          });
        }
        return bad;
      },
      { sel: WORDS, loop: LOOP_MS, step: STEP_MS },
    );
    expect(hits).toEqual([]);
  });
}

test("reduced motion is a still spiral", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/say-hi/", DESKTOP);
  await ready(page);
  await allState(page, "paused");
  const visible = await page.evaluate(
    (sel) =>
      [...document.querySelectorAll(sel)].filter(
        (el) => parseFloat(getComputedStyle(el).opacity) > 0.05,
      ).length,
    WORDS,
  );
  expect(visible).toBeGreaterThanOrEqual(10);
});

test.describe("JS off", () => {
  test.use({ javaScriptEnabled: false });
  test("is a still spiral", async ({ page }) => {
    await page.goto("/say-hi/");
    await expect(words(page)).toHaveCount(22);
    expect((await states(page)).every((s) => s !== "running")).toBe(true);
  });
});

test("phone band under the links and address", async ({ page }) => {
  await open(page, "/say-hi/", PHONE);
  await ready(page);
  const shown = await words(page).evaluateAll(
    (els) => els.filter((el) => getComputedStyle(el).display !== "none").length,
  );
  expect(shown).toBe(14);
  const geo = await page.evaluate(() => {
    const layer = document
      .querySelector("#page-say-hi [data-say-hi-spiral-layer]")!
      .getBoundingClientRect();
    const addr = document
      .querySelector("#page-say-hi [data-copy-line]")!
      .getBoundingClientRect();
    return {
      top: layer.top,
      right: layer.right,
      addrBottom: addr.bottom,
      width: innerWidth,
    };
  });
  expect(geo.top).toBeGreaterThanOrEqual(geo.addrBottom + 32 - 1);
  expect(Math.abs(geo.right - geo.width)).toBeLessThanOrEqual(1);
  await expect(page.locator(TOGGLE)).toBeVisible();
  const before = await landId(page);
  await page.keyboard.press("ArrowLeft");
  await waitForLanded(page, before);
  await expect(page.locator(TOGGLE)).toBeHidden();
});

test.describe("hint pending", () => {
  test.use({ storageState: FRESH_VISITOR });
  test("keeps it still", async ({ page }) => {
    await page.goto("/say-hi/");
    await expect(words(page)).toHaveCount(22);
    if ((await page.locator("html[data-hint]").count()) > 0) {
      expect((await states(page)).every((s) => s !== "running")).toBe(true);
    }
  });
});
