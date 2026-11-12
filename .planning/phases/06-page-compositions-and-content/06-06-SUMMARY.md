---
phase: 06-page-compositions-and-content
plan: 06
subsystem: walkthrough
tags: [walkthrough, waapi, hold-rule, lazy-feature, e2e]
requires: ["06-01", "06-03", "06-04"]
provides: ["Facturo walkthrough (CONT-11)", "pure hold rule", "lazy walkthrough mount module"]
affects: ["components/pages/ProjectsPage.tsx", "e2e/layout.spec.ts"]
tech-stack:
  added: []
  patterns: ["one WAAPI clock", "seq guard on async frame decode", "pure HoldInputs derivation"]
key-files:
  created:
    - lib/walkthrough/hold.ts
    - lib/walkthrough/geometry.ts
    - lib/walkthrough/text.ts
    - components/walkthrough/Walkthrough.tsx
    - components/walkthrough/walkthrough.module.css
    - tests/walkthrough-hold.test.ts
    - e2e/walkthrough.spec.ts
  modified:
    - lib/walkthrough/mount.ts
    - components/pages/ProjectsPage.tsx
    - components/pages/projects-page.module.css
    - tests/pages-projects.test.tsx
    - e2e/layout.spec.ts
key-decisions:
  - "Touch hold uses pointerup with a 10px slop (v7 behaviour) rather than pointerdown, so swipes do not toggle"
metrics:
  completed: 2026-11-12
  tasks: 3
---

# Phase 6 Plan 06: Facturo Walkthrough Summary

Facturo plays as a pausable 10-frame greyscale push-in/crossfade walkthrough driven by a single WAAPI clock, with pause and colour derived from one pure `HoldInputs` rule, loaded lazily.

## Commits
- 5a0427c: pure hold rule, visible-box geometry, counter text (10 unit tests, includes all 512 input combinations)
- 534232a: Walkthrough markup/CSS, Projects wiring, lazy mount module, projects page tests
- 00ae600: walkthrough e2e (12 tests) and layout.spec img-count update

## Verification
- vitest 586 passed; typecheck, lint, build clean; measure:js passes (150 kB / 12 kB gates).
- e2e/walkthrough.spec.ts 12/12; a11y, assets, routes, layout pass except the pre-existing portrait failure below.

## Deviations from Plan
**1. [Rule 1 - Bug] e2e/layout.spec.ts img-count test broken by this plan.** It asserted two imgs site-wide and one visible on /projects/ (the old still). Excluded `[data-walk] img` (covered by walkthrough.spec.ts), now expects one non-walkthrough img and a visible img only on /about/. Commit 00ae600.

**2. [Rule 3] `font-family: inherit` rejected by css-guard**; buttons use `var(--font-sans)`.

## Deferred Issues
- `e2e/layout.spec.ts` "portrait resolves to the 1200 or 1512 source" fails: about page serves `portrait-devfest-2026-grey-1200.webp`, regex expects `portrait-(1200|1512)`. Pre-existing, unrelated to this plan (not touched).
- Port 4173 was occupied by another process in this environment; e2e was run with `BASE_URL` against a local `serve out` on another port.

## Known Stubs
None. (`projects.flagship.imageAlt` in content is now unused by the page; left in content.)

## Self-Check: PASSED
