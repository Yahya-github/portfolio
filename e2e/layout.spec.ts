// D-04 / DSGN-01 / DSGN-02 / DSGN-06 / UI-SPEC: overflow, desktop fit, accent use, grid, Poster size, no ornament.
import { test, expect, type Page } from "@playwright/test";
import { sections } from "../content/site";

const ACCENT = "rgb(95, 174, 132)";

interface Viewport {
  readonly width: number;
  readonly height: number;
}

const VIEWPORTS = {
  phoneSmall: { width: 320, height: 640 },
  phone: { width: 390, height: 844 },
  laptop: { width: 1366, height: 768 },
  desktop: { width: 1440, height: 900 },
  small: { width: 1280, height: 720 },
} as const satisfies Record<string, Viewport>;

const OVERFLOW_VIEWPORTS = [
  VIEWPORTS.phoneSmall,
  VIEWPORTS.phone,
  VIEWPORTS.laptop,
  VIEWPORTS.desktop,
];
const FIT_VIEWPORTS = [VIEWPORTS.desktop, VIEWPORTS.laptop, VIEWPORTS.small];

const ACCENT_TEXT: Record<string, readonly string[]> = {
  index: [],
  achievements: ["Y", "75/75"],
  projects: ["A"],
  experience: ["H"],
  about: ["Y"],
  "say-hi": ["A"],
};

const POSTER_SIZES = [
  { viewport: VIEWPORTS.desktop, px: 636 },
  { viewport: VIEWPORTS.laptop, px: 589 },
  { viewport: VIEWPORTS.phone, px: 164 },
];

const VISIBLE_IMG_ROUTES = new Set(["/about/", "/projects/"]);

const label = (v: Viewport) => `${v.width}x${v.height}`;

async function open(page: Page, route: string, viewport: Viewport) {
  await page.setViewportSize(viewport);
  await page.goto(route);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

for (const s of sections) {
  for (const vp of OVERFLOW_VIEWPORTS) {
    test(`${s.route} has no horizontal overflow at ${label(vp)}`, async ({
      page,
    }) => {
      await open(page, s.route, vp);
      const result = await page.evaluate(() => {
        const de = document.documentElement;
        // Inert pages and the six-page track itself sit past innerWidth by design (JS-on track); scrollWidth still guards the document.
        const offenders = [...document.querySelectorAll("body *")]
          .filter((el) => !el.closest("[inert]"))
          .filter((el) => !el.matches("main#content"))
          .filter((el) => el.checkVisibility())
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.width > 1 && r.right > innerWidth + 0.5)
          .map(
            ({ el, r }) =>
              `${el.tagName}.${el.className} right=${r.right.toFixed(1)}`,
          );
        return {
          scrollWidth: de.scrollWidth,
          clientWidth: de.clientWidth,
          offenders,
        };
      });
      expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth);
      expect(result.offenders).toEqual([]);
    });
  }

  for (const vp of FIT_VIEWPORTS) {
    test(`${s.route} fits ${label(vp)} without vertical scroll`, async ({
      page,
    }) => {
      await open(page, s.route, vp);
      const fit = await page.evaluate((slug) => {
        const sec = document.getElementById(`page-${slug}`)!;
        return {
          sectionScroll: sec.scrollHeight,
          sectionClient: sec.clientHeight,
          docScroll: document.documentElement.scrollHeight,
          innerHeight,
        };
      }, s.slug);
      expect(fit.sectionScroll).toBeLessThanOrEqual(fit.sectionClient + 1);
      expect(fit.docScroll).toBeLessThanOrEqual(fit.innerHeight + 1);
    });
  }

  test(`${s.route} accent text at rest is only ${JSON.stringify(ACCENT_TEXT[s.slug])}`, async ({
    page,
  }) => {
    await open(page, s.route, VIEWPORTS.desktop);
    const accentText = await page.evaluate(
      (accent) =>
        [...document.querySelectorAll("body *")]
          .filter((el) => !el.closest("[inert]"))
          .filter((el) => el.checkVisibility())
          .filter((el) =>
            [...el.childNodes].some(
              (n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim(),
            ),
          )
          .filter((el) => el.getBoundingClientRect().width > 1)
          .filter((el) => getComputedStyle(el).color === accent)
          .map((el) => el.textContent!.trim()),
      ACCENT,
    );
    expect([...accentText].sort()).toEqual([...ACCENT_TEXT[s.slug]].sort());
  });

  test(`${s.route} page grid has 12 columns at 1440x900`, async ({ page }) => {
    await open(page, s.route, VIEWPORTS.desktop);
    const columns = await page
      .locator(`#page-${s.slug} > .grid`)
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(columns.split(/\s+/).filter((c) => /px$/.test(c))).toHaveLength(12);
  });

  test(`${s.route} has no ornament: no svg, two img, the right ones visible`, async ({
    page,
  }) => {
    await open(page, s.route, VIEWPORTS.desktop);
    await expect(page.locator("svg")).toHaveCount(0);
    await expect(page.locator("img")).toHaveCount(2);
    // Off-screen inert pages render their images with JS, so count the current page plus anything outside main.
    const onPage = await page.locator(`#page-${s.slug} img:visible`).count();
    const outsideMain = await page
      .locator("body img:not(main img):visible")
      .count();
    expect(onPage + outsideMain).toBe(VISIBLE_IMG_ROUTES.has(s.route) ? 1 : 0);
  });

  test(`${s.route} deep link paints its page in place at 1440x900`, async ({
    page,
  }) => {
    await open(page, s.route, VIEWPORTS.desktop);
    const state = await page.evaluate(
      (slug) => ({
        hasJs: document.documentElement.hasAttribute("data-js"),
        left: document.getElementById(`page-${slug}`)!.getBoundingClientRect()
          .left,
        scrollX: window.scrollX,
      }),
      s.slug,
    );
    expect(state.hasJs).toBe(true);
    expect(Math.abs(state.left)).toBeLessThanOrEqual(1);
    expect(state.scrollX).toBe(0);
  });
}

for (const s of sections.filter((x) => x.slug !== "index")) {
  test(`${s.route} rail marks exactly one current letter in accent`, async ({
    page,
  }) => {
    await open(page, s.route, VIEWPORTS.desktop);
    const current = page.locator(
      'nav[data-mode="rail"] a[aria-current="page"]',
    );
    await expect(current).toHaveCount(1);
    await expect(current).toHaveCSS("color", ACCENT);
  });
}

test("/ shows the hero wordmark with no current letter", async ({ page }) => {
  await open(page, "/", VIEWPORTS.desktop);
  await expect(page.locator('nav[data-mode="hero"]')).toHaveCount(1);
  await expect(page.locator("nav a[aria-current]")).toHaveCount(0);
});

for (const { viewport, px } of POSTER_SIZES) {
  test(`Poster is ${px}px at ${label(viewport)}`, async ({ page }) => {
    await open(page, "/", viewport);
    const size = await page
      .locator('nav[aria-label="Sections"]')
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(Math.abs(size - px)).toBeLessThanOrEqual(1);
  });
}

for (const vp of [VIEWPORTS.phone, VIEWPORTS.phoneSmall]) {
  test(`index list clears the wordmark at ${label(vp)}`, async ({ page }) => {
    await open(page, "/", vp);
    const listBottom = await page
      .locator("#page-index li")
      .last()
      .evaluate((el) => el.getBoundingClientRect().bottom);
    const letterTop = await page
      .locator("nav a[data-glyph]")
      .first()
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(listBottom).toBeLessThanOrEqual(letterTop);
  });
}

test("portrait resolves to the 1200 or 1512 source at 1440x900", async ({
  page,
}) => {
  await open(page, "/about/", VIEWPORTS.desktop);
  const img = page.locator("#page-about img");
  await expect(img).toBeVisible();
  await expect
    .poll(() => img.evaluate((i: HTMLImageElement) => i.currentSrc))
    .toMatch(/portrait-(1200|1512)/);
});
