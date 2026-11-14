---
phase: 08-interactive-proof
plan: 16
subsystem: proof-gate
tags: [robot, clearance, webgl, visual-baselines]
requires: [08-08, 08-12, 08-15]
provides: [Robot cleared, real CAD mesh c28756aa3fe3, viewer-rendered still, robot baselines]
key-files:
  created:
    - scripts/render-robot-still.mjs
    - docs/material/photos/robot-still.png
    - public/models/robot/c28756aa3fe3/robot.bin
    - public/media/robot/robot-still-grey-960.webp
    - public/media/robot/robot-still-grey-996.webp
    - e2e/visual.spec.ts-snapshots/ (4 robot + 2 state baselines)
  modified:
    - docs/material/proof-clearance.md
    - content/proof-gate.ts
    - content/generated/robot-model.ts
    - scripts/build-robot-mesh.mjs
    - scripts/build-media.mjs
    - lib/media/manifest.ts
    - package.json
    - .gitignore
    - e2e/visual.spec.ts
requirements: [PROOF-02]
metrics:
  completed: 2026-11-13
---

# Phase 8 Plan 16: Robot gate Summary

The robot is recorded as cleared, the real decimated CAD mesh (24,499 triangles, 297.5 KB raw, 190 KB gzip) is committed as `robot.bin`, the still is rendered by the viewer's own shader at the start pose, and robot baselines are pinned.

## Gate outcome (Task 1, resolved by user decision)
Yahya (2026-11-13): "I have the consent but you can export it from the cad website", then supplied the Onshape "Robot Assembly" glTF himself (`docs/material/robot.gltf`, local only, in `.git/info/exclude`, never committed). Gate record: `Robot: cleared (2026-11-13 ...)`, with the consent noted as reported by Yahya, no written message seen. Inventory row Robot CAD = cleared. `content/proof-gate.ts` robot = cleared.

## Commits
- 0c91af8: gate record, mesh builder change, render script, committed robot.bin, real still and media, `.gitignore` un-ignores `public/models/`
- 148e0fd: visual spec and baselines

## What shipped
- `scripts/build-robot-mesh.mjs`: position-only simplification and a growing error budget (the CAD export's per-face attributes stopped the simplifier from collapsing anything). Output version c28756aa3fe3, sha256 of robot.bin starts with it; size 304,606 B matches `content/generated/robot-model.ts` (placeholder false). No `--target` flag was needed.
- `scripts/render-robot-still.mjs` (`pnpm model:still`): builds, serves out/ on 4175, headless Chromium (swiftshader WebGL2) 1440x900 reduced motion, waits for `data-model-state="live"`, presses Home, screenshots the canvas to `docs/material/photos/robot-still.png` (996x623). Reviewed visually: grey, correct normals, recognisable robot.
- `scripts/build-media.mjs`: robot job uses `photos/robot-still.png` at widths 960 and native (996). Plan said 960/1440, but the script names files by requested width and records the real width, so a 1440 request on a 996 source produced a manifest pointing at a missing file; native avoids it.
- Baselines: robot x4 viewports (mesh request aborted so the page stays on its still), `state-robot-viewer-focus` (live, canvas masked magenta, red ring), `state-projects-robot-focus`.

## Verification
- lint, typecheck clean; `pnpm test` 904/904; `pnpm build` ok.
- `node scripts/measure-js.mjs out --max-gzip-kb 150 --max-chunk-kb 12 --max-model-kb 700`: exit code 0 (model 297.5 KB raw).
- Playwright chromium on own port 4392 (BASE_URL): `e2e/robot.spec.ts` 14 passed, 1 skipped (gate-off case, not applicable now).
- Container visual run (VISUAL=1, no update), twice in a row: `51 passed (34.2s)` and `51 passed (34.5s)`; once more after the last baseline change: `51 passed (34.0s)`. Existing Projects baselines were unchanged.
- Acceptance greps: `placeholder: false` count 1; `git ls-files public/models` lists only robot.bin; no `clearance: "pending"` left.

## Deviations from Plan
- **[Rule 3] Media widths** as above (960 + native 996 instead of 960 + 1440).
- **Viewer focus baseline:** the plan asked for the "Arrow keys rotate" hint in the shot. The hint sits in the controls under the fixed footer bar at 1440x900, so it is asserted in the DOM (`toHaveText("Arrow keys rotate")`) but not visible in the PNG; the ring and red accent are.
- The 1440x900 full-page robot baseline shows the still partly under the fixed footer (same behaviour as the Atlantis full-page baseline), not a layout bug.
- Known quality note: the lower drive/wheel region of the decimated mesh is visibly rough at 24k triangles under the 700 KB budget; the upper robot reads well. Raising the triangle target is possible within budget if Yahya wants it.

## Known Stubs
None.

## Self-Check: PASSED
Commits 0c91af8 and 148e0fd exist; robot.bin, robot-still.png and baselines tracked; robot.gltf untracked and excluded; nothing pushed; STATE.md and ROADMAP.md untouched.
