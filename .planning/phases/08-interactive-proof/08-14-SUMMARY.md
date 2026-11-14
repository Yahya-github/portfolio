---
phase: 08-interactive-proof
plan: 14
subsystem: transitions
tags: [view-transitions, a11y, motion, inline-script]
requires: ["08-13"]
provides:
  - "Row-to-deep-dive cross-document View Transition for Facturo, Atlantis, Robot firmware"
affects: [app/layout.tsx, styles/transition.css, components/pages/ProjectsPage.tsx]
tech-stack:
  patterns: ["media-gated @view-transition", "build-time inline script (T-05-09)"]
key-files:
  created:
    - lib/transition/rules.ts
    - lib/transition/script.ts
    - tests/transition-rules.test.ts
    - styles/transition.css
    - e2e/dive-transition.spec.ts
  modified:
    - app/layout.tsx
    - components/pages/ProjectsPage.tsx
    - components/deep-dive/FacturoDeepDive.tsx
    - components/proof/ProofRoute.tsx
    - .planning/PROJECT.md
decisions:
  - "Transition name on the ProofRoute h1 (not word spans): Robot firmware has two words and a name must be unique"
  - "Reduced motion is handled by gating @view-transition in CSS, not in the script (byte budget)"
metrics:
  completed: 2026-11-13
---

# Phase 8 Plan 14: Row-to-deep-dive transition Summary

Cross-document View Transitions (CSS `@view-transition` inside `prefers-reduced-motion: no-preference`) plus a 1 kB inline script that skips off-screen or non-dive pairs, lets any input finish the transition, and focuses the deep-dive h1.

## Commits
- 3f75fb0 feat(08-14): skip rules, inline script, layout injection, transition.css
- b20aec4 feat(08-14): names on the three pairs, PROJECT.md decisions
- e68fdc0 test(08-14): e2e and focusable h1

## Deviations from Plan

**1. [Rule 3 - Blocking] h1 not focusable.** The plan said the h1 already had tabindex -1; only `main` did. Added `tabIndex={-1}` to the Facturo and ProofRoute h1.

**2. [Rule 1 - Bug] Duplicate transition name.** Robot has two title words; naming each span would duplicate `dive-title-robot` and abort the transition. Name sits on the h1 for ProofRoute.

**3. Script size.** The 1024-byte cap forced trimming: no matchMedia check in the script (the CSS gate already means no transition under reduced motion), plain capture listeners, and any error in pageswap skips the transition.

**4. transition.css committed in Task 1** (layout imports it), not Task 2.

**5. e2e "calm" check** counts only `::view-transition` animations; the Projects page runs its own looping device animations.

Header uses `body > header`, rail uses `[data-pager="letters"]` (no component edits needed).

## Verification
- vitest 904 passed, lint, typecheck, build clean.
- `node scripts/measure-js.mjs out --max-gzip-kb 150 --max-chunk-kb 12 --max-model-kb 700` exit 0; root route 146.7 kB (unchanged, no new chunk).
- Chromium e2e: dive-transition (14), deep-dive, focus, a11y, routes, projects, proof-isolation, atlantis, robot, csp, reduced-motion, motion-control all passing (159 passed, 4 skipped).

## Known Stubs
None.

## Self-Check: PASSED
