import { existsSync } from "node:fs";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { atlantisBuild } from "../content/generated/atlantis-build";
import { cspForPath, withoutDirectiveToken } from "./helpers/csp";

// Real Atlantis export under the exact production /games/ CSP (T-08-21).
// serve does not send vercel.json headers, so the policy is injected per document.
type Probe = { violations: string[]; messages: string[] };
type ProbeWindow = { __violations: string[]; __msgs: string[] };

const BOOT_TIMEOUT_MS = 90_000;
const TEST_TIMEOUT_MS = 120_000;
const MEDIA_TOKEN = "media-src";

const hasExport =
  atlantisBuild !== null && existsSync(join("out", atlantisBuild.path));

async function boot(page: Page, csp: (path: string) => string): Promise<Probe> {
  if (atlantisBuild === null) throw new Error("no build");
  await page.addInitScript(() => {
    const w = window as unknown as ProbeWindow;
    w.__violations = [];
    w.__msgs = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      w.__violations.push(`${e.effectiveDirective} ${e.blockedURI}`);
    });
    window.addEventListener("message", (e) => {
      const d = e.data as { type?: string } | null;
      w.__msgs.push(d?.type ?? "?");
    });
  });
  await page.route("**/games/**", async (route) => {
    if (route.request().resourceType() !== "document") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "content-security-policy": csp(new URL(route.request().url()).pathname),
      },
    });
  });
  await page.goto(atlantisBuild.path);
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          (window as unknown as ProbeWindow).__msgs.includes("ready"),
        ),
      { timeout: BOOT_TIMEOUT_MS, intervals: [1000] },
    )
    .toBe(true);
  return page.evaluate(() => {
    const w = window as unknown as ProbeWindow;
    return { violations: w.__violations, messages: w.__msgs };
  });
}

test.describe("@slow real Atlantis boot", () => {
  test.skip(!hasExport, "no local export");
  test.setTimeout(TEST_TIMEOUT_MS);

  test("boots to the title under the /games/ CSP with zero violations", async ({
    page,
  }) => {
    const result = await boot(page, cspForPath);
    expect(result.violations).toEqual([]);
    expect(result.messages).not.toContain("error");
  });

  test("records whether media-src is needed (informational)", async ({
    page,
  }, info) => {
    const stripped = (p: string) => {
      const csp = cspForPath(p);
      const directive = csp
        .split(";")
        .map((d) => d.trim())
        .find((d) => d.startsWith(MEDIA_TOKEN));
      return directive ? withoutDirectiveToken(csp, directive) : csp;
    };
    const result = await boot(page, stripped);
    const mediaHits = result.violations.filter((v) =>
      v.startsWith(MEDIA_TOKEN),
    );
    info.annotations.push({
      type: "media-src",
      description: `violations without media-src: ${mediaHits.length} ${mediaHits.join(" | ")}`,
    });
    expect(result.messages).toContain("ready");
  });
});
