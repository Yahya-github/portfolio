// DSGN-03: no two pager pages share a layout and the deep dive differs from all six.
// A layout signature is the sorted grid placement (start col, end col, top in 8px steps) of every root child.
import { expect, test, type Page } from "@playwright/test";
import { sections } from "../content/site";
import { open } from "./helpers/pager";

test.use({ viewport: { width: 1440, height: 900 } });

const GRID_STEP_PX = 8;

async function signature(page: Page, rootSelector: string): Promise<string> {
  const placements = await page.evaluate(
    ([sel, step]) => {
      const root = document.querySelector(sel as string);
      if (!root) throw new Error(`no root for ${sel}`);
      const cs = getComputedStyle(root);
      const gutter = parseFloat(cs.columnGap) || 0;
      const cols = cs.gridTemplateColumns.split(" ").map(parseFloat);
      const col = cols[0] ?? 1;
      const box = root.getBoundingClientRect();
      const unit = col + gutter;
      return Array.from(root.children)
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0)
        .map((r) => [
          Math.round((r.left - box.left) / unit),
          Math.round((r.right - box.left + gutter) / unit),
          Math.round((r.top - box.top) / (step as number)),
        ])
        .sort((a, b) => a[0] - b[0] || a[2] - b[2] || a[1] - b[1]);
    },
    [rootSelector, GRID_STEP_PX] as const,
  );
  return JSON.stringify(placements);
}

test("six pages and the deep dive have pairwise different layouts", async ({ page }) => {
  const signatures: string[] = [];
  for (const s of sections) {
    await open(page, s.route);
    const mode = await page.locator("[data-mode]").first().getAttribute("data-mode");
    const sig = `${mode}|${await signature(page, "main section:not([inert]) > .grid")}`;
    test.info().annotations.push({ type: `signature ${s.slug}`, description: sig });
    signatures.push(sig);
  }
  expect(new Set(signatures).size).toBe(6);

  await page.goto("/projects/facturo/");
  const deep = await signature(page, "main article");
  test.info().annotations.push({ type: "signature deep-dive", description: deep });
  for (const sig of signatures) expect(sig.split("|")[1]).not.toBe(deep);
});
