---
phase: 08-interactive-proof
plan: 05
subsystem: infra
tags: [csp, vercel, wasm, playwright, headers]
requires: [08-01]
provides:
  - Disjoint Vercel header rules (site, /games/, /models/, /_next/static/)
  - cspForPath e2e helper and wasm probe negative control
affects: [08-07, 08-13, 08-17]
tech-stack:
  added: []
  patterns: ["one CSP-setting rule per path, enforced by unit and e2e helper"]
key-files:
  created: [e2e/helpers/csp.ts, e2e/fixtures/wasm-probe/probe.html, e2e/fixtures/wasm-probe/probe.js]
  modified: [vercel.json, tests/vercel-config.test.ts, e2e/csp.spec.ts]
key-decisions:
  - "D06 = split: /projects/atlantis/ stays on the site rule (CSP, XFO DENY)"
  - "media-src 'self' blob: kept defensively; 08-07 decides whether to drop it"
metrics:
  completed: 2026-11-13
---

# Phase 08 Plan 05: Disjoint CSP rules for the game path Summary

Only `/games/(.*)` now gets `'wasm-unsafe-eval'`, blob images and same-origin framing; the site rule is byte-identical and pinned by unit tests plus a wasm probe negative control.

## Tasks

| Task | Commit | Notes |
|------|--------|-------|
| 1. Disjoint rules and unit pins | 63357c1 | Site source `/((?!games/).*)`, game and models rules, 810 unit tests pass |
| 2. Path-aware e2e CSP and wasm probe | cd9def6 | 10 csp.spec tests pass on chromium, including both probe tests |

## Deviations from Plan

None. The worktree started on an older base and was reset to 8be8c4a as instructed.

## Known Stubs

None.

## Threat Flags

None beyond the plan's threat model. T-08-15 (header drift on Vercel) still needs the `curl -sI` check in 08-17.

## Self-Check: PASSED
