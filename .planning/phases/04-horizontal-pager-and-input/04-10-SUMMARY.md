---
phase: 04-horizontal-pager-and-input
plan: 10
subsystem: pager-input
tags: [wheel, keyboard, swipe, playwright, cross-browser]
requires:
  - phase: 04-03
    provides: stepWheel / INITIAL_WHEEL
  - phase: 04-04
    provides: keyIntent / targetKindOf / resolveScrollKey / stepSwipe
  - phase: 04-06
    provides: pageElement / scrollerFor / edgeInfo
  - phase: 04-08
    provides: PagerProvider controller, e2e pager helpers
provides:
  - usePagerInput hook (wheel, keys, swipe listeners driving the controller)
  - lib/pager/debug.ts setDebugSink / emitDebug
  - chromium-touch project, firefox/webkit pager projects behind ALL_BROWSERS=1
  - NAV-01 and NAV-02/NAV-07 e2e specs
affects: [04-11, 04-13, 04-15]
tech-stack:
  added: []
  patterns:
    - "Thin DOM listener groups (bindWheel/bindKeys/bindSwipe) folding events into pure FSMs; FSM state kept in effect-closure lets, not React state"
key-files:
  created:
    - lib/pager/debug.ts
    - components/shell/usePagerInput.ts
    - e2e/pager-wheel.spec.ts
    - e2e/pager-keys.spec.ts
  modified:
    - components/shell/PagerProvider.tsx
    - playwright.config.ts
key-decisions:
  - "Scroll-first keys scroll natively only when focus is inside the scroller (or body for a document scroller); otherwise preventDefault + scrollBy (Pitfall 8)"
  - "Swipe debug frames are emitted only while a swipe is tracked, so mouse pointer moves do not spam the sink"
requirements-completed: [NAV-01, NAV-02, NAV-03, NAV-07]
duration: 15min
completed: 2026-11-09
---

# Phase 4 Plan 10: Gesture input wiring Summary

**Non-passive window wheel listener, keydown map with scroll-first handling and passive Pointer Events swipe, all folding into the tested pure FSMs and driving the pager controller, proven by wheel/key e2e in Chromium, Firefox and WebKit.**

## Performance

- Duration: about 15 min
- Tasks: 2/2
- Files: 4 created, 2 modified

## Accomplishments

- `usePagerInput(controller)`: wheel (`{ passive: false }`, `deltaMode` read first, preventDefault only when `stepWheel` says so), keys (Home/End goto, arrows Left/Right page with `repeat`, scroll-first keys via `resolveScrollKey`), swipe (passive pointer listeners, `visualViewport.scale > 1` as zoomed, never preventDefault).
- `emitDebug` frames for wheel (t, dx, dy, mode, legacy, accum, gesture, edge) and swipe (dx, v, lock); no-op until the `?debug` overlay sets a sink.
- Playwright: `chromium` ignores `pager-swipe`, new `chromium-touch` (390x844, hasTouch) for plan 04-13, `firefox`/`webkit` on `pager-(wheel|keys|history)` behind `ALL_BROWSERS=1`.

## Verification

- `pnpm test` 440/440, typecheck, lint, format:check, build all green; JS gate 139.8 KB gzip (< 150).
- New specs on Chromium: 10/10. Full host `pnpm test:e2e` (served on :4251): 189/189 (179 + 10).
- Container `mcr.microsoft.com/playwright:v1.65.0-noble`, `--project=firefox --project=webkit`: 42/42 (pager-wheel, pager-keys, pager-history in both engines). Host `pnpm install --frozen-lockfile` re-run afterwards.
- Engine-specific findings: none. Playwright's synthetic wheel delivers pixel-mode deltas in all three engines and the same thresholds paged correctly; real-device trackpad/notch tuning stays with plan 04-15.

## Task Commits

1. Task 1: debug sink, input hook, provider hook-up: `c94025c`
2. Task 2: Playwright projects and wheel/key e2e: `2f61fa7`

## Deviations from Plan

None - plan executed exactly as written. (The fast-retarget test additionally polls the pathname to `/projects/` before waiting for landing, since the first landing can be skipped by the retarget.)

## Known Stubs

None. `chromium-touch` matches `pager-swipe.spec.ts`, which arrives in plan 04-13 (project currently has no tests, by design).

## Self-Check: PASSED

- FOUND: lib/pager/debug.ts, components/shell/usePagerInput.ts, e2e/pager-wheel.spec.ts, e2e/pager-keys.spec.ts
- FOUND: c94025c, 2f61fa7
