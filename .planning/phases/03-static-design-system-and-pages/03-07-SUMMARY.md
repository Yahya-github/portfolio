---
phase: 03-static-design-system-and-pages
plan: 07
subsystem: pages
tags: [pages, css-modules, grid, display-fit, portrait]
requires:
  - phase: 03-02
    provides: tokens.css, base.css global classes
  - phase: 03-03
    provides: content/experience.ts, content/about.ts, content/say-hi.ts
  - phase: 03-04
    provides: Photo, Heading/PageTitle, PageProps, displayFitStyle, portrait-800/1200/1512.webp
provides:
  - ExperiencePage (Work cols 1-6 + Involvement cols 7-12 ruled tables)
  - AboutPage (portrait cols 1-4, TWO/HAB/ITS cols 5-8, text cols 8-12)
  - SayHiPage (four Display links cols 1-6 + address mailto)
affects: [03-08]
tech-stack:
  added: []
  patterns:
    - "Root contract: <div className={`grid ${styles.root}`}>, synchronous server component taking PageProps"
    - "Phone Display fit: style={displayFitStyle(word)} plus calc((100vw - var(--phone-inset)) / var(--word-em)) at <=820px"
    - "vi.mock on @/assets/*.webp to give real image dimensions in tests"
key-files:
  created:
    - components/pages/ExperiencePage.tsx
    - components/pages/experience-page.module.css
    - components/pages/SayHiPage.tsx
    - components/pages/say-hi-page.module.css
    - components/pages/AboutPage.tsx
    - components/pages/about-page.module.css
    - tests/pages-experience-sayhi.test.tsx
    - tests/pages-about.test.tsx
  modified: []
key-decisions:
  - "About tests vi.mock the three portrait imports with real dimensions, because the vitest static-image loader stubs every asset at 1000x800; vitest.config.mts was left untouched to avoid conflicts with parallel plans"
metrics:
  duration: ~20min
  completed: 2026-11-08
  tasks: 2
  files: 8
---

# Phase 3 Plan 07: Experience, About and Say hi Pages Summary

Experience, About and Say hi page compositions built as synchronous server components on the 12-column grid, rendered entirely from content modules, with per-word phone Display fit and the approved 800/1200/1512 portrait `sizes`.

## What was built

- **ExperiencePage**: a visually hidden h1/h2 `title-experience`; "Work" (an `ol` of five rows: date / role / organisation, in content order) in cols 1-6 and "Involvement" (a `ul` of three rows: role / organisation) in cols 7-12, under Display heads at `headingLevel + 1`. Short-viewport head rule `calc((100svh - 660px) / 0.88)`. On phones each head word fits via `--word-em`, and Involvement stacks below with `--space-2xl`.
- **SayHiPage**: four Display links (Email mailto, LinkedIn, GitHub, Resume (PDF)) mapped from `sayHi.lines`. External lines get `target="_blank" rel="noopener noreferrer"` (T-03-20). The address is an underlined `ulink` mailto in its real case. v7 `--col` / `--S` sizing, without the spiral.
- **AboutPage**: the greyscale portrait in cols 1-4 (`object-fit: cover`, `object-position: 52% 10%`; `52% 0` on phones at 40svh) with sources `[portrait-800, portrait-1200, portrait-1512]` and sizes `(max-width: 820px) 100vw, calc((100vh - 128px) * 1.22)`. It is eager only when `isCurrent`. The TWO/HAB/ITS rows sit aria-hidden inside the "Two habits" heading in cols 5-8, and the lead and paragraph are bottom-aligned in cols 8-12. No button, no tabindex, no colour twin.

## Commits

| Task | Gate | Commit | Message |
| ---- | ---- | ------ | ------- |
| 1 | RED | ac06cd2 | test(03-07): add failing tests for Experience and Say hi pages |
| 1 | GREEN | 596d297 | feat(03-07): implement Experience and Say hi pages |
| 2 | RED | 2fd89de | test(03-07): add failing tests for About page |
| 2 | GREEN | 7f81266 | feat(03-07): implement About page with the portrait |

## Verification

- `pnpm test`: 13 files, 132 tests pass (including css-guard and source-guard)
- `pnpm lint`, `pnpm typecheck` and `pnpm format:check` are green
- All acceptance greps match (660px budget, `var(--word-em)` in both CSS files, the 1.22 sizes string, `52% 10%`, three portrait imports, no svg/img/next/link/spiral/clipboard/button/tabIndex)

## Deviations from Plan

None in the shipped code. One test-side adaptation: the About test uses `vi.mock` for the portrait assets so it can assert the real `800w/1200w/1512w` srcset and the 1512x1240 intrinsic size (the shared test loader returns 1000x800 for every image).

## TDD Gate Compliance

Both tasks have a `test(...)` RED commit followed by a `feat(...)` GREEN commit. No refactor was needed.

## Known Stubs

None. The empty columns (Experience cols 9-12, Say hi cols 7-12, About cols 9-12 above the text) are intentional Phase 6 ornament slots (DSGN-06).

## Self-Check: PASSED

All 8 created files exist, and commits ac06cd2, 596d297, 2fd89de and 7f81266 are present in `git log`.
