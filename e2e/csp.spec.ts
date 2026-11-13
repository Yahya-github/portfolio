import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { sections } from "../content/site";
import { cspForPath, withoutDirectiveToken } from "./helpers/csp";

// Pitfall 7: `serve` does not send vercel.json headers, so inject the per-path CSP here.
type CspWindow = { __cspViolations: string[] };
type CspPicker = (pathname: string) => string;

const PROBE_DIR = "e2e/fixtures/wasm-probe";
const PROBE_PATH = "/games/__probe__/probe.html";
const WASM_TOKEN = "'wasm-unsafe-eval'";

async function runUnderCsp(
  page: Page,
  pickCsp: CspPicker,
  route: string,
): Promise<{ violations: string[]; errors: string[] }> {
  await page.addInitScript(() => {
    const w = window as unknown as CspWindow;
    w.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      w.__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "document") {
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          "content-security-policy": pickCsp(
            new URL(route.request().url()).pathname,
          ),
        },
      });
      return;
    }
    await route.continue();
  });
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto(route, { waitUntil: "networkidle" });
  const violations = await page.evaluate(
    () => (window as unknown as CspWindow).__cspViolations,
  );
  return { violations, errors };
}

for (const route of [...sections.map((s) => s.route), "/projects/facturo/"]) {
  test(`${route} runs under the production CSP with zero violations`, async ({
    page,
  }) => {
    expect(cspForPath(route)).toContain("default-src 'self'");
    const { violations, errors } = await runUnderCsp(page, cspForPath, route);
    expect(violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("CSP negative control: strict script-src reports violations", async ({
  page,
}) => {
  const siteCsp = cspForPath("/");
  const strictCsp = siteCsp.replace(
    "script-src 'self' 'unsafe-inline'",
    "script-src 'self'",
  );
  expect(strictCsp).not.toBe(siteCsp);
  const { violations } = await runUnderCsp(page, () => strictCsp, "/");
  expect(violations.length).toBeGreaterThan(0);
});

async function runWasmProbe(page: Page, csp: string) {
  await page.addInitScript(() => {
    const w = window as unknown as CspWindow;
    w.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      w.__cspViolations.push(e.effectiveDirective);
    });
  });
  await page.route("**/games/__probe__/**", async (route) => {
    const isHtml = route.request().url().endsWith(".html");
    const file = isHtml ? "probe.html" : "probe.js";
    await route.fulfill({
      status: 200,
      contentType: isHtml ? "text/html" : "text/javascript",
      headers: { "content-security-policy": csp },
      body: readFileSync(`${PROBE_DIR}/${file}`),
    });
  });
  await page.goto(PROBE_PATH);
  await page.waitForFunction(() => document.body.dataset.wasm !== undefined);
  const outcome = await page.evaluate(() => document.body.dataset.wasm);
  const violations = await page.evaluate(
    () => (window as unknown as CspWindow).__cspViolations,
  );
  return { outcome, violations };
}

test("game CSP lets a wasm module compile", async ({ page }) => {
  const { outcome, violations } = await runWasmProbe(
    page,
    cspForPath(PROBE_PATH),
  );
  expect(outcome).toBe("ok");
  expect(violations).toEqual([]);
});

test("wasm negative control: without wasm-unsafe-eval compilation is blocked", async ({
  page,
}) => {
  const csp = withoutDirectiveToken(cspForPath(PROBE_PATH), WASM_TOKEN);
  const { outcome, violations } = await runWasmProbe(page, csp);
  expect(outcome).toBe("blocked");
  expect(violations.some((v) => v.startsWith("script-src"))).toBe(true);
});
