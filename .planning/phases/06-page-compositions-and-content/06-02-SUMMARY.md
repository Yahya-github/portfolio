---
phase: 06-page-compositions-and-content
plan: 02
subsystem: build-gate
tags: [performance, ci, js-budget]
requires: []
provides: ["per-route and per-lazy-chunk JS budget gate"]
affects: [".github/workflows/ci.yml"]
key-files:
  created: [scripts/lib/measure.mjs, scripts/lib/measure.d.mts, tests/measure-js.test.ts]
  modified: [scripts/measure-js.mjs, .github/workflows/ci.yml]
decisions:
  - "Lazy chunk cap 12 kB gzip (Claude's discretion within D-08)"
metrics:
  completed: 2026-11-12
requirements: [CONT-07, CONT-11]
---

# Phase 6 Plan 02: JS budget gate Summary

`pnpm measure:js` now measures initial JS for every exported route and every lazy chunk, failing CI on a route over 150 kB gzip or a lazy chunk over 12 kB gzip.

## Commits
- 05ba739: pure helpers (scriptsOf, referencedChunks, routeOf, lazyChunks, moduleHint) plus 7 fixture tests
- 7331e49: measure-js.mjs rewrite and ci.yml line change

## Measured output (`pnpm measure:js -- --max-gzip-kb 150 --max-chunk-kb 12`, exit 0)
```
{"route":"/","files":7,"rawKB":477.2,"gzipKB":143.4,"brotliKB":122.5}
{"route":"/_not-found/","files":5,"rawKB":447,"gzipKB":132.3,"brotliKB":112.6}
{"route":"/404/","files":5,"rawKB":447,"gzipKB":132.3,"brotliKB":112.6}
{"route":"/about/","files":7,"rawKB":477.2,"gzipKB":143.4,"brotliKB":122.5}
{"route":"/achievements/","files":7,"rawKB":477.2,"gzipKB":143.4,"brotliKB":122.5}
{"route":"/experience/","files":7,"rawKB":477.2,"gzipKB":143.4,"brotliKB":122.5}
{"route":"/projects/","files":7,"rawKB":477.2,"gzipKB":143.4,"brotliKB":122.5}
{"route":"/say-hi/","files":7,"rawKB":477.2,"gzipKB":143.4,"brotliKB":122.5}
{"chunk":"/_next/static/chunks/03te02sm3k78n.js","module":"unknown","gzipKB":1.5,"brotliKB":1.4}
{"chunk":"/_next/static/chunks/08sj2u1zbfdoz.js","module":"unknown","gzipKB":0.8,"brotliKB":0.7}
```
Negative controls: `--max-gzip-kb 1` exits 1; `--max-chunk-kb 0.1` exits 1.

## Deviations from Plan

1. **[Rule 3 - Blocked] `--no-verify` refused.** A plugin hook blocks `git commit --no-verify`, so commits ran with normal hooks.
2. **[Rule 1 - Bug] routeOf backslash handling.** The first version split on `path.sep`, which failed the backslash fixture on POSIX; it now normalises `\` to `/` explicitly.
3. **Known limitation.** Production Turbopack chunks contain no `[project]/...` module ids, so `moduleHint` returns "unknown" for real chunks (the plan expected `lib/cursor/mount.ts`). The helper is correct against its fixtures and the gate works; failures name the chunk path but not the module. Improving the hint would need another source (e.g. build manifest), deferred.

## Self-Check: PASSED
Files exist, tests (7), typecheck, lint and build pass; commits present.
