// A11Y-01 / WR-06 / Pitfalls 9-10: reachability, focus, ring, live region and axe after real page changes.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { sections } from "../content/site";
import {
  GESTURE_GAP_WAIT_MS,
  landId,
  open,
  pathname,
  waitForLanded,
} from "./helpers/pager";

const DESKTOP = { width: 1440, height: 900 };
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
] as const;
const MOTIONS = ["no-preference", "reduce"] as const;
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const TOTAL = sections.length;
const LIVE = 'p[aria-live="polite"]';
const LETTERS = 'nav[data-pager="letters"]';

type SectionEntry = (typeof sections)[number];

async function pressAndLand(page: Page, key: string): Promise<void> {
  const before = await landId(page);
  await page.keyboard.press(key);
  await waitForLanded(page, before);
}

async function wheelAndLand(page: Page): Promise<void> {
  const before = await landId(page);
  await page.mouse.wheel(0, 120);
  await waitForLanded(page, before);
  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
}

async function focusedTitleOutline(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return {
      id: el?.id ?? "",
      focusVisible: el ? el.matches(":focus-visible") : false,
      outlineStyle: el ? getComputedStyle(el).outlineStyle : "",
    };
  });
}

async function expectLandedOn(
  page: Page,
  s: SectionEntry,
  position: number,
): Promise<void> {
  const live = page.locator("main#content > section:not([inert])");
  await expect(live).toHaveCount(1);
  await expect(live).toHaveAttribute("id", `page-${s.slug}`);

  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveAttribute("id", `title-${s.slug}`);

  const focus = await page.evaluate(() => ({
    id: document.activeElement?.id ?? "",
    inInert: document.activeElement?.closest("[inert]") != null,
  }));
  expect(focus.id).toBe(`title-${s.slug}`);
  expect(focus.inInert).toBe(false);

  await expect(page.locator(LIVE)).toHaveText(
    `${s.name}, page ${position} of ${TOTAL}`,
  );

  const results = await new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    .exclude("main#content > section[inert]")
    .analyze();
  expect(results.violations, `${s.route}`).toEqual([]);
}

for (const vp of VIEWPORTS) {
  for (const motion of MOTIONS) {
    test(`after paging, one page is reachable, focused, announced and axe-clean (${vp.name}, ${motion})`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: motion });
      await open(page, "/", { width: vp.width, height: vp.height });
      for (let i = 1; i < TOTAL; i += 1) {
        await pressAndLand(page, "ArrowRight");
        expect(pathname(page)).toBe(sections[i].route);
        await expectLandedOn(page, sections[i], i + 1);
      }
      await pressAndLand(page, "Home");
      expect(pathname(page)).toBe("/");
      await expectLandedOn(page, sections[0], 1);
    });
  }
}

test("the title ring follows the input source (Pitfall 10)", async ({
  page,
}) => {
  await open(page, "/", DESKTOP);

  // Key change onto a display-stack title: ring shows.
  await pressAndLand(page, "ArrowRight");
  const achievements = await focusedTitleOutline(page);
  expect(achievements.id).toBe("title-achievements");
  expect(achievements.focusVisible).toBe(true);
  expect(achievements.outlineStyle).not.toBe("none");

  // Key changes onto visually hidden titles: never a ring.
  await pressAndLand(page, "ArrowRight");
  const projects = await focusedTitleOutline(page);
  expect(projects.id).toBe("title-projects");
  expect(projects.outlineStyle).toBe("none");
  await pressAndLand(page, "ArrowRight");
  const experience = await focusedTitleOutline(page);
  expect(experience.id).toBe("title-experience");
  expect(experience.outlineStyle).toBe("none");

  // Wheel change onto a display-stack title: no ring (:focus-visible false or outline none).
  await page.mouse.move(720, 450);
  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
  await wheelAndLand(page);
  expect(pathname(page)).toBe("/about/");
  const about = await focusedTitleOutline(page);
  expect(about.id).toBe("title-about");
  expect(about.focusVisible === false || about.outlineStyle === "none").toBe(
    true,
  );
});

test("the riding hero row cannot be reached by Tab", async ({ page }) => {
  await open(page, "/", DESKTOP);
  const before = await landId(page);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('main#content[data-phase="sliding"]')).toHaveCount(
    1,
  );
  await expect(page.locator(LETTERS)).toHaveAttribute("inert", "");
  for (let i = 0; i < 3; i += 1) {
    await page.keyboard.press("Tab");
    const inLetters = await page.evaluate(
      (sel) => document.activeElement?.closest(sel) != null,
      LETTERS,
    );
    expect(inLetters).toBe(false);
  }
  await waitForLanded(page, before);
  await expect(page.locator(LETTERS)).not.toHaveAttribute("inert", /.*/);
  await expect(page.locator(LETTERS)).toHaveAttribute("data-mode", "rail");
});

test("paging past the last page changes nothing", async ({ page }) => {
  await open(page, "/say-hi/", DESKTOP);
  const live = await page.locator(LIVE).textContent();
  const before = await landId(page);
  const focusBefore = await page.evaluate(
    () => document.activeElement?.id ?? "",
  );
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(GESTURE_GAP_WAIT_MS);
  expect(pathname(page)).toBe("/say-hi/");
  expect(await landId(page)).toBe(before);
  await expect(page.locator(LIVE)).toHaveText(live ?? "");
  expect(await page.evaluate(() => document.activeElement?.id ?? "")).toBe(
    focusBefore,
  );
});
