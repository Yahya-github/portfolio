---
phase: 04-horizontal-pager-and-input
plan: 07
subsystem: pages-a11y
tags: [a11y, headings, context, focus, tdd]
requires:
  - "04-01: source-guard client allowlist (Heading.tsx, PageLevel.tsx)"
  - "04-02: JS-on Track layout"
provides:
  - "components/pages/PageLevel.tsx: PageLevelProvider, usePageLevel, PageLevel (1 | 2, default 1)"
  - "components/pages/Heading.tsx (client): Heading({ offset?: 0|1|2, id?, tabIndex?, className? }), PageTitle({ slug, text, className?, children? }) with tabIndex -1"
  - "PageProps is { isCurrent } only"
affects: [04-08, 04-11]
tech-stack:
  added: []
  patterns: ["client context drives heading levels so server page bodies never re-render on pager state"]
key-files:
  created:
    - components/pages/PageLevel.tsx
  modified:
    - components/pages/Heading.tsx
    - components/pages/types.ts
    - components/pages/IndexPage.tsx
    - components/pages/AchievementsPage.tsx
    - components/pages/ProjectsPage.tsx
    - components/pages/ExperiencePage.tsx
    - components/pages/AboutPage.tsx
    - components/pages/SayHiPage.tsx
    - components/shell/Track.tsx
    - tests/heading.test.tsx
    - tests/pages-about.test.tsx
    - tests/pages-experience-sayhi.test.tsx
    - tests/pages-index-achievements.test.tsx
    - tests/pages-projects.test.tsx
decisions:
  - "Index, Achievements, Experience and SayHi take no props (they never used isCurrent); About and Projects keep { isCurrent } for Photo eager"
  - "Heading level is clamped at h4 (MAX_LEVEL)"
metrics:
  duration: "~5 min"
  completed: 2026-11-09
  tasks: 3
  files: 15
---

# Phase 4 Plan 07: PageLevel Heading Context Summary

Heading levels now come from a client `PageLevel` context: `Heading` renders page level + `offset`, and `PageTitle` (`id="title-{slug}"`) is script-focusable with `tabIndex={-1}`. Track wraps each body in `<PageLevelProvider level={isCurrent ? 1 : 2}>`, so plan 04-08's PageSection can switch h1 and h2 by changing one context value.

## Tasks

| # | Task | Commits |
|---|------|---------|
| 1 | PageLevel context and client Heading/PageTitle (TDD) | 007aef1 (RED), 217573c (GREEN) |
| 2 | Page bodies and Track wrapper | 24347b0 |
| 3 | Page tests and full build/e2e run | f6d8d2f |

## Verification

- `pnpm test`: 233/233 passed
- `pnpm typecheck` and `pnpm lint`: clean
- `pnpm build` passed. JS gate: 132.6 KB gzip, under the 150 KB limit
- `pnpm test:e2e`: 168/168 passed against `out/` served on port 4237. Static HTML still has one h1 per route, and `tests/shell.test.tsx` and `e2e/routes.spec.ts` were not changed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The About test assumed no element had a tabindex**
- **Found during:** Task 3
- **Issue:** The test `does not make the portrait interactive` asserted that `container.querySelector("[tabindex]")` is null. The title now has `tabindex="-1"` on purpose (A11Y-01).
- **Fix:** The test now asserts that nothing is Tab-reachable (`[tabindex]:not([tabindex="-1"])`) and that the portrait has no tabindex ancestor. The test still checks what it was meant to check.
- **Files modified:** tests/pages-about.test.tsx
- **Commit:** f6d8d2f

**2. [Rule 3 - Blocking] Page test calls for prop-less pages**
- **Found during:** Task 3
- **Issue:** Four pages now take no props, so the tests can no longer pass `isCurrent` to them (TypeScript reports an excess-prop error).
- **Fix:** Those test renders drop `isCurrent`. About and Projects tests still pass it.
- **Commit:** f6d8d2f

## TDD Gate Compliance

RED `test(04-07)` 007aef1 comes before GREEN `feat(04-07)` 217573c. Gate satisfied.

## Threat Model

T-04-20 is mitigated. `tabIndex -1` keeps titles out of the Tab order, which is tested in heading.test.tsx and pages-about.test.tsx.

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: components/pages/PageLevel.tsx, components/pages/Heading.tsx
- FOUND commits: 007aef1, 217573c, 24347b0, f6d8d2f
