---
phase: 06-page-compositions-and-content
plan: 09
subsystem: deep-dive
tags: [nextjs, static-export, css-subgrid, playwright, a11y]
requires: [06-01, 06-03, 06-04]
provides:
  - "/projects/facturo/ standalone vertical deep-dive route (CONT-04)"
  - "Header label override, LetterNav currentMarker, deepDiveMetadata"
  - "Resume and contact proven on seven routes (CONT-08)"
affects: [06-10]
tech-stack:
  added: []
  patterns: ["standalone route outside Shell with lean chrome", "CSS subgrid ruled sections"]
key-files:
  created:
    - app/projects/facturo/page.tsx
    - components/deep-dive/FacturoDeepDive.tsx
    - components/deep-dive/DeepDiveFooter.tsx
    - components/deep-dive/StandaloneClient.tsx
    - components/deep-dive/deep-dive.module.css
    - tests/deep-dive.test.tsx
    - e2e/deep-dive.spec.ts
  modified:
    - components/frame/Header.tsx
    - components/letters/LetterNav.tsx
    - lib/metadata.ts
    - tests/source-guard.test.ts
    - tests/frame.test.tsx
    - tests/letters.test.tsx
    - tests/metadata.test.ts
    - e2e/routes.spec.ts
    - e2e/a11y.spec.ts
    - e2e/csp.spec.ts
decisions:
  - "Header/LetterNav get optional props (label, currentMarker) rather than variants"
  - "DeepDiveFooter is a lean server sibling reusing frame.module.css (fixed footer, no counter/hint/bar)"
metrics:
  completed: 2026-11-12
---

# Phase 6 Plan 09: Facturo Deep Dive Summary

Standalone static route `/projects/facturo/` with a giant Facturo title, four ruled sections (Problem, What I built, Result, Links) and greyscale hard-cropped screenshots, outside the pager with a lean footer and cursor-only client island.

## Tasks

| Task | Commit | Notes |
| ---- | ------ | ----- |
| 1. Header label, LetterNav marker, metadata, StandaloneClient | 56d5079 | source-guard allowlist updated |
| 2. Route, body, footer, CSS | see git log (feat(06-09) route commit) | build exports route; 137.5 kB gzip (< 150) |
| 3. e2e coverage | see git log (test(06-09) commit) | 84 Playwright tests pass (chromium + nojs) |

## Verification

- vitest: 39 files, 582 tests pass; typecheck and lint clean; build exports `out/projects/facturo/index.html`.
- measure:js: `/projects/facturo/` 137.5 kB gzip; all chunks under 12 kB.
- Playwright (deep-dive, routes, a11y, csp; chromium + chromium-nojs): 84 pass, axe and CSP zero violations on the deep dive.

## Deviations from Plan

**1. [Rule 1 - Test bug] Lazy-loading e2e assertion**
- The planned "other images not requested before scroll" check fails: Chromium's lazy-load margin fetches images on this short page early.
- Fix: assert the loading policy instead (first image `eager`, the other four `lazy`), plus `-grey` currentSrc after scrolling.
- Files: e2e/deep-dive.spec.ts

**2. Links list renders every item from content**, including the internal "Back to Projects" entry, as the plan's "each item" wording says (the footer link is a second route back).

Prettier reformatting of Header.tsx and two test files was committed with Task 3.

## Known Stubs

None.

## Threat Flags

None. T-06-25 to T-06-28 mitigations hold: rel noopener noreferrer asserted in unit and e2e tests, root noindex inherited and asserted, CSP spec covers the route.

## Self-Check: PASSED
