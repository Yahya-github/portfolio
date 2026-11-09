---
phase: 04-horizontal-pager-and-input
plan: 11
subsystem: pager-debug
tags: [debug, overlay, trace, lazy-load, source-guard]
requires:
  - phase: 04-10
    provides: lib/pager/debug.ts setDebugSink / emitDebug
  - phase: 04-08
    provides: PagerProvider, PagerContext hooks, e2e pager helpers
provides:
  - DebugOverlay (lazy, ?debug only) with window.__pagerTrace recorder (600-sample cap)
  - exact client-component allowlist in the source guard
  - e2e/pager-debug.spec.ts
affects: [04-15]
tech-stack:
  added: []
  patterns:
    - "Feature flag via URLSearchParams.has() + dynamic import() in an effect; flag value never parsed or rendered"
key-files:
  created:
    - components/shell/DebugOverlay.tsx
    - components/shell/debug.module.css
    - tests/debug-overlay.test.tsx
    - e2e/pager-debug.spec.ts
  modified:
    - components/shell/PagerProvider.tsx
    - tests/source-guard.test.ts
key-decisions:
  - "The overlay listens to the reduced-motion media query itself only to re-render; the displayed value still comes from controller.isReducedMotion()"
  - "Fields with no frame yet show '-' (data notation constant)"
requirements-completed: [NAV-01, NAV-03]
duration: 8min
completed: 2026-11-09
---

# Phase 4 Plan 11: Debug overlay and trace recorder Summary

**A `?debug`-only, lazily imported, aria-hidden overlay showing Index, Phase, Source, Wheel, Accum, Gesture, Edge, Swipe and Motion, plus a 600-sample `window.__pagerTrace` wheel recorder in trace-file format; absent from the initial JS.**

## Performance

- Duration: about 8 min
- Tasks: 2/2
- Files: 4 created, 2 modified

## Accomplishments

- `DebugOverlay` registers the debug sink on mount (`setDebugSink(null)` on unmount), merges frames immutably and appends each `frame.wheel` (`{ t, dx, dy, mode, legacy? }`) to `window.__pagerTrace`, keeping the newest 600.
- `debug.module.css` follows UI-SPEC placement (fixed, `z-index: 40`, ground background, hair border, `pointer-events: none`), tokens only.
- `PagerProvider` imports `./DebugOverlay` dynamically only when the URL has `debug`; no static import.
- Source guard now asserts the exact set of Phase 4 client components.

## Verification

- `pnpm test` 446/446; typecheck, lint, prettier green.
- `pnpm build` + `pnpm measure:js -- --max-gzip-kb 150`: 140.1 KB gzip (139.8 before; +0.3 KB for the dynamic-import stub).
- Bundle check (inline `node -e` from the plan): the 7 initial scripts of `out/index.html` do not contain `__pagerTrace`; the lazy chunk `08sj2u1zbfdoz.js` does. Exit 0.
- `e2e/pager-debug.spec.ts` on chromium: 3/3. Full suite served on :4261 (`BASE_URL=http://localhost:4261`): 192/192 (189 + 3). Server stopped afterwards.

## Task Commits

1. Task 1 RED: failing overlay tests: `841a3cd`
2. Task 1 GREEN: overlay, CSS, lazy load: `de51536`
3. Task 2: exact allowlist and debug e2e: `1a80c51`

## Deviations from Plan

**1. [Rule 1 - Bug] Motion row re-render on preference change**
- **Found during:** Task 1
- **Issue:** `controller.isReducedMotion()` is not reactive, so the Motion row would not update when the preference flips (the e2e requires it live).
- **Fix:** the overlay subscribes to `(prefers-reduced-motion: reduce)` and re-renders on change; the shown value still comes from the controller (media value only as a fallback outside a provider).
- **Files modified:** components/shell/DebugOverlay.tsx
- **Commit:** de51536

## TDD Gate Compliance

RED `841a3cd` (test) precedes GREEN `de51536` (feat).

## Known Stubs

None.

## Threat Flags

None. T-04-31..33 mitigated as planned (local-only data, aria-hidden, flag only gates a same-origin import, 600-sample cap; paging unchanged with the flag per e2e).

## Self-Check: PASSED

- FOUND: components/shell/DebugOverlay.tsx, components/shell/debug.module.css, tests/debug-overlay.test.tsx, e2e/pager-debug.spec.ts
- FOUND commits: 841a3cd, de51536, 1a80c51
