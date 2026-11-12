---
phase: 06-page-compositions-and-content
plan: 10
subsystem: ui
tags: [projects, proof-preview, org-mark, playwright]
requires: [06-05, 06-06, 06-07, 06-09]
provides:
  - Projects "Read the deep dive" link to /projects/facturo/
  - MAME row mark and admin-overview preview
key-files:
  modified:
    - components/pages/ProjectsPage.tsx
    - components/pages/projects-page.module.css
    - tests/pages-projects.test.tsx
  created:
    - e2e/projects.spec.ts
requirements-completed: [CONT-03, CONT-10, CONT-12]
duration: ~25min
completed: 2026-11-12
---

# Phase 6 Plan 10: Projects deep-dive link, MAME mark and preview Summary

Projects now links the Facturo deep dive and the MAME row carries its organisation mark and a hover/focus admin-overview preview in cols 7-8, reusing ProofPreview and OrgMark.

## Tasks

1. Deep-dive link, MAME mark and preview: commit 4a7f7d0
2. Projects e2e: commit 9e08f0e (also contains the placement fix below)

## Deviations from Plan

**1. [Rule 1 - Bug] Preview bottom offset**
- **Found during:** Task 2 (e2e measured 31.6px off at all three viewports)
- **Issue:** The plan's `bottom: var(--space-lg)` lands on the bottom of the deep-dive link, which is now the last element in `.lead`, not on the last `.leadLine`.
- **Fix:** `bottom: calc(var(--space-lg) + var(--space-md) + var(--text-label) * 1.3)` (lead padding + deep-dive margin + its label line). The e2e asserts the figure bottom is within 2px of the last lead line at 1440x900, 1366x768 and 1280x720.
- **Files:** components/pages/projects-page.module.css

**2. [Rule 3] Old unit test replaced**
The 06-02-era test "has no deep-dive link" contradicted this plan and was replaced by the deep-dive/MAME tests.

## Verification

- vitest 629 passed; typecheck, lint, build clean; `measure:js` budget gate exit 0.
- Playwright (chromium): projects (17), walkthrough and a11y specs, 43 tests all pass.
- Stylelint binary is not installed in the worktree, so it was not run.

## Known Stubs

None.

## Self-Check: PASSED
