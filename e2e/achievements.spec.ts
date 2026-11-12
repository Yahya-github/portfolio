// CONT-02 / CONT-10: the Achievements list and its proof previews
import { test, expect, type Locator, type Page } from "@playwright/test";
import { achievements } from "../content/achievements";
import { open } from "./helpers/pager";

const ROOT = "section#page-achievements";
const ITEMS = `${ROOT} ol > li`;
const FRAME_TOP = 72;
const INSET = 8;

const photoLines = achievements.lines
  .map((l, i) => ({ l, i }))
  .filter(({ l }) => l.preview.kind === "photo");

const figureOf = (page: Page, i: number): Locator =>
  page.locator(ITEMS).nth(i).locator("figure[data-preview]");

const opacityOf = (loc: Locator): Promise<string> =>
  loc.evaluate((el) => getComputedStyle(el).opacity);

async function hoverLine(page: Page, i: number): Promise<void> {
  await page.locator(ITEMS).nth(i).locator("[data-preview-trigger]").hover();
}

for (const viewport of [
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
]) {
  test.describe(`desktop ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test.beforeEach(async ({ page }) => {
      await open(page, "/achievements/", viewport);
    });

    test("one list with 75/75 first, all results at the same weight", async ({
      page,
    }) => {
      const items = page.locator(ITEMS);
      await expect(items).toHaveCount(5);
      await expect(items.first()).toContainText("75/75");
      await expect(items.first()).toContainText(
        "Canadian Computing Competition, perfect score",
      );
      const styleOf = (i: number) =>
        items
          .nth(i)
          .locator("span")
          .nth(1)
          .evaluate((el) => {
            const s = getComputedStyle(el);
            return `${s.fontSize}/${s.fontWeight}`;
          });
      const first = await styleOf(0);
      for (let i = 1; i < 5; i++) expect(await styleOf(i)).toBe(first);
    });

    test("hover shows the colour preview inside the viewport", async ({
      page,
    }) => {
      for (const { i } of photoLines) {
        await hoverLine(page, i);
        const figure = figureOf(page, i);
        await expect.poll(() => opacityOf(figure)).toBe("1");
        const src = await figure
          .locator("img")
          .evaluate((el) => (el as HTMLImageElement).currentSrc);
        expect(src).toContain("/media/achievements/");
        expect(src).not.toContain("-grey");
        const fb = await figure.boundingBox();
        const footer = await page.locator("footer").boundingBox();
        if (!fb || !footer) throw new Error("no bounding box");
        expect(fb.y + fb.height).toBeLessThanOrEqual(footer.y - INSET + 1);
        expect(fb.y).toBeGreaterThanOrEqual(FRAME_TOP - 1);
        await page.mouse.move(5, 5);
        await expect.poll(() => opacityOf(figure)).toBe("0");
      }
    });

    test("keyboard focus shows the preview", async ({ page }) => {
      const diro = page.locator(ITEMS).nth(1).locator("a");
      for (let n = 0; n < 40; n++) {
        await page.keyboard.press("Tab");
        const onDiro = await diro.evaluate(
          (el) => el === document.activeElement,
        );
        if (onDiro) break;
      }
      await expect(diro).toBeFocused();
      await expect.poll(() => opacityOf(figureOf(page, 1))).toBe("1");
    });

    test("a mouse click does not hold the preview", async ({
      page,
      context,
    }) => {
      context.on("page", (popup) => void popup.close());
      const link = page.locator(ITEMS).nth(1).locator("a");
      await link.click();
      await page.mouse.move(5, 5);
      await expect.poll(() => opacityOf(figureOf(page, 1))).toBe("0");
    });

    test("a stale hover stays hidden after blur until the pointer moves", async ({
      page,
    }) => {
      await hoverLine(page, 2);
      const figure = figureOf(page, 2);
      await expect.poll(() => opacityOf(figure)).toBe("1");
      await page.evaluate(() => window.dispatchEvent(new Event("blur")));
      await expect(page.locator(ROOT)).toHaveAttribute("data-quiet", "");
      await expect.poll(() => opacityOf(figure)).toBe("0");
      const box = await page
        .locator(ITEMS)
        .nth(2)
        .locator("[data-preview-trigger]")
        .boundingBox();
      if (!box) throw new Error("no bounding box");
      await page.mouse.move(box.x + 20, box.y + 10);
      await expect.poll(() => opacityOf(figure)).toBe("1");
    });

    test("links open in a new tab, the 75/75 line is focusable but not a link", async ({
      page,
    }) => {
      const links = page.locator(`${ITEMS} a`);
      await expect(links).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        await expect(links.nth(i)).toHaveAttribute("target", "_blank");
        await expect(links.nth(i)).toHaveAttribute(
          "rel",
          "noopener noreferrer",
        );
      }
      const ccc = page.locator(ITEMS).first().locator("[data-preview-trigger]");
      expect(await ccc.evaluate((el) => el.tagName)).toBe("DIV");
      await expect(ccc).toHaveAttribute("tabindex", "0");
      await ccc.focus();
      await expect(ccc).toBeFocused();
    });
  });
}

test.describe("touch phone", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("each photo line shows its greyscale thumbnail inline, text preview hidden", async ({
    page,
  }) => {
    await open(page, "/achievements/");
    const touch = await page.evaluate(
      () => matchMedia("(hover: none)").matches,
    );
    expect(touch, "emulated device must report (hover: none)").toBe(true);
    for (const { i } of photoLines) {
      const item = page.locator(ITEMS).nth(i);
      const figure = figureOf(page, i);
      await expect(figure).toBeVisible();
      const [line, fb] = await Promise.all([
        item.locator("[data-preview-trigger]").boundingBox(),
        figure.boundingBox(),
      ]);
      if (!line || !fb) throw new Error("no bounding box");
      expect(fb.y).toBeGreaterThan(line.y + line.height - 1);
      const src = await figure
        .locator("img")
        .evaluate((el) => (el as HTMLImageElement).currentSrc);
      expect(src).toContain("-grey");
    }
    await expect(
      page.locator(`${ITEMS} figure[data-preview-text]`),
    ).toBeHidden();
  });
});
