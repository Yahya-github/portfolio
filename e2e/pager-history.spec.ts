// NAV-04 / A11Y-01 / Pitfalls 1-2: URL, deep links, Back/Forward, title, announcer.
import { test, expect, type Page } from "@playwright/test";
import { sections } from "../content/site";
import { landId, open, pathname, waitForLanded } from "./helpers/pager";

const lettersNav = (page: Page) => page.locator('nav[aria-label="Sections"]');
const letterLink = (page: Page, route: string) =>
  lettersNav(page).locator(`a[href="${route}"]`);
const liveRegion = (page: Page) => page.locator('p[aria-live="polite"]');

for (const s of sections) {
  test(`deep link ${s.route} lands on its page with nothing animating`, async ({
    page,
  }) => {
    await open(page, s.route);
    // Pager motion only: the margin-names strips (06-15, paused off the current page) and the
    // Projects walkthrough frames (06-0x, their own fade/loop) are page-local, not the pager in flight.
    expect(
      await page.evaluate(
        () =>
          document.getAnimations().filter((a) => {
            const target = (a.effect as KeyframeEffect | null)?.target;
            return !(
              target?.hasAttribute("data-names-strip") ||
              /(^|\s|_)fr(\s|$)/.test(target?.className?.toString() ?? "")
            );
          }).length,
      ),
    ).toBe(0);
    const live = page.locator("main#content > section:not([inert])");
    await expect(live).toHaveCount(1);
    await expect(live).toHaveId(`page-${s.slug}`);
    const left = await page
      .locator(`#page-${s.slug}`)
      .evaluate((el) => el.getBoundingClientRect().left);
    expect(Math.abs(left)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.title)).toBe(s.title);
  });
}

test("a link pages, then Back and Forward slide without a reload", async ({
  page,
}) => {
  await open(page, "/");
  await page.evaluate(() => {
    (window as unknown as { __marker: number }).__marker = 1;
  });

  let before = await landId(page);
  await page
    .getByRole("link", { name: "01 Achievements", exact: true })
    .click();
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/achievements/");
  await expect(page).toHaveTitle("Achievements, Yahya Hallani");
  await expect(liveRegion(page)).toHaveText("Achievements, page 2 of 6");
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    return { id: el?.id ?? "", inInert: el?.closest("[inert]") !== null };
  });
  expect(focus).toEqual({ id: "title-achievements", inInert: false });
  expect(
    await page.evaluate(
      () => document.querySelectorAll("next-route-announcer").length,
    ),
  ).toBe(0);
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("manual");

  before = await landId(page);
  await page.goBack();
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/");
  await expect(page).toHaveTitle("Yahya Hallani");
  expect(
    await page.evaluate(
      () => (window as unknown as { __marker?: number }).__marker,
    ),
  ).toBe(1);
  await expect(liveRegion(page)).toHaveText("Index, page 1 of 6");

  before = await landId(page);
  await page.goForward();
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/achievements/");
});

test("each landing adds exactly one history entry", async ({ page }) => {
  await open(page, "/");
  const length = await page.evaluate(() => history.length);
  const before = await landId(page);
  await letterLink(page, "/experience/").click();
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/experience/");
  expect(await page.evaluate(() => history.length)).toBe(length + 1);
});

test("the current page's link starts nothing", async ({ page }) => {
  await open(page, "/achievements/");
  const before = await landId(page);
  const length = await page.evaluate(() => history.length);
  await letterLink(page, "/achievements/").click();
  await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(1);
  expect(await landId(page)).toBe(before);
  expect(await page.evaluate(() => history.length)).toBe(length);
  expect(pathname(page)).toBe("/achievements/");
});

test("?debug survives a page change", async ({ page }) => {
  await open(page, "/?debug");
  const before = await landId(page);
  await page
    .getByRole("link", { name: "01 Achievements", exact: true })
    .click();
  await waitForLanded(page, before);
  expect(pathname(page)).toBe("/achievements/");
  expect(new URL(page.url()).search).toBe("?debug");
});

test("popstate to an unknown path changes nothing", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (e) => errors.push(e));
  await open(page, "/");
  const before = await landId(page);
  await page.evaluate(() => {
    history.pushState(null, "", "/nope/");
    dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(1);
  expect(await landId(page)).toBe(before);
  await expect(page.locator("main#content > section:not([inert])")).toHaveId(
    "page-index",
  );
  expect(errors).toEqual([]);
});
