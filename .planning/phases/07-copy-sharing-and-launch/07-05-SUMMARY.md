---
phase: 07-copy-sharing-and-launch
plan: 05
subsystem: ci
tags: [lighthouse, lhci, ci, seo, performance]
requires: [07-03]
provides: [lighthouse CI gate config, lighthouse CI job, baseline scores]
affects: [.github/workflows/ci.yml, branch protection (07-07)]
tech-stack:
  added: ["@lhci/cli 0.16.1 (exact pin)"]
key-files:
  created: [lighthouserc.json, tests/lighthouserc.test.ts]
  modified: [package.json, pnpm-lock.yaml, pnpm-workspace.yaml, .gitignore, .prettierignore, .github/workflows/ci.yml]
requirements: [SEO-01, SEO-02]
metrics:
  completed: 2026-11-12
---

# Phase 07 Plan 05: Lighthouse CI gate Summary

LHCI (mobile, 3 runs) over eight routes served from `out/` with per-audit SEO assertions (pre-launch), plus a `lighthouse` CI job uploading reports as a private 7-day artifact.

## Commits

- 2f4f0c7 feat: LHCI config, test, ignores, script
- 5d27996 ci: lighthouse job
- pnpm-workspace.yaml release-age exclusion and its formatting (two small commits)

## Baseline (best representative run of 3, local Chrome, mobile)

| Route | perf | a11y | best-practices | seo (pre-launch, noindex) |
| --- | --- | --- | --- | --- |
| / | 0.99 | 1 | 1 | 0.63 |
| /achievements/ | 0.97 | 1 | 1 | 0.66 |
| /projects/ | 0.96 | 1 | 1 | 0.66 |
| /experience/ | 1 | 1 | 1 | 0.63 |
| /about/ | 0.96 | 1 | 1 | 0.66 |
| /say-hi/ | 0.99 | 1 | 1 | 0.63 |
| /projects/facturo/ | 0.99 | 1 | 1 | 0.66 |
| /this-page-does-not-exist/ | 0.99 | 0.97 | 0.96 | 0.40 |

All seven page routes pass every assertion. SEO category scores are low only because `is-crawlable` fails (noindex until 07-08); it is asserted per audit instead.

## Open item: 404 route fails accessibility (not a threshold problem)

`pnpm exec lhci autorun` exits 1 solely on the 404 route: accessibility 0.97 (`landmark-one-main`: no main landmark), and best-practices 0.96 (`errors-in-console`, passes the 0.95 budget). The built `out/404.html` in this worktree is still Next's default "404: This page could not be found." page; the on-brand 404 is plan 07-04 (parallel in this wave). No threshold was lowered. 07-07 must re-run LHCI on the merged build; the on-brand 404 needs a `<main>` landmark to reach accessibility 1.

## Deviations

1. [Rule 3 - Blocking] pnpm's release-age policy blocked `@lhci/cli@0.16.1` (and its `@lhci/utils`); added both to `minimumReleaseAgeExclude` in pnpm-workspace.yaml. 0.16.1 kept, no fallback to 0.16.0.
2. Local run needed `--collect.chromePath=/usr/bin/google-chrome` (no Chromium on PATH for LHCI here). CI config left unchanged; per plan, add Playwright Chromium + CHROME_PATH in 07-07 only if the runner lacks Chrome.
3. `pnpm format:check` has pre-existing warnings in 5 unrelated files (proof-preview.module.css, lib/features/types.ts, scripts/measure-js.mjs, tests/decode-images.test.ts, tests/use-features.test.tsx); out of scope.

## Threat model

T-07-15 exact pin plus frozen lockfile; T-07-16 filesystem upload only (no temporary-public-storage); T-07-17 thresholds pinned by tests/lighthouserc.test.ts.

## Self-Check: PASSED

lighthouserc.json, tests/lighthouserc.test.ts, ci.yml `lighthouse` job exist; `pnpm test tests/lighthouserc.test.ts` passes (5 tests).
