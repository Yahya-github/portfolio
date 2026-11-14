---
phase: 08-interactive-proof
plan: 12
subsystem: proof
tags: [webgl2, viewer, robot, e2e]
requires: [08-04, 08-08, 08-10, 08-11]
provides:
  - "lib/proof/model/viewer.ts: raw WebGL2 Lambert viewer (mount)"
  - "ProofClient model mode, robot page wired, touched-flag CSS"
affects: [robot route]
tech-stack:
  added: []
  patterns: ["lazy IntersectionObserver (100% rootMargin) then dynamic import", "silent degrade to still"]
key-files:
  created: [lib/proof/model/viewer.ts, e2e/robot.spec.ts, e2e/robot-touch.spec.ts]
  modified: [components/proof/ProofClient.tsx, app/projects/robot/page.tsx, components/frame/frame.module.css]
decisions:
  - "devices.mount is invoked through a one-line cast to a zero-arg function because it ignores its FeatureMount arguments"
  - "e2e compares canvas screenshots at a fixed scroll position (focus ring and header overlap otherwise differ)"
metrics:
  completed: 2026-11-13
  tasks: 2
---

# Phase 8 Plan 12: Robot WebGL2 viewer Summary

Raw WebGL2 robot viewer with drag, horizontal-first touch, arrow keys, Home and Reset view, gated auto-rotate, lazily loaded only on /projects/robot/ and degrading silently to the still.

## Commits
- 4931031 feat(08-12): add raw WebGL2 robot viewer
- ba532aa feat(08-12): wire lazy robot viewer, motion control and e2e

## Verification
- `pnpm lint`, `pnpm typecheck`, `pnpm test`: pass. `pnpm build`: pass.
- `node scripts/measure-js.mjs out --max-gzip-kb 150 --max-chunk-kb 12 --max-model-kb 700`: exit 0. Largest route 146.7 kB gzip (/); /projects/robot/ 140.6 kB. Viewer chunk `1x_y0t01oybsn.js` is 4.3 kB gzip (cap 12). Note `pnpm measure:js -- --flags` passes the flags after a literal `--`; I ran the node script directly. No model in `out/` (placeholder not bundled), so the model cap is "no model".
- `playwright e2e/robot.spec.ts --project=chromium`: 14 passed, 1 skipped (gate-off case, viewer is on). Run against own serve on port 4391 via BASE_URL.
- `playwright e2e/robot-touch.spec.ts --project=chromium-phone`: 2 passed.

## Deviations from Plan
1. [Rule 1 - Bug] Camera depth sign was inverted in my first viewer draft (blank canvas); found through e2e, fixed in ba532aa.
2. [Rule 1 - Bug] `html[data-model-touched]` was never cleared on cleanup; now deleted.
3. viewer.ts is about 520 lines (plan said under 400; under the 800 project cap). Not split further.
4. Mesh 404 e2e filters Chrome's own "Failed to load resource" console line; the viewer adds none. The no-WebGL2 case asserts zero console errors.
5. Viewer copy (role description, label, hint keys) is embedded in viewer.ts rather than imported from content/robot.ts, to keep the lazy chunk free of the content module; drag hint is read from the server markup.

## Known Stubs
None. Model is the generated placeholder mesh (08-gate), e2e serves its bytes by route.

## Self-Check: PASSED
