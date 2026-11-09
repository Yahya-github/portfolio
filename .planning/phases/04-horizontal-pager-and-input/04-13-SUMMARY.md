---
phase: 04-horizontal-pager-and-input
plan: 13
subsystem: pager-verification
tags: [playwright, touch, cdp, waapi, reduced-motion, ci, cross-browser]
requires:
  - phase: 04-10
    provides: usePagerInput swipe/keys, chromium-touch project, ALL_BROWSERS firefox/webkit projects
  - phase: 04-06
    provides: WAAPI animator (track + bar, 600ms, --ease-page / --ease-retarget)
provides:
  - NAV-03 automated e2e with real CDP touch events
  - D-01 / D-03 / D-11 / WR-08 motion contract e2e
  - CI e2e job runs pager specs in Chromium, Firefox and WebKit
affects: [04-15]
tech-stack:
  added: []
  patterns:
    - "CDP Input.dispatchTouchEvent swipe helper with per-step waits as finger speed"
    - "Easing compared as numeric cubic-bezier control points (minified CSS drops leading zeros)"
key-files:
  created:
    - e2e/pager-swipe.spec.ts
    - e2e/pager-motion.spec.ts
  modified:
    - .github/workflows/ci.yml
key-decisions:
  - "Edge-exclusion swipe runs from /achievements/ so a right swipe would otherwise page (from / it would be vacuous)"
  - "Easing assertions parse cubic-bezier numbers because the built CSS token reads .77 while WAAPI reports 0.77"
requirements-completed: [NAV-03, NAV-01]
duration: 20min
completed: 2026-11-09
---

# Phase 4 Plan 13: Swipe and motion contract e2e Summary

**Real-touch swipe e2e on a 390x844 Chromium viewport, a WAAPI motion contract spec (retarget continuity, shared track/bar timing, same-target no-op, live reduced motion) and `ALL_BROWSERS=1` in the CI e2e job.**

## Accomplishments

- `e2e/pager-swipe.spec.ts` (chromium-touch, 6 tests): horizontal swipe pages forward/back and focuses `#title-achievements`; swipe from x=10 (inside the 20px edge) does nothing; vertical swipe on /projects/ scrolls the document (`scrollY > 0`) without paging; 30px over ~500ms does not page; swipe left on /say-hi/ does nothing; swipe from a scrolled /projects/ lands /experience/ at `scrollY === 0` with no inline transform on `#page-projects`.
- `e2e/pager-motion.spec.ts` (chromium, 1440x900, 7 tests): retarget at currentTime > 200ms jumps <= 4px and the rAF-sampled track never moves backwards (consecutive diff <= 0.5px), ending within 1px of `-2 * innerWidth`; first slide uses `--ease-page`, retarget uses `--ease-retarget`; track and bar share duration 600, easing and startTime (< 1ms); End is one 600ms slide; End twice keeps one animation with the same startTime; switching to reduced motion mid-session makes ArrowLeft instant (no `#content` animation, `data-land` incremented after one rAF) and switching back restores the slide; at rest no animations and `--track-index` equals the landed index.
- `.github/workflows/ci.yml`: `ALL_BROWSERS: "1"` added under `VISUAL: "1"` in the e2e job env, with comment. Job names, image tag, permissions unchanged; no `paths:`.

## Verification

- Host, served on :4263: `pager-swipe` 6/6 (chromium-touch), `pager-motion` 7/7 (also 21/21 with `--repeat-each=3`).
- Full host `pnpm test:e2e`: 202/202 (189 + 13).
- Container `mcr.microsoft.com/playwright:v1.65.0-noble`, `ALL_BROWSERS=1 --project=firefox --project=webkit`: 42/42. Host `pnpm install --frozen-lockfile` re-run afterwards.
- `pnpm lint`, `pnpm typecheck`, prettier check: green. Workflow greps: `ALL_BROWSERS: "1"` x1, four required job names, no `paths:`.

## Task Commits

1. Task 1: swipe e2e via CDP touch: `ea9fc04`
2. Task 2: motion contract e2e + CI cross-browser switch: `3d3612e`

## Deviations from Plan

1. **[Rule 1 - Test correctness] Edge-exclusion test starts on /achievements/** instead of "/": a right swipe from "/" could never page (index 0), so the test would pass regardless of the 20px rule. From /achievements/ the same swipe would page to "/" without the edge exclusion.
2. **[Rule 1 - Test correctness] Easing compared numerically:** the production CSS is minified (`cubic-bezier(.77,0,.18,1)`) while `getTiming().easing` reports `cubic-bezier(0.77, 0, 0.18, 1)`; the spec compares parsed control points.
3. The same-target test awaits `animation.ready` before reading `startTime` (startTime is null while pending), so the "unchanged" comparison is meaningful.

No product code changed; no product bugs found.

## Known Stubs

None.

## Threat Flags

None. T-04-36 mitigated: only an env var was added to the workflow and the verify greps confirm job names and absence of `paths:`.

## Self-Check: PASSED

- FOUND: e2e/pager-swipe.spec.ts, e2e/pager-motion.spec.ts, .github/workflows/ci.yml
- FOUND: ea9fc04, 3d3612e
