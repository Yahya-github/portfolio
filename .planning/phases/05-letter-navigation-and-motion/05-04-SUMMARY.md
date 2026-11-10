---
phase: 05-letter-navigation-and-motion
plan: 04
subsystem: letters-motion
tags: [glide, waapi, css, e2e]
requires: ["05-01", "05-02"]
provides:
  - "components/letters/useGlide.ts wiring createGlide to pager signals"
  - "LetterNav with server-constant data-mode, data-cursor-tag, data-tag captions, never inert"
  - "Flight CSS: caption fades, accent in flight, rail focus/hover tag"
affects: [05-06]
key-files:
  created:
    - components/letters/useGlide.ts
  modified:
    - lib/pager/animator.ts
    - components/shell/PagerProvider.tsx
    - components/letters/LetterNav.tsx
    - components/letters/letters.module.css
    - tests/pager-dom.test.ts
    - tests/motion-guard.test.ts
    - tests/letters.test.tsx
    - e2e/pager-a11y.spec.ts
    - e2e/pager-motion.spec.ts
requirements-completed: [LTR-03, LTR-04, LTR-05, LTR-06, DSGN-04]
metrics:
  tasks: 3
  completed: 2026-11-09
---

# Phase 5 Plan 04: Glide wiring Summary

The Phase 4 riding-letters stand-in is gone. `useGlide` drives `createGlide` from pager slide-start, resize, orientation and reduced-motion changes. The animator now moves only track and bar, using the shared WAAPI helpers.

## Commits
- 3cb489a: refactor, animator drops the letters target
- 3c9a46a: feat, useGlide, LetterNav hand-off, flight CSS and rail tag
- 8a0e9c2: test, e2e assertions for the glide

## Deviations from Plan
- **[Rule 3]** The worktree started on a different base and was hard-reset to 668ac92 as instructed. `pnpm install --frozen-lockfile` was run.
- Tests were updated alongside implementation rather than as separate RED commits.
- Reduced-motion switching only snaps when it turns on, per the plan's hook code.
- No other e2e specs needed `waitForGlideSettled`; the full chromium suite passed unchanged.

## Verification
- vitest 490/490, `pnpm typecheck`, `pnpm lint` clean.
- `pnpm build` then `playwright test --project=chromium`: 197 passed.
- `pnpm measure:js`: 141.2 KB gzip (budget 150).

## Known Stubs
`heldScrollY: 0` is passed in `useGlide`; plan 06 supplies the real value. The reducer's `lettersMode`, `railEnter` and `lettersInert` remain unused until plan 06 deletes them.

## Self-Check: PASSED
