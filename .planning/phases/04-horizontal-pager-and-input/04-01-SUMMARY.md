---
phase: 04-horizontal-pager-and-input
plan: 01
subsystem: pager-core
tags: [pager, reducer, contracts, tdd, a11y]
requires: []
provides:
  - "lib/pager/types.ts: Intent, Source, PagerState, EdgeInfo, Direction, Animator, HistoryPort, FocusPort, ScrollPort, PagerDeps, PagerController, PagerSignals, PAGER_SELECTORS"
  - "lib/pager/state.ts: initialState, reduce, land, isLive, headingLevelOf, isCollapsed, lettersInert, PAGE_COUNT"
  - "lib/sections.ts: indexOfRoute, slugAt, liveRegionText"
  - "content site.liveRegion.template and site.debug labels"
  - "tests/setup.ts matchMedia + scrollTo stubs; source-guard client allowlist"
affects: [04-03, 04-04, 04-05, 04-06, 04-07, 04-08, 04-09, 04-11]
tech-stack:
  added: []
  patterns: ["pure reducer returning the same reference for rejected intents", "ports (animator/history/focus/scroll) injected into the controller"]
key-files:
  created:
    - lib/pager/types.ts
    - lib/pager/state.ts
    - tests/pager-state.test.ts
  modified:
    - content/types.ts
    - content/site.ts
    - lib/sections.ts
    - tests/sections.test.ts
    - tests/source-guard.test.ts
    - tests/setup.ts
decisions:
  - "reduce rejects non-integer goto indices (NaN, 1.5) in addition to out-of-range ones"
  - "Client-component allowlist uses subset semantics until plan 04-11 tightens it"
metrics:
  duration: "~8 min"
  completed: 2026-11-09
  tasks: 2
  files: 9
---

# Phase 4 Plan 01: Pager Contracts and Reducer Summary

This plan adds the typed contracts the pager is built on and a pure reducer. The reducer covers retargeting mid-slide (D-01), hard stops at both ends that return the same object (D-02), direct `goto` jumps (D-03), focus hand-off, and the D-09 letters stand-in. It also adds the live-region copy ("Projects, page 3 of 6"), exact-match route lookup, and the jsdom/allowlist test infrastructure that Wave 2 needs.

## Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Pager contracts, content strings, section helpers, test infra | f289972 | lib/pager/types.ts, content/types.ts, content/site.ts, lib/sections.ts, tests/sections.test.ts, tests/source-guard.test.ts, tests/setup.ts |
| 2 (RED) | Failing reducer tests | ddb4ca8 | tests/pager-state.test.ts |
| 2 (GREEN) | Pure pager reducer | 681c362 | lib/pager/state.ts |

## Verification

- `pnpm test`: 18 files and 226 tests pass.
- `pnpm typecheck`, `pnpm lint` and `prettier --check` all exit 0.
- `lib/pager/state.ts` has no React, `document` or `window` references.
- `tests/content.test.ts` does not check the exact set of `site` keys, so it was left unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Input validation] Integer guard on goto**
- **Found during:** Task 2
- **Issue:** With only the range check from the plan (`to < 0 || to >= PAGE_COUNT`), `goto(NaN)` and `goto(1.5)` would be accepted, because every comparison against NaN is false (T-04-02).
- **Fix:** Added `!Number.isInteger(to)` to the rejection check. `sectionAt` in `lib/sections.ts` has the same guard. Both are covered by tests.
- **Commit:** 681c362

### Process notes
- The worktree started at 7861a39, not the expected base, so it was hard-reset to e6d9480 as the worktree branch check instructs.
- A plugin PreToolUse hook blocked `git commit --no-verify`, so the commits ran with hooks enabled. All of them succeeded.

## TDD Gate Compliance

The RED commit (ddb4ca8, `test(04-01)`) comes before the GREEN commit (681c362, `feat(04-01)`). No refactor commit was needed.

## Known Stubs

None.

## Self-Check: PASSED
