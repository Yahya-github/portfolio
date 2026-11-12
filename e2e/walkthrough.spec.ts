// CONT-11: the Facturo walkthrough (hold matrix, resume, stepper, lazy loading, touch).
import { expect, test, type Page } from "@playwright/test";
import { projects } from "../content/projects";
import { open, waitForLanded, landId } from "./helpers/pager";

const DESKTOP = { width: 1440, height: 900 };
const HOLD_MS = 800;
const WINDOW_MS = 2000;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (ms) =>
      document.addEventListener("DOMContentLoaded", () => {
        const s = document.createElement("style");
        s.textContent = `:root{--walk-hold:${ms}ms}`;
        document.head.append(s);
      }),
    HOLD_MS,
  );
});

const group = (page: Page) => page.locator("[data-walk]");
const counter = (page: Page) => page.locator("[data-walk-counter]");
const read = async (page: Page) => (await counter(page).textContent()) ?? "";

async function ready(page: Page, route = "/projects/"): Promise<void> {
  await open(page, route, DESKTOP);
  await expect(group(page)).toHaveAttribute("data-walk", "ready");
}

async function advancesWithin(page: Page, ms = WINDOW_MS): Promise<void> {
  const start = await read(page);
  await expect.poll(() => read(page), { timeout: ms }).not.toBe(start);
}

async function staysFor(page: Page, ms = WINDOW_MS): Promise<void> {
  const start = await read(page);
  const deadline = Date.now() + ms;
  let changed = false;
  await expect
    .poll(
      async () => {
        if ((await read(page)) !== start) changed = true;
        return changed || Date.now() >= deadline;
      },
      { intervals: [200], timeout: ms + 1000 },
    )
    .toBe(true);
  expect(changed).toBe(false);
  expect(await read(page)).toBe(start);
}

async function centre(page: Page) {
  const b = await group(page).boundingBox();
  if (!b) throw new Error("no frame box");
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

async function park(page: Page): Promise<void> {
  await page.mouse.move(5, 5);
}

test.describe("walkthrough on desktop", () => {
  test.use({ viewport: DESKTOP });

  test("it advances on its own", async ({ page }) => {
    await ready(page);
    expect(await read(page)).toBe("01 / 10, Home");
    await park(page);
    await expect
      .poll(() => read(page), { timeout: 2500 })
      .toBe("02 / 10, History");
  });

  test("hover on the frame pauses and shows colour", async ({ page }) => {
    await ready(page);
    const c = await centre(page);
    await page.mouse.move(c.x, c.y);
    await expect(group(page)).toHaveAttribute("data-colour", "");
    const src = page
      .locator("[data-frame][data-current] img[data-twin=colour]")
      .first();
    await expect
      .poll(() => src.evaluate((i: HTMLImageElement) => i.currentSrc))
      .toContain("/media/facturo/facturo-0");
    expect(
      await src.evaluate((i: HTMLImageElement) => i.currentSrc),
    ).not.toContain("-grey");
    await staysFor(page);
    await page
      .getByRole("heading", { name: projects.flagship.name, exact: true })
      .hover();
    await expect(group(page)).not.toHaveAttribute("data-colour", /.*/);
    await advancesWithin(page);
  });

  test("the heading, lines and counter never pause it", async ({ page }) => {
    await ready(page);
    const targets = [
      page.getByRole("heading", { name: projects.flagship.name, exact: true }),
      page.getByText(projects.flagship.lines[0]),
      counter(page),
    ];
    for (const t of targets) {
      await t.hover();
      await advancesWithin(page);
    }
  });

  test("a mouse-clicked Next does not hold", async ({ page }) => {
    await ready(page);
    const before = await read(page);
    await page.getByRole("button", { name: "Next screen" }).click();
    await expect.poll(() => read(page)).not.toBe(before);
    await park(page);
    await advancesWithin(page);
  });

  test("keyboard focus holds; leaving resumes", async ({ page }) => {
    await ready(page);
    await park(page);
    for (let i = 0; i < 30; i++) {
      if (
        await page.evaluate(() =>
          document.activeElement?.hasAttribute("data-walk"),
        )
      )
        break;
      await page.keyboard.press("Tab");
    }
    await expect(group(page)).toBeFocused();
    await expect(group(page)).toHaveAttribute("data-colour", "");
    await staysFor(page);
    for (let i = 0; i < 30; i++) {
      const inside = await page.evaluate(
        () =>
          !!document.activeElement?.closest(
            "[data-walk], [data-walk-controls]",
          ),
      );
      if (!inside) break;
      await page.keyboard.press("Tab");
    }
    await advancesWithin(page);
  });

  test("Pause holds until Play", async ({ page }) => {
    await ready(page);
    const pause = page.getByRole("button", { name: "Pause walkthrough" });
    await pause.click();
    const play = page.getByRole("button", { name: "Play walkthrough" });
    await expect(play).toHaveText("Play");
    await park(page);
    await staysFor(page);
    await play.click();
    await park(page);
    await advancesWithin(page);
  });

  test("off-page pauses", async ({ page }) => {
    await ready(page);
    await park(page);
    const before = await landId(page);
    await page.keyboard.press("ArrowRight");
    await waitForLanded(page, before);
    const state = () =>
      page.evaluate(
        () =>
          document
            .querySelector("[data-frame][data-current]")
            ?.getAnimations()[0]?.playState,
      );
    await expect.poll(state).toBe("paused");
    const back = await landId(page);
    await page.keyboard.press("ArrowLeft");
    await waitForLanded(page, back);
    await advancesWithin(page);
  });

  test("frames load one ahead and colour only on demand", async ({ page }) => {
    const urls: string[] = [];
    page.on("request", (r) => urls.push(r.url()));
    await page.mouse.move(5, 5);
    await page.goto("/projects/");
    await expect(group(page)).toHaveAttribute("data-walk", "ready");
    await page.waitForLoadState("networkidle");
    expect(urls.filter((u) => /\/facturo-(0[3-9]|10)-/.test(u))).toEqual([]);
    const colour = urls.filter(
      (u) => u.includes("/media/facturo/") && !u.includes("-grey"),
    );
    expect(colour).toEqual([]);
  });

  test("the phone frame is shown whole", async ({ page }) => {
    await ready(page);
    const next = page.getByRole("button", { name: "Next screen" });
    for (let i = 0; i < 9 && !(await read(page)).startsWith("09 / 10"); i++) {
      await next.click();
      await expect.poll(() => read(page)).toMatch(/^\d\d \/ 10/);
    }
    await expect.poll(() => read(page)).toMatch(/^09 \/ 10/);
    const fit = await page
      .locator("[data-frame][data-current] img[data-twin=grey]")
      .evaluate((i) => getComputedStyle(i).objectFit);
    expect(fit).toBe("contain");
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: DESKTOP, reducedMotion: "reduce" });

  test("is a stepper", async ({ page }) => {
    await ready(page);
    await expect(
      page.getByRole("button", { name: "Pause walkthrough" }),
    ).toBeHidden();
    await park(page);
    await staysFor(page, 2500);
    await page.getByRole("button", { name: "Next screen" }).click();
    await expect(counter(page)).toHaveText("02 / 10, History");
    await expect(page.locator("[data-walk-status]")).toHaveText(
      "02 of 10, History",
    );
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, viewport: DESKTOP });

  test("frame 1 shows in grey and no controls render", async ({ page }) => {
    await page.goto("/projects/");
    const first = page.locator('[data-frame="0"] img[data-twin=grey]');
    await expect(first).toBeVisible();
    await expect(first).toHaveAttribute(
      "alt",
      projects.flagship.walkthrough.frames[0].alt,
    );
    await expect(page.locator("[data-walk-controls]")).toBeHidden();
    const later = page.locator(
      '[data-frame]:not([data-frame="0"]) img[data-twin=grey]',
    );
    expect(await later.count()).toBe(9);
    for (const img of await later.all()) {
      await expect(img).not.toHaveAttribute("src", /.*/);
    }
  });
});

test.describe("touch", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("a tap holds with colour, a second tap releases", async ({ page }) => {
    await page.goto("/projects/");
    await expect(group(page)).toHaveAttribute("data-walk", "ready");
    await group(page).tap();
    await expect(group(page)).toHaveAttribute("data-colour", "");
    await group(page).tap();
    await expect(group(page)).not.toHaveAttribute("data-colour", /.*/);
    const controls = page.locator("[data-walk-controls] button");
    for (const b of await controls.all()) {
      const box = await b.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });
});
