---
phase: 05-letter-navigation-and-motion
plan: 06
subsystem: pager-core
tags: [pager, reducer, scroll-port, glide]
requires: ["05-04"]
provides:
  - "PagerState without lettersMode, railEnter, LettersMode, lettersInert"
  - "ScrollPort.heldScrollY() and SlideStartEvent.heldScrollY"
affects: [05-07, 05-08]
key-files:
  modified:
    - lib/pager/types.ts
    - lib/pager/state.ts
    - lib/pager/scroll.ts
    - lib/pager/controller.ts
    - components/letters/useGlide.ts
    - tests/pager-state.test.ts
    - tests/pager-controller.test.ts
    - tests/pager-dom.test.ts
    - tests/helpers/stub-ports.ts
requirements-completed: [LTR-03, LTR-06]
metrics:
  tasks: 2
  completed: 2026-11-09
---

# Phase 5 Plan 06: Stand-in removal and heldScrollY Summary

The pager reducer no longer carries any letters stand-in, and the scroll port reports the px it reset so the glide starts from where the letters were on screen on a scrolled phone Index (Pitfall 6).

## Commits
- c5f62fc: refactor, delete lettersMode, railEnter, LettersMode, lettersInert; pin the PagerState key list in a test
- 49688ca: feat, heldScrollY from createScrollPort through the controller's SlideStartEvent into useGlide

## Deviations from Plan
- The worktree base was not the expected commit, so it was hard-reset to afb53cd as instructed.
- Task 1 and 2 changes were made code-first with tests updated in the same commit, not separate RED commits.
- The stub-ports scroll stub returns 0 without logging, as specified.
- `pnpm install --frozen-lockfile` was run (no node_modules in the worktree).

## Verification
- vitest 522/522, `pnpm typecheck`, `pnpm lint` exit 0.
- `pnpm build`, then Playwright chromium: 197 passed; chromium-touch pager-swipe: 6 passed.
- `grep -rn "lettersMode\|railEnter\|lettersInert" lib components tests e2e` prints nothing.

## Known Stubs
None.

## Self-Check: PASSED
