// LTR-04 / D-18 / Pitfall 12: the rail letter shows its name to the right on focus and hover.
import { test, expect, type Locator, type Page } from "@playwright/test";
import { open } from "./helpers/pager";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const INK = "rgb(240, 240, 240)";
const GROUND = "rgb(11, 11, 11)";
const MAX_TABS = 20;
const VISIBLE_MIN_WIDTH = 1;

const RAIL = 'nav[data-mode="rail"]';

async function tabTo(page: Page, href: string): Promise<Locator> {
  const target = `${RAIL} a[href="${href}"]`;
  for (let i = 0; i < MAX_TABS; i += 1) {
    await page.keyboard.press("Tab");
    const hit = await page.evaluate(
      (sel) => document.activeElement === document.querySelector(sel),
      target,
    );
    if (hit) return page.locator(target);
  }
  throw new Error(`Tab never reached ${href}`);
}

test("keyboard focus on a rail letter shows its name to the right", async ({
  page,
}) => {
  await open(page, "/achievements/", DESKTOP);
  const letter = await tabTo(page, "/projects/");
  const tag = letter.locator("[data-tag]");
  await expect(tag).toHaveText("02 Projects");
  await expect(tag).toHaveCSS("opacity", "1");
  await expect(tag).toHaveCSS("background-color", INK);
  await expect(tag).toHaveCSS("color", GROUND);
  const letterBox = (await letter.boundingBox())!;
  const tagBox = (await tag.boundingBox())!;
  expect(tagBox.width).toBeGreaterThan(VISIBLE_MIN_WIDTH);
  expect(tagBox.x).toBeGreaterThanOrEqual(letterBox.x + letterBox.width);
  const overlapsVertically =
    tagBox.y < letterBox.y + letterBox.height &&
    tagBox.y + tagBox.height > letterBox.y;
  expect(overlapsVertically).toBe(true);
});

test("focus never colours a rail letter", async ({ page }) => {
  await open(page, "/achievements/", DESKTOP);
  const letter = await tabTo(page, "/projects/");
  await expect(letter).toHaveCSS("color", INK);
  await expect(letter).toHaveCSS("outline-color", INK);
});

test("hover fallback without the custom cursor", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await open(page, "/achievements/", DESKTOP);
  const letter = page.locator(`${RAIL} a[href="/about/"]`);
  await letter.hover();
  const tag = letter.locator("[data-tag]");
  await expect(tag).toHaveText("04 About");
  await expect
    .poll(async () => (await tag.boundingBox())?.width ?? 0)
    .toBeGreaterThan(VISIBLE_MIN_WIDTH);
});

test("hero letters do not show the rail tag", async ({ page }) => {
  await open(page, "/", DESKTOP);
  const first = page.locator('nav[data-mode="hero"] a').first();
  const caption = first.locator("[data-tag]");
  const before = await caption.boundingBox();
  await first.focus();
  await expect(page.locator(RAIL)).toHaveCount(0);
  const after = await caption.boundingBox();
  expect(after).toEqual(before);
});

test("phone: focus tag does not leave the screen", async ({ page }) => {
  await open(page, "/achievements/", PHONE);
  const letter = await tabTo(page, "/projects/");
  const tagBox = (await letter.locator("[data-tag]").boundingBox())!;
  expect(tagBox.x + tagBox.width).toBeLessThanOrEqual(PHONE.width);
});
