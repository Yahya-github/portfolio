// Device 4 (margin section names) and the D-06 Pause motion control (WCAG 2.2.2), plus the
// hint collision rule: the control and the hint never share the footer.
import { expect, test, type Locator, type Page } from "@playwright/test";
import { FRESH_VISITOR } from "./helpers/first-visit";
import { open } from "./helpers/pager";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const TOGGLE = "footer button[data-motion-toggle]";

const strip = (page: Page, slug: string): Locator =>
  page.locator(`#page-${slug} [data-names-strip]`);

const playState = (loc: Locator): Promise<string> =>
  loc.evaluate((el) => el.getAnimations()[0]?.playState ?? "none");

async function ready(page: Page): Promise<void> {
  await expect(page.locator("html[data-motion-ready]")).toHaveCount(1);
}

test("names run on the current page only, at about 30px/s", async ({
  page,
}) => {
  await open(page, "/achievements/", DESKTOP);
  await ready(page);
  await expect
    .poll(() => playState(strip(page, "achievements")))
    .toBe("running");
  expect(await playState(strip(page, "projects"))).toBe("paused");
  const speed = await strip(page, "achievements").evaluate((el) => {
    const half = el.getBoundingClientRect().height / 2;
    const d = parseFloat(el.style.getPropertyValue("--names-d"));
    return half / d;
  });
  expect(speed).toBeGreaterThan(29);
  expect(speed).toBeLessThan(31);
});

test("Pause motion stops them and Play motion starts them", async ({
  page,
}) => {
  await open(page, "/achievements/", DESKTOP);
  await ready(page);
  const button = page.locator(TOGGLE);
  await expect(button).toBeVisible();
  await expect(button).toHaveText(/Pause motion/);
  await button.click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect
    .poll(() => playState(strip(page, "achievements")))
    .toBe("paused");
  await expect(button).toHaveText(/Play motion/);
  await button.click();
  await expect
    .poll(() => playState(strip(page, "achievements")))
    .toBe("running");
});

test("pausing is not stored", async ({ page }) => {
  await open(page, "/achievements/", DESKTOP);
  await ready(page);
  await page.locator(TOGGLE).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await page.reload();
  await ready(page);
  await expect(page.locator("html")).not.toHaveAttribute("data-motion", /.*/);
  await expect
    .poll(() => playState(strip(page, "achievements")))
    .toBe("running");
});

test("a hidden tab pauses the names", async ({ page }) => {
  await open(page, "/achievements/", DESKTOP);
  await ready(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("html")).toHaveAttribute("data-tab-hidden", "");
  await expect
    .poll(() => playState(strip(page, "achievements")))
    .toBe("paused");
});

test("the control is hidden on the Index", async ({ page }) => {
  await open(page, "/", DESKTOP);
  await ready(page);
  await expect(page.locator(TOGGLE)).toHaveCSS("visibility", "hidden");
});

test("reduced motion: no control, names still and shown once", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/achievements/", DESKTOP);
  await ready(page);
  await expect(page.locator(TOGGLE)).toHaveCSS("display", "none");
  const s = strip(page, "achievements");
  expect(await playState(s)).toBe("none");
  const shown = await s.evaluate(
    (el) =>
      Array.from(el.children).filter(
        (c) => getComputedStyle(c).display !== "none",
      ).length,
  );
  expect(shown).toBe(1);
});

test("Experience names stop 24px above the 03", async ({ page }) => {
  await open(page, "/experience/", DESKTOP);
  await ready(page);
  const m = await page.evaluate(() => {
    const edge = document.querySelector<HTMLElement>(
      "#page-experience [data-edge-number]",
    )!;
    const names = document.querySelector<HTMLElement>(
      "#page-experience [data-names-strip]",
    )!.parentElement!;
    return {
      namesBottom: names.getBoundingClientRect().bottom,
      edgeTop: edge.getBoundingClientRect().top,
    };
  });
  expect(m.namesBottom).toBeLessThanOrEqual(m.edgeTop - 24 + 1);
});

test("phones show neither names nor control", async ({ page }) => {
  await open(page, "/achievements/", PHONE);
  await ready(page);
  await expect(page.locator(TOGGLE)).toHaveCSS("display", "none");
  await expect(
    page.locator("#page-achievements [data-names-strip]").locator(".."),
  ).toHaveCSS("display", "none");
});

test.describe("JavaScript off", () => {
  test.use({ javaScriptEnabled: false });
  test("no control; names visible and static", async ({ page }) => {
    await page.goto("/achievements/");
    await expect(page.locator(TOGGLE)).toHaveCSS("display", "none");
    const s = strip(page, "achievements");
    await expect(s).toBeVisible();
    expect(await playState(s)).toBe("paused");
  });
});

test.describe("first visit", () => {
  test.use({ storageState: FRESH_VISITOR });

  test("the hint and the control never share the footer", async ({ page }) => {
    await page.goto("/achievements/");
    await expect(page.locator('main#content[data-phase="idle"]')).toHaveCount(
      1,
    );
    await ready(page);
    const html = page.locator("html");
    const button = page.locator(TOGGLE);
    const hint = page.locator("footer [data-hint]");
    await expect(html).toHaveAttribute("data-hint", "pending");
    await expect(button).toBeHidden();
    expect(await playState(strip(page, "achievements"))).toBe("paused");

    // Sample until the hint ends on its own: never both visible.
    await expect
      .poll(
        async () => {
          const hintShown = (await hint.textContent())?.trim() !== "";
          const buttonShown = await button.isVisible();
          expect(hintShown && buttonShown).toBe(false);
          return html.evaluate((el) => el.hasAttribute("data-hint"));
        },
        { intervals: [100], timeout: 20_000 },
      )
      .toBe(false);

    await expect(button).toBeVisible();
    await expect
      .poll(() => playState(strip(page, "achievements")))
      .toBe("running");
  });
});
