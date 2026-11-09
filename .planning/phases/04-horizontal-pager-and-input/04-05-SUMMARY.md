---
phase: 04-horizontal-pager-and-input
plan: 05
subsystem: pager-core
tags: [pager, controller, signals, react-context, tdd, a11y]
requires:
  - "04-01: lib/pager/types.ts contracts, lib/pager/state.ts reduce/land/initialState"
provides:
  - "lib/pager/controller.ts: createPagerController, REPEAT_GATE_MS (600)"
  - "lib/pager/signals.ts: createSignals, SignalHub (slide started / landed for Phase 5)"
  - "components/shell/PagerContext.tsx: PagerContext, usePagerController, usePagerState"
  - "tests/helpers/stub-ports.ts: createStubDeps (ordered call log, deferred slides, fake clock)"
affects: [04-08, 04-09, 05]
tech-stack:
  added: []
  patterns:
    - "plain-TS external store with injected ports, read through useSyncExternalStore"
    - "stale animation promises ignored by slideId so landings coalesce"
key-files:
  created:
    - lib/pager/controller.ts
    - lib/pager/signals.ts
    - components/shell/PagerContext.tsx
    - tests/helpers/stub-ports.ts
    - tests/pager-controller.test.ts
  modified: []
decisions:
  - "Listener sets (store and signals) are iterated over a copy, so subscribing or unsubscribing during notify/emit is safe"
  - "The stub ports do not log signals; tests that check signal order attach a listener that writes into the same log"
metrics:
  duration: "~5 min"
  completed: 2026-11-09
  tasks: 2
  files: 5
---

# Phase 4 Plan 05: Pager Controller, Signals and React Context Summary

This plan adds a plain-TypeScript pager controller that wraps the 04-01 reducer and reaches every side effect through injected ports. An accepted intent runs commit, scroll, animate, focus, then slideStart. A landing runs focus, commit, settle, history, scroll, then landed. Retarget chains coalesce, so only the final landing pushes history, announces and emits `landed`. Held keys are gated to one step per 600 ms. A slide-start/landed signal hub is ready for Phase 5, and `PagerContext` / `usePagerState` expose live state to client components, falling back to a resting state when there is no provider.

## Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 (RED) | Failing controller and signals tests | b216f1e | tests/helpers/stub-ports.ts, tests/pager-controller.test.ts |
| 1 (GREEN) | Controller and signals | ebe5eb1 | lib/pager/controller.ts, lib/pager/signals.ts |
| 2 | React context hooks and tests | 3aafb05 | components/shell/PagerContext.tsx, tests/pager-controller.test.ts |

## Verification

- `pnpm test`: 19 files and 251 tests pass. `tests/pager-controller.test.ts` has 25 tests.
- `pnpm typecheck`, `pnpm lint` and `prettier --check` on the touched files all exit 0.
- `grep -cE "console\.|setTimeout|document\.|window\."` on controller.ts and signals.ts returns 0 for each file.
- The tests check the exact log order for an intent and for a landing (`toEqual([...])`), and also cover:
  - retarget (no refocus, `fromRest` false, `retarget=true`)
  - stale slide promises being ignored
  - a single history push
  - history-sourced changes that do not push
  - cancelled slides that never land
  - rejected intents that cause no side effects
  - the repeat gate at 500 ms and 600 ms, including under reduced motion
  - goto ignoring `repeat`
  - reduced motion being passed through
  - signals unsubscribing, and listeners added during an emit
  - `usePagerState` with no provider, and its re-render on an intent

## Deviations from Plan

None in behaviour; plan executed as written.

### Process notes
- The worktree started at 7861a39 and was hard-reset to 275cc46, as the worktree branch check instructs.
- In Task 2 the hook tests and `PagerContext.tsx` were written together before the first run, so there is no separate RED commit for Task 2. The plan-level RED (b216f1e) then GREEN (ebe5eb1) gate is intact.
- The first intent-order test leaves out the signal entry because the stubs do not log signals. A separate test attaches a listener to the same log and checks that `signal.slideStart` comes right after the focus call, and that `signal.landed` comes right after `scroll.afterLand`.

## TDD Gate Compliance

The RED commit `test(04-05)` (b216f1e) comes before the GREEN commit `feat(04-05)` (ebe5eb1). No refactor commit was needed.

## Threat Model

T-04-12 is mitigated:
- A no-op intent returns before any port call (tested).
- Repeats are gated at 600 ms and while sliding (tested).
- Stale slide promises are dropped by slideId (tested).

## Known Stubs

None.

## Self-Check: PASSED
