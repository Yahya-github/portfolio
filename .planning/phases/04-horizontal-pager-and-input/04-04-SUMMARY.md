---
phase: 04-horizontal-pager-and-input
plan: 04
subsystem: pager-input
tags: [pager, keyboard, swipe, tdd, a11y]
requires:
  - "lib/pager/types.ts: Direction, EdgeInfo (04-01)"
provides:
  - "lib/pager/input/keys.ts: keyIntent, targetKindOf, resolveScrollKey, KEY_LINE_PX, KEY_PAGE_RATIO, TargetKind, KeyEventLike, KeyAction, KeyIntent"
  - "lib/pager/input/swipe.ts: stepSwipe, swipeVelocity, swipeDx, INITIAL_SWIPE, SWIPE_EDGE_PX, AXIS_LOCK_PX, AXIS_RATIO, SWIPE_COMMIT_PX, SWIPE_FAST_PX, SWIPE_VELOCITY, VELOCITY_WINDOW_MS, PointerSample, SwipeState, SwipeStep, SwipeLock"
affects: [04-05, 04-10]
tech-stack:
  added: []
  patterns: ["table-driven key map (Record lookup)", "pure swipe FSM folded over pointer samples"]
key-files:
  created:
    - lib/pager/input/keys.ts
    - lib/pager/input/swipe.ts
    - tests/pager-keys.test.ts
    - tests/pager-swipe.test.ts
  modified: []
decisions:
  - "Text-field guard is checked before the control guard, so a contenteditable button counts as text"
  - "Samples from a foreign pointer id (including a second down) are ignored while a swipe is tracked"
  - "An up with lock 'none' resolves the axis by the same 12px / 1.5 ratio rule"
  - "Added swipeDx(state) so a later finger-follow needs no API change"
metrics:
  duration: "~6 min"
  completed: 2026-11-09
  tasks: 2
  files: 4
---

# Phase 4 Plan 04: Key Map and Swipe Recogniser Summary

This plan adds the keyboard map and the touch-swipe recogniser as pure, table-tested functions. The key map covers the NAV-02 table, the WR-04 rule that Space on a focused control never pages, guards for modifiers, text fields and `defaultPrevented`, and the NAV-07 scroll-first edge rule. The swipe recogniser covers the 20px left-edge exclusion (D-08, Decision 3), the 12px axis lock with the 1.5 ratio, commit at 48px (or 24px at 0.3 px/ms or faster), cancel, pinch-zoom and foreign-pointer handling.

## Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 (RED) | Failing key map tests | ba04824 | tests/pager-keys.test.ts |
| 1 (GREEN) | Key map | 966e775 | lib/pager/input/keys.ts |
| 2 (RED) | Failing swipe tests | 96c92a8 | tests/pager-swipe.test.ts |
| 2 (GREEN) | Swipe recogniser | 4e2dfa5 | lib/pager/input/swipe.ts, tests/pager-swipe.test.ts |

## Verification

- `pnpm test`: 20 files and 313 tests pass (59 key tests, 28 swipe tests).
- `pnpm typecheck` and `pnpm lint` exit 0, and `prettier` reports the files as clean.
- `lib/pager/input/swipe.ts` has no `document.`, `window.` or React references.
- Threat mitigations T-04-09, T-04-10 and T-04-11 are each covered by tests: the modifier, text and WR-04 guards; sample pruning plus ignoring foreign pointer ids; and the zoomed-down case.

## Deviations from Plan

### Process
- The plan describes one RED and one GREEN commit for the whole feature. Because each task commits on its own, there is a RED/GREEN pair per task instead (`test(04-04)` then `feat(04-04)`, twice).
- Added the exported helper `swipeDx(state)` with a test. This puts into code the plan's note to "keep dx exposed in state-derived values" for a later finger-follow.
- The worktree started at 7861a39, so it was hard-reset to 275cc46 as the worktree branch check instructs.

## TDD Gate Compliance

For both tasks the RED commit comes before the GREEN commit: ba04824 then 966e775, and 96c92a8 then 4e2dfa5. Both RED runs failed because the module was missing. No refactor commit was needed.

## Known Stubs

None.

## Self-Check: PASSED
