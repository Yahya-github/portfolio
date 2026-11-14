// A11Y-03: axe finds no WCAG 2.0/2.1 A/AA violation on any route at desktop and phone sizes.
// Direct loads only; the same axe pass after real page changes (inert pages excluded) lives in pager-a11y.spec.ts.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { atlantisBuild } from "../content/generated/atlantis-build";
import { robotModel } from "../content/generated/robot-model";
import { proofGate } from "../content/proof-gate";
import { sections } from "../content/site";
import { atlantisPlayable, robotViewerOn } from "../lib/proof/gate";
import { encodeMesh, placeholderMesh } from "../scripts/lib/robot-mesh.mjs";
import { cspForPath } from "./helpers/csp";
import { open } from "./helpers/pager";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
] as const;

const ROUTES = [
  ...sections.map((s) => s.route),
  "/projects/facturo/",
  "/projects/atlantis/",
  "/projects/robot/",
  "/this-page-does-not-exist/",
];

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`axe ${route} ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test.describe("axe with interaction states", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  async function expectClean(page: Page) {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }

  test("achievements with a preview shown", async ({ page }) => {
    await open(page, "/achievements/");
    await page
      .locator("#page-achievements [data-preview-trigger]")
      .first()
      .focus();
    await expectClean(page);
  });

  test("projects with the walkthrough held", async ({ page }) => {
    await open(page, "/projects/");
    await page.locator("#page-projects [data-walk]").focus();
    await expectClean(page);
  });

  test("projects with the MAME link focused", async ({ page }) => {
    await open(page, "/projects/");
    await page.locator("#page-projects [data-preview-trigger]").first().focus();
    await expectClean(page);
  });

  test("about with the portrait pressed", async ({ page }) => {
    await open(page, "/about/");
    const toggle = page.locator("#page-about [data-portrait-toggle]");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expectClean(page);
  });

  test("say hi after a successful copy", async ({ page }) => {
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
    await expectClean(page);
  });
});

// PROOF-01 / PROOF-02: the live states of the two proof routes (stubbed game, placeholder mesh).
const STUB_DIR = join("e2e", "fixtures", "game-stub");

for (const vp of VIEWPORTS) {
  test.describe(`proof route live states ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`axe atlantis playing ${vp.name}`, async ({ page }) => {
      test.skip(
        !atlantisPlayable(proofGate, atlantisBuild),
        "embed off or withheld",
      );
      await page.route("**/games/atlantis/**", async (route) => {
        const file = new URL(route.request().url()).pathname.split("/").pop();
        if (file === "play.html") {
          await route.fulfill({
            contentType: "text/html",
            headers: {
              "content-security-policy": cspForPath(
                "/games/atlantis/play.html",
              ),
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
      await page.goto("/projects/atlantis/");
      await page.getByRole("button", { name: "Play Atlantis" }).click();
      await expect(page.locator("[data-game]")).toHaveAttribute(
        "data-game-state",
        "playing",
      );
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test(`axe robot live ${vp.name}`, async ({ page }) => {
      test.skip(!robotViewerOn(proofGate, robotModel), "viewer off");
      const body = Buffer.from(encodeMesh(placeholderMesh()));
      await page.route("**/models/robot/**", (route) =>
        route.fulfill({ contentType: "application/octet-stream", body }),
      );
      await page.goto("/projects/robot/");
      await expect(page.locator("[data-model]")).toHaveAttribute(
        "data-model-state",
        "live",
      );
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
