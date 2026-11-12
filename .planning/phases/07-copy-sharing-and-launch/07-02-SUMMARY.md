---
phase: 07-copy-sharing-and-launch
plan: 02
subsystem: seo
tags: [metadata, open-graph, json-ld, twitter-card, 404]
requires: []
provides:
  - SHARE_IMAGE and shared OG base spread into every metadata builder
  - notFoundMetadata and content/not-found.ts strings
  - Person JSON-LD in the root layout
affects: [07-03 share-card.png, 07-04 404 page, 07-08 robots flip]
tech-stack:
  added: []
  patterns: [OG_BASE spread per builder (Next merges openGraph shallowly)]
key-files:
  created: [content/not-found.ts, lib/structured-data.ts, tests/structured-data.test.ts, e2e/seo.spec.ts]
  modified: [content/types.ts, content/site.ts, tests/content.test.ts, lib/metadata.ts, tests/metadata.test.ts, app/layout.tsx]
decisions:
  - OG_BASE typed with a mutable images array (type: "website" as const) rather than `as const`, since Next's OpenGraph type rejects readonly tuples
metrics:
  tasks: 3
  completed: 2026-11-12
---

# Phase 07 Plan 02: SEO head and Person JSON-LD Summary

Every route now emits its own title, description, canonical, og:url, an absolute og:image pointing at /share-card.png (1200x630 with alt), twitter summary_large_image, and one Person JSON-LD block; 404 strings and noindex,follow metadata are ready for 07-04.

## Commits
- 715fbfc: content contracts (shareCardAlt, person, notFound)
- 8488b0d: shared OG base, twitter card, notFoundMetadata
- 3cc2668: structured-data, layout JSON-LD, e2e/seo.spec.ts

## Verification
pnpm test (680 pass), typecheck, lint, build, and seo + csp Playwright specs (16 pass) all green. robots stays noindex,nofollow (07-08 flips it).

## Deviations from Plan
- **[Rule 3 - Blocking] OG_BASE typing:** `as const` made `images` a readonly tuple that TS rejected; used `type: "website" as const` with a plain array (the fallback the plan anticipated).
- **Commit flag:** `--no-verify` is blocked by a repo hook, so commits ran with normal hooks.
- **Verification environment:** a stale `serve` process from the main checkout (pid 609806) holds port 4173 and served an old build, so the first seo run failed on missing og tags. It was not touched; the specs were re-run against this worktree's `out/` served on port 4180 via `BASE_URL`, and passed. Reviewers running `playwright test` locally with that server alive will hit the same stale-build failure.
- Worktree base was reset to dc83998 as instructed.

## Known Stubs
None. /share-card.png itself is produced by plan 07-03.

## Self-Check: PASSED
