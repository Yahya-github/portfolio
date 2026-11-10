---
phase: 05-letter-navigation-and-motion
plan: 05
subsystem: first-visit
tags: [opening, hint, tdd, pure-logic]
requires: ["05-01", "05-02"]
provides:
  - OPENING_SCRIPT before-paint inline script with a 3000ms failsafe
  - isSkipKey, openingStartX and opening timing constants (870ms total)
  - Pure hint timing state machine (initialHint, stepHint, nextWakeAt)
affects: ["05-07", "05-09"]
tech-stack:
  added: []
  patterns: [pure reducer returning the same object when unchanged]
key-files:
  created:
    - lib/first-visit/script.ts
    - lib/first-visit/opening-rules.ts
    - lib/first-visit/hint.ts
    - tests/first-visit-opening.test.ts
    - tests/first-visit-hint.test.ts
  modified: []
key-decisions:
  - "Opening total is derived from letter geometry constants (720ms chrome delay + 150ms), 870ms, under 1s"
metrics:
  tasks: 2
  files: 5
  completed: 2026-11-09
---

# Phase 5 Plan 05: First-visit opening and hint rules Summary

Pure, unit-tested rules for the opening (before-paint script, skip-key filter, 870ms timing) and the first-visit hint (timing state machine), ready for the runtime wiring in plans 07 and 09.

## Commits
- a570431 test: failing opening rules tests (RED)
- 2103d7b test: failing hint machine tests (RED)
- feat: opening script and skip rules (GREEN)
- feat: hint timing machine (GREEN)

## Verification
37 tests pass across the two files; `pnpm typecheck` and `pnpm lint` exit 0.

## Deviations from Plan
None. Plan executed as written. The worktree started on a stale base and was reset to the specified base commit as instructed.

## TDD Gate Compliance
RED (`test(...)`) commits precede GREEN (`feat(...)`) commits for both tasks. No refactor commits were needed.

## Known Stubs
None.

## Self-Check: PASSED
