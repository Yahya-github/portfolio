import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type HeaderEntry = { key: string; value: string };
type VercelConfig = {
  outputDirectory?: string;
  headers: { source: string; headers: HeaderEntry[] }[];
};

const ALL_PATHS = "/(.*)";
const ONE_YEAR_SECONDS = 31536000;

// jsdom gives import.meta.url a non-file scheme, so resolve from the Vitest root.
function loadConfig(): VercelConfig {
  return JSON.parse(
    readFileSync(join(process.cwd(), "vercel.json"), "utf8"),
  ) as VercelConfig;
}

function headerValue(key: string): string | undefined {
  const block = loadConfig().headers.find((h) => h.source === ALL_PATHS);
  return block?.headers.find((h) => h.key.toLowerCase() === key.toLowerCase())
    ?.value;
}

describe("vercel-config", () => {
  it("sends no X-Robots-Tag after launch (D-10)", () => {
    expect(headerValue("X-Robots-Tag")).toBeUndefined();
  });

  it("sends a first-party-only CSP with the key directives", () => {
    const csp = headerValue("Content-Security-Policy") ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).not.toMatch(/https?:\/\//);
  });

  it("sends HSTS with max-age of at least one year", () => {
    const hsts = headerValue("Strict-Transport-Security") ?? "";
    const maxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1] ?? 0);
    expect(maxAge).toBeGreaterThanOrEqual(ONE_YEAR_SECONDS);
  });

  it("sends nosniff and X-Frame-Options DENY", () => {
    expect(headerValue("X-Content-Type-Options")).toBe("nosniff");
    expect(headerValue("X-Frame-Options")).toBe("DENY");
  });

  it("does not override the output directory", () => {
    expect(loadConfig()).not.toHaveProperty("outputDirectory");
  });
});
