import { test, expect } from "@playwright/test";

// DEP-02 / D-13: every request is first-party; the font, image and PDF load; the page is noindex.
test("all assets first-party; font, image and PDF load; page is noindex", async ({
  page,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin;
  const foreign: string[] = [];
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith(origin) && !u.startsWith("data:")) foreign.push(u);
  });
  const fontStatuses: number[] = [];
  page.on("response", (r) => {
    if (/\/_next\/static\/media\/[^/?]+\.woff2(?:\?|$)/.test(r.url())) {
      fontStatuses.push(r.status());
    }
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(foreign).toEqual([]);

  // The self-hosted WOFF2 must actually be fetched from /_next/static/media.
  expect(fontStatuses.length).toBeGreaterThan(0);
  expect(fontStatuses.every((s) => s === 200)).toBe(true);

  // The family string comes from the exported const name in app/fonts.ts.
  // Match it exactly: next/font also emits an "instrumentSans Fallback" face
  // backed by local(Arial), which must not satisfy this check.
  const fontLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some(
      (f) =>
        f.status === "loaded" &&
        f.family.replace(/["']/g, "") === "instrumentSans",
    );
  });
  expect(fontLoaded).toBe(true);

  const img = page.getByRole("img", { name: /Yahya Hallani/ });
  await expect(img).toBeVisible();
  expect(
    await img.evaluate(
      (i: HTMLImageElement) => i.complete && i.naturalWidth > 0,
    ),
  ).toBe(true);

  const pdfHref = await page
    .getByRole("link", { name: /Resume/ })
    .getAttribute("href");
  const pdf = await page.request.get(pdfHref!);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
