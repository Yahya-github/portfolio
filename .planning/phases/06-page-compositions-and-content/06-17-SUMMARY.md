---
phase: 06-page-compositions-and-content
plan: 17
subsystem: verification
tags: [playwright, axe, visual-regression, layout, review]
requires:
  - phase: 06-16
    provides: all five D-05 devices and the shared motion gate
provides:
  - layouts-distinct signature proof (DSGN-03), axe on interaction states, 34 visual baselines
  - review fixes: ring hover, walkthrough minified-token pace bug, Say hi hint footer collision
affects: [all pages]
key-files:
  created:
    - e2e/layouts-distinct.spec.ts
    - e2e/walkthrough-pace.spec.ts
    - lib/motion/duration.ts
    - tests/duration.test.ts
    - e2e/visual.spec.ts-snapshots/ (34 PNGs)
  modified:
    - e2e/a11y.spec.ts
    - e2e/visual.spec.ts
    - e2e/device-rings.spec.ts
    - components/frame/frame.module.css
    - components/devices/quarter-rings.module.css
    - lib/walkthrough/mount.ts
    - lib/cursor/mount.ts
key-decisions:
  - "Review verdict: approved by Yahya with the planner defaults (see Checkpoint Outcome)"
completed: 2026-11-12
---

# Phase 6 Plan 17: Phase close-out Summary

Layout-signature proof, axe on interaction states and 34 regenerated visual baselines, followed by a desktop review in which Yahya returned two defects. Both are fixed, and the Phase 6 gate is green.

## Commits
- 9d2975d test(06-17): layout-signature proof and axe interaction states
- c37df47 test(06-17): regenerate 34 visual baselines in pinned container
- 9852a35 fix(06-17): keep Pause motion out of the phone footer row while the Say hi hint is pending
- ad6e64b feat(06-17): quarter ring circles turn white on hover
- ee7bf37 fix(06-17): walkthrough raced at 5 ms per frame; parse minified s/ms tokens

## What was built
- **Layout signatures (DSGN-03):** the six pages have pairwise different column/row signatures and the deep dive differs from all six.
- **Axe on interaction states:** Achievements preview, walkthrough held, MAME focus, portrait pressed, Say hi copied.
- **Visual baselines:** 34 PNGs (4 are the Facturo deep dive) regenerated with `reducedMotion: "reduce"` in the pinned Podman container, 320x568 added.

## Checkpoint Outcome
- Reply: "approved". Yahya's desktop review returned two defects before approving (below); both are fixed.
- **Not done:** no real-device phone check was reported (iPhone Safari, LinkedIn in-app browser, Android Chrome). Phone behaviour is covered only by the emulated `chromium-phone` / `chromium-touch` projects. This is a known gap, not a pass.
- **Decisions:** the reply did not state an answer, so the planner defaults stand: (a) JS-off keeps the portrait twin and walkthrough grey, marks keep CSS colour; (b) motion waits for the first-visit hint and Pause motion is hidden meanwhile; (c) no D-05 device cut.

## Deviations from Plan

### Auto-fixed
1. **[Rule 1] Say hi hint skipped on phones.** 06-16 showed Pause motion in the phone footer row on /say-hi/; while the hint was pending it was only `visibility:hidden`, still took 92px, squeezed the hint to 55px and `useHint`'s overflow guard silently skipped it. Fix: `display:none` for `.motion` while `html[data-hint]` on Say hi at phone widths.
2. **[Review] Walkthrough ran "ultra fast".** The production CSS minifier ships `--walk-hold: 5000ms` as `5s` and `--dur-frame: 900ms` as `.9s`; `lib/walkthrough/mount.ts` read them with bare `parseFloat`, so the hold was 5 ms and the counter went 02/10 to 10/10 in ~0.5 s. The dev server and `e2e/walkthrough.spec.ts` hid it because that spec injects an unminified `800ms`. Fix: `lib/motion/duration.ts` `parseDurationMs` (s, ms, unitless). The same bug existed for `--dur-ui` (`.15s`) in `lib/cursor/mount.ts` and was fixed too. Regression test `e2e/walkthrough-pace.spec.ts` runs on the built site with no override and was confirmed to fail on the old code.
3. **[Review] Quarter ring circles turn white on hover.** Per-circle hover via `stroke-opacity` (resting dimness moved from the group to each circle), `pointer-events: stroke` only under `(hover: hover) and (pointer: fine)`; group stays `pointer-events: none` so nothing in cols 9-12 is blocked. Uses the existing `--color-ink`.

### Open observations (not fixed)
- `e2e/pager-history.spec.ts` "nothing animating" still ignores the Projects walkthrough `.fr` frame fades by class regex. The seven `.fr` opacity transitions were measured to settle within about 900 ms, so the filter is conservative rather than hiding a leak, but it is a regex exemption.
- Unexplained flakes: one full run had 3 failures (`letters-glide.spec.ts:244`, `routes.spec.ts:103`, `spiral.spec.ts:168`) that did not reproduce; the cause was not found (possibly two overlapping Playwright runs).
- Stylelint is not a project dependency, so no stylelint pass was run in Phase 6.

## Verification
Orchestrator re-ran on the final tree: typecheck and lint clean, 662 unit tests passed, build ok, `measure:js --max-gzip-kb 150 --max-chunk-kb 12` exit 0, full Playwright suite 442 passed / 1 skipped across all projects.

## Known Stubs
None.

## Self-Check: PASSED
