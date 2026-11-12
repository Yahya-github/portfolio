// Device 2 of D-05: the edge-cropped "03" on Experience (design doc 4.2 item 3).
import { expect, test } from "@playwright/test";
import { open } from "./helpers/pager";

const EDGE = '#page-experience span[aria-hidden="true"].tnum';
const SIZES = [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
];

for (const viewport of SIZES) {
  test(`edge number fits and clears content at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await open(page, "/experience/", viewport);
    const edge = page.locator(EDGE).last();
    await expect(edge).toHaveAttribute("aria-hidden", "true");
    await expect(edge).toHaveText("03");

    const m = await page.evaluate((sel) => {
      const els = document.querySelectorAll(sel);
      const el = els[els.length - 1] as HTMLElement;
      const r = el.getBoundingClientRect();
      const box = (e: Element) => {
        const b = e.getBoundingClientRect();
        return { l: b.left, r: b.right, t: b.top, b: b.bottom };
      };
      const hit = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) =>
        a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
      const mine = box(el);
      const obstacles = Array.from(
        document.querySelectorAll(
          "#page-experience ol, #page-experience ul, #page-experience a, nav",
        ),
      )
        .map(box)
        .filter((b) => b.r > b.l && b.b > b.t);
      const root = el.parentElement as HTMLElement;
      const cs = getComputedStyle(root);
      const rb = root.getBoundingClientRect();
      const pad = parseFloat(cs.paddingLeft);
      const gap = parseFloat(cs.columnGap);
      const inner = rb.width - pad - parseFloat(cs.paddingRight);
      const col = (inner - 11 * gap) / 12;
      const section = document.getElementById("page-experience") as HTMLElement;
      return {
        fontSize: parseFloat(getComputedStyle(el).fontSize),
        left: r.left,
        right: r.right,
        width: r.width,
        bottom: r.bottom,
        footerTop: (
          document.querySelector("footer") as HTMLElement
        ).getBoundingClientRect().top,
        collides: obstacles.some((o) => hit(mine, o)),
        col9Left: rb.left + pad + 8 * (col + gap),
        innerWidth: window.innerWidth,
        docOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        sectionOverflowX: getComputedStyle(section).overflowX,
        namesEnd: getComputedStyle(section).getPropertyValue("--names-end"),
      };
    }, EDGE);

    if (viewport.width === 1440) console.log(`edge font-size ${m.fontSize}px`);
    expect(m.right).toBeGreaterThan(m.innerWidth);
    expect(m.left + 0.55 * m.width).toBeLessThan(m.innerWidth);
    // Box bottom sits on the footer line (line-height 0.72 leaves the glyph box inside).
    expect(Math.abs(m.bottom - m.footerTop)).toBeLessThanOrEqual(
      0.06 * m.fontSize,
    );
    expect(m.collides).toBe(false);
    expect(m.left).toBeGreaterThanOrEqual(m.col9Left - 1);
    expect(m.docOverflow).toBeLessThanOrEqual(0);
    // scrollWidth counts clipped overflow, so assert the section clips (never scrolls) instead.
    expect(m.sectionOverflowX).toBe("clip");
    expect(m.namesEnd.trim()).not.toBe("");
  });
}

test("edge number is hidden on phones", async ({ page }) => {
  await open(page, "/experience/", { width: 390, height: 844 });
  await expect(page.locator(EDGE).last()).toBeHidden();
});
