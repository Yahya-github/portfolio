---
phase: 03-static-design-system-and-pages
plan: 04
subsystem: design-system-primitives
tags: [images, webp, photo, heading, a11y, display-fit, source-guard, cont-09]
requires: []
provides:
  - assets/portrait-1200.webp, assets/portrait-1512.webp, assets/facturo-01-960.webp, assets/facturo-01-1440.webp
  - components/media/Photo.tsx (Photo)
  - components/pages/Heading.tsx (Heading, PageTitle, HeadingLevel)
  - components/pages/types.ts (PageProps)
  - lib/display-fit.ts (displayFitStyle, DISPLAY_WORD_EM, DEFAULT_WORD_EM)
  - vitest static-image plugin
  - tests/source-guard.test.ts
affects: [03-05, 03-06, 03-07, 03-08]
tech-stack:
  added: []
  patterns:
    - "Single Photo component owns every <img> and the only no-img-element disable"
    - "PageTitle: visually hidden text is the accessible name; decorative children aria-hidden"
    - "Per-word --word-em custom property for phone Display fit"
key-files:
  created:
    - assets/portrait-1200.webp
    - assets/portrait-1512.webp
    - assets/facturo-01-960.webp
    - assets/facturo-01-1440.webp
    - components/media/Photo.tsx
    - components/pages/Heading.tsx
    - components/pages/types.ts
    - lib/display-fit.ts
    - tests/photo.test.tsx
    - tests/heading.test.tsx
    - tests/display-fit.test.ts
    - tests/source-guard.test.ts
  modified:
    - vitest.config.mts
decisions:
  - "heading.test.tsx calls afterEach(cleanup) explicitly, because Vitest globals are off and Testing Library does not auto-clean"
  - "The eslint.config.mjs jsx-no-literals edit was NOT applied: the user's config-protection hook blocks it. It needs the user's approval"
metrics:
  duration: ~10 min
  completed: 2026-11-08
  tasks: 2
  files: 13
---

# Phase 3 Plan 04: Shared Primitives, Images and CONT-09 Guards Summary

This plan adds four greyscale WebP images with metadata stripped, a `Photo` component that builds srcset, `Heading`/`PageTitle` with a hidden accessible name, `PageProps`, a per-word phone Display fit helper, and a source-guard test. The guard bans literal a11y strings, `'use client'`, and value imports from next/link and next/image. The ESLint `react/jsx-no-literals` rule is blocked by a hook and still needs to be added.

## Tasks

| # | Name | Commits |
|---|------|---------|
| 1 | WebP assets, Photo, Vitest image stub | e998067 (test), b556d98 (feat) |
| 2 | Heading/PageTitle, PageProps, display fit, guards | 025bdc3 (test), 0b1ecd5 (feat) |

## Assets

| File | Size (px) | Bytes |
|------|-----------|-------|
| assets/portrait-1512.webp | 1512 x 1240 | 130944 |
| assets/portrait-1200.webp | 1200 x 984 | 62892 |
| assets/facturo-01-1440.webp | 1440 x 900 | 41810 |
| assets/facturo-01-960.webp | 960 x 600 | 21150 |

All four are under 153600 bytes. `exiftool assets/*.webp | grep -iE "GPS|Camera Model"` prints nothing (T-03-11). `assets/portrait-800.webp` is unchanged.

## Verification

- `pnpm test`: 6 files and 34 tests pass.
- `pnpm lint`, `pnpm typecheck` and `pnpm format:check` are all green.
- The source guard passes on the current tree. It failed on a scratch `components/tmp-guard.tsx` containing `alt="x"`, which was then deleted.
- `grep -rln no-img-element app components` lists only `app/page.tsx` and `components/media/Photo.tsx`.
- `grep -rn "use client" app components` prints nothing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Testing Library DOM leaked between tests**
- **Found during:** Task 2, GREEN step
- **Issue:** Vitest globals are off, so RTL does not auto-clean. `getByRole("heading")` found headings left over from earlier tests.
- **Fix:** Added `afterEach(cleanup)` to tests/heading.test.tsx.
- **Commit:** 0b1ecd5

**2. [Rule 3 - Tooling] Prettier reflowed the displayFitStyle signature** in lib/display-fit.ts. This is formatting only.

### Blocked / Not Applied

**eslint.config.mjs `react/jsx-no-literals` rule (CONT-09 lint half) was not applied.**
- The user's `everything-claude-code` config-protection hook (`pre:config-protection`) rejected the edit with "Modifying eslint.config.mjs is not allowed".
- The change makes linting stricter, but I did not work around a user-installed guard.
- **Needed:** the user approves the edit (or disables the hook temporarily). Then add this block after `...nextTs,`:
  ```js
  // CONT-09: no user-visible text literals in components; all copy comes from content/*.ts.
  {
    files: ["app/**/*.tsx", "components/**/*.tsx"],
    // app/page.tsx is the Phase 2 placeholder; plan 03-08 replaces it and removes this ignores entry
    ignores: ["app/page.tsx"],
    rules: {
      "react/jsx-no-literals": ["error", { noStrings: true, ignoreProps: true }],
    },
  },
  ```
- Then check that a scratch `components/tmp.tsx` with `<p>hello</p>` fails `pnpm lint`.
- Until this lands, CONT-09 is enforced only by the source-guard test. Text literals in JSX are not yet caught.

### Commit flag

`git commit --no-verify` was blocked by a plugin hook. The repo has no active git hooks, so I used plain `git commit`, which behaves the same.

## TDD Gate Compliance

Both tasks have a `test(...)` RED commit followed by a `feat(...)` GREEN commit. The source-guard test passed in RED because the tree already complies; it is a guard. Its failing path was shown with the scratch violation.

## Known Stubs

None.

## Self-Check: PASSED

All 12 created files exist. Commits e998067, b556d98, 025bdc3 and 0b1ecd5 are in `git log`.
