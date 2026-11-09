---
phase: 03-static-design-system-and-pages
plan: 06
subsystem: pages
tags: [pages, swiss-grid, subgrid, css-modules, a11y, tdd]
requires:
  - "03-02: styles/tokens.css, styles/base.css global classes"
  - "03-03: content/index.ts, content/achievements.ts, content/projects.ts, content/site.ts, lib/sections.ts"
  - "03-04: components/media/Photo.tsx, components/pages/Heading.tsx, components/pages/types.ts, lib/display-fit.ts, assets/facturo-01-*.webp"
provides:
  - "IndexPage(PageProps): route 00 composition"
  - "AchievementsPage(PageProps): route 01 composition"
  - "ProjectsPage(PageProps): route 02 composition"
affects:
  - "03-08: Track places these components inside its sections"
  - "03-09: e2e routes.spec checks every a[target=_blank]"
tech-stack:
  added: []
  patterns:
    - "Page root is <div className={`grid ${styles.root}`}>; pages never render their own <section>"
    - "Nested blocks stay on master columns via grid-template-columns: subgrid"
    - "Sub-headings use headingLevel + 1"
    - "Test files call afterEach(cleanup) (Vitest runs without globals)"
key-files:
  created:
    - components/pages/IndexPage.tsx
    - components/pages/index-page.module.css
    - components/pages/AchievementsPage.tsx
    - components/pages/achievements-page.module.css
    - components/pages/ProjectsPage.tsx
    - components/pages/projects-page.module.css
    - tests/pages-index-achievements.test.tsx
    - tests/pages-projects.test.tsx
  modified: []
decisions:
  - "External links use rel=\"noopener noreferrer\" from one JSX site per component (T-03-17, T-03-18)"
  - "The Facturo still is eager only when isCurrent; otherwise lazy"
metrics:
  duration: "~25 min (across a rate-limit interruption)"
  completed: 2026-11-08
  tasks: 2
  files: 8
---

# Phase 3 Plan 06: Index, Achievements and Projects pages Summary

Three synchronous server-component pages built from content data only. Index has the plain-text role line, three dim desktop meta labels and a phone five-link section list. Achievements has the AC..TS letter stack and five subgrid lines, with 75/75 as accent tabular text and four source links that open in a new tab. Projects has the greyscale Facturo still across cols 1-8 and five ruled rows in cols 9-12. Below 880px viewport height the middle line of each row is hidden.

## Tasks

| Task | Name | Commits | Files |
| ---- | ---- | ------- | ----- |
| 1 | IndexPage and AchievementsPage | 912b298 (RED), d2ab8c9 (GREEN) | IndexPage.tsx, index-page.module.css, AchievementsPage.tsx, achievements-page.module.css, tests/pages-index-achievements.test.tsx |
| 2 | ProjectsPage | 18457cb (RED), 11099a3 (GREEN) | ProjectsPage.tsx, projects-page.module.css, tests/pages-projects.test.tsx |

## Verification

- `pnpm test`: 13 files, 134 tests pass (16 new page tests; css-guard and source-guard green)
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`: clean
- Acceptance greps:
  - one `rel="noopener noreferrer"` JSX site each in AchievementsPage and ProjectsPage
  - 3 `subgrid` declarations in achievements-page.module.css
  - `var(--word-em)` used in both phone fits
  - exactly one `<Photo` with `eager={isCurrent}` in ProjectsPage
  - the short-height media query is present
  - no `svg`, `img` or `next/link` in the Index and Achievements sources, and no "deep dive" text in ProjectsPage

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test DOM leaked between cases**
- **Found during:** Task 1 GREEN
- **Issue:** Vitest runs without globals, so Testing Library never cleans up automatically. Renders piled up across cases ("multiple elements" errors).
- **Fix:** Added `afterEach(cleanup)`, matching tests/heading.test.tsx. Task 2 tests included it from the start.
- **Files modified:** tests/pages-index-achievements.test.tsx
- **Commit:** d2ab8c9

**2. [Rule 3 - Blocking] Acceptance grep matched a code comment**
- **Found during:** Task 2
- **Issue:** The JSDoc said "No deep-dive link", which fails the `grep -niE "deep dive|deep-dive"` acceptance check.
- **Fix:** Reworded it to "The case-study link and walkthrough wait for Phase 6 (D-13)".
- **Commit:** 11099a3

### Commit trailer note

The RED commit 912b298 was made before the coordinator relayed the user's "no Co-Authored-By trailer" rule, so it carries a `Co-Authored-By` line. Later commits have no trailer. It was left as is to avoid rewriting history; amend it before merge if the trailer must go.

## Known Stubs

None. Cols 11-12 on Achievements and cols 7-8 on Projects are empty by design (previews arrive in Phase 6), not stubs.

## Threat Flags

None. The only new surface is outbound target=_blank links, which the plan's threat model already covers (T-03-17/18).

## Self-Check: PASSED

- All 8 created files exist on disk.
- Commits 912b298, d2ab8c9, 18457cb, 11099a3 exist in git log.
