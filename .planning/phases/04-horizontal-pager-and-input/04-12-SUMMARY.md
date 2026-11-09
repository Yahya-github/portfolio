---
phase: 04-horizontal-pager-and-input
plan: 12
subsystem: testing
tags: [e2e, playwright, axe, a11y, pager, overflow]
requires:
  - phase: 04-horizontal-pager-and-input
    provides: "pager input hook and edge rule (04-10), e2e pager helpers (04-08)"
provides:
  - "A11Y-01 e2e after real page changes (pager-a11y.spec.ts)"
  - "NAV-07 edge-rule e2e on document and page scrollers (pager-overflow.spec.ts)"
affects: [04-15]
tech-stack:
  added: []
  patterns: ["axe run after every landing with inert pages excluded", "streamWheel: 30ms-spaced wheel events form one gesture"]
key-files:
  created:
    - e2e/pager-a11y.spec.ts
    - e2e/pager-overflow.spec.ts
  modified:
    - e2e/a11y.spec.ts
key-decisions:
  - "a11y.spec.ts had no [inert] exclusion from 04-02, so only a pointer comment to pager-a11y.spec.ts was added (direct-load axe stays unexcluded)"
requirements-completed: [A11Y-01, NAV-07]
duration: ~20min
completed: 2026-11-09
---

# Phase 4 Plan 12: Accessibility and Overflow Edge E2E Summary

**Playwright proves A11Y-01 after each real page change (one live page, single focused h1, exact live-region text, zero axe violations at 1440x900 and 390x844 in both motion modes) and NAV-07's fresh-gesture-at-edge rule at 200% zoom and on short desktop screens.**

## Accomplishments
- `e2e/pager-a11y.spec.ts` (7 tests): pages through all six with ArrowRight then Home per viewport x motion mode, checking reachability, `h1` uniqueness, focus outside `[inert]`, live text "`{name}, page n of 6`", and axe (`.exclude("main#content > section[inert]")`); ring shows after a key change onto Achievements, never on Projects/Experience, and not after a wheel change onto About; the riding letter row is `inert` during `data-phase="sliding"` and Tab never enters it, then it lands in rail mode; ArrowRight on `/say-hi/` changes nothing.
- `e2e/pager-overflow.spec.ts` (10 tests): at 683x384 @2x, `/projects/` and `/experience/` use document scroll, a streamed gesture reaches the bottom plus 6 momentum events without paging, a fresh wheel pages with `scrollY`/`scrollX` 0, and ArrowLeft returns to the previous page at its top; at 1024x500 the `#page-projects` scroller reaches its end before paging and Experience opens at scrollTop 0; a horizontal wheel mid-scroll pages at once; every page fits at 1366x768 with the pager on.

## Task Commits
1. **Task 1: Accessibility after paging** - `7413156` (test)
2. **Task 2: Overflow at the edge** - `1704085` (test)

## Verification
- `pnpm build` then both specs pass in Chromium; `--repeat-each=3` on the two new specs: 51/51.
- Full `pnpm test:e2e` (served on port 4262): 206/206 (189 previous + 17 new).
- Prettier, ESLint and `tsc --noEmit` clean.

## Deviations from Plan
None - plan executed exactly as written. No source defects surfaced, so no product files were touched.

## Known Stubs
None.

## Self-Check: PASSED
- FOUND: e2e/pager-a11y.spec.ts, e2e/pager-overflow.spec.ts, e2e/a11y.spec.ts (modified)
- FOUND: commits 7413156, 1704085
