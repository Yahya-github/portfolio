---
phase: 06-page-compositions-and-content
plan: 05
subsystem: achievements-previews
tags: [previews, achievements, css, playwright]
requires: ["06-01", "06-03", "06-04"]
provides:
  - ProofPreview shared component (reused by the MAME row in 06-10)
  - lib/previews nudge maths and quiet-after-blur feature module
  - Achievements page with five lines and server-rendered proof previews
affects: [06-10]
key-files:
  created:
    - components/media/ProofPreview.tsx
    - components/media/proof-preview.module.css
    - lib/previews/nudge.ts
    - tests/previews-nudge.test.ts
    - tests/previews-mount.test.ts
    - e2e/achievements.spec.ts
  modified:
    - lib/previews/mount.ts
    - components/pages/AchievementsPage.tsx
    - components/pages/achievements-page.module.css
    - tests/pages-index-achievements.test.tsx
decisions:
  - "Preview reveal is pure CSS (hover and :has(:focus-visible)); JS only nudges --pv-y and sets data-quiet"
requirements: [CONT-02, CONT-10]
metrics:
  tasks: 3
  completed: 2026-11-12
---

# Phase 6 Plan 05: Achievements proof previews Summary

CSS-first proof previews on the five Achievements lines (colour on hover or keyboard focus, greyscale inline thumbnails on touch), with a lazy previews module that keeps each preview 8px inside the viewport above the footer and hides stale hovers after window blur.

## Tasks

| Task | Commit | Notes |
| ---- | ------ | ----- |
| 1 RED | 1762aee | failing nudge and mount tests |
| 1 GREEN | 857462b | previewOffset, mount (nudge, quiet) |
| 2 | 3a811ad | ProofPreview, Achievements markup and CSS, unit tests |
| 3 | c766179 | e2e: desktop 1366x768 and 1440x900, touch phone |

## Verification

- vitest 588/588, typecheck, eslint (0 warnings), build, measure:js budget (150 gzip / 12 chunk) all pass.
- Playwright chromium: achievements.spec 13/13, a11y.spec 12/12, assets.spec 8/8 (run with --workers=1 / 2).

## Deviations from Plan

**1. [Rule 3 - Blocking] Removed the eslint-disable comment on the preview img.** The `@next/next/no-img-element` rule does not fire inside `<picture>`, so the directive raised an "unused directive" warning and `--max-warnings 0` failed lint. Files: components/media/ProofPreview.tsx.

**2. Comment reworded in proof-preview.module.css.** The plan's literal "never :focus-within" comment would have tripped the plan's own no-`focus-within` grep and unit test.

**3. Worktree base reset.** HEAD was 7861a39, not the required base; hard-reset to 2e14211 per the startup check.

## Notes

- A first Playwright run with default parallelism and three spec files failed every test, including pre-existing specs. The same tests pass when run with fewer workers; likely contention on the shared port 4173 from other parallel agents, not a code issue.
- `pnpm exec stylelint` is not installed in this worktree, so Stylelint was not run (guards in vitest css-guard passed).

## Known Stubs

None.

## Threat Flags

None. T-06-13/14/15 mitigations hold: `rel="noopener noreferrer"` asserted in unit and e2e tests, previews are self-hosted, the module writes only a CSS variable and a data attribute.

## Self-Check: PASSED
