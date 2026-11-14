---
phase: 08-interactive-proof
plan: 08
subsystem: build-pipeline
tags: [gltf-transform, meshoptimizer, rbt1, budget-gate, measure-js]
requires: ["08-02", "08-04", "08-06"]
provides:
  - "pnpm model:build: glTF (or --placeholder) to RBT1 under public/models/robot/<hash>/"
  - "content/generated/robot-model.ts (robotModel, placeholder: true)"
  - "measure:js --max-model-kb gate and game payload report"
affects: [08-robot-viewer, 08-16]
tech-stack:
  added: ["@gltf-transform/core 4.5.1", "@gltf-transform/functions 4.5.1", "@gltf-transform/extensions 4.5.1", "meshoptimizer 1.3.0 (all devDependencies)"]
key-files:
  created: [scripts/build-robot-mesh.mjs, content/generated/robot-model.ts]
  modified: [package.json, pnpm-lock.yaml, scripts/measure-js.mjs, scripts/lib/measure.mjs, scripts/lib/measure.d.mts, tests/measure-js.test.ts, .github/workflows/ci.yml]
decisions:
  - "routeOf now returns null for non index.html and games/ paths so game pages never count as routes"
metrics:
  tasks: 2
  completed: 2026-11-13
requirements: [PROOF-02]
---

# Phase 8 Plan 08: Robot mesh pipeline and model gate Summary

Dev-only glTF to quantized RBT1 pipeline (simplify to about 40k triangles, 60k cap, 700 kB raw gate) with a placeholder model, plus a model size gate and game payload report in `pnpm measure:js`, wired into CI.

## Tasks

1. Dev deps and build-robot-mesh (commit 391b490). Placeholder run: 268 triangles, 288 vertices, 5104 B raw, 1613 B gzip, version d6835fc8af0e. `public/models/` stays git-ignored; generated module committed with `placeholder: true`.
2. measure-js model gate and game payload report (commit bf85362). New pure helpers `modelFiles` and `gameFiles`, tests (854 pass), CI flag `--max-model-kb 700`. Build plus gate exits 0 and prints a model row and a game row.

## Deviations from Plan

- **[Rule 1 - Bug]** measure-js treated argv index 0 (the out dir) as a flag value whenever a flag was absent (`idx + 1 === 0`), which broke running it with only `--max-model-kb`. Fixed by only registering present flags.
- **[Rule 3]** `routeOf` signature became `string | null` so game pages (`games/**`) are excluded from route rows, matching the plan's behaviour spec.
- The glTF code path could not be exercised on the real robot (no `docs/material/robot.glb|gltf` exists in this checkout). It was verified with a synthetic translated glb generated from the placeholder (268 triangles, welded to 144 vertices, world transform applied). The real file still needs a `pnpm model:build` run when it arrives.
- The generated module imports `@/content/types` as the plan specifies (the sibling atlantis module uses a relative path).

## Known Stubs

`content/generated/robot-model.ts` is a placeholder model (`placeholder: true`); intentional until the teammate's CAD arrives and the 08-15/08-16 gate un-ignores binaries.

## Notes

- Game row reports 0 files in this worktree because `public/games/` is git-ignored and absent here; it will report real bytes where the build exists.
- No STATE.md or ROADMAP.md changes. No config-protection hook blocks hit; a destructive-command gate required restating facts before the base `git reset --hard`.
- Commits intentionally carry no Co-Authored-By trailer (user memory rule).

## Self-Check: PASSED

Files and commits (391b490, bf85362) exist; typecheck, lint, tests, build and measure gate pass.
