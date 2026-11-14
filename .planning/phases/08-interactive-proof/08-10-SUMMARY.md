---
phase: 08-interactive-proof
plan: 10
subsystem: proof / game stage
tags: [atlantis, godot, iframe, postmessage, prefetch, playwright]
requires: ["08-03", "08-05", "08-09"]
provides:
  - lazy React-free Atlantis stage controller
  - intent-gated game file prefetch
  - ProofClient island (cursor plus lazy feature)
  - stub game fixture and atlantis e2e
key-files:
  created:
    - lib/proof/game/mount.ts
    - lib/proof/game/prefetch.ts
    - components/proof/ProofClient.tsx
    - tests/game-prefetch.test.ts
    - e2e/atlantis.spec.ts
    - e2e/atlantis-touch.spec.ts
    - e2e/fixtures/game-stub/play.html
    - e2e/fixtures/game-stub/play-error.html
    - e2e/fixtures/game-stub/shell.js
  modified:
    - app/projects/atlantis/page.tsx
    - components/proof/proof.module.css
    - tests/source-guard.test.ts
    - playwright.config.ts
metrics:
  completed: 2026-11-13
---

# Phase 8 Plan 10: Atlantis stage controller Summary

Lazy `mount()` drives the 08-03 reducer and message guard: nothing under /games/ loads until Play, Esc and Exit move focus safely, mute posts to `location.origin`, and hover, focus or touchstart on Play warms play.wasm and play.pck once (never with Save-Data).

## Tasks and commits

| Task | Commit | Notes |
| ---- | ------ | ----- |
| Prefetch (orchestrator scope) | fe69408 | pure `createPrefetch`, 7 unit tests |
| 1 Controller and island | 5edc483 | mount.ts, ProofClient, page, allowlist |
| 2 Stub and e2e | a7b5319 | fixtures, two specs, playwright config |

## Prefetch design

- `lib/proof/game/prefetch.ts`: `heavyUrls(playPath)` derives `play.wasm` and `play.pck` from the versioned folder in `data-game-src` (which comes from `content/generated/atlantis-build.ts`); rejects paths outside /games/.
- `createPrefetch(playPath, {fetch, saveData})` returns a once-only trigger. Mechanism: same-origin `fetch(url, {priority: "low"})` with the body drained, so it fits `connect-src 'self'` and fills the HTTP cache (the /games/ folder is `immutable`, one year).
- Triggered from `pointerenter`, `focus`, `touchstart` on the Play button only; never on load. Skipped if `navigator.connection.saveData` is true (the Save-Data request header is not readable from JS, so the client hint is the check).
- Limitation: if the visitor clicks Play while the prefetch is mid-flight, the browser may fetch the files again in parallel (no abort, to avoid wasting a partly downloaded file). Real-world gain on slow links should be measured on the deployed site; this was not measured here (no real build in the worktree).
- JS budget: `measure:js --max-gzip-kb 150 --max-chunk-kb 12` exits 0 (atlantis route 140.4 KB gzip).

## Verification

- lint, typecheck, vitest (874 passed), build, measure:js all green.
- `atlantis.spec.ts` chromium: 11 passed, 1 skipped (the "not playable" describe, skipped because embed is on and a build exists); with csp.spec.ts and deep-dive.spec.ts 33 passed. `atlantis-touch.spec.ts` on chromium-phone passes; phone.spec.ts still passes.
- Prefetch e2e: hover fetches wasm and pck exactly once, no play.html; Save-Data fetches nothing; no /games/ request before Play.

## Deviations from Plan

1. **[Rule 1 - Bug] Poster click never reached the poster.** `[data-game-slot]` overlays the poster, so the click listener on the poster never fired. The listener is on their shared parent instead; e2e covers clicking the slot area. Commit a7b5319.
2. **[Rule 3 - Blocking] Play unreachable after Exit.** The 08-09 CSS showed Play and the size line only in `ready`; added `exited` selectors in `proof.module.css` so Exit can return focus to a visible Play. Commit 5edc483.
3. **Tab test depth.** After Esc the frame itself and its canvas are legitimate tab stops, so the "Esc then Tab moves on" check allows 8 presses before asserting focus left the stage.
4. **chromium-phone instead of chromium-touch** (as planned): isMobile guarantees a coarse pointer. Config matches `phone|atlantis-touch|robot-touch`; chromium ignores atlantis-touch and robot-touch.
5. `mount()` is one closure over shared state (about 170 lines, helpers each short), mirroring `lib/walkthrough/mount.ts`, rather than splitting under 50 lines.

## Environment note

A foreign `serve` process (other worktree) already owned port 4173, so Playwright's `reuseExistingServer` served the wrong `out/` and everything 404ed. I ran my own `serve out -l 4181` and `BASE_URL=http://localhost:4181`. The orchestrator should be aware when running specs from several worktrees at once.

## Known Stubs

None. The stub game exists only under `e2e/fixtures/`.

## Threat Flags

None beyond the plan's register (T-08-31/32/34/35 mitigated and tested; the prefetch adds only same-origin GETs under existing CSP).

## Self-Check: PASSED
