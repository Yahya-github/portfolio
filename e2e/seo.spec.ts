// SEO-01 / SEO-02: per-route head metadata and Person JSON-LD in the built HTML.
import { test, expect } from "@playwright/test";
import { facturo } from "../content/facturo";
import { sections, site } from "../content/site";

const CARD = `${site.origin}/share-card.png`;

const PAGES = [
  ...sections.map((s) => ({
    route: s.route,
    title: s.title,
    description: s.description,
  })),
  {
    route: facturo.route,
    title: facturo.metaTitle,
    description: facturo.metaDescription,
  },
];

const content = (selector: string) => `head ${selector}`;

for (const { route, title, description } of PAGES) {
  test(`head metadata for ${route}`, async ({ page }) => {
    await page.goto(route);
    const url = `${site.origin}${route}`;
    const head = (sel: string) => page.locator(content(sel));

    await expect(page).toHaveTitle(title);
    await expect(head('meta[name="description"]')).toHaveAttribute(
      "content",
      description,
    );
    await expect(head("link[rel=canonical]")).toHaveAttribute("href", url);
    await expect(head('meta[property="og:url"]')).toHaveAttribute(
      "content",
      url,
    );
    await expect(head('meta[property="og:image"]')).toHaveAttribute(
      "content",
      CARD,
    );
    await expect(head('meta[property="og:image:width"]')).toHaveAttribute(
      "content",
      "1200",
    );
    await expect(head('meta[property="og:image:height"]')).toHaveAttribute(
      "content",
      "630",
    );
    await expect(head('meta[property="og:image:alt"]')).toHaveAttribute(
      "content",
      site.shareCardAlt,
    );
    await expect(head('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );

    const ld = head('script[type="application/ld+json"]');
    await expect(ld).toHaveCount(1);
    const raw = (await ld.textContent()) ?? "";
    expect(JSON.parse(raw)["@type"]).toBe("Person");
    expect(raw).not.toMatch(/telephone|address|email/);
  });
}

test("404 carries the card and Person data but no canonical", async ({
  page,
}) => {
  await page.goto("/this-page-does-not-exist/");
  await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute(
    "content",
    CARD,
  );
  await expect(
    page.locator('head script[type="application/ld+json"]'),
  ).toHaveCount(1);
  await expect(page.locator("head link[rel=canonical]")).toHaveCount(0);
});
