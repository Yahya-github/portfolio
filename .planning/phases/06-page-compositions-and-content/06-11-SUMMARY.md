---
phase: 06-page-compositions-and-content
plan: 11
subsystem: phone-layouts
tags: [phone, e2e, playwright, css]
requires: [06-05, 06-07, 06-08, 06-09, 06-10]
provides:
  - CSS-only Index landscape hint (D-10)
  - chromium-phone Playwright project and EXP-02 e2e suite
  - shared e2e/helpers/swipe.ts
affects: [06-17]
key-files:
  created: [e2e/phone.spec.ts, e2e/helpers/swipe.ts]
  modified: [components/pages/IndexPage.tsx, components/pages/index-page.module.css, playwright.config.ts, e2e/pager-swipe.spec.ts, tests/pages-index-achievements.test.tsx]
requirements-completed: [EXP-02]
duration: 25min
completed: 2026-11-12
---

# Phase 6 Plan 11: Phone layouts and landscape hint Summary

Index landscape hint ("Landscape shows the full posters") shown by pure CSS in portrait on coarse pointers, plus a `chromium-phone` project proving EXP-02 at 390x844 and 320x568 on all seven routes.

## Tasks

1. Landscape hint (66f0ae8): `<p className="t-label c-dim landscape">` after the phone list in IndexPage (server component, no "use client"); `.landscape { display:none }`, revealed by `@media (max-width: 820px) and (orientation: portrait) and (pointer: coarse)` with `margin-top: var(--space-md)`. Unit test added.
2. chromium-phone + suite (second commit): project (isMobile, hasTouch, 390x844), `chromium` testIgnore updated, swipe helper moved to `e2e/helpers/swipe.ts`, `e2e/phone.spec.ts` (35 tests).

## Per-page phone CSS audit

Each page was checked against its intent by the e2e signatures (stacked rank/result/detail, 16:10 walkthrough with 44px controls, rows below the deep-dive link, Involvement below Work, portrait 40svh, Say hi lines at most 64px with address below, no overflow at 320/390). All passed with the existing `@media (max-width: 820px)` rules, so no per-page CSS selector changes were needed (Projects `.rows`, Experience `.involvement`, Achievements `.item`, About `.portrait`, Say hi `.line` already matched).

## Deviations from Plan

- Deep dive route has no pager `data-phase`, so the overflow test uses plain goto plus fonts.ready for it (test-only; not a product change).
- Landscape-hint overlap check compares text case-insensitively (the label is uppercased by CSS).

## Verification

vitest, lint, build green; `chromium-phone` + `chromium-touch` 35 passed; no-scrollbar and a11y (axe) on chromium 18 passed.

## Self-Check: PASSED
