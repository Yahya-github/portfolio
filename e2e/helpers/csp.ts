import { readFileSync } from "node:fs";

// `serve` does not send vercel.json headers, so e2e injects the per-path CSP itself.
type HeaderEntry = { key: string; value: string };
type HeaderBlock = { source: string; headers: HeaderEntry[] };
type VercelConfig = { headers: HeaderBlock[] };

export const SITE_SOURCE = "/((?!games/).*)";
export const GAME_SOURCE = "/games/(.*)";

const CSP_KEY = "content-security-policy";
const UPGRADE_DIRECTIVE = "upgrade-insecure-requests";

let cached: VercelConfig | undefined;

function config(): VercelConfig {
  cached ??= JSON.parse(readFileSync("vercel.json", "utf8")) as VercelConfig;
  return cached;
}

function cspOf(block: HeaderBlock): string | undefined {
  return block.headers.find((h) => h.key.toLowerCase() === CSP_KEY)?.value;
}

// The local run is plain http, so upgrade-insecure-requests would break it.
function stripUpgrade(csp: string): string {
  return csp
    .split(";")
    .map((d) => d.trim())
    .filter((d) => d && d !== UPGRADE_DIRECTIVE)
    .join("; ");
}

export function cspForPath(pathname: string): string {
  const matches = config().headers.filter(
    (b) => new RegExp("^" + b.source + "$").test(pathname) && cspOf(b),
  );
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one CSP rule for ${pathname}, found ${matches.length}`,
    );
  }
  return stripUpgrade(cspOf(matches[0]) ?? "");
}

export function withoutDirectiveToken(csp: string, token: string): string {
  const out = csp
    .split(token)
    .join("")
    .replace(/ {2,}/g, " ")
    .replace(/ ;/g, ";");
  if (out === csp) throw new Error(`Token ${token} not found in CSP`);
  return out;
}
