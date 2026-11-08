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
  await page.goto("/", { waitUntil: "networkidle" });
  expect(foreign).toEqual([]);

  // The family string comes from the exported const name in app/fonts.ts.
  const fontLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some(
      (f) => f.status === "loaded" && f.family.includes("instrumentSans"),
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
