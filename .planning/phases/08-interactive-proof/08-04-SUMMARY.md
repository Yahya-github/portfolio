---
phase: 08-interactive-proof
plan: 04
subsystem: proof-viewer
tags: [tdd, orbit, easing, mesh-format, webgl-prep]
requires: []
provides:
  - lib/proof/model/orbit.ts (Pose, START_POSE, PITCH_LIMIT, dragTo, keyStep, touchIntent, autoRotateYaw, shouldAutoRotate)
  - lib/proof/model/ease.ts (cubicBezier, parseCubicBezier)
  - lib/proof/model/mesh-format.ts (MESH_MAGIC, HEADER_BYTES, parseMesh)
  - scripts/lib/robot-mesh.mjs (encodeMesh, placeholderMesh) with .d.mts
affects: [08-08, 08-12]
tech-stack:
  added: []
  patterns: [pure no-DOM modules, bitmask truth-table tests, bounds-checked binary parse]
key-files:
  created:
    - lib/proof/model/orbit.ts
    - lib/proof/model/ease.ts
    - lib/proof/model/mesh-format.ts
    - scripts/lib/robot-mesh.mjs
    - scripts/lib/robot-mesh.d.mts
    - tests/proof-orbit.test.ts
    - tests/proof-mesh.test.ts
  modified: []
decisions:
  - "lib/motion/waapi.ts only holds the easing strings; it has no cubic-bezier parser, so ease.ts adds parseCubicBezier rather than reusing one."
  - "Quantization read as round((unit) * 32767) with unit = ((p-min)/(max-min||1))*2-1; dequant is min + ((q/32767+1)/2)*(max-min)."
metrics:
  tasks: 2
  completed: 2026-11-13
---

# Phase 08 Plan 04: Orbit maths, easing and RBT1 mesh format Summary

Pure, fully tested orbit/auto-rotate/easing modules plus an RBT1 mesh decoder that rejects any header/length/index inconsistency, with a dev encoder and deterministic placeholder robot for the round trip.

## Commits

- 7cbb751 test(08-04): failing tests for orbit, gate, easing (RED)
- e693e58 feat(08-04): orbit maths, auto-rotate gate, easing (GREEN)
- b001546 test(08-04): failing tests for the RBT1 mesh format (RED)
- 4e757ab feat(08-04): RBT1 decoder and dev encoder (GREEN)

## Deviations from Plan

**1. [Rule 1 - Bug] Wrong easing reference constants in my first test draft.** I had guessed t=0.5 values (0.7107, 0.9546). The implementation disagreed; an independent Python bisection solve gave 0.58714 (ease-page, not symmetric as the plan hedged) and 0.97178 (ease-ui). The test was corrected to those values (committed with the GREEN commit). Implementation unchanged.

**2. [Environment] `--no-verify` blocked.** A local pre-bash hook rejects `git commit --no-verify`, so commits ran with hooks enabled. No effect on content.

**3. [Environment] Worktree base was reset** to 13eb986 as instructed; `pnpm install --frozen-lockfile` was run since node_modules was absent.

## Verification

`pnpm test` (754 tests), `pnpm typecheck`, `pnpm lint` all pass. Threat T-08-09 mitigated: exact byteLength check before any typed-array view, index range scan, bbox finite/ordered checks; null return keeps the still.

## Known Stubs

None. placeholderMesh is an intentional dev/e2e fixture; the real robot mesh is 08-08.

## Self-Check: PASSED
