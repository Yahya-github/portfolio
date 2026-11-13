// PROOF-01: the Atlantis stage against a stub game that speaks the real
// postMessage protocol. serve ignores vercel.json, so the game CSP is injected.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { atlantis } from "../content/atlantis";
import { atlantisBuild } from "../content/generated/atlantis-build";
import { proofGate } from "../content/proof-gate";
import { atlantisPlayable } from "../lib/proof/gate";
import { cspForPath } from "./helpers/csp";

const ROUTE = "/projects/atlantis/";
const STUB_DIR = join("e2e", "fixtures", "game-stub");
const playable = atlantisPlayable(proofGate, atlantisBuild);
const stage = "[data-game]";
const FRAME = "iframe[data-game-frame]";
const SHELL_DELAY_MS = 700;

type StubMode = "ok" | "error";

async function stubGame(
  page: Page,
  mode: { current: StubMode },
  seen: string[],
  shellDelayMs = 0,
): Promise<void> {
  await page.route("**/games/atlantis/**", async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.pathname);
    const file = url.pathname.split("/").pop() ?? "";
    if (file === "play.html") {
      const name = mode.current === "error" ? "play-error.html" : "play.html";
      await route.fulfill({
        contentType: "text/html",
        headers: { "content-security-policy": cspForPath(url.pathname) },
        body: readFileSync(join(STUB_DIR, name), "utf8"),
      });
    } else if (file === "shell.js") {
      if (shellDelayMs) await new Promise((r) => setTimeout(r, shellDelayMs));
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

const state = (page: Page) =>
  page.locator(stage).getAttribute("data-game-state");
const active = (page: Page) =>
  page.evaluate(() => document.activeElement?.tagName ?? "");

test.describe("playable", () => {
  test.skip(!playable, "embed off or withheld: fallback asserted below");
  test.use({ viewport: { width: 1440, height: 900 } });
  const mode = { current: "ok" as StubMode };
  let seen: string[] = [];

  test.beforeEach(async ({ page }) => {
    mode.current = "ok";
    seen = [];
    await stubGame(page, mode, seen);
  });

  test("nothing under /games/ loads before Play", async ({ page }) => {
    await page.goto(ROUTE);
    await expect(
      page.getByRole("button", { name: "Play Atlantis" }),
    ).toBeVisible();
    await page.waitForTimeout(500);
    expect(seen).toEqual([]);
  });

  test("Play loads, then the frame takes focus", async ({ page }) => {
    await page.unroute("**/games/atlantis/**");
    await stubGame(page, mode, seen, SHELL_DELAY_MS);
    await page.goto(ROUTE);
    await page.getByRole("button", { name: "Play Atlantis" }).click();
    await expect(page.locator("[data-game-status]")).toContainText(
      "Loading the game",
    );
    await expect.poll(() => state(page)).toBe("playing");
    await expect.poll(() => active(page)).toBe("IFRAME");
  });

  test("clicking the poster starts the game", async ({ page }) => {
    await page.goto(ROUTE);
    await page.locator("[data-game-slot]").click();
    await expect.poll(() => state(page)).toBe("playing");
  });

  test("Esc moves focus to Exit; Exit returns focus to Play", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    await page.getByRole("button", { name: "Play Atlantis" }).click();
    await expect.poll(() => state(page)).toBe("playing");
    await page.frameLocator(FRAME).locator("canvas").press("Escape");
    await expect(page.getByRole("button", { name: "Exit game" })).toBeFocused();
    await page.getByRole("button", { name: "Exit game" }).click();
    await expect(page.locator(FRAME)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Play Atlantis" }),
    ).toBeFocused();
    expect(await state(page)).toBe("exited");
  });

  test("Mute toggles its label and tells the game", async ({ page }) => {
    await page.goto(ROUTE);
    await page.getByRole("button", { name: "Play Atlantis" }).click();
    await expect.poll(() => state(page)).toBe("playing");
    const mute = page.getByRole("button", { name: "Mute game sound" });
    await mute.click();
    const unmute = page.getByRole("button", { name: "Unmute game sound" });
    await expect(unmute).toHaveText("Unmute");
    await expect(page.frameLocator(FRAME).locator("body")).toHaveAttribute(
      "data-muted",
      "true",
    );
  });

  test("a failed load shows the error and Try again recovers", async ({
    page,
  }) => {
    mode.current = "error";
    await page.goto(ROUTE);
    await page.getByRole("button", { name: "Play Atlantis" }).click();
    await expect(page.locator("[data-game-error]")).toBeVisible();
    const retry = page.getByRole("button", { name: "Try again" });
    await expect(retry).toBeVisible();
    mode.current = "ok";
    await retry.click();
    await expect.poll(() => state(page)).toBe("playing");
  });

  test("Tab never traps", async ({ page }) => {
    await page.goto(ROUTE);
    await page.getByRole("button", { name: "Play Atlantis" }).focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press("Tab");
    expect(
      await page.evaluate((s) => !!document.activeElement?.closest(s), stage),
    ).toBe(false);

    await page.getByRole("button", { name: "Play Atlantis" }).click();
    await expect.poll(() => state(page)).toBe("playing");
    await page.frameLocator(FRAME).locator("canvas").press("Escape");
    for (let i = 0; i < 8; i++) await page.keyboard.press("Tab");
    expect(
      await page.evaluate((s) => !!document.activeElement?.closest(s), stage),
    ).toBe(false);
  });

  test("hover on Play prefetches the heavy files once", async ({ page }) => {
    await page.goto(ROUTE);
    const play = page.getByRole("button", { name: "Play Atlantis" });
    await play.hover();
    await expect
      .poll(() => seen.filter((p) => /play\.(wasm|pck)$/.test(p)).length)
      .toBe(2);
    await page.mouse.move(0, 0);
    await play.hover();
    await page.waitForTimeout(300);
    expect(seen.filter((p) => /play\.(wasm|pck)$/.test(p))).toHaveLength(2);
    expect(seen.some((p) => p.endsWith("play.html"))).toBe(false);
  });

  test("Save-Data disables the prefetch", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", {
        value: { saveData: true },
      });
    });
    await page.goto(ROUTE);
    await page.getByRole("button", { name: "Play Atlantis" }).hover();
    await page.waitForTimeout(500);
    expect(seen).toEqual([]);
  });

  test("standalone page shape", async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("header")).toContainText(atlantis.headerLabel);
    await expect(page.locator('[data-pager="bar"]')).toHaveCount(0);
    const nav = page.locator('nav[data-pager="letters"]');
    await expect(nav.locator('a[href="/projects/"]')).toHaveAttribute(
      "aria-current",
      "true",
    );
    await page
      .locator("footer")
      .getByRole("link", { name: atlantis.backLabel })
      .click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/projects/");
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("the poster does not fade", async ({ page }) => {
      await page.goto(ROUTE);
      const duration = await page
        .locator("[data-game-poster]")
        .evaluate((el) => getComputedStyle(el).transitionDuration);
      expect(duration).toBe("0s");
    });
  });
});

test.describe("not playable", () => {
  test.skip(playable, "embed is on: the playable describe covers the stage");
  test("no controls, poster, gallery and links remain", async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator("[data-game-action]:visible")).toHaveCount(0);
    await expect(page.locator("[data-game-poster]")).toBeVisible();
    for (const link of atlantis.links) {
      await expect(page.locator(`a[href="${link.href}"]`)).toBeVisible();
    }
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
