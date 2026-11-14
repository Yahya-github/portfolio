// DSGN-01/02/06 + EXP-02 visual baselines; run only in mcr.microsoft.com/playwright:v1.65.0-noble (Pitfall 6)
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { sections } from "../content/site";

// Motion is neutralised: devices still render and the walkthrough is a stepper showing frame 1.
test.use({ reducedMotion: "reduce" });

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "390x844", width: 390, height: 844 },
  { name: "320x568", width: 320, height: 568 },
] as const;

const ROUTES = [
  ...sections.map((s) => ({ name: s.slug, route: s.route })),
  { name: "facturo-deep-dive", route: "/projects/facturo/" },
  { name: "atlantis", route: "/projects/atlantis/" },
  { name: "robot", route: "/projects/robot/" },
  { name: "not-found", route: "/this-page-does-not-exist/" },
];

const SHOT = {
  animations: "disabled",
  caret: "hide",
  maxDiffPixelRatio: 0.002,
} as const;

/** Fonts and every image with a src in the live page are settled before a shot. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const live = document.querySelectorAll(
      "main section:not([inert]) img[src], main article img[src]",
    );
    await Promise.all(
      Array.from(live).map((img) => {
        const el = img as HTMLImageElement;
        return el.complete
          ? undefined
          : new Promise((r) => {
              el.onload = el.onerror = () => r(undefined);
            });
      }),
    );
  });
}

for (const r of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`${r.route} at ${vp.name} matches its baseline`, async ({ page }) => {
      // The live canvas is not baselined: without the mesh the robot page stays on its still.
      if (r.name === "robot")
        await page.route("**/models/robot/**", (route) => route.abort());
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(r.route);
      await settle(page);
      await expect(page).toHaveScreenshot(`${r.name}-${vp.name}.png`, {
        ...SHOT,
        fullPage:
          r.name === "facturo-deep-dive" ||
          r.name === "atlantis" ||
          r.name === "robot",
      });
    });
  }
}

test.describe("interaction states at 1440x900", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("achievements focus", async ({ page }) => {
    await page.goto("/achievements/");
    await settle(page);
    await page
      .locator("#page-achievements [data-preview-trigger]")
      .first()
      .focus();
    await expect(page).toHaveScreenshot("state-achievements-focus.png", SHOT);
  });

  test("mame focus", async ({ page }) => {
    await page.goto("/projects/");
    await settle(page);
    await page.locator("#page-projects [data-preview-trigger]").first().focus();
    await expect(page).toHaveScreenshot("state-mame-focus.png", SHOT);
  });

  test("walkthrough held", async ({ page }) => {
    await page.goto("/projects/");
    await settle(page);
    await page.locator("#page-projects [data-walk]").focus();
    await expect(page).toHaveScreenshot("state-walkthrough-held.png", SHOT);
  });

  test("portrait pressed", async ({ page }) => {
    await page.goto("/about/");
    await settle(page);
    const toggle = page.locator("#page-about [data-portrait-toggle]");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await settle(page);
    await expect(page).toHaveScreenshot("state-portrait-pressed.png", SHOT);
  });

  test("experience hover", async ({ page }) => {
    await page.goto("/experience/");
    await settle(page);
    await page.locator("#page-experience [data-tap-colour]").first().hover();
    await expect(page).toHaveScreenshot("state-experience-hover.png", SHOT);
  });

  test("say hi copied", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: () => Promise.resolve() },
        configurable: true,
      });
    });
    await page.goto("/say-hi/");
    const email = page.locator("#page-say-hi a[data-copy-email]");
    await expect(email).toHaveAttribute(
      "aria-describedby",
      "copy-email-description",
    );
    await email.click();
    await expect(
      page.locator("#page-say-hi [data-copy-status]"),
    ).not.toBeEmpty();
    await expect(page).toHaveScreenshot("state-say-hi-copied.png", SHOT);
  });
});

// PROOF-01: Atlantis loading and error states against the stub game, plus the
// Projects row "Play" link focused (08-15).
const STUB_DIR = join("e2e", "fixtures", "game-stub");
const HELD_SHELL = `
const post = (m) => parent.postMessage(m, location.origin);
post({ type: "progress", cur: 50, total: 100 });
`;

async function routeStub(page: Page, mode: "held" | "error"): Promise<void> {
  await page.route("**/games/atlantis/**", async (route) => {
    const file = new URL(route.request().url()).pathname.split("/").pop() ?? "";
    if (file === "play.html") {
      const name = mode === "error" ? "play-error.html" : "play.html";
      await route.fulfill({
        contentType: "text/html",
        body: readFileSync(join(STUB_DIR, name), "utf8"),
      });
    } else if (file === "shell.js") {
      await route.fulfill({
        contentType: "text/javascript",
        body:
          mode === "held"
            ? HELD_SHELL
            : readFileSync(join(STUB_DIR, "shell.js"), "utf8"),
      });
    } else {
      await route.fulfill({
        contentType: "application/octet-stream",
        body: "stub",
      });
    }
  });
}

test.describe("proof states at 1440x900", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("atlantis loading at 50%", async ({ page }) => {
    await routeStub(page, "held");
    await page.goto("/projects/atlantis/");
    await settle(page);
    await page.getByRole("button", { name: "Play Atlantis" }).click();
    await expect(page.locator("[data-game-status]")).toContainText("50%");
    await expect(page).toHaveScreenshot("state-atlantis-loading.png", SHOT);
  });

  test("atlantis load error", async ({ page }) => {
    await routeStub(page, "error");
    await page.goto("/projects/atlantis/");
    await settle(page);
    await page.getByRole("button", { name: "Play Atlantis" }).click();
    await expect(page.locator("[data-game-error]")).toBeVisible();
    await expect(page).toHaveScreenshot("state-atlantis-error.png", SHOT);
  });

  test("projects atlantis Play link focus", async ({ page }) => {
    await page.goto("/projects/");
    await settle(page);
    await page
      .locator('#page-projects a[href="/projects/atlantis/"]')
      .first()
      .focus();
    await expect(page).toHaveScreenshot("state-projects-play-focus.png", SHOT);
  });
});

// PROOF-02: robot viewer focused (ring and key hint; the canvas is masked) and the
// Projects "3D model" link focused (08-16).
test.describe("robot states at 1440x900", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("robot viewer focus", async ({ page }) => {
    await page.goto("/projects/robot/");
    await settle(page);
    await expect(page.locator("[data-model]")).toHaveAttribute(
      "data-model-state",
      "live",
    );
    await page.locator("[data-model]").focus();
    await expect(page.locator("[data-model-hint]")).toHaveText(
      "Arrow keys rotate",
    );
    await page.locator("[data-model-hint]").scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot("state-robot-viewer-focus.png", {
      ...SHOT,
      mask: [page.locator("[data-model-slot]")],
    });
  });

  test("projects robot 3D model link focus", async ({ page }) => {
    await page.goto("/projects/");
    await settle(page);
    await page
      .locator('#page-projects a[href="/projects/robot/"]')
      .first()
      .focus();
    await expect(page).toHaveScreenshot("state-projects-robot-focus.png", SHOT);
  });
});
