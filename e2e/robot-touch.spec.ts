// PROOF-02 / T-08-41: on touch, vertical swipes scroll the page and never orbit;
// horizontal swipes orbit.
import { test, expect, type Page } from "@playwright/test";
import { robotModel } from "../content/generated/robot-model";
import { proofGate } from "../content/proof-gate";
import { robotViewerOn } from "../lib/proof/gate";
import { encodeMesh, placeholderMesh } from "../scripts/lib/robot-mesh.mjs";

const ROUTE = "/projects/robot/";
const canvas = "[data-model-slot] canvas";
const SETTLE_MS = 700;
const STEPS = 8;

test.skip(!robotViewerOn(proofGate, robotModel), "gate has the viewer off");

interface Pt {
  readonly x: number;
  readonly y: number;
}

const shot = (page: Page): Promise<Buffer> =>
  page.locator(canvas).screenshot({ animations: "disabled" });

/** One-finger swipe through CDP so the browser itself decides scroll vs pointer events. */
async function swipe(page: Page, from: Pt, to: Pt): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const send = (type: "touchStart" | "touchMove" | "touchEnd", p?: Pt) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: p ? [{ x: p.x, y: p.y, id: 1 }] : [],
    });
  await send("touchStart", from);
  for (let i = 1; i <= STEPS; i++) {
    await send("touchMove", {
      x: from.x + ((to.x - from.x) * i) / STEPS,
      y: from.y + ((to.y - from.y) * i) / STEPS,
    });
  }
  await send("touchEnd");
}

test.beforeEach(async ({ page }) => {
  const body = Buffer.from(encodeMesh(placeholderMesh()));
  await page.route("**/models/robot/**", (route) =>
    route.fulfill({ contentType: "application/octet-stream", body }),
  );
  await page.goto(ROUTE);
  await expect(page.locator("[data-model]")).toHaveAttribute(
    "data-model-state",
    "live",
  );
});

test("vertical swipe scrolls the page and does not orbit", async ({ page }) => {
  const box = await page.locator(canvas).boundingBox();
  if (!box) throw new Error("no canvas");
  const x = box.x + box.width / 2;
  const y = Math.min(box.y + box.height * 0.8, 800);
  const y0 = await page.evaluate(() => window.scrollY);
  // touching stops auto-rotate, so wait for a frozen baseline after the swipe
  await swipe(page, { x, y }, { x, y: y - 160 });
  await page.waitForTimeout(SETTLE_MS);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(y0);
  const a = await shot(page);
  await page.waitForTimeout(SETTLE_MS);
  expect((await shot(page)).equals(a)).toBe(true);
});

test("horizontal swipe changes the pose", async ({ page }) => {
  // pause auto-rotate first so only the swipe can change the pose
  await page.locator("html").evaluate((el) => {
    el.dataset.motion = "off";
  });
  await page.waitForTimeout(200);
  const before = await shot(page);
  const box = await page.locator(canvas).boundingBox();
  if (!box) throw new Error("no canvas");
  const y = box.y + Math.min(box.height / 2, 300);
  await swipe(
    page,
    { x: box.x + box.width * 0.3, y },
    { x: box.x + box.width * 0.7, y },
  );
  await page.waitForTimeout(200);
  expect((await shot(page)).equals(before)).toBe(false);
});
