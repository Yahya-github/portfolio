---
phase: 06-page-compositions-and-content
plan: 13
subsystem: ui
tags: [css-modules, decorative-device, playwright]
requires:
  - phase: 06-12
    provides: GridLines device pattern
provides:
  - EdgeNumber decorative device (cropped "03" on Experience)
  - --names-end custom property on section#page-experience (for plan 06-15)
affects: [experience-page, margin-names]
key-files:
  created:
    - components/devices/EdgeNumber.tsx
    - components/devices/edge-number.module.css
    - e2e/device-edge-number.spec.ts
  modified:
    - components/pages/ExperiencePage.tsx
    - components/pages/experience-page.module.css
requirements-completed: [DSGN-03]
completed: 2026-11-12
---

# Phase 6 Plan 13: Edge Number Summary

Server-rendered, aria-hidden "03" (from content, never a literal) in Display weight/width on Experience, sized to the free height, cut by the right edge, hidden on phones, and publishing `--names-end`; removable by deleting `<EdgeNumber />`.

## Tasks
1. EdgeNumber component, CSS, Experience wiring: b71398c
2. Edge-number e2e (4 tests; 1440x900, 1366x768, 1280x720, phone): see commit "test(06-13)"

Measured font-size at 1440x900: 461.1px (expected about 460px).

## Deviations from Plan

**1. [Rule 1 - Bug] Section scrollWidth assertion replaced**
- **Issue:** The plan asked for section `scrollWidth <= clientWidth`, but scrollWidth counts clipped overflow, so the intentional 0.14em crop (30px at 1280x720) always fails it.
- **Fix:** Assert the section's computed `overflow-x` is `clip` (cannot scroll) plus document scrollWidth <= clientWidth.
- **Files:** e2e/device-edge-number.spec.ts
- Also updated the stale comment in experience-page.module.css that said the "03" still waits for its device.

## Verification
vitest 630 pass, lint clean, build ok, Playwright chromium device-edge-number + marks-portrait + a11y all pass.

## Known Stubs
None.

## Self-Check: PASSED
