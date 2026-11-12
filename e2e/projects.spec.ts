// CONT-03 / CONT-10 / CONT-12: Projects composition, deep-dive link, MAME mark and preview
import { test, expect, type Locator, type Page } from "@playwright/test";
import { open, pathname } from "./helpers/pager";

const ROOT = "section#page-projects";
const ROWS = `${ROOT} ol > li`;
const NAMES = [
  "Facturo",
  "MAME Tool Rental",
  "Atlantis",
  "CRC problems",
  "Robot firmware",
  "Showdown AI",
];

const opacityOf = (loc: Locator): Promise<string> =>
  loc.evaluate((el) => getComputedStyle(el).opacity);

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function boxOf(loc: Locator): Promise<Box> {
  const b = await loc.boundingBox();
  if (!b) throw new Error("no bounding box");
  return b;
}

const intersects = (a: Box, b: Box): boolean =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

const mameRow = (page: Page): Locator => page.locator(ROWS).first();
const mameFigure = (page: Page): Locator =>
  mameRow(page).locator("figure[data-preview]");

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
]) {
  test.describe(`desktop ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test.beforeEach(async ({ page }) => {
      await open(page, "/projects/", viewport);
    });

    test("Facturo has the most space", async ({ page }) => {
      const lead = await boxOf(
        page.locator(`${ROOT} [data-walk]`).locator(".."),
      );
      const rows = await boxOf(page.locator(`${ROOT} ol`));
      expect(lead.width * lead.height).toBeGreaterThan(
        rows.width * rows.height,
      );
      for (const name of NAMES) {
        await expect(
          page.locator(ROOT).getByRole("heading", { name }),
        ).toBeVisible();
      }
    });

    test("MAME preview on hover, placed in cols 7-8 clear of the lead", async ({
      page,
    }) => {
      await mameRow(page).hover();
      const figure = mameFigure(page);
      await expect.poll(() => opacityOf(figure)).toBe("1");
      const src = await figure
        .locator("img")
        .evaluate((el) => (el as HTMLImageElement).currentSrc);
      expect(src).toContain("/media/mame/mame-05-admin-overview-480");

      const fb = await boxOf(figure);
      const vp = page.viewportSize();
      if (!vp) throw new Error("no viewport");
      expect(fb.x).toBeGreaterThanOrEqual(0);
      expect(fb.y).toBeGreaterThanOrEqual(0);
      expect(fb.x + fb.width).toBeLessThanOrEqual(vp.width);
      expect(fb.y + fb.height).toBeLessThanOrEqual(vp.height);

      const rows = await boxOf(page.locator(`${ROOT} ol`));
      const gutter = await page.evaluate(() =>
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--grid-gutter",
          ) || "0",
        ),
      );
      expect(fb.x + fb.width).toBeLessThanOrEqual(rows.x - gutter + 1);

      const walk = await boxOf(page.locator(`${ROOT} [data-walk]`));
      expect(fb.y).toBeGreaterThanOrEqual(walk.y + walk.height - 1);

      const deep = await boxOf(
        page.getByRole("link", { name: "Read the deep dive" }),
      );
      expect(intersects(fb, deep)).toBe(false);
      const leadLines = await page.locator(`${ROOT} [class*="leadLine"]`).all();
      expect(leadLines).toHaveLength(2);
      for (const l of leadLines) {
        expect(intersects(fb, await boxOf(l))).toBe(false);
      }
      const last = await boxOf(leadLines[1]);
      expect(
        Math.abs(fb.y + fb.height - (last.y + last.height)),
      ).toBeLessThanOrEqual(2);
    });

    test("keyboard focus on Live site shows it; a mouse click does not hold it", async ({
      page,
      context,
    }) => {
      const live = mameRow(page).getByRole("link", { name: "Live site" });
      for (let n = 0; n < 60; n++) {
        await page.keyboard.press("Tab");
        if (await live.evaluate((el) => el === document.activeElement)) break;
      }
      await expect(live).toBeFocused();
      await expect.poll(() => opacityOf(mameFigure(page))).toBe("1");

      await open(page, "/projects/", viewport);
      context.on("page", (popup) => void popup.close());
      await live.click();
      await page.mouse.move(5, 5);
      await expect.poll(() => opacityOf(mameFigure(page))).toBe("0");
    });

    test("MAME mark is mono at rest and colour on row hover", async ({
      page,
    }) => {
      const colour = mameRow(page).locator("[data-mark] img[data-defer]");
      await page.mouse.move(5, 5);
      await expect.poll(() => opacityOf(colour)).toBe("0");
      await mameRow(page).hover();
      await expect.poll(() => opacityOf(colour)).toBe("1");
    });

    test("all five rows end above the footer", async ({ page }) => {
      const footer = await boxOf(page.locator("footer"));
      const rows = page.locator(ROWS);
      await expect(rows).toHaveCount(5);
      for (let i = 0; i < 5; i++) {
        const b = await boxOf(rows.nth(i));
        expect(b.y + b.height).toBeLessThanOrEqual(footer.y + 1);
      }
    });
  });
}

test.describe("deep-dive link", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("opens the Facturo deep dive", async ({ page }) => {
    await open(page, "/projects/");
    await page.getByRole("link", { name: "Read the deep dive" }).click();
    await expect.poll(() => pathname(page)).toBe("/projects/facturo/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Facturo");
  });
});

test.describe("touch", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("MAME thumbnail is inline grey and a tap toggles the mark", async ({
    page,
  }) => {
    await page.goto("/projects/");
    await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(
      1,
    );
    const row = mameRow(page);
    await row.scrollIntoViewIfNeeded();
    const figure = mameFigure(page);
    await expect(figure).toBeVisible();
    await expect
      .poll(() =>
        figure
          .locator("img")
          .evaluate((el) => (el as HTMLImageElement).currentSrc),
      )
      .toContain("-grey");
    await row.tap({ position: { x: 5, y: 5 } });
    await expect(row).toHaveAttribute("data-colour", "");
    await row.tap({ position: { x: 5, y: 5 } });
    await expect(row).not.toHaveAttribute("data-colour", "");
  });
});
