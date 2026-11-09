import { test, expect } from "@playwright/test";
import { sections, site } from "../content/site";
import { about } from "../content/about";

// DEP-02 / D-13: every request is first-party; the font, image and PDF load; the page is noindex.

for (const s of sections) {
  test(`${s.route} makes first-party requests only`, async ({
    page,
    baseURL,
  }) => {
    const origin = new URL(baseURL!).origin;
    const foreign: string[] = [];
    page.on("request", (r) => {
      const u = r.url();
      if (!u.startsWith(origin) && !u.startsWith("data:")) foreign.push(u);
    });
    await page.goto(s.route, { waitUntil: "networkidle" });
    expect(foreign).toEqual([]);
  });
}

test("/ loads the font and the PDF, is noindex, and fetches no hidden image", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (r) => requested.push(r.url()));
  await page.goto("/", { waitUntil: "networkidle" });

  // The family string comes from the exported const name in app/fonts.ts.
  const fontLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some(
      (f) => f.status === "loaded" && f.family.includes("instrumentSans"),
    );
  });
  expect(fontLoaded).toBe(true);

  // Lazy images inside inert, display: none sections are never fetched.
  expect(
    requested.filter((u) => u.includes("portrait-") || u.includes("facturo-")),
  ).toEqual([]);

  // /say-hi/ has a second Resume link, so scope to the header.
  const pdfHref = await page
    .getByRole("banner")
    .getByRole("link", { name: site.resume.label })
    .getAttribute("href");
  const pdf = await page.request.get(pdfHref!);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

// Pitfall 7: the portrait lives in the About section, hidden on every other route.
test("/about/ shows the portrait, decoded", async ({ page }) => {
  await page.goto("/about/", { waitUntil: "networkidle" });
  const img = page.getByRole("img", { name: about.portraitAlt });
  await expect(img).toBeVisible();
  await expect
    .poll(() =>
      img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0),
    )
    .toBe(true);
});
