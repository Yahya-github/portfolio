---
phase: 05-letter-navigation-and-motion
plan: 07
subsystem: ui
tags: [first-visit, hint, footer, playwright, waapi]
requires:
  - phase: 05-01
    provides: lib/first-visit/storage (HINT_KEY, seenState, markSeen)
  - phase: 05-02
    provides: OPENING_DONE_EVENT, waapi helpers
  - phase: 05-05
    provides: lib/first-visit/hint state machine
provides:
  - useHint hook driving the hint with real time, storage and pager signals
  - footer hint slot (empty on the server) with a one-time Next nudge
  - typed site.hint strings (fine / coarse)
  - e2e/first-visit-hint.spec.ts (NAV-06, NAV-05 footer)
affects: [05-09 opening (dispatches OPENING_DONE_EVENT)]
tech-stack:
  added: []
  patterns: [pure state machine driven by a thin effect hook, textContent-only DOM writes]
key-files:
  created: [components/frame/useHint.ts, e2e/first-visit-hint.spec.ts]
  modified: [content/types.ts, content/site.ts, components/frame/Footer.tsx, components/frame/frame.module.css, tests/frame.test.tsx, e2e/helpers/first-visit.ts]
key-decisions:
  - "Hint text is written client-side only, so server HTML never contains the strings"
  - "Blocked storage: module-level shownThisLoad caps the hint to one show per page load"
  - "If the hint cannot fit on one line it is dropped (UI-SPEC phone rule)"
requirements-completed: [NAV-06, NAV-05]
duration: 25min
completed: 2026-11-09
---

# Phase 5 Plan 07: First-Visit Hint Summary

**Footer hint ("Scroll or use the arrow keys" / "Swipe sideways") driven by the stepHint state machine via a useHint hook, with a one-time 4px Next nudge and full e2e coverage.**

## Tasks

1. Hint strings, useHint hook, footer markup/layout: eb531ce
2. Hint e2e spec: b56a98a

## Verification

- vitest (frame, content, source/css/motion guards), typecheck, lint pass; full `pnpm test` passes
- Full chromium Playwright suite: 207 passed; measure:js gzip 142 KB (under the 150 KB budget)

## Deviations from Plan

**1. [Rule 3 - Blocking] FRESH_VISITOR type error** - `e2e/helpers/first-visit.ts` declared the constant `as const`, which `test.use({ storageState })` rejects at `next build` type-check. Removed `as const`. Commit b56a98a.

**2. [Rule 3 - Blocking] Deterministic clock** - A free-running `page.clock.install()` made the "not yet shown at 1.4s" assertion flaky because real time elapsed during page load. The spec now installs the clock at time 0 and pauses at 1000 before navigating; the axe test calls `page.clock.resume()` since axe needs live timers.

## Notes

- Port 4173 was occupied by another parallel worktree agent's `serve`, which serves a different `out/`. I ran the suite against my own server via `BASE_URL=http://localhost:4283`. Orchestrator/other agents should beware of the shared port when running e2e locally.
- The opening itself (plan 09) is not built yet; the `opening-done` path is covered by the plan-05 unit tests, not e2e here (e2e uses deep links with no opening).

## Known Stubs

None.

## Self-Check: PASSED
