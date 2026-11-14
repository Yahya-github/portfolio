// PROOF-02: the robot stage. Still first, lazy WebGL2 viewer, keys, motion
// control and silent degradation. The mesh bytes are the generated placeholder.
import { test, expect, type Page } from "@playwright/test";
import { robot } from "../content/robot";
import { robotModel } from "../content/generated/robot-model";
import { proofGate } from "../content/proof-gate";
import { robotViewerOn } from "../lib/proof/gate";
import { encodeMesh, placeholderMesh } from "../scripts/lib/robot-mesh.mjs";

const ROUTE = "/projects/robot/";
const DESKTOP = { width: 1440, height: 900 };
const viewerOn = robotViewerOn(proofGate, robotModel);
const figure = "[data-model]";
const canvas = "[data-model-slot] canvas";
const SETTLE_MS = 900;

async function serveMesh(page: Page): Promise<void> {
  const body = Buffer.from(encodeMesh(placeholderMesh()));
  await page.route("**/models/robot/**", (route) =>
    route.fulfill({ contentType: "application/octet-stream", body }),
  );
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/** Fixed scroll position first, so fixed header/footer overlap is identical across shots. */
async function shot(page: Page): Promise<Buffer> {
  await page.locator(canvas).evaluate((el) => {
    el.scrollIntoView({ block: "center", behavior: "instant" });
  });
  return page.locator(canvas).screenshot({ animations: "disabled" });
}

async function live(page: Page): Promise<void> {
  await page.goto(ROUTE);
  await expect(page.locator(figure)).toHaveAttribute(
    "data-model-state",
    "live",
  );
}

/** Home both stops auto-rotate and gives a known pose. */
async function startPose(page: Page): Promise<Buffer> {
  await page.locator(figure).focus();
  await page.keyboard.press("Home");
  await page.waitForTimeout(SETTLE_MS);
  return shot(page);
}

test.describe("robot standalone", () => {
  test.use({ viewport: DESKTOP });

  test("standalone page", async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("header")).toContainText(robot.headerLabel);
    await expect(page.locator('[data-pager="bar"]')).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: robot.backLabel }).first(),
    ).toBeVisible();
  });

  test("the still is visible immediately", async ({ page }) => {
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
    const box = await page.locator("[data-model-still] img").boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);
  });

  test("viewer and model load only on the robot route", async ({ page }) => {
    await serveMesh(page);
    const seen = new Map<string, Set<string>>();
    let route = "";
    page.on("request", (r) => {
      if (!seen.has(route)) seen.set(route, new Set());
      seen.get(route)?.add(new URL(r.url()).pathname);
    });
    for (const r of ["/", "/projects/", ROUTE]) {
      route = r;
      await page.goto(r);
      await page.waitForLoadState("networkidle");
    }
    const others = [
      ...(seen.get("/") ?? []),
      ...(seen.get("/projects/") ?? []),
    ];
    expect(others.some((p) => p.includes("/models/"))).toBe(false);
    const robotPaths = [...(seen.get(ROUTE) ?? [])];
    if (!viewerOn) {
      await expect(page.locator("[data-model-src]")).toHaveCount(0);
      return;
    }
    expect(robotPaths.some((p) => p.includes("/models/"))).toBe(true);
    const robotOnly = robotPaths.filter(
      (p) => p.endsWith(".js") && !others.includes(p),
    );
    expect(robotOnly.length).toBeGreaterThan(0);
  });

  test("gate off: no viewer hooks", async ({ page }) => {
    test.skip(viewerOn, "viewer is on");
    await page.goto(ROUTE);
    await expect(page.locator("[data-model-src]")).toHaveCount(0);
  });

  test.describe("viewer", () => {
    test.skip(!viewerOn, "gate has the viewer off");
    test.beforeEach(async ({ page }) => serveMesh(page));

    test("goes live with a canvas and group semantics, still kept", async ({
      page,
    }) => {
      await live(page);
      await expect(page.locator(canvas)).toHaveCount(1);
      await expect(page.locator(figure)).toHaveAttribute("role", "group");
      await expect(page.locator(figure)).toHaveAttribute(
        "aria-label",
        robot.viewer.groupLabel,
      );
      await expect(page.locator("[data-model-still]")).toHaveCount(1);
    });

    test("arrow keys rotate; Home and Reset view restore the start pose", async ({
      page,
    }) => {
      await live(page);
      const start = await startPose(page);
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(SETTLE_MS);
      expect((await shot(page)).equals(start)).toBe(false);
      await page.keyboard.press("Home");
      await page.waitForTimeout(SETTLE_MS);
      expect((await shot(page)).equals(start)).toBe(true);
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(SETTLE_MS);
      await page.getByRole("button", { name: robot.viewer.reset }).click();
      await page.waitForTimeout(SETTLE_MS);
      // the start shot had the focus ring; restore focus so only pose differs
      await page.locator(figure).focus();
      expect((await shot(page)).equals(start)).toBe(true);
    });

    test("Tab moves past the viewer", async ({ page }) => {
      await live(page);
      await page.locator(figure).focus();
      await page.keyboard.press("Tab");
      const onFigure = await page.evaluate(
        () => document.activeElement?.matches("[data-model]") ?? false,
      );
      expect(onFigure).toBe(false);
    });

    test("drag rotates with a mouse", async ({ page }) => {
      await live(page);
      const start = await startPose(page);
      const box = await page.locator(canvas).boundingBox();
      if (!box) throw new Error("no canvas");
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + 120, cy, { steps: 6 });
      await page.mouse.up();
      expect((await shot(page)).equals(start)).toBe(false);
    });

    test("normal motion: rotates until touched, then the Pause control hides", async ({
      page,
    }) => {
      await live(page);
      const a = await shot(page);
      await page.waitForTimeout(SETTLE_MS);
      expect((await shot(page)).equals(a)).toBe(false);
      await page.locator(canvas).click();
      await page.waitForTimeout(200);
      const b = await shot(page);
      await page.waitForTimeout(SETTLE_MS);
      expect((await shot(page)).equals(b)).toBe(true);
      await expect(
        page.locator("footer button[data-motion-toggle]"),
      ).toBeHidden();
    });

    test("auto-rotate resumes after a few idle seconds", async ({ page }) => {
      await live(page);
      await page.locator(canvas).click();
      await page.waitForTimeout(200);
      const paused = await shot(page);
      await page.waitForTimeout(4200);
      await shot(page);
      await page.waitForTimeout(SETTLE_MS);
      expect((await shot(page)).equals(paused)).toBe(false);
    });

    test("Pause motion freezes rotation before any touch", async ({ page }) => {
      await live(page);
      await expect(page.locator("html[data-motion-ready]")).toHaveCount(1);
      await page.locator("footer button[data-motion-toggle]").click();
      await page.waitForTimeout(200);
      const a = await shot(page);
      await page.waitForTimeout(SETTLE_MS);
      expect((await shot(page)).equals(a)).toBe(true);
    });

    test.describe("reduced motion", () => {
      test.use({ reducedMotion: "reduce" });
      test("no auto-rotate", async ({ page }) => {
        await live(page);
        const a = await shot(page);
        await page.waitForTimeout(SETTLE_MS);
        expect((await shot(page)).equals(a)).toBe(true);
      });
    });

    test("no WebGL2: still stays, no canvas, no console errors", async ({
      page,
    }) => {
      const errors = collectErrors(page);
      await page.addInitScript(() => {
        const orig = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          type: string,
          ...rest: unknown[]
        ) {
          if (type === "webgl2") return null;
          return (orig as (...a: unknown[]) => unknown).call(
            this,
            type,
            ...rest,
          );
        } as typeof orig;
      });
      const req = page.waitForRequest("**/models/robot/**");
      await page.goto(ROUTE);
      await req;
      await page.waitForTimeout(SETTLE_MS);
      await expect(page.locator(canvas)).toHaveCount(0);
      await expect(page.locator("[data-model-still] img")).toBeVisible();
      expect(errors).toEqual([]);
    });

    test("mesh 404: still stays, viewer adds no console errors", async ({
      page,
    }) => {
      const errors = collectErrors(page);
      await page.unroute("**/models/robot/**");
      await page.route("**/models/robot/**", (route) =>
        route.fulfill({ status: 404, body: "" }),
      );
      await page.goto(ROUTE);
      await page.waitForTimeout(SETTLE_MS);
      await expect(page.locator(canvas)).toHaveCount(0);
      await expect(page.locator("[data-model-still] img")).toBeVisible();
      // Chrome itself logs the failed resource; the viewer adds nothing else.
      expect(
        errors.filter((e) => !e.includes("Failed to load resource")),
      ).toEqual([]);
    });
  });
});

for (const vp of [
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
  test(`phone ${vp.width}: no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto(ROUTE);
    const o = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(o.scroll).toBeLessThanOrEqual(o.client);
  });
}
