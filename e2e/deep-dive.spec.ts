// CONT-04 / CONT-08 / D-01 / D-02: the standalone Facturo deep dive.
import { test, expect, type Page } from "@playwright/test";
import { facturo } from "../content/facturo";
import { site } from "../content/site";

const ROUTE = "/projects/facturo/";
const DESKTOP = { width: 1440, height: 900 };

const pathname = (page: Page) => new URL(page.url()).pathname;

test.describe("deep dive", () => {
  test.use({ viewport: DESKTOP });

  test("standalone page", async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page).toHaveTitle(facturo.metaTitle);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      site.origin + ROUTE,
    );
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Facturo");
    await expect(page.locator("main h2")).toHaveText([
      "Problem",
      "What I built",
      "Result",
      "Links",
    ]);
    await expect(page.locator("header")).toContainText(facturo.headerLabel);
    await expect(page.locator('[data-pager="bar"]')).toHaveCount(0);
    await expect(page.locator("[data-hint]")).toHaveCount(0);
    await expect(
      page.locator("[aria-live]").filter({ hasText: /of 6/ }),
    ).toHaveCount(0);
    await expect(page.locator("main section[inert]")).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.dataset.opening),
    ).toBeUndefined();
    await expect(page.locator("meta[name=robots]")).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("it scrolls vertically and keys do not page", async ({ page }) => {
    await page.goto(ROUTE);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight > window.innerHeight,
      ),
    ).toBe(true);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("PageDown");
    expect(pathname(page)).toBe(ROUTE);
  });

  test("header reaches resume and contact (CONT-08)", async ({
    page,
    request,
  }) => {
    await page.goto(ROUTE);
    const nav = page.locator("header nav");
    const resume = nav.getByRole("link", {
      name: site.resume.label,
      exact: true,
    });
    await expect(resume).toHaveAttribute("href", site.resume.href);
    const res = await request.get(site.resume.href);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
    await expect(nav.getByRole("link", { name: "Say hi" })).toHaveAttribute(
      "href",
      "/say-hi/",
    );
  });

  test("Back to Projects works", async ({ page }) => {
    await page.goto(ROUTE);
    await page
      .locator("footer")
      .getByRole("link", { name: facturo.backLabel })
      .click();
    await expect.poll(() => pathname(page)).toBe("/projects/");
    await expect(page.locator("#page-projects")).toBeVisible();
  });

  test("the rail marks Projects", async ({ page }) => {
    await page.goto(ROUTE);
    const nav = page.locator('nav[data-pager="letters"]');
    await expect(nav).toHaveAttribute("data-mode", "rail");
    await expect(nav.locator('a[href="/projects/"]')).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("screenshots are greyscale and lazy", async ({ page }) => {
    // Chromium's lazy-load margin can fetch a short page early, so assert the loading policy, not request timing.
    await page.goto(ROUTE, { waitUntil: "load" });
    const loading = await page
      .locator("main img")
      .evaluateAll((els) => els.map((e) => e.getAttribute("loading")));
    expect(loading).toEqual(["eager", "lazy", "lazy", "lazy", "lazy"]);
    const imgs = page.locator("main img");
    const count = await imgs.count();
    expect(count).toBe(5);
    for (let i = 0; i < count; i++) {
      await imgs.nth(i).scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          imgs.nth(i).evaluate((el) => (el as HTMLImageElement).currentSrc),
        )
        .toContain("-grey");
    }
  });

  test("cursor mounts on a fine pointer", async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator('[data-cursor-part="root"]')).toBeAttached();
    await page.mouse.move(400, 300);
    await expect(page.locator("html")).toHaveAttribute("data-cursor", "");
  });

  test("the route is served", async ({ request }) => {
    expect((await request.get(ROUTE)).status()).toBe(200);
  });
});

for (const vp of [
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
  test(`phone ${vp.width}: one column, no horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize(vp);
    await page.goto(ROUTE);
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      rights: [...document.querySelectorAll("main img")].map(
        (i) => i.getBoundingClientRect().right,
      ),
    }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
    for (const r of overflow.rights) {
      expect(r).toBeLessThanOrEqual(vp.width);
    }
  });
}
