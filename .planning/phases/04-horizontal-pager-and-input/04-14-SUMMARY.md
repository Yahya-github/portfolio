---
phase: 04-horizontal-pager-and-input
plan: 14
subsystem: design-system / visual baselines
tags: [typography, label, kerning, playwright, visual-regression]
requires: ["04-11", "04-12", "04-13"]
provides:
  - ".t-label subpixel positioning and kerning fix"
  - "18 visual baselines regenerated for the Phase 4 track at rest"
affects: [styles/base.css, e2e/visual.spec.ts-snapshots/]
tech-stack:
  added: []
  patterns: ["Rendering fixes scoped to one type role; baselines are only generated in the pinned Playwright container"]
key-files:
  created: []
  modified:
    - styles/base.css
    - e2e/visual.spec.ts-snapshots/*.png (18)
    - .planning/todos/done/2026-11-08-fix-label-letter-gaps.md (moved from pending/)
decisions:
  - "Label letter gaps fixed with text-rendering: geometricPrecision + font-kerning: normal on .t-label only; no --font-render-hinting flag needed (signal: fixed)"
  - "Baselines regenerated with --update-snapshots=all so all 18 match the current render, not only those outside tolerance"
metrics:
  duration: ~35 min (including the human-verify pause)
  completed: 2026-11-09
  tasks: 3
  files: 20
requirements: [NAV-04, NAV-07]
---

# Phase 4 Plan 14: Label letter-gap fix and baseline regeneration Summary

The Label role (`.t-label`) now sets `text-rendering: geometricPrecision; font-kerning: normal`. This removes the inner-word gaps ("ACHIE VEMENTS", "00 /05") from small uppercase labels in headless Chromium on Linux. All 18 visual baselines were regenerated in the pinned v1.65.0 container.

## Tasks

| Task | Name | Commit |
| ---- | ---- | ------ |
| 1 | Before/after label crops and the first-line fix | 0d6714d |
| 2 | Human verify: container crops and Chrome (signal "fixed") | n/a |
| 3 | Regenerate the 18 baselines, close the todo | 2d96890, e82c34c |

## Findings

- **Crops at DSF 2 (container, 1440x900):** "NEXT, ACHIEVEMENTS" showed a wider gap at "ACHIE VEMENTS" before the fix and is even after it. The other labels were tighter and even after the fix. "HALL ANI" and "RESU ME" were not clearly visible at 2x in either the before or the after crops.
- **Task 2 signal: "fixed".** The coordinator ran the Chrome check for Yahya. Chrome at dpr 1.33 computes the new properties and has fractional advances for all 74 glyphs checked. The original gap did not reproduce there either before or after the fix, so that check is not decisive. The 1x container baselines are the decisive check.
- **1x baselines:** the old `index-1440x900` footer reads "ACHIE VEMENTS" and "00 /05". The regenerated baseline reads evenly. "YAHYA HALLANI" and "RESUME (PDF)" in the header are clean.
- Pitfall 14 hypotheses (a) and (b) are addressed by the CSS alone, so the `--font-render-hinting=none` launch flag (playwright.config.ts) was not added. fontTools inspection (hypothesis c) was not needed.

## Verification

- Container `--project=visual` without `--update-snapshots`, run twice in a row: 18/18 passed both times (7.0s, 6.9s).
- Host: `pnpm test` 446/446; `pnpm build && pnpm test:e2e` 222/222 (font-shift.spec.ts included). `pnpm format:check` is clean.
- `pnpm install --frozen-lockfile` was re-run on the host after each container run.

## Deviations from Plan

**1. [Rule 1 - Bug] Regenerated with `--update-snapshots=all`**
- **Found during:** Task 3
- **Issue:** The plan's command (`--update-snapshots`, mode "changed") rewrote only the 8 baselines that were outside `maxDiffPixelRatio: 0.002`. The other 10 would have kept the old label rendering, and the plan requires all 18 to be regenerated.
- **Fix:** Re-ran in the same container with `--update-snapshots=all`. All 18 PNGs are in commit 2d96890.

**2. Task 2 check performed by the coordinator.** The user delegated the Chrome check, and the crops had been cleared from test-results/ by later e2e runs before they could be re-viewed.

## Known Stubs

None.

## Self-Check: PASSED
