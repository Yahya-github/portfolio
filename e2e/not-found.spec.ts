// SEO-02 / D-08 / D-12: the on-brand 404 outside the pager.
import { test, expect } from "@playwright/test";
import { notFound } from "../content/not-found";
import { sections, site } from "../content/site";

const ROUTE = "/this-page-does-not-exist/";
const DESKTOP = { width: 1440, height: 900 };
const ACCENT = "rgb(95, 174, 132)";
const letters = sections.filter((s) => s.letter !== null);

test.describe("404 page", () => {
  test.use({ viewport: DESKTOP });

  test("status and structure", async ({ page }) => {
    const res = await page.goto(ROUTE);
    expect(res?.status()).toBe(404);
    await expect(page).toHaveTitle(notFound.metaTitle);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      `${notFound.display} ${notFound.headingRest}`,
    );
    const nav = page.getByRole("navigation", { name: site.navLabel });
    const links = nav.getByRole("link");
    await expect(links).toHaveCount(5);
    for (const [i, s] of letters.entries()) {
      await expect(links.nth(i)).toHaveAttribute("href", s.route);
      await expect(links.nth(i)).toHaveAccessibleName(`${s.number} ${s.name}`);
    }
    await expect(
      page.getByRole("link", { name: site.footer.backToStart }),
    ).toHaveAttribute("href", "/");
    await expect(page.locator('[data-pager="bar"]')).toHaveCount(0);
    await expect(page.locator("[data-hint]")).toHaveCount(0);
    await expect(page.locator('nav[data-pager="letters"]')).toHaveCount(0);
    await expect(page.locator("link[rel=canonical]")).toHaveCount(0);
    const robots = await page
      .locator("meta[name=robots]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("content") ?? ""));
    expect(robots.every((c) => c.includes("noindex"))).toBe(true);
    expect(
      robots.some((c) => c.includes("follow") && !c.includes("nofollow")),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.dataset.opening),
    ).toBeUndefined();
  });

  test("keyboard order and focus ring", async ({ page }) => {
    await page.goto(ROUTE);
    await page.keyboard.press("Tab");
    await expect(page.locator("a:focus", { hasText: /skip/i })).toHaveCount(1);
    const nav = page.getByRole("navigation", { name: site.navLabel });
    const hrefOf = () =>
      page.evaluate(() => document.activeElement?.getAttribute("href") ?? "");
    const inNav = () =>
      nav
        .locator("a:focus")
        .count()
        .then((n) => n === 1);
    let presses = 0;
    while (!(await inNav()) && presses < 10) {
      await page.keyboard.press("Tab");
      presses += 1;
    }
    expect(await hrefOf()).toBe(letters[0].route);
    const expected = [...letters.slice(1).map((s) => s.route), "/"];
    for (const [i, href] of ["first", ...expected].entries()) {
      if (i > 0) {
        await page.keyboard.press("Tab");
        expect(await hrefOf()).toBe(href);
      }
      const ring = await page.evaluate(() => {
        const cs = getComputedStyle(document.activeElement as Element);
        return { style: cs.outlineStyle, color: cs.outlineColor };
      });
      expect(ring).toEqual({ style: "solid", color: ACCENT });
    }
  });

  test("fit at 1440x900 and 1366x768", async ({ page }) => {
    for (const vp of [DESKTOP, { width: 1366, height: 768 }]) {
      await page.setViewportSize(vp);
      await page.goto(ROUTE);
      const fits = await page.evaluate(
        () =>
          (document.scrollingElement?.scrollHeight ?? 0) <= window.innerHeight,
      );
      expect(fits).toBe(true);
    }
  });
});

test.describe("404 reduced motion", () => {
  test.use({ viewport: DESKTOP, reducedMotion: "reduce" });

  test("letter links do not transition", async ({ page }) => {
    await page.goto(ROUTE);
    const first = page
      .getByRole("navigation", { name: site.navLabel })
      .getByRole("link")
      .first();
    await expect(first).toHaveCSS("transition-duration", "0s");
  });
});

test.describe("404 without JavaScript", () => {
  test.use({ viewport: DESKTOP, javaScriptEnabled: false });

  test("content is still there", async ({ page }) => {
    const res = await page.goto(ROUTE);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: site.navLabel }).getByRole("link"),
    ).toHaveCount(5);
    await expect(
      page
        .getByRole("navigation", { name: site.navLabel })
        .getByRole("link")
        .first(),
    ).toBeVisible();
  });
});

test.describe("404 on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("letter links are tap sized and captioned", async ({ page }) => {
    await page.goto(ROUTE);
    const links = page
      .getByRole("navigation", { name: site.navLabel })
      .getByRole("link");
    for (const [i, s] of letters.entries()) {
      const link = links.nth(i);
      const box = await link.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      await expect(link.getByText(s.name)).toBeVisible();
    }
  });
});
