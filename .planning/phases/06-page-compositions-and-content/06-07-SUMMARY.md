---
phase: 06-page-compositions-and-content
plan: 07
subsystem: ui
tags: [marks, portrait, toggles, a11y, playwright]
requires: ["06-01", "06-03", "06-04"]
provides:
  - OrgMark component (reused by MAME Projects row, plan 06-10)
  - PortraitToggle pressed-state button with on-demand colour twin
  - lib/toggles/mount.ts (touch tap colour, aria-pressed, deferred twin load)
affects: [06-08, 06-10, 06-17]
tech-stack:
  added: []
  patterns: ["server-rendered nodes + lazy attribute-only feature module", "data-tap-colour / data-colour CSS hook"]
key-files:
  created:
    - components/media/OrgMark.tsx
    - components/media/org-mark.module.css
    - components/media/PortraitToggle.tsx
    - components/media/portrait-toggle.module.css
    - tests/toggles.test.ts
    - tests/org-mark.test.tsx
    - e2e/marks-portrait.spec.ts
  modified:
    - lib/toggles/mount.ts
    - components/pages/ExperiencePage.tsx
    - components/pages/experience-page.module.css
    - components/pages/AboutPage.tsx
    - components/pages/about-page.module.css
    - tests/pages-about.test.tsx
    - e2e/assets.spec.ts
requirements-completed: [CONT-12, CONT-05]
duration: ~25min
completed: 2026-11-12
---

# Phase 6 Plan 07: Organisation marks and portrait colour twin Summary

Seven decorative organisation marks on Experience (mono at rest, colour on hover or touch tap) and a pressed-state About portrait whose colour twin downloads only on first hover, focus or tap, driven by one small lazy toggles module.

## Tasks
1. Toggles module (TDD): `5884ba7` (RED), `83274f6` (GREEN).
2. OrgMark, PortraitToggle, Experience and About markup/CSS and tests: `c196d75`.
3. Marks and portrait e2e (desktop, keyboard, reduced motion, touch, JS off) plus assets spec update: `23971e7`.

## Verification
Vitest 583 passing, typecheck, lint, build, measure:js (143.9 KB gzip, under 150) all pass. Playwright marks-portrait, assets and a11y (axe) specs pass on Chromium (38 tests across the three files).

## Deviations from Plan
- **[Rule 3 - Blocking]** `ExperiencePage` takes `Partial<PageProps>` (isCurrent defaults to false) because the untouched tests/pages-experience-sayhi.test.tsx (owned by 06-08) renders it with no props and typecheck would otherwise fail.
- **[Rule 1]** The e2e accessible-name check tolerates whitespace before the comma, since Chromium joins the img alt and hidden suffix with a space ("... 2026 , show in colour"). Cosmetic for screen readers; the content constant is unchanged.
- Worktree base was behind the expected commit; fast-forwarded with `git merge --ff-only` instead of `reset --hard` (a safety hook blocked the reset; result identical).
- The assets.spec "hidden image" filter already matched `portrait-` and `facturo-`; explicit colour/facturo patterns were added as the plan asked.
- Commit trailer: the system reminder asked for a Co-Authored-By line, but the user's memory says no Claude co-author trailer; none was added.

## Known Stubs
None.

## Threat Flags
None. T-06-19 to T-06-21 dispositions unchanged (portrait twin loads only on interaction; JS-off portrait button stays disabled, to flag for Yahya in 06-17).

## Self-Check: PASSED
