---
phase: 06-page-compositions-and-content
plan: 16
subsystem: devices
tags: [svg, css-keyframes, motion, say-hi]
requires:
  - phase: 06-15
    provides: motion gate html flags and footer Pause motion control
provides:
  - SayHiSpiral device (device 5), phone footer rule
affects: [say-hi page]
key-files:
  created:
    - components/devices/SayHiSpiral.tsx
    - components/devices/say-hi-spiral.module.css
    - tests/say-hi-spiral.test.tsx
    - e2e/spiral.spec.ts
  modified:
    - components/pages/SayHiPage.tsx
    - components/pages/say-hi-page.module.css
    - components/frame/frame.module.css
    - e2e/layout.spec.ts
    - e2e/pager-history.spec.ts
key-decisions:
  - "No JS for the spiral: it reuses the 06-15 html flags; durations and delays come from --spiral-step"
duration: 40min
completed: 2026-11-12
---

# Phase 6 Plan 16: Say hi spiral Summary

Server-rendered "say hi" logarithmic spiral (22 words on one textPath, 14 on phones) animated by v7's verbatim CSS keyframes, running only under the shared motion gate, still under reduced motion and without JS.

## Commits
- b0120cf feat(06-16): spiral component, CSS, Say hi wiring, phone footer rule, unit test, narrow e2e updates
- test(06-16): spiral e2e (see git log)

## Deviations from Plan

### Phase 5 assertions updated narrowly (stale by design)
- `e2e/layout.spec.ts` "no ornament": `svg:not([data-quarter-rings]):not([data-say-hi-spiral])` must be 0; `svg[data-say-hi-spiral]` is exactly 23 (defs + 22 words), all inside `#page-say-hi`. Every page is in the DOM on every route, so the count is 23 on every route, not only /say-hi/.
- Horizontal-overflow scan exempts descendants of `[data-say-hi-spiral-layer]` (clipped by `overflow: clip`); document scrollWidth check still holds.
- `e2e/pager-history.spec.ts` "nothing animating" also ignores animations targeting the spiral layer's descendants (same narrow style as the margin-names exemption).
- e2e "never behind content": the left-of-layer bounding check was dropped because word boxes are rotated bounding rects that poke past the clipped layer edge by design; replaced with an assertion that the layer is `overflow: clip`. Intersection with links, address and the Pause button is still checked at four sizes over a full 55s loop.

No bugs found; the vertical-fit test did not need `contain: paint` (the layer is overflow-clipped).

## Verification
Unit 649 passed, lint, build, `measure:js` budget (150 gz / 12 chunk) pass. Chromium: layout, a11y, routes, pager-history, motion-control, say-hi, spiral (158 passed); chromium-phone phone.spec (29 passed).

## Known Stubs
None.

## Self-Check: PASSED
