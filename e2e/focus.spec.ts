// A11Y-02: the skip link is the first stop, and every focus stop shows a solid outline of at least 2px.
import { test, expect } from "@playwright/test";
import { sections, site } from "../content/site";

const MAX_TABS = 60;
const MIN_STOPS = 8;
const INK = "rgb(240, 240, 240)";

interface FocusStop {
  readonly tag: string;
  readonly key: string;
  readonly outlineStyle: string;
  readonly outlineWidth: number;
}

for (const s of sections) {
  test(`${s.route} first Tab focuses the skip link, Enter moves to main`, async ({
    page,
  }) => {
    await page.goto(s.route);
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveText(site.skipLabel);
    await expect(focused).toHaveCSS("opacity", "1");
    await page.keyboard.press("Enter");
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id))
      .toBe("content");
  });

  test(`${s.route} every focus stop has a solid outline >= 2px`, async ({
    page,
  }) => {
    await page.goto(s.route);
    const stops: FocusStop[] = [];
    let firstKey: string | null = null;
    for (let i = 0; i < MAX_TABS; i++) {
      await page.keyboard.press("Tab");
      const stop = await page.evaluate((): FocusStop => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body)
          return { tag: "BODY", key: "", outlineStyle: "", outlineWidth: 0 };
        const cs = getComputedStyle(el);
        const all = [...document.querySelectorAll("*")];
        return {
          tag: el.tagName,
          key: `${el.tagName}#${all.indexOf(el)} ${el.textContent?.trim() ?? ""}`,
          outlineStyle: cs.outlineStyle,
          outlineWidth: parseFloat(cs.outlineWidth),
        };
      });
      if (stop.tag === "BODY" || stop.key === firstKey) break;
      firstKey ??= stop.key;
      stops.push(stop);
    }
    expect(stops.length).toBeGreaterThanOrEqual(MIN_STOPS);
    for (const stop of stops) {
      expect(stop.outlineStyle, stop.key).not.toBe("none");
      expect(stop.outlineWidth, stop.key).toBeGreaterThanOrEqual(2);
    }
  });
}

test("a focused rail letter has an ink outline, never accent", async ({
  page,
}) => {
  await page.goto("/achievements/");
  const letter = page.locator('nav[data-mode="rail"] a').first();
  await letter.focus();
  await expect(letter).toHaveCSS("outline-color", INK);
});
