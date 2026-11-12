---
phase: 06-page-compositions-and-content
plan: 04
subsystem: pager-shell
tags: [lazy-loading, features, decode, cursor]
requires: []
provides:
  - lib/features/registry (FEATURE_LOADERS, PAGE_FEATURES, GLOBAL_FEATURES, neighbourSlugs, featureJobs)
  - lib/features/types (FeatureContext, FeatureMount, FeatureModule, FeatureKey)
  - components/shell/useFeatures
  - lib/media/decode (decodeImages, DECODE_SELECTOR)
  - lib/cursor/autoload (autoloadCursor)
  - no-op mount contracts for previews, walkthrough, toggles, copy-email
affects: [06-05, 06-06, 06-07, 06-08, 06-09, 06-15]
tech-stack:
  added: []
  patterns: [string-literal dynamic import per feature, retryable lazy jobs]
key-files:
  created:
    - lib/features/types.ts
    - lib/features/registry.ts
    - lib/previews/mount.ts
    - lib/walkthrough/mount.ts
    - lib/toggles/mount.ts
    - lib/copy-email/mount.ts
    - lib/media/decode.ts
    - lib/cursor/autoload.ts
    - components/shell/useFeatures.ts
    - tests/features-registry.test.ts
    - tests/decode-images.test.ts
    - tests/use-features.test.tsx
  modified:
    - components/shell/PagerProvider.tsx
key-decisions:
  - "Hook run() skips jobs with a missing root without marking them loaded, so they stay retryable"
requirements-completed: [CONT-07, CONT-10, CONT-11, CONT-12]
duration: 20min
completed: 2026-11-12
---

# Phase 6 Plan 04: Lazy feature loader Summary

Per-page lazy feature registry and `useFeatures` hook (target +-1, once each, retry on failed chunk), with `decodeImages` skipping `img[data-defer]` and a provider-independent `autoloadCursor`.

## Tasks
1. Feature contracts, registry maths, decode selector - 34395ee
2. useFeatures hook, cursor autoload, PagerProvider wiring - 9cd0635

## Verification
Full vitest (545 pass), typecheck, lint, build, JS gate (143.9 kB gzip < 150), cursor/assets/pager-motion e2e (30 pass).

## Deviations from Plan
- **[Rule 3 - Blocking]** Executor instructions said to commit with `--no-verify`, but a local PreToolUse hook blocks that flag; commits were made with normal hooks.
- Worktree was based on 7861a39, so it was reset to the expected base e1809ca per the branch check; `pnpm install --offline` was run to get node_modules.
- Test tweaks: used `vi.hoisted` for mocks and `getAttribute("loading")` because jsdom does not reflect `loading`.

## Known Stubs
The four `mount.ts` modules are intentional no-ops, filled by plans 06-05..06-08.

## Self-Check: PASSED
