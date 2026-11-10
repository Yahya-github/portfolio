---
phase: 05-letter-navigation-and-motion
plan: 10
subsystem: testing
tags: [playwright, e2e, glide, letters, a11y]
requires: ["05-01", "05-04", "05-06"]
provides:
  - Browser-level evidence for the letter glide (LTR-03, DSGN-04, LTR-06) and rail labels/accent (LTR-04, LTR-05)
key-files:
  created:
    - e2e/letters-glide.spec.ts
    - e2e/letters-labels.spec.ts
  modified:
    - e2e/layout.spec.ts
metrics:
  tasks: 2
  files: 3
  completed: 2026-11-10
---

# Phase 5 Plan 10: Glide and Rail Label E2E Summary

Chromium specs proving the glide end states, convergence under fast paging and resize, horizontal-first monotonic motion, the 24px phone rail, the rail focus/hover tag and the single-accent rule.

## Commits
- 553a41d: glide spec (9 tests, 8 pass, 1 skip)
- next commit: labels spec and layout additions

## Results
Full `pnpm exec playwright test --project=chromium` against this worktree's `out/` on port 4292: 234 passed, 1 skipped. `tsc --noEmit` and `eslint e2e` clean.

The skipped test is "phone: a scrolled Index starts the glide with no jump (Pitfall 6)": the Index at 390x844 does not scroll, so the plan's skip clause applies. That scenario is currently not exercised.

## Deviations from Plan

**1. [Rule 1 - Test assumption] Stagger and sync probes ignore letter 0's horizontal motion**
- Issue: the first Y letter already rests at the rail's left edge (dx about 0), so it only moves vertically, 100ms (Y_LAG) after X. Asserting "letter 0 moves first" by any-axis motion failed, as did comparing letter 0 against the track start.
- Fix: reading-order stagger is asserted across letters that travel horizontally; the track-sync probe uses letter 1. The X-ahead-of-Y, monotonic and no-overshoot checks still run on every letter that has displacement on both axes.
- Files: e2e/letters-glide.spec.ts

**2. Tests use the hydration-aware `open` helper in layout.spec.ts additions** (aliased `openHydrated`) because the file's local `open` does not wait for the pager.

No production code changed.

## Self-Check: PASSED
