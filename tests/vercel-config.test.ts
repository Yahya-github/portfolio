import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type HeaderEntry = { key: string; value: string };
type HeaderBlock = { source: string; headers: HeaderEntry[] };
type VercelConfig = { outputDirectory?: string; headers: HeaderBlock[] };

const SITE = "/((?!games/).*)";
const GAME = "/games/(.*)";
const ONE_YEAR_SECONDS = 31536000;
const CSP = "Content-Security-Policy";

// jsdom gives import.meta.url a non-file scheme, so resolve from the Vitest root.
function loadConfigText(): string {
  return readFileSync(join(process.cwd(), "vercel.json"), "utf8");
}

function loadConfig(): VercelConfig {
  return JSON.parse(loadConfigText()) as VercelConfig;
}

function valueIn(block: HeaderBlock | undefined, key: string) {
  return block?.headers.find((h) => h.key.toLowerCase() === key.toLowerCase())
    ?.value;
}

function headerValue(source: string, key: string): string | undefined {
  return valueIn(
    loadConfig().headers.find((h) => h.source === source),
    key,
  );
}

function cspBlocksFor(pathname: string): HeaderBlock[] {
  return loadConfig().headers.filter(
    (h) =>
      new RegExp("^" + h.source + "$").test(pathname) &&
      valueIn(h, CSP) !== undefined,
  );
}

describe("vercel-config site rule", () => {
  it("sends no X-Robots-Tag after launch (D-10)", () => {
    expect(headerValue(SITE, "X-Robots-Tag")).toBeUndefined();
  });

  it("sends a first-party-only CSP with the key directives", () => {
    const csp = headerValue(SITE, CSP) ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).not.toMatch(/https?:\/\//);
    expect(csp).not.toContain("wasm-unsafe-eval");
  });

  it("sends HSTS with max-age of at least one year", () => {
    const hsts = headerValue(SITE, "Strict-Transport-Security") ?? "";
    const maxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1] ?? 0);
    expect(maxAge).toBeGreaterThanOrEqual(ONE_YEAR_SECONDS);
  });

  it("sends nosniff and X-Frame-Options DENY", () => {
    expect(headerValue(SITE, "X-Content-Type-Options")).toBe("nosniff");
    expect(headerValue(SITE, "X-Frame-Options")).toBe("DENY");
  });

  it("does not override the output directory", () => {
    expect(loadConfig()).not.toHaveProperty("outputDirectory");
  });
});

describe("vercel-config game rule", () => {
  const csp = () => headerValue(GAME, CSP) ?? "";

  it("allows wasm, blob images and same-origin framing only", () => {
    expect(csp()).toContain("'wasm-unsafe-eval'");
    expect(csp()).toContain("img-src 'self' data: blob:");
    expect(csp()).toContain("frame-ancestors 'self'");
    expect(csp()).toContain("base-uri 'none'");
    expect(csp()).toContain("object-src 'none'");
    const scriptSrc = /script-src ([^;]*)/.exec(csp())?.[1] ?? "";
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it("never allows unsafe-eval anywhere", () => {
    expect(loadConfigText()).not.toContain("'unsafe-eval'");
  });

  it("sets framing, indexing and cache headers", () => {
    expect(headerValue(GAME, "X-Frame-Options")).toBe("SAMEORIGIN");
    expect(headerValue(GAME, "X-Robots-Tag")).toBe("noindex");
    expect(headerValue(GAME, "Cache-Control")).toBe(
      "public, max-age=31536000, immutable",
    );
  });

  it("matches the site values for the shared security headers", () => {
    for (const key of [
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ]) {
      expect(headerValue(GAME, key)).toBe(headerValue(SITE, key));
    }
  });

  it("is the only block with wasm-unsafe-eval (negative control)", () => {
    const holders = loadConfig().headers.filter((h) =>
      h.headers.some((e) => e.value.includes("wasm-unsafe-eval")),
    );
    expect(holders.map((h) => h.source)).toEqual([GAME]);
  });
});

describe("vercel-config rule disjointness", () => {
  const samples: [string, string][] = [
    ["/", SITE],
    ["/projects/", SITE],
    ["/projects/atlantis/", SITE],
    ["/projects/robot/", SITE],
    ["/games/atlantis/abc/play.html", GAME],
    ["/models/robot/abc/robot.bin", SITE],
    ["/_next/static/x.js", SITE],
  ];

  it.each(samples)("%s matches exactly one CSP rule", (path, expected) => {
    const blocks = cspBlocksFor(path);
    expect(blocks.map((b) => b.source)).toEqual([expected]);
  });

  it("/models/ block sets only an immutable Cache-Control", () => {
    const block = loadConfig().headers.find((h) => h.source === "/models/(.*)");
    expect(block?.headers).toEqual([
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ]);
  });
});
