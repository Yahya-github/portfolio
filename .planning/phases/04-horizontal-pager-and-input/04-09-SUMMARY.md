---
phase: 04-horizontal-pager-and-input
plan: 09
subsystem: chrome
tags: [pager, a11y, letters, header, footer, client-projection]
requires:
  - phase: 04-01
    provides: lettersInert, PagerState.lettersMode/railEnter/target
  - phase: 04-05
    provides: PagerContext, usePagerState with no-provider fallback
provides:
  - Header, Footer and LetterNav as client projections of the pager target
  - data-pager="bar" and data-pager="letters" hooks for the animator and e2e
  - rail-in fade on landing off Index
affects: [04-08, 04-10, 04-11, 04-12, phase-05-letters-flip]
tech-stack:
  added: []
  patterns:
    - "Chrome reads usePagerState(indexOfSlug(current)); the current prop is the initial route only"
    - "Animator-owned inline styles are computed from the initial prop so React never rewrites them"
key-files:
  created: []
  modified:
    - components/frame/Header.tsx
    - components/frame/Footer.tsx
    - components/letters/LetterNav.tsx
    - components/letters/letters.module.css
    - tests/frame.test.tsx
    - tests/letters.test.tsx
key-decisions:
  - "Footer bar --page-index stays at the initial index; the animator owns it after hydration (D-11)"
  - "LetterNav renders inert={lettersInert(state)}, so the hero row is unreachable only while it rides out with page 00"
requirements-completed: [A11Y-01, NAV-04]
duration: ~10min
completed: 2026-11-09
---

# Phase 4 Plan 09: Chrome and Letters Projections Summary

**The header label, footer counter and Next link, Say hi aria-current and the rail's current letter and name now follow the pager target at slide start. The YAHYA row stays in hero mode and inert while it rides out with page 00, and the rail fades in over --dur-ui on landing.**

## Performance

- Duration: about 10 minutes
- Tasks: 2 of 2
- Files modified: 6

## Accomplishments

- `Header.tsx` and `Footer.tsx` are `"use client"` and use `usePagerState(indexOfSlug(current))` with `slugAt(state.target)`. A retarget mid-slide updates them again (tested).
- The footer bar has `data-pager="bar"`. Its `--page-index` is computed from the initial `current` prop, so React never overwrites the animator's write. A test checks it stays at 2 after `goto 4`.
- `LetterNav.tsx`:
  - is a client component
  - takes `data-mode` from `state.lettersMode`
  - sets `inert` from `lettersInert(state)`
  - sets `data-enter` when `railEnter` is true
  - carries `data-pager="letters"`
  - moves `aria-current` and the name span with the target
- `letters.module.css` has `@keyframes rail-in` (opacity 0 to 1), applied to `.nav[data-mode="rail"][data-enter]` with `var(--dur-ui) var(--ease-ui)`. Under reduced motion the duration is 0ms through the token.
- Without a provider, every component renders exactly as before. All existing frame and letters assertions still pass.

## Task Commits

1. Task 1, Header and Footer projections: RED `ddc705b`, GREEN `07d4106`
2. Task 2, LetterNav stand-in and rail fade: RED `0ffc105`, GREEN `3c33cf2`

## Verification

- `pnpm test`: 421/421 passed
- `pnpm typecheck`, `pnpm lint` and `pnpm format:check` are clean
- `pnpm build` succeeded, with all 7 routes static
- `BASE_URL=http://localhost:4242 pnpm test:e2e` ran against this worktree's `out/` and passed 168/168. That includes the routes, layout and rail-accent specs, so first paint is unchanged.

## Deviations from Plan

None. The plan's tests needed a link-type intent, and the `Source` type has `"link"` (there is no `"click"`), so the tests use `"link"`.

## TDD Gate Compliance

Both tasks have a `test(...)` RED commit before their `feat(...)` GREEN commit. Each RED run failed as expected: 4 failures in each.

## Issues Encountered

- `stylelint` is not installed in this repo, so it was not run on the CSS change. `css-guard.test.ts` passes.

## Next Phase Readiness

- Plan 04-08's PagerProvider only needs to wrap these components. They already work inside `<PagerContext value={controller}>`.
- The animator can target `[data-pager="bar"]` and `[data-pager="letters"]`.

## Self-Check: PASSED

- The six modified files exist.
- Commits ddc705b, 07d4106, 0ffc105 and 3c33cf2 are present in `git log`.
