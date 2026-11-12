// D-04 / DSGN-01 / DSGN-02 / DSGN-06 / UI-SPEC: overflow, desktop fit, accent use, grid, Poster size, no ornament.
import { test, expect, type Page } from "@playwright/test";
import { sections } from "../content/site";
import {
  landId,
  open as openHydrated,
  pathname,
  waitForLanded,
} from "./helpers/pager";
import { LETTERS, letterRects, waitForGlideSettled } from "./helpers/letters";

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

// The Facturo walkthrough ([data-walk], 20 imgs) is covered by walkthrough.spec.ts and excluded here.

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
          // Ring circles are geometry clipped by their svg viewport; the svg itself is still checked.
          .filter((el) => !el.matches("svg[data-quarter-rings] *"))
          // The edge-cropped page number is cut by the right edge by design (D-05 device 2); the document scrollWidth check still guards it.
          .filter((el) => !el.matches("[data-edge-number]"))
          // The say-hi spiral enters from past the right edge by design (D-04 device 5); its layer clips it.
          .filter((el) => !el.closest("[data-say-hi-spiral-layer]"))
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

  // Phase 6 puts real content images (proof previews, org marks, the portrait twin) inside pages, so the
  // old per-page img count no longer applies. What still holds: no svg ornament and no img outside main.
  test(`${s.route} has no ornament: no svg and no decorative img outside main`, async ({
    page,
  }) => {
    await open(page, s.route, VIEWPORTS.desktop);
    // The only svg allowed is the intentional aria-hidden quarter-rings device on /about/ (D-05).
    await expect(
      page.locator("svg:not([data-quarter-rings]):not([data-say-hi-spiral])"),
    ).toHaveCount(0);
    // Plus the aria-hidden say-hi spiral (06-16): its defs svg and 22 word svgs, inside #page-say-hi only
    // (every page is in the DOM on every route, like the quarter rings).
    await expect(page.locator("svg[data-say-hi-spiral]")).toHaveCount(23);
    await expect(
      page.locator("svg[data-say-hi-spiral]:not(#page-say-hi svg)"),
    ).toHaveCount(0);
    await expect(page.locator("svg[data-quarter-rings]")).toHaveCount(1);
    await expect(
      page.locator("body img:not(main img):not([data-walk] img):visible"),
    ).toHaveCount(0);
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
  // The portrait is a grey/colour twin (two stacked imgs); the grey layer is the one at rest.
  const img = page.locator("#page-about img").first();
  await expect(img).toBeVisible();
  await expect
    .poll(() => img.evaluate((i: HTMLImageElement) => i.currentSrc))
    .toMatch(/portrait-devfest-2026-(grey|color)-(1200|1512)/);
});

test("exactly one accent letter after any paging sequence (LTR-05)", async ({
  page,
}) => {
  await openHydrated(page, "/", VIEWPORTS.desktop);
  for (const key of [
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
  ]) {
    const before = await landId(page);
    await page.keyboard.press(key);
    await waitForLanded(page, before);
    await waitForGlideSettled(page);
    const route = pathname(page);
    const section = sections.find((x) => x.route === route)!;
    const current = page.locator(`${LETTERS} a[aria-current="page"]`);
    if (section.slug === "index") {
      await expect(current).toHaveCount(0);
      continue;
    }
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("href", route);
    await expect(current).toHaveCSS("color", ACCENT);
    const others = page.locator(`${LETTERS} a:not([aria-current="page"])`);
    for (let i = 0; i < (await others.count()); i += 1) {
      await expect(others.nth(i)).not.toHaveCSS("color", ACCENT);
    }
    const now = page.locator(`${LETTERS} > [aria-hidden="true"]`);
    await expect(now).toHaveText(`${section.number} ${section.name}`);
    await expect(now).toBeVisible();
  }
});

test("the accent arrives with the move", async ({ page }) => {
  await openHydrated(page, "/", VIEWPORTS.desktop);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(`${LETTERS}[data-flight="out"]`)).toHaveCount(1);
  await expect(page.locator(`${LETTERS} a[href="/achievements/"]`)).toHaveCSS(
    "color",
    ACCENT,
  );
});

test("each letter's hit area is its own box", async ({ page }) => {
  await openHydrated(page, "/achievements/", VIEWPORTS.desktop);
  const rects = await letterRects(page);
  for (let i = 0; i < rects.length; i += 1) {
    const r = rects[i];
    const owner = await page.evaluate(
      ({ x, y, sel }) => {
        const hit = document.elementFromPoint(x, y)?.closest("a");
        return [...document.querySelectorAll(`${sel} > a`)].indexOf(
          hit as Element,
        );
      },
      { x: r.left + r.width / 2, y: r.top + r.height / 2, sel: LETTERS },
    );
    expect(owner, `letter ${i}`).toBe(i);
  }
});
