import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { sections } from "../content/site";

// Pitfall 7: `serve` does not send vercel.json headers, so inject the production CSP here.
type HeaderEntry = { key: string; value: string };
type VercelConfig = { headers: { source: string; headers: HeaderEntry[] }[] };
type CspWindow = { __cspViolations: string[] };

const config = JSON.parse(readFileSync("vercel.json", "utf8")) as VercelConfig;
const productionCsp =
  config.headers
    .find((h) => h.source === "/(.*)")
    ?.headers.find((h) => h.key === "Content-Security-Policy")?.value ?? "";

// The local run is plain http, so upgrade-insecure-requests would break it.
const localCsp = productionCsp
  .split(";")
  .map((d) => d.trim())
  .filter((d) => d && d !== "upgrade-insecure-requests")
  .join("; ");

async function runUnderCsp(
  page: Page,
  csp: string,
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
        headers: { ...response.headers(), "content-security-policy": csp },
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

for (const s of sections) {
  test(`${s.route} runs under the production CSP with zero violations`, async ({
    page,
  }) => {
    expect(localCsp).toContain("default-src 'self'");
    const { violations, errors } = await runUnderCsp(page, localCsp, s.route);
    expect(violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("CSP negative control: strict script-src reports violations", async ({
  page,
}) => {
  const strictCsp = localCsp.replace(
    "script-src 'self' 'unsafe-inline'",
    "script-src 'self'",
  );
  expect(strictCsp).not.toBe(localCsp);
  const { violations } = await runUnderCsp(page, strictCsp, "/");
  expect(violations.length).toBeGreaterThan(0);
});
