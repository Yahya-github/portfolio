---
phase: 04-horizontal-pager-and-input
plan: 06
subsystem: pager-ports
tags: [pager, waapi, history, scroll, focus, a11y, tdd]
requires:
  - "04-01: lib/pager/types.ts (Animator, HistoryPort, FocusPort, ScrollPort, EdgeInfo, PAGER_SELECTORS), lib/sections.ts (indexOfRoute, slugAt)"
provides:
  - "lib/pager/animator.ts: createWaapiAnimator, AnimatorTargets, translateXOf, restingOffsetPx, SLIDE_MS"
  - "lib/pager/history.ts: createHistoryPort, silenceNextAnnouncer, setManualScrollRestoration, indexFromLocation"
  - "lib/pager/focus.ts: createFocusPort"
  - "lib/pager/scroll.ts: createScrollPort"
  - "lib/pager/input/edge.ts: pageElement, pageScrolls, scrollerFor, edgeInfo"
affects: [04-03, 04-04, 04-08]
tech-stack:
  added: []
  patterns:
    - "WAAPI slide that reads the rendered transform before cancelling, so a retarget never snaps"
    - "Browser side effects as injectable ports, tested in jsdom with stubbed animate/getAnimations"
key-files:
  created:
    - lib/pager/animator.ts
    - lib/pager/history.ts
    - lib/pager/focus.ts
    - lib/pager/scroll.ts
    - lib/pager/input/edge.ts
    - tests/pager-dom.test.ts
  modified: []
decisions:
  - "translateXOf returns 0 for malformed matrices (wrong arity or non-numeric values), so a bad computed style never produces NaN keyframes"
  - "The animator only animates the bar and letters when they expose Element.animate; the track check decides whether the whole slide is instant"
  - "history.push ignores an out-of-range index (sections[index]?.route) instead of throwing"
metrics:
  duration: "~6 min"
  completed: 2026-11-09
  tasks: 2
  files: 6
---

# Phase 4 Plan 06: Browser Ports Summary

This plan adds the browser-side ports the pager controller depends on:
- **WAAPI animator.** Each slide starts from the rendered transform. The track, progress bar and hero row share one 600 ms slide with one easing (`--ease-page`, or `--ease-retarget` on a retarget, each with a fallback). A slide is instant under reduced motion or where `Element.animate` is missing. `slideTo` resolves `false` when the slide is cancelled.
- **History port.** It pushes the landed route and keeps `?debug`. It never pushes the URL that is already current, swallows errors, and removes `next-route-announcer` first.
- **Focus port.** It focuses the page title with `preventScroll` and a `focusVisible` hint.
- **Scroll port.** It resets the target page to its top (D-06). On phones it holds the outgoing page with a translate while the window scroll resets. A cancelled leave gets its scroll back, and any horizontal window scroll is reset to 0.
- **Edge probe.** It picks the page scroller on desktop and the document scroller under document-scroll layouts.

## Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 (RED) | Failing animator/edge/focus tests | 7ddfd78 | tests/pager-dom.test.ts |
| 1 (GREEN) | Animator, edge probe, focus port | 20ab50b | lib/pager/animator.ts, lib/pager/input/edge.ts, lib/pager/focus.ts, tests/pager-dom.test.ts (prettier) |
| 2 (RED) | Failing history/scroll tests | d55c38f | tests/pager-dom.test.ts |
| 2 (GREEN) | History port, scroll port | 1a45ee8 | lib/pager/history.ts, lib/pager/scroll.ts |

## Verification

- `pnpm vitest run tests/pager-dom.test.ts`: 36 tests pass.
- `pnpm test`: 19 files and 262 tests pass.
- `pnpm typecheck`, `pnpm lint` and `prettier --check` all exit 0.
- Every acceptance grep passes:
  - `fill: "forwards"` appears 1 time.
  - `SLIDE_MS = 600` appears 1 time.
  - `preventScroll: true` appears 1 time.
  - There are no `transition` or `console.` matches in the animator.
  - `next-route-announcer` appears 1 time.
  - `window.history.pushState` appears exactly 1 time.
  - There are no `router.push` or `History.prototype` matches.
  - `behavior: "instant"` appears 2 times in scroll.ts.
  - There are no `console.` calls in history.ts or scroll.ts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Input validation] Guarded history.push and translateXOf against bad input**
- **Found during:** Tasks 1 and 2
- **Issue:** `sections[index].route` throws on an out-of-range index. A malformed matrix string could also produce NaN keyframes.
- **Fix:** Changed to `sections[index]?.route` with an early return. `translateXOf` now checks the matrix arity and uses `Number.isFinite`. Both have tests.
- **Commits:** 20ab50b, 1a45ee8

**2. [Acceptance tweak] Doc comment wording in history.ts**
- The doc comment also named `window.history.pushState`, so the grep counted 2 instead of the required 1. I reworded the comment and left the code unchanged.

### Process notes
- The worktree started at 7861a39 and was hard-reset to 275cc46 as the branch check instructs. `pnpm install --frozen-lockfile` was needed because the worktree had no `node_modules`.
- The test teardown uses `document.body.replaceChildren()` instead of `innerHTML = ""`, which a security hook had flagged.

## TDD Gate Compliance

Each task has a RED `test(04-06)` commit (7ddfd78, d55c38f) followed by a GREEN `feat(04-06)` commit (20ab50b, 1a45ee8). No refactor commits were needed.

## Known Stubs

None. `restingOffsetPx` uses the viewport width. Its doc comment says Phase 5 will switch it to the rail measurement, as the plan intends.

## Threat Flags

None. History writes stay within T-04-15 to T-04-17: only the constant routes plus the existing `location.search` are pushed, and errors are swallowed.

## Self-Check: PASSED
