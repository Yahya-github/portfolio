---
phase: 05-letter-navigation-and-motion
plan: 09
subsystem: motion
tags: [opening, waapi, first-visit, e2e]
requires: ["05-05", "05-06", "05-07"]
provides:
  - createOpening runtime (fresh-load and D-03 paged paths, skip, reduced motion)
  - before-paint OPENING_SCRIPT wiring and pending-hide CSS
  - e2e/first-visit.spec.ts (12 tests)
affects: [components/letters/useGlide.ts, lib/letters/glide.ts]
key-files:
  created: [lib/first-visit/opening.ts, e2e/first-visit.spec.ts]
  modified: [components/letters/useGlide.ts, app/layout.tsx, styles/base.css, lib/letters/glide.ts]
metrics:
  completed: 2026-11-10
---

# Phase 5 Plan 09: Opening Summary

A first view of the Index plays a sub-second, skippable, once-ever opening (letters slide in with the 30ms stagger, then captions and chrome fade up), with a before-paint hide that can never leave content hidden.

## Commits
- c0e66d5: opening runtime, layout script, hide CSS, useGlide wiring (Task 1)
- Task 2 commit: e2e spec plus the two fixes below (see git log)

## Deviations from Plan

**1. [Rule 1 - Bug] glide cancelled the opening's animations after intercept**
- `createGlide.start` ran `letters().forEach(cancelOn)` after `intercept` returned true, killing the D-03 paged opening (no slide, "running" stuck until failsafe-less finish). Removed that cancel; the interceptor cancels before it plays. File: lib/letters/glide.ts.

**2. [Rule 1 - Bug] reduced-motion flag not written on fresh load**
- Child effect (useGlide) runs before PagerProvider syncs `setReducedMotion`, so `controller.isReducedMotion()` was still false at `claim()`. Opening now also reads the `prefers-reduced-motion` media query. File: lib/first-visit/opening.ts.

Header/footer selectors verified: only the frame Header/Footer render those elements, so the plain selectors were kept. The e2e recorder observes `document` (not `documentElement`, which is null in init scripts).

## Verification
- vitest 524 passed; typecheck, lint, build clean
- Playwright chromium + chromium-nojs full run: 254 passed (own worktree served on port 4291); the known reduced-motion flake did not appear
- measure:js: 143.2 KB gzip (under 150)

## Known Stubs
None.

## Self-Check: PASSED
