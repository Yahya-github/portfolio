// EXP-03 / D-16..D-19 / WR-05 / WR-07: the custom cursor
import { test, expect, type Locator, type Page } from "@playwright/test";
import { landId, open, waitForLanded } from "./helpers/pager";
import { LETTERS, waitForGlideSettled } from "./helpers/letters";

const DESKTOP = { width: 1440, height: 900 };
const ROOT = '[data-cursor-part="root"]';
const DOT = '[data-cursor-part="dot"]';
const TAG = '[data-cursor-part="tag"]';
const RAIL_PROJECTS = `${LETTERS} a[href="/projects/"]`;

async function centre(loc: Locator): Promise<{ x: number; y: number }> {
  const b = await loc.boundingBox();
  if (!b) throw new Error("no bounding box");
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

async function hover(page: Page, loc: Locator): Promise<void> {
  const c = await centre(loc);
  await page.mouse.move(c.x, c.y);
}

async function waitSnapped(page: Page): Promise<void> {
  await expect(page.locator(ROOT)).toHaveAttribute("data-snapped", "");
  await expect(page.locator(ROOT)).not.toHaveAttribute("data-snapping", "");
}

test.describe("fine pointer", () => {
  test.use({ viewport: DESKTOP });

  test("nothing shows and the native cursor stays before the first move", async ({
    page,
  }) => {
    await open(page, "/achievements/", DESKTOP);
    await expect(page.locator(ROOT)).toBeAttached();
    await expect(page.locator("html")).not.toHaveAttribute("data-cursor", "");
    await expect(page.locator(ROOT)).toHaveCSS("opacity", "0");
    await expect(page.locator("body")).not.toHaveCSS("cursor", "none");
  });

  test("the dot sits exactly on the pointer", async ({ page }) => {
    await open(page, "/achievements/", DESKTOP);
    await expect(page.locator(ROOT)).toBeAttached();
    for (const [x, y] of [
      [400, 300],
      [900, 620],
    ]) {
      await page.mouse.move(x, y);
      await expect(page.locator("html")).toHaveAttribute("data-cursor", "");
      const c = await centre(page.locator(DOT));
      expect(Math.abs(c.x - x)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(c.y - y)).toBeLessThanOrEqual(0.5);
    }
  });

  test("snaps to a rail letter and shows its name", async ({ page }) => {
    await open(page, "/achievements/", DESKTOP);
    await expect(page.locator(ROOT)).toBeAttached();
    const letter = page.locator(RAIL_PROJECTS);
    await hover(page, letter);
    await waitSnapped(page);
    const box = await letter.boundingBox();
    expect(box).toBeTruthy();
    if (!box) return;
    // The hairlines finish their 150ms transition just after data-snapping clears, so poll the final box.
    await expect
      .poll(async () => {
        const top = await page
          .locator('[data-cursor-part="line"]')
          .first()
          .boundingBox();
        if (!top) return Infinity;
        return Math.max(
          Math.abs(top.x - (box.x - 4)),
          Math.abs(top.y - (box.y - 4)),
          Math.abs(top.width - (box.width + 8)),
        );
      })
      .toBeLessThanOrEqual(1);
    await expect(page.locator(TAG)).toHaveText("02 Projects");
    await expect(page.locator(TAG)).toHaveAttribute("data-visible", "");
  });

  test("internal chrome links snap without a tag", async ({ page }) => {
    await open(page, "/achievements/", DESKTOP);
    await expect(page.locator(ROOT)).toBeAttached();
    await hover(page, page.locator("header nav a").last());
    await waitSnapped(page);
    await expect(page.locator(TAG)).not.toHaveAttribute("data-visible", "");
  });

  test("the tag stays 8px inside the viewport", async ({ page }) => {
    await open(page, "/achievements/", DESKTOP);
    await expect(page.locator(ROOT)).toBeAttached();
    await hover(page, page.locator("header nav a").first());
    await expect(page.locator(TAG)).toHaveText("Resume (PDF)");
    await expect(page.locator(TAG)).toHaveAttribute("data-visible", "");
    const r = await page.locator(TAG).boundingBox();
    expect(r).toBeTruthy();
    if (!r) return;
    expect(r.x).toBeGreaterThanOrEqual(8);
    expect(r.y).toBeGreaterThanOrEqual(8);
    expect(r.x + r.width).toBeLessThanOrEqual(1432);
    expect(r.y + r.height).toBeLessThanOrEqual(892);
  });

  test("paging releases the snap and re-snaps after landing", async ({
    page,
  }) => {
    await open(page, "/", DESKTOP);
    await expect(page.locator(ROOT)).toBeAttached();
    await hover(page, page.locator(`${LETTERS} a[href="/achievements/"]`));
    await waitSnapped(page);
    const before = await landId(page);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(ROOT)).not.toHaveAttribute("data-snapped", "");
    await waitForLanded(page, before);
    await waitForGlideSettled(page);
    const snapTargetUnder = await page.evaluate(() => {
      const ptr = document.querySelector('[data-cursor-part="dot"]');
      if (!ptr) return false;
      const r = ptr.getBoundingClientRect();
      const el = document.elementFromPoint(r.left + 2, r.top + 2);
      return !!el?.closest("a, button, [data-cursor-snap]");
    });
    const root = page.locator(ROOT);
    if (snapTargetUnder) await expect(root).toHaveAttribute("data-snapped", "");
    else await expect(root).not.toHaveAttribute("data-snapped", "");
  });

  test("leaving the window hides it", async ({ page }) => {
    await open(page, "/achievements/", DESKTOP);
    await expect(page.locator(ROOT)).toBeAttached();
    await page.mouse.move(500, 400);
    await expect(page.locator(ROOT)).toHaveAttribute("data-visible", "");
    await page.evaluate(() =>
      document.documentElement.dispatchEvent(new PointerEvent("pointerleave")),
    );
    await expect(page.locator(ROOT)).not.toHaveAttribute("data-visible", "");
  });

  test("a settle while the pointer is outside the window shows no tag", async ({
    page,
  }) => {
    await open(page, "/achievements/", DESKTOP);
    await expect(page.locator(ROOT)).toBeAttached();
    await hover(page, page.locator(RAIL_PROJECTS));
    await waitSnapped(page);
    await expect(page.locator(TAG)).toHaveAttribute("data-visible", "");
    await page.evaluate(() =>
      document.documentElement.dispatchEvent(new PointerEvent("pointerleave")),
    );
    await expect(page.locator(TAG)).not.toHaveAttribute("data-visible", "");
    await page.evaluate(() =>
      document.dispatchEvent(new Event("yh:glide-settled")),
    );
    await expect(page.locator(ROOT)).not.toHaveAttribute("data-visible", "");
    await expect(page.locator(TAG)).not.toHaveAttribute("data-visible", "");
  });

  test("the square blends with difference", async ({ page }) => {
    await open(page, "/achievements/", DESKTOP);
    await expect(page.locator(ROOT)).toBeAttached();
    await expect(page.locator(ROOT)).toHaveCSS("mix-blend-mode", "difference");
  });

  test("the cursor code is not in the initial scripts", async ({ page }) => {
    const html = await (await page.request.get("/")).text();
    const srcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(srcs.length).toBeGreaterThan(0);
    for (const src of srcs) {
      const body = await (await page.request.get(src)).text();
      expect(body).not.toContain("data-cursor-part");
      expect(body).not.toContain("cursorPart");
    }
  });
});

test.describe("touch", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("touch devices keep the native cursor and load nothing", async ({
    page,
  }) => {
    await open(page, "/achievements/");
    await page.touchscreen.tap(200, 400);
    await expect(page.locator(ROOT)).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-cursor", "");
  });
});

test.describe("forced colours", () => {
  test.use({ viewport: DESKTOP });

  test("keep the native cursor and the CSS caption", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await open(page, "/achievements/", DESKTOP);
    await page.mouse.move(500, 400);
    await expect(page.locator(ROOT)).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-cursor", "");
    await hover(page, page.locator(RAIL_PROJECTS));
    const cap = await page
      .locator(`${RAIL_PROJECTS} > [data-tag]`)
      .boundingBox();
    expect(cap?.width ?? 0).toBeGreaterThan(1);
  });
});
