// Success criterion 3: no route other than its own pays for the proof pieces.
// Request audit across all nine sitemap routes.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { atlantis } from "../content/atlantis";
import { atlantisBuild } from "../content/generated/atlantis-build";
import { robotModel } from "../content/generated/robot-model";
import { facturo } from "../content/facturo";
import { proofGate } from "../content/proof-gate";
import { robot } from "../content/robot";
import { sections } from "../content/site";
import { atlantisPlayable, robotViewerOn } from "../lib/proof/gate";
import { encodeMesh, placeholderMesh } from "../scripts/lib/robot-mesh.mjs";
import { cspForPath } from "./helpers/csp";

const ROUTES = [
  ...sections.map((s) => s.route),
  facturo.route,
  atlantis.route,
  robot.route,
];
const STUB_DIR = join("e2e", "fixtures", "game-stub");
const IDLE_MS = 1000;

function scriptName(url: string): string | null {
  const path = new URL(url).pathname;
  return path.endsWith(".js") ? (path.split("/").pop() ?? null) : null;
}

function record(page: Page): string[] {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  return urls;
}

async function stubGame(page: Page): Promise<void> {
  await page.route("**/games/atlantis/**", async (route) => {
    const file = new URL(route.request().url()).pathname.split("/").pop();
    if (file === "play.html") {
      await route.fulfill({
        contentType: "text/html",
        headers: {
          "content-security-policy": cspForPath("/games/atlantis/play.html"),
        },
        body: readFileSync(join(STUB_DIR, "play.html"), "utf8"),
      });
    } else if (file === "shell.js") {
      await route.fulfill({
        contentType: "text/javascript",
        body: readFileSync(join(STUB_DIR, "shell.js"), "utf8"),
      });
    } else {
      await route.fulfill({
        contentType: "application/octet-stream",
        body: "stub",
      });
    }
  });
}

async function stubMesh(page: Page): Promise<void> {
  const body = Buffer.from(encodeMesh(placeholderMesh()));
  await page.route("**/models/robot/**", (route) =>
    route.fulfill({ contentType: "application/octet-stream", body }),
  );
}

const scriptsOf = (urls: string[]): Set<string> =>
  new Set(urls.map(scriptName).filter((n): n is string => n !== null));

test.describe("proof isolation", () => {
  test.describe.configure({ mode: "serial" });
  test.use({ viewport: { width: 1440, height: 900 } });

  const own = new Set<string>();
  let baseline: Set<string> | null = null;
  const loadedByRoute = new Map<string, Set<string>>();

  test("no route requests /games/ or another route's /models/ files", async ({
    page,
  }) => {
    for (const route of ROUTES) {
      const urls = record(page);
      await page.goto(route);
      await page.waitForTimeout(IDLE_MS);
      // The robot route legitimately fetches its own mesh; everything else, and
      // Atlantis before Play, must request neither prefix.
      const offenders = urls.filter(
        (u) =>
          u.includes("/games/") ||
          (u.includes("/models/") && route !== robot.route),
      );
      expect(offenders, route).toEqual([]);
      loadedByRoute.set(route, scriptsOf(urls));
    }
    const others = new Set<string>();
    for (const [route, names] of loadedByRoute) {
      if (route === atlantis.route || route === robot.route) continue;
      for (const n of names) others.add(n);
    }
    baseline = others;
  });

  test("Atlantis controller chunk loads only on its own route, no wasm or pck before Play", async ({
    page,
  }) => {
    test.skip(!atlantisPlayable(proofGate, atlantisBuild), "embed off");
    await stubGame(page);
    const urls = record(page);
    await page.goto(atlantis.route);
    await page.waitForTimeout(IDLE_MS);
    expect(urls.filter((u) => /\.(wasm|pck)(\?|$)/.test(u))).toEqual([]);
    const before = scriptsOf(urls);
    await page.getByRole("button", { name: "Play Atlantis" }).click();
    await expect(page.locator("[data-game]")).toHaveAttribute(
      "data-game-state",
      "playing",
    );
    const after = scriptsOf(urls);
    for (const n of after) if (!before.has(n)) own.add(n);
    // Chunks the route needs that no other route loads (route page plus controller).
    for (const n of after) if (!(baseline ?? new Set()).has(n)) own.add(n);
  });

  test("robot viewer chunk loads only on its own route", async ({ page }) => {
    test.skip(!robotViewerOn(proofGate, robotModel), "viewer off");
    await stubMesh(page);
    const urls = record(page);
    await page.goto(robot.route);
    await expect(page.locator("[data-model]")).toHaveAttribute(
      "data-model-state",
      "live",
    );
    const after = scriptsOf(urls);
    for (const n of after) if (!(baseline ?? new Set()).has(n)) own.add(n);
  });

  test("none of the proof chunks appear on the other routes", async ({
    page,
  }) => {
    const proofRoutes = new Set<string>([atlantis.route, robot.route]);
    const gameChunks = [...own];
    for (const route of ROUTES) {
      if (proofRoutes.has(route)) continue;
      const urls = record(page);
      await page.goto(route);
      await page.waitForTimeout(IDLE_MS);
      const seen = scriptsOf(urls);
      const leaked = gameChunks.filter((n) => seen.has(n));
      expect(leaked, route).toEqual([]);
    }
  });
});
