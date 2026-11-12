---
phase: 06-page-compositions-and-content
plan: 01
subsystem: media
tags: [sharp, webp, manifest, images]
requires: []
provides:
  - public/media WebP/SVG set (68 files) and generated lib/media/manifest.ts
  - Photo on MediaVariant with defer/onDemand modes, Twin component, loadDeferred
affects: [06-02, 06-03, 06-04]
tech-stack:
  added: [sharp@0.35.5 (dev only)]
  patterns: [generated manifest of image dimensions, data-src on-demand twins]
key-files:
  created:
    - scripts/build-media.mjs
    - lib/media/types.ts
    - lib/media/manifest.ts
    - lib/media/defer.ts
    - components/media/Twin.tsx
    - tests/media-manifest.test.ts
    - tests/media-defer.test.ts
  modified:
    - components/media/Photo.tsx
    - components/pages/ProjectsPage.tsx
    - components/pages/AboutPage.tsx
    - tests/photo.test.tsx
    - tests/pages-about.test.tsx
    - package.json
    - pnpm-lock.yaml
  deleted: [assets/]
key-decisions:
  - "Portrait group quality lowered 78 -> 74 -> 70 to meet the 150 kB cap (1512w colour was 202 kB, then 163 kB)"
  - "Dropped the mtime skip-if-fresh optimisation: it ignores quality changes; always re-encoding is deterministic"
requirements-completed: [CONT-04, CONT-10, CONT-11, CONT-12]
duration: ~35min
completed: 2026-11-12
---

# Phase 6 Plan 01: Media pipeline Summary

Dev-only sharp script (`pnpm media:build`) turns docs/material into 68 committed, metadata-free WebP/SVG files under public/media with a generated dimension manifest; Photo now reads from it and gains deferred and on-demand modes, plus a Twin component.

## Commits
- 4bab041 media files and manifest
- 812674a sharp dependency and script
- 19c6761 assets/ deletion
- 3817c2b Photo, Twin, defer, tests

## Verification
vitest 541 passed, typecheck, lint, format:check, build, Chromium e2e (assets, routes; JS on and off) 56 passed. A second `pnpm media:build` produced no diff.

## Deviations from Plan
- [Rule 3] The plan's mtime-skip in the script was removed (see decisions).
- Commits were made without `--no-verify` because a local hook blocks that flag.
- Task 2's work landed over two commits (the first only captured the assets/ deletion because of a failed `git add`); no content impact.

## Known Stubs
None.

## Self-Check: PASSED
