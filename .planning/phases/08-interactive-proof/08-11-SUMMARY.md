---
phase: 08-interactive-proof
plan: 11
subsystem: proof-routes
tags: [robot, static-route, model-stage, media]
requires: [08-08, 08-09]
provides: [robot route, ModelStage, robot content, robot still media]
affects: [08-12, 08-13, 08-16]
key-files:
  created: [content/robot.ts, components/proof/ModelStage.tsx, app/projects/robot/page.tsx, public/media/robot/]
  modified: [scripts/build-media.mjs, lib/media/manifest.ts, components/proof/proof.module.css, tests/proof-route.test.tsx, tests/content.test.ts, tests/metadata.test.ts]
requirements: [PROOF-02]
duration: short
completed: 2026-11-13
---

# Phase 8 Plan 11: Robot route Summary

/projects/robot/ ships as static HTML with the grey CAD still first, the red accent, the CRC 2026 trophies photo, and viewer hooks that only appear when robotViewerOn() is true.

## Commits
- 3cc1dc0: robot content, still media job (placeholder CAD source, native 600x340), content/metadata tests
- df0d03b: ModelStage, CSS, route page, proof-route tests

## Deviations from Plan
- ModelStage wraps the still in a `data-model-still` div instead of passing the attribute to Photo, because Photo accepts no arbitrary data props (Rule 3). The phone-only caption is the stage figcaption; the same caption also appears in the meta list.
- Worktree base was reset to 10291f4 per instructions.

## Verification
lint, typecheck, build and full vitest (877 tests) pass; out/projects/robot/index.html has data-dive="robot" x2, still img with width, trophies photo, and data-model-src (gate is pending with a placeholder model, so the viewer hook is on locally). measure:js ran clean.

## Known Stubs
The still is the placeholder photos/robot-cad-01-grey.png (600x340) until 08-16 renders the real one. robot/robot-still-grey has a single native width.

## Self-Check: PASSED
