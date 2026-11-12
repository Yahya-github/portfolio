// SEO-02 / D-05 / D-07: the card and icons are served and linked from every page.
import { test, expect } from "@playwright/test";
import { sections } from "../content/site";

const routes = [...sections.map((s) => s.route), "/projects/facturo/"];

test("/share-card.png is served as a PNG", async ({ request }) => {
  const res = await request.get("/share-card.png");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
});

for (const route of routes) {
  test(`${route} links the icon and the apple icon`, async ({ page }) => {
    await page.goto(route);
    const icon = page.locator('link[rel="icon"]').first();
    await expect(icon).toHaveAttribute("type", "image/svg+xml");
    expect(await icon.getAttribute("href")).toMatch(/^\/icon\.svg/);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      "sizes",
      "180x180",
    );
  });
}

test("the linked icons are served with the right content types", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const iconHref = await page
    .locator('link[rel="icon"]')
    .first()
    .getAttribute("href");
  const appleHref = await page
    .locator('link[rel="apple-touch-icon"]')
    .getAttribute("href");
  const icon = await request.get(iconHref!);
  expect(icon.status()).toBe(200);
  expect(icon.headers()["content-type"]).toContain("image/svg+xml");
  const apple = await request.get(appleHref!);
  expect(apple.status()).toBe(200);
  expect(apple.headers()["content-type"]).toContain("image/png");
});
