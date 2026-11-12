// EXP-02 / D-10 / D-11: phone portrait layouts, swipe paging and the landscape hint.
import { expect, test, type Locator, type Page } from "@playwright/test";
import { sections } from "../content/site";
import { indexPage } from "../content/index";
import { OPENING_KEY, SEEN_VALUE } from "./helpers/first-visit";
import { open, pathname, waitForLanded, landId } from "./helpers/pager";
import { swipe } from "./helpers/swipe";

const DEEP_DIVE = "/projects/facturo/";
const ROUTES = [...sections.map((s) => s.route), DEEP_DIVE];
const PAGER_ROUTES = sections.map((s) => s.route);
const PHONES = [
  { width: 390, height: 844 },
  { width: 320, height: 568 },
] as const;
const PORTRAIT = PHONES[0];
const HINT = "footer [data-hint]";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function box(locator: Locator): Promise<Box> {
  const b = await locator.boundingBox();
  if (!b) throw new Error("element has no box");
  return b;
}

const bottom = (b: Box) => b.y + b.height;
const intersects = (a: Box, b: Box) =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

/** Live page root: the pager section that is not inert, or main on the deep dive. */
function liveRoot(page: Page): Locator {
  return page.locator("main section:not([inert]), main:not(:has(section))");
}

test("the emulation reports a coarse touch pointer", async ({ page }) => {
  await open(page, "/");
  const media = await page.evaluate(() => ({
    coarse: matchMedia("(pointer: coarse)").matches,
    noHover: matchMedia("(hover: none)").matches,
  }));
  expect(media).toEqual({ coarse: true, noHover: true });
});

for (const viewport of PHONES) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    for (const route of ROUTES) {
      test(`no horizontal overflow on ${route}`, async ({ page }) => {
        if (route === DEEP_DIVE) {
          // The deep dive sits outside the pager, so there is no data-phase to wait for.
          await page.setViewportSize(viewport);
          await page.goto(route);
          await page.evaluate(async () => {
            await document.fonts.ready;
          });
        } else {
          await open(page, route, viewport);
        }
        const doc = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(doc.scroll).toBeLessThanOrEqual(doc.client);

        const offenders = await liveRoot(page)
          .first()
          .evaluate((root) => {
            const out: string[] = [];
            const limit = window.innerWidth + 1;
            for (const el of root.querySelectorAll("*")) {
              if (el.closest('[aria-hidden="true"]')) continue;
              let clipped = false;
              for (
                let p: Element | null = el.parentElement;
                p && p !== root.parentElement;
                p = p.parentElement
              ) {
                const o = getComputedStyle(p).overflowX;
                if (o === "clip" || o === "hidden") {
                  clipped = true;
                  break;
                }
              }
              if (clipped) continue;
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.right > limit) {
                out.push(`${el.tagName}.${String(el.className)} ${r.right}`);
              }
            }
            return out;
          });
        expect(offenders).toEqual([]);
      });
    }
  });
}

test.describe("per-page phone layouts at 390x844", () => {
  test("Achievements: one-line title, lines stacked rank / result / detail", async ({
    page,
  }) => {
    await open(page, "/achievements/", PORTRAIT);
    const root = page.locator("#page-achievements");
    await expect(root.locator('[class*="rows"]')).toBeHidden();
    await expect(root.locator('[class*="one"]')).toBeVisible();
    const items = root.locator("ol > li");
    await expect(items).toHaveCount(5);
    for (let i = 0; i < 5; i += 1) {
      const spans = items.nth(i).locator("span");
      const tops = [
        (await box(spans.nth(0))).y,
        (await box(spans.nth(1))).y,
        (await box(spans.nth(2))).y,
      ];
      expect(tops[1]).toBeGreaterThan(tops[0]);
      expect(tops[2]).toBeGreaterThan(tops[1]);
    }
  });

  test("Projects: 16:10 walkthrough, 44px controls, rows below the deep-dive link", async ({
    page,
  }) => {
    await open(page, "/projects/", PORTRAIT);
    const frame = await box(page.locator("#page-projects [data-walk]"));
    expect(Math.abs(frame.width / frame.height - 1.6)).toBeLessThan(0.02);
    const controls = page.locator("#page-projects [data-walk-action]");
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      expect((await box(controls.nth(i))).height).toBeGreaterThanOrEqual(44);
    }
    const deep = await box(
      page.locator('#page-projects a[href="/projects/facturo/"]'),
    );
    const rows = await box(page.locator("#page-projects ol").last());
    expect(rows.y).toBeGreaterThan(bottom(deep));
  });

  test("Experience: Involvement sits below the last Work row", async ({
    page,
  }) => {
    await open(page, "/experience/", PORTRAIT);
    const root = page.locator("#page-experience");
    const workRows = root.locator("ol").first().locator("> li");
    const lastWork = await box(workRows.last());
    const heads = root.getByRole("heading", { name: /Work|Involvement/ });
    const involvement = await box(heads.nth(1));
    expect(involvement.y).toBeGreaterThan(bottom(lastWork));
  });

  test("About: portrait is 40svh tall", async ({ page }) => {
    await open(page, "/about/", PORTRAIT);
    const portrait = await box(
      page.locator('#page-about [class*="portrait"]').first(),
    );
    const ratio = portrait.height / PORTRAIT.height;
    expect(Math.abs(ratio - 0.4)).toBeLessThanOrEqual(0.01);
  });

  test("Say hi: four display lines at most 64px, address line below", async ({
    page,
  }) => {
    await open(page, "/say-hi/", PORTRAIT);
    const lines = page.locator("#page-say-hi a.t-display");
    await expect(lines).toHaveCount(4);
    let lastBottom = 0;
    for (let i = 0; i < 4; i += 1) {
      const size = await lines
        .nth(i)
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(size).toBeLessThanOrEqual(64);
      lastBottom = bottom(await box(lines.nth(i)));
    }
    const side = await box(page.locator("#page-say-hi [data-copy-line]"));
    expect(side.y).toBeGreaterThanOrEqual(lastBottom);
  });
});

test.describe("swipe paging", () => {
  for (const [i, route] of PAGER_ROUTES.slice(0, -1).entries()) {
    test(`swiping left on ${route} goes to the next page`, async ({ page }) => {
      await open(page, route, PORTRAIT);
      const before = await landId(page);
      await swipe(page, { x: 300, y: 400 }, { x: 60, y: 400 });
      await waitForLanded(page, before);
      expect(pathname(page)).toBe(PAGER_ROUTES[i + 1]);
    });
  }
});

test.describe("landscape hint (D-10)", () => {
  test("shows in portrait on a coarse pointer, clear of other text, not focusable", async ({
    page,
  }) => {
    await open(page, "/", PORTRAIT);
    const hint = page.getByText(indexPage.landscapeHint, { exact: true });
    await expect(hint).toBeVisible();
    const hintBox = await box(hint);
    const others = page.locator(
      "#page-index p, #page-index li, #page-index a, #page-index h1, #page-index h2",
    );
    const n = await others.count();
    for (let i = 0; i < n; i += 1) {
      const el = others.nth(i);
      if (!(await el.isVisible())) continue;
      if (
        (await el.innerText()).trim().toLowerCase() ===
        indexPage.landscapeHint.toLowerCase()
      )
        continue;
      const other = await box(el);
      expect(
        intersects(hintBox, other),
        `${await el.innerText()} ${JSON.stringify(other)} vs ${JSON.stringify(hintBox)}`,
      ).toBe(false);
    }
    expect(
      await hint.evaluate((el) => el.matches("a, button, [tabindex]")),
    ).toBe(false);
  });

  test("hides in landscape", async ({ page }) => {
    await open(page, "/", { width: 844, height: 390 });
    await expect(
      page.getByText(indexPage.landscapeHint, { exact: true }),
    ).toBeHidden();
  });

  test.describe("fine pointer", () => {
    test.use({ isMobile: false, hasTouch: false });
    test("hides on a fine pointer", async ({ page }) => {
      await open(page, "/", PORTRAIT);
      await expect(
        page.getByText(indexPage.landscapeHint, { exact: true }),
      ).toBeHidden();
    });
  });

  test.describe("beside the footer swipe hint", () => {
    test.use({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: new URL(process.env.BASE_URL ?? "http://localhost:4173")
              .origin,
            localStorage: [{ name: OPENING_KEY, value: SEEN_VALUE }],
          },
        ],
      },
    });
    test("both hints show and do not overlap", async ({ page }) => {
      await open(page, "/", PORTRAIT);
      const footer = page.locator(HINT);
      await expect(footer).toBeVisible();
      await expect(footer).toContainText("Swipe sideways");
      const landscape = page.getByText(indexPage.landscapeHint, {
        exact: true,
      });
      await expect(landscape).toBeVisible();
      expect(intersects(await box(footer), await box(landscape))).toBe(false);
    });
  });
});
