// CONT-12 organisation marks and the About portrait colour twin (DSGN-05, D-09).
import { expect, test, type Locator, type Page } from "@playwright/test";
import { about } from "../content/about";
import { open } from "./helpers/pager";

const DESKTOP = { width: 1440, height: 900 };
const SHORT = { width: 1366, height: 768 };

const MARKED = "#page-experience li[data-tap-colour]";
const PORTRAIT = "#page-about button[data-portrait-toggle]";

const opacityOf = (l: Locator) =>
  l.evaluate((el) => getComputedStyle(el).opacity);

const colourOf = (row: Locator) => row.locator("img[data-defer]");

async function marks(page: Page): Promise<void> {
  await open(page, "/experience/", DESKTOP);
}

test.describe("marks on desktop", () => {
  test("seven marks, mono at rest", async ({ page }) => {
    await marks(page);
    const spans = page.locator("#page-experience [data-mark]");
    await expect(spans).toHaveCount(7);
    for (let i = 0; i < 7; i++) {
      const span = spans.nth(i);
      const mono = span.locator("img").first();
      await expect
        .poll(() =>
          mono.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth),
        )
        .toBeGreaterThan(0);
      expect(
        await mono.evaluate((e: HTMLImageElement) => e.currentSrc),
      ).toContain("-mono");
      expect(await opacityOf(span.locator("img").nth(1))).toBe("0");
    }
  });

  test("row hover shows true colours", async ({ page }) => {
    await marks(page);
    const rows = page.locator(MARKED);
    const count = await rows.count();
    expect(count).toBe(7);
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      await row.hover();
      await expect.poll(() => opacityOf(colourOf(row))).toBe("1");
      await page.mouse.move(2, 2);
      await expect.poll(() => opacityOf(colourOf(row))).toBe("0");
    }
  });

  test("flush with the column edge", async ({ page }) => {
    await marks(page);
    const lists = page.locator("#page-experience ol, #page-experience ul");
    for (let i = 0; i < 2; i++) {
      const row = lists.nth(i).locator("li[data-tap-colour]").first();
      const rowBox = await row.boundingBox();
      const markBox = await row.locator("[data-mark]").boundingBox();
      if (!rowBox || !markBox) throw new Error("missing box");
      expect(
        Math.abs(markBox.x + markBox.width - (rowBox.x + rowBox.width)),
      ).toBeLessThanOrEqual(1);
    }
  });

  test("the marks fit the short desktop", async ({ page }) => {
    await open(page, "/experience/", SHORT);
    const rows = page.locator(MARKED);
    for (let i = 0; i < (await rows.count()); i++) {
      const row = rows.nth(i);
      const text = await row.locator("div").first().boundingBox();
      const mark = await row.locator("[data-mark]").boundingBox();
      if (!text || !mark) throw new Error("missing box");
      const textRight = await row
        .locator("div")
        .first()
        .evaluate((el) => {
          const r = document.createRange();
          r.selectNodeContents(el);
          return r.getBoundingClientRect().right;
        });
      expect(mark.x).toBeGreaterThanOrEqual(textRight - 1);
    }
  });
});

test.describe("portrait", () => {
  test("hover loads and shows colour", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (r) => requested.push(r.url()));
    await open(page, "/about/", DESKTOP);
    expect(
      requested.filter((u) => u.includes("portrait-devfest-2026-color")),
    ).toEqual([]);
    const button = page.locator(PORTRAIT);
    const colour = button.locator('img[data-twin="colour"]');
    await button.hover();
    await expect
      .poll(() =>
        requested.some((u) => u.includes("portrait-devfest-2026-color")),
      )
      .toBe(true);
    await expect.poll(() => opacityOf(colour)).toBe("1");
    await page.mouse.move(2, 2);
    await expect.poll(() => opacityOf(colour)).toBe("0");
  });

  test("keyboard toggle holds the colour", async ({ page }) => {
    await open(page, "/about/", DESKTOP);
    const button = page.locator(PORTRAIT);
    const colour = button.locator('img[data-twin="colour"]');
    await button.focus();
    await expect(button).toHaveAccessibleName(
      // Chromium joins the img and the hidden suffix with a space.
      new RegExp(`${about.portraitAlt}\\s*, show in colour`),
    );
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await page.mouse.move(2, 2);
    await expect.poll(() => opacityOf(colour)).toBe("1");
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("the swap is instant", async ({ page }) => {
      await open(page, "/about/", DESKTOP);
      const colour = page.locator(PORTRAIT).locator('img[data-twin="colour"]');
      expect(
        await colour.evaluate((e) => getComputedStyle(e).transitionDuration),
      ).toBe("0s");
    });
  });
});

test.describe("touch", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("tap toggles a mark and presses the portrait", async ({ page }) => {
    await page.goto("/experience/");
    await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(
      1,
    );
    const row = page.locator(MARKED).first();
    await row.scrollIntoViewIfNeeded();
    await row.tap();
    await expect(row).toHaveAttribute("data-colour", "");
    await row.tap();
    await expect(row).not.toHaveAttribute("data-colour", "");

    await page.goto("/about/");
    await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(
      1,
    );
    const button = page.locator(PORTRAIT);
    await button.tap();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("javascript off", () => {
  test.use({ javaScriptEnabled: false });

  test("portrait stays greyscale and marks render mono", async ({ page }) => {
    await page.goto("/about/");
    const button = page.locator(PORTRAIT);
    await expect(button).toBeDisabled();
    await expect(button.locator('img[data-twin="colour"]')).not.toHaveAttribute(
      "src",
      /.+/,
    );
    await page.goto("/experience/");
    const mono = page.locator("#page-experience [data-mark] img").first();
    await expect(mono).toHaveAttribute("src", /-mono/);
  });
});
