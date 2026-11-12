---
phase: 06-page-compositions-and-content
plan: 03
subsystem: content
tags: [content, tokens, guards]
requires: []
provides:
  - typed Phase 6 content (previews, walkthrough, marks, copy, motion strings)
  - content/facturo.ts deep-dive copy
  - Phase 6 motion/size tokens
  - DSGN-05 no-CSS-filter guard
affects: [06 later plans]
tech-stack:
  added: []
  patterns: ["as const satisfies", "single-sourced alts via altOf()"]
key-files:
  created: [content/facturo.ts]
  modified:
    - content/types.ts
    - content/achievements.ts
    - content/projects.ts
    - content/experience.ts
    - content/about.ts
    - content/say-hi.ts
    - content/index.ts
    - content/site.ts
    - tests/content.test.ts
    - styles/tokens.css
    - tests/css-guard.test.ts
key-decisions:
  - "--spiral-step and --walk-hold are not zeroed under reduced motion"
requirements-completed: [CONT-02, CONT-03, CONT-04, CONT-07, CONT-10, CONT-11, CONT-12, EXP-02]
duration: ~15min
completed: 2026-11-12
---

# Phase 6 Plan 03: Content and tokens Summary

All Phase 6 strings and data are typed in content files, Facturo deep-dive copy lives in content/facturo.ts, and Phase 6 tokens plus a DSGN-05 no-filter guard are in place.

## Commits
- 947e819: content types, page strings, facturo.ts, tests
- 2196e2a: tokens and filter guard

## Deviations from Plan
- [Rule 1] The existing exact `toEqual` test on achievements line 0 broke when the new fields were added; changed to `toMatchObject`.
- The plan's parallel-mode `--no-verify` is blocked by a repo hook, so commits ran with normal hooks (they passed).
- Walkthrough alts matched v7 wording exactly; no differences found.

## Verification
content tests (69), css/motion/contrast guards, typecheck, lint, format:check and build all pass.

## Known Stubs
None.

## Self-Check: PASSED
