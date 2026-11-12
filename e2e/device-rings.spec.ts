// Device 3 of D-05: About's quarter rings (design doc 4.2 item 5).
import { expect, test } from "@playwright/test";
import { open } from "./helpers/pager";

const SHAPE = "#page-about svg[data-quarter-rings] >> xpath=..";
const SIZES = [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
];

for (const viewport of SIZES) {
  test(`quarter rings sit in cols 9-12 and clear the content at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await open(page, "/about/", viewport);
    const shape = page.locator(SHAPE);
    await expect(shape).toHaveAttribute("aria-hidden", "true");
    await expect(shape).toHaveCSS("pointer-events", "none");
    await expect(shape).toHaveCSS("opacity", "1");
    await expect(
      page.locator("svg[data-quarter-rings] circle").first(),
    ).toHaveCSS("stroke-opacity", "0.22");

    const m = await page.evaluate(() => {
      const svg = document.querySelector(
        "#page-about svg[data-quarter-rings]",
      ) as SVGElement;
      const layer = svg.parentElement as HTMLElement;
      const root = layer.parentElement as HTMLElement;
      const box = (e: Element) => {
        const b = e.getBoundingClientRect();
        return { l: b.left, r: b.right, t: b.top, b: b.bottom };
      };
      const hit = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) =>
        a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
      const cols = getComputedStyle(root)
        .gridTemplateColumns.split(/\s+/)
        .map(parseFloat);
      const rootBox = root.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(root).columnGap) || 0;
      const colLeft = (n: number) =>
        rootBox.left +
        cols.slice(0, n - 1).reduce((a, c) => a + c + gap, 0) +
        parseFloat(getComputedStyle(root).paddingLeft || "0") * 0;
      const col12Right = colLeft(12) + cols[11];
      const mine = box(layer);
      const text = box(root.querySelector("p")!.parentElement as Element);
      const portrait = box(
        root.querySelector("button[data-portrait-toggle]") as Element,
      );
      const title = box(root.querySelector("h1") as Element);
      return {
        mine,
        svg: box(svg),
        col9Left: colLeft(9),
        col12Right,
        textTop: text.t,
        hits: [portrait, title, text].map((b) => hit(mine, b)),
      };
    });
    expect(m.mine.l).toBeGreaterThanOrEqual(m.col9Left - 1);
    expect(m.mine.r).toBeLessThanOrEqual(m.col12Right + 1);
    expect(m.mine.b + 48).toBeLessThanOrEqual(m.textTop + 1);
    expect(m.hits).toEqual([false, false, false]);
    expect(Math.abs(m.svg.r - m.mine.r)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.svg.t - m.mine.t)).toBeLessThanOrEqual(1);
  });
}

test("quarter rings are hidden on phones", async ({ page }) => {
  await open(page, "/about/", { width: 390, height: 844 });
  await expect(page.locator(SHAPE)).toBeHidden();
});

test("each ring circle turns white on hover and its siblings stay dim", async ({
  page,
}) => {
  await open(page, "/about/", { width: 1440, height: 900 });
  const circles = page.locator("svg[data-quarter-rings] circle");
  const n = await circles.count();
  expect(n).toBe(14);
  // Point on the stroke of circle i: centre (100,0) in a 100-unit viewBox, so
  // the point straight left of the corner at radius r.
  const point = (i: number) =>
    page.evaluate((idx) => {
      const svg = document.querySelector("svg[data-quarter-rings]")!;
      const c = svg.querySelectorAll("circle")[idx];
      const b = svg.getBoundingClientRect();
      const k = b.width / 100;
      const r = Number(c.getAttribute("r"));
      return { x: b.left + (100 - r) * k, y: b.top + 1 };
    }, i);
  for (const i of [2, 7]) {
    const p = await point(i);
    await page.mouse.move(p.x, p.y);
    await expect(circles.nth(i)).toHaveCSS("stroke-opacity", "1");
    await expect(circles.nth(i + 1)).toHaveCSS("stroke-opacity", "0.22");
    await expect(circles.nth(i - 1)).toHaveCSS("stroke-opacity", "0.22");
    await expect(circles.nth(i)).toHaveCSS("stroke", "rgb(240, 240, 240)");
  }
  await page.mouse.move(5, 5);
  await expect(circles.nth(7)).toHaveCSS("stroke-opacity", "0.22");
});
