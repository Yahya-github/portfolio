---
phase: 07-copy-sharing-and-launch
plan: 03
subsystem: seo-assets
tags: [favicon, share-card, open-graph, sharp, playwright]
requires: []
provides:
  - app/icon.svg and app/apple-icon.png from the real Instrument Sans Y glyph
  - public/share-card.png (1200x630, 33 KB)
  - pnpm favicon:build and pnpm card:build (dev-only)
affects: [07-02 metadata og:image]
tech-stack:
  added: []
  patterns: [committed generated binaries, dev-only build scripts, .d.mts beside .mjs helpers]
key-files:
  created:
    - scripts/favicon/extract_y.py
    - scripts/favicon/y-path.json
    - scripts/lib/glyph-path.mjs
    - scripts/lib/glyph-path.d.mts
    - scripts/build-favicon.mjs
    - scripts/build-share-card.mjs
    - scripts/share-card/card.html
    - app/icon.svg
    - app/apple-icon.png
    - public/share-card.png
    - tests/favicon.test.ts
    - tests/share-card.test.ts
    - e2e/share-assets.spec.ts
  modified:
    - package.json
key-decisions:
  - "Glyph path extracted once with fontTools via uvx and pinned in y-path.json plus a test"
metrics:
  completed: 2026-11-12
---

# Phase 7 Plan 03: Favicon and Share Card Summary

Favicon set from the real Instrument Sans Y (wdth 75 / wght 700) and a 1200x630 LinkedIn card rendered by Playwright from an HTML template using the self-hosted font and live tokens.

## Tasks

| Task | Commit |
| ---- | ------ |
| 1 Favicon from the real Y glyph | 88e448f |
| 2 Share card template, script, PNG | d5bcc06 |
| 3 Built-site asset e2e (+ type declarations) | f817880 |

## Measurements

- share-card.png: 33307 bytes, 1200x630 PNG
- YAHYA rendered width 543.03 px (limit 552), gap to bottom row 46.69 px (min 32)
- Extracted path matched the verified one exactly: `M182 0V306L8 720H164L298 344H229L362 720H498L324 306V0Z`
- Built `out/` contains icon.svg, apple-icon.png, share-card.png; head links `rel="icon"` (svg) and `apple-touch-icon` (180x180)

## Deviations from Plan

**1. [Rule 3 - Blocking] Added scripts/lib/glyph-path.d.mts.** `pnpm build` type-check failed (TS7016) on tests/favicon.test.ts importing the untyped .mjs. Mirrored the existing measure.d.mts pattern. Commit f817880.

**2. [Environment] `--no-verify` omitted.** A plugin hook blocks `git commit --no-verify`, so commits ran with normal hooks (they passed).

**3. [Environment] e2e run against BASE_URL.** Port 4173 was held by another process serving a different `out/`, so the default webServer was reused and gave 404s. I served this worktree's `out/` on port 4199 and ran `BASE_URL=http://localhost:4199 playwright test e2e/share-assets.spec.ts e2e/assets.spec.ts --project=chromium`: 17 passed. The temporary server was stopped.

## Deferred Issues

`pnpm format:check` reports pre-existing issues in files unrelated to this plan (components/media/proof-preview.module.css, lib/features/types.ts, scripts/measure-js.mjs, tests/decode-images.test.ts, tests/use-features.test.tsx). Not touched. Lint, tsc and build are clean.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

All listed files exist; commits 88e448f, d5bcc06, f817880 present.
