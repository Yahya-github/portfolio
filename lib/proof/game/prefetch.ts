/**
 * Intent-gated prefetch of the Atlantis game files (Phase 8, PROOF-01).
 *
 * - Fires at most once, only from an explicit intent signal (hover, focus or
 *   touchstart on Play), never on page load.
 * - Skipped when the visitor asked to save data.
 * - Same-origin low-priority fetch, so the site CSP (connect-src 'self') holds
 *   and the immutable /games/<version>/ files land in the HTTP cache.
 *
 * No React; the fetch and connection are injected so it stays testable.
 */
export interface PrefetchDeps {
  readonly fetch: typeof fetch;
  readonly saveData: boolean;
}

const HEAVY_FILES = ["play.wasm", "play.pck"] as const;

/** Heavy game file URLs next to the versioned play.html, or [] for an unusable path. */
export function heavyUrls(playPath: string): readonly string[] {
  const slash = playPath.lastIndexOf("/");
  if (!playPath.startsWith("/games/") || slash < 0) return [];
  const dir = playPath.slice(0, slash + 1);
  return HEAVY_FILES.map((name) => dir + name);
}

async function drain(res: Response): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) return;
  for (;;) {
    const { done } = await reader.read();
    if (done) return;
  }
}

async function warm(f: typeof fetch, url: string): Promise<void> {
  const res = await f(url, {
    priority: "low",
    credentials: "same-origin",
  } as RequestInit);
  if (res.ok) await drain(res);
}

/** Returns a trigger that prefetches once and ignores every later call. */
export function createPrefetch(
  playPath: string,
  deps: PrefetchDeps,
): () => void {
  let fired = false;
  return () => {
    if (fired || deps.saveData) return;
    fired = true;
    for (const url of heavyUrls(playPath)) {
      warm(deps.fetch, url).catch(() => {});
    }
  };
}

/** True when the browser reports the Save-Data preference. */
export function readSaveData(nav: Navigator): boolean {
  const conn = (nav as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  return conn?.saveData === true;
}
