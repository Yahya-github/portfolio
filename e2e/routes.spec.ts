// A11Y-05 / LTR-01 / CONT-01 / D-07
import { test, expect, type Page } from "@playwright/test";
import { sections, site } from "../content/site";
import { achievements } from "../content/achievements";
import { about } from "../content/about";

// Every assertion is a DOM read, so this file runs unchanged with JavaScript off.

const pathname = (page: Page) => new URL(page.url()).pathname;

for (const s of sections) {
  test(`${s.route} shows one page, one h1 and its metadata`, async ({
    page,
  }) => {
    await page.goto(s.route);
    // With JS the five inert pages still render off-screen; without JS they are display: none.
    await expect(
      page.locator("main#content > section:not([inert])"),
    ).toHaveCount(1);
    await expect(page.locator(`#page-${s.slug}`)).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(s.title);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      site.origin + s.route,
    );
    await expect(page.locator("meta[name=description]")).toHaveAttribute(
      "content",
      s.description,
    );
    await expect(page.locator("meta[name=robots]")).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test(`${s.route} header links the resume`, async ({ page }) => {
    await page.goto(s.route);
    await expect(
      page
        .locator("header nav")
        .getByRole("link", { name: site.resume.label, exact: true }),
    ).toHaveAttribute("href", site.resume.href);
  });
}

test("all six pages' text is in the DOM on /", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator("#page-achievements").textContent()).toContain(
    achievements.lines[1].result,
  );
  expect(await page.locator("#page-about").textContent()).toContain(about.lead);
});

test("CONT-01: the role line is visible on /", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(site.roleLine)).toBeVisible();
});

for (const l of sections.filter((s) => s.letter !== null)) {
  test(`hero letter ${l.number} ${l.name} reaches ${l.route}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: `${l.number} ${l.name}`, exact: true })
      .click();
    await expect.poll(() => pathname(page)).toBe(l.route);
    await expect(page.locator(`#page-${l.slug}`)).toBeVisible();
  });
}

test("rail letter navigates and marks one current page", async ({ page }) => {
  await page.goto("/achievements/");
  await page
    .locator('nav[aria-label="Sections"]')
    .getByRole("link", { name: "02 Projects", exact: true })
    .click();
  await expect.poll(() => pathname(page)).toBe("/projects/");
  await expect(
    page.locator('nav[aria-label="Sections"] a[aria-current="page"]'),
  ).toHaveCount(1);
});

test("footer link chains through all six routes and back", async ({ page }) => {
  await page.goto("/");
  const expected = [
    "/achievements/",
    "/projects/",
    "/experience/",
    "/about/",
    "/say-hi/",
    "/",
  ];
  for (const path of expected) {
    await page.locator("footer a").click();
    await expect.poll(() => pathname(page)).toBe(path);
  }
});

// T-03-17 / T-03-29: no reverse tabnabbing and no plain-http outbound links.
for (const route of ["/achievements/", "/projects/", "/say-hi/"]) {
  test(`${route} external links are https with noopener noreferrer`, async ({
    page,
  }) => {
    await page.goto(route);
    const links = page.locator('a[target="_blank"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const href = (await link.getAttribute("href")) ?? "";
      const rel = ((await link.getAttribute("rel")) ?? "").split(/\s+/);
      expect(rel, href).toContain("noopener");
      expect(rel, href).toContain("noreferrer");
      expect(href).toMatch(/^https:\/\//);
    }
  });
}

// CONT-08 / CONT-04: the standalone deep dive keeps resume, contact and safe external links (also JS-off).
const DEEP_DIVE = "/projects/facturo/";

test(`${DEEP_DIVE} header links the resume and Say hi`, async ({ page }) => {
  await page.goto(DEEP_DIVE);
  const nav = page.locator("header nav");
  await expect(
    nav.getByRole("link", { name: site.resume.label, exact: true }),
  ).toHaveAttribute("href", site.resume.href);
  await expect(nav.getByRole("link", { name: "Say hi" })).toHaveAttribute(
    "href",
    "/say-hi/",
  );
});

test(`${DEEP_DIVE} external links are https with noopener noreferrer`, async ({
  page,
}) => {
  await page.goto(DEEP_DIVE);
  const links = page.locator('a[target="_blank"]');
  const count = await links.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    const href = (await link.getAttribute("href")) ?? "";
    const rel = ((await link.getAttribute("rel")) ?? "").split(/\s+/);
    expect(rel, href).toContain("noopener");
    expect(rel, href).toContain("noreferrer");
    expect(href).toMatch(/^https:\/\//);
  }
});
