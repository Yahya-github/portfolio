---
phase: 04-horizontal-pager-and-input
plan: 03
subsystem: pager-input
tags: [pager, wheel, trackpad, fsm, tdd, traces]
requires: ["04-01"]
provides:
  - "lib/pager/input/wheel.ts: stepWheel, INITIAL_WHEEL, WheelSample, WheelState, WheelStep, WHEEL_THRESHOLD_PX, GESTURE_GAP_MS, FRESH_FLICK_MIN_PX, FRESH_FLICK_RATIO, DECAY_RATIO, DISCRETE_NOTCH"
  - "lib/pager/input/normalize.ts: normalizeDelta, LINE_PX"
  - "tests/traces: JSON trace fixtures, deterministic synthetic generators, loadTraces/replay"
affects: [04-08, 04-15]
tech-stack:
  added: []
  patterns: ["pure timestamp-driven input FSM (no DOM, no timers)", "trace replay tests from JSON fixtures plus synthetic generators"]
key-files:
  created:
    - lib/pager/input/normalize.ts
    - lib/pager/input/wheel.ts
    - tests/traces/load.ts
    - tests/traces/synthetic.ts
    - tests/traces/windows-chrome-notches.json
    - tests/traces/firefox-linux-lines.json
    - tests/traces/safari-mac-mouse-notch.json
    - tests/traces/ctrl-pinch.json
    - tests/traces/idle-gap-reset.json
    - tests/pager-wheel.test.ts
  modified: []
decisions:
  - "stepWheel ignores non-finite deltas (NaN/Infinity): state unchanged, no intent, no preventDefault"
  - "Fresh-flick detection needs the stream to have decayed to 50% of its peak first; thresholds left for device tuning in 04-15"
metrics:
  duration: "~6 min"
  completed: 2026-11-09
  tasks: 2
  files: 10
---

# Phase 4 Plan 03: Wheel Gesture State Machine Summary

`stepWheel` is a pure, timestamp-driven recogniser for wheel and trackpad input. Each gesture produces exactly one page intent, and momentum tails of any length are swallowed. A new flick that starts inside a decaying tail counts as a second gesture. Ctrl (pinch) events are never touched, and the accumulator resets after a 160 ms idle gap. On overflowing pages a vertical gesture scrolls natively unless it starts at the edge. All of this is proven by replaying traces.

## Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 (RED) | Traces, loader and failing tests | 5c98871 | tests/traces/*, tests/pager-wheel.test.ts |
| 2 (GREEN) | normalizeDelta and stepWheel | 11e9806 | lib/pager/input/normalize.ts, lib/pager/input/wheel.ts |

## Verification

- `pnpm vitest run tests/pager-wheel.test.ts`: 32 tests pass. They cover 5 JSON traces and 5 synthetic traces (Mac flick next/prev/horizontal, two flicks, Linux touchpad), plus inline cases for the inclusive threshold, the legacy notch, mode 2, immutability, pinch, idle reset, non-finite deltas, and the overflow/edge rules.
- `pnpm test` (258 tests), `pnpm typecheck`, `pnpm lint` and `pnpm format:check` all exit 0.
- The two `lib/pager/input` modules contain no `setTimeout`, `document.`, `window.` or React import. `wheel.ts` is 193 lines.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Input validation] Non-finite delta guard (T-04-07)**
- **Found during:** Task 2
- **Issue:** Under the planned algorithm, a NaN delta would still start an "accumulating" gesture, and its NaN sums would carry forward until the idle gap.
- **Fix:** `stepWheel` now returns the incoming state with no intent and `preventDefault: false` when the normalised magnitude is not finite. A test covers it.
- **Commit:** 11e9806

### Process notes
- The worktree started at 7861a39, so it was hard-reset to 275cc46 as the worktree branch check instructs.
- `loadJsonTraces()` is exported next to `loadTraces()`, so tests can check that exactly 5 JSON fixtures exist and select the pinch trace. It appends the file name to each `device` label.

## TDD Gate Compliance

The RED commit (5c98871, `test(04-03)`) comes before the GREEN commit (11e9806, `feat(04-03)`). No refactor commit was needed.

## Known Stubs

None.

## Self-Check: PASSED
