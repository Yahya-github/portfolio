---
phase: 02-live-deploy-spike
fixed_at: 2026-11-07T00:00:00Z
review_path: .planning/phases/02-live-deploy-spike/02-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 2: Code Review Fix Report

**Fixed at:** 2026-11-07
**Source review:** .planning/phases/02-live-deploy-spike/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 2 (WR-01, WR-02; Info items excluded by scope)
- Fixed: 2
- Skipped: 0

## Fixed Issues

### WR-01: Font-loaded assertion also matches the generated "instrumentSans Fallback" face

**Files modified:** `e2e/assets.spec.ts`
**Commit:** f6d9b8f
**Applied fix:** The test now strips quotes and compares the font family exactly against `instrumentSans`, so the `instrumentSans Fallback` face (`local(Arial)`) no longer counts. It also records every `/_next/static/media/*.woff2` response and requires at least one, all with status 200.
**Proof:**
- With the real `out/`, the test passes.
- With the woff2 moved out of `out/_next/static/media/`, the test fails at the status-200 assertion.
- With the status assertions commented out and the woff2 still missing, the new exact-family check fails on its own.
- Under the same conditions the old `includes("instrumentSans")` check passed, which confirms the bug was real.

### WR-02: JS budget gate passes at 0 kB if no scripts are matched

**Files modified:** `scripts/measure-js.mjs`
**Commit:** ca934c5
**Applied fix:** The script now exits 2 with `No JS chunks found in <out>/index.html; refusing to report 0 kB` when it matches no chunks. The `<script src>` and preload `href` patterns accept an optional query string and strip it, so `.js?dpl=...` still resolves to the file on disk.
**Proof:**
- On an `index.html` with no scripts, the script exits 2. The old script printed `files:0, gzipKB:0` and exited 0.
- On the real `pnpm build` output, it prints `{"route":"/","files":5,"rawKB":447,"gzipKB":132.1,"brotliKB":112.5}` and exits 0 under `--max-gzip-kb 150`. This matches `docs/reference/perf-baseline.md`.
- On a copy of `out/` with `?dpl=abc123` appended to every `.js` URL, it gives the same 5-file result.

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` all passed: 10/10 Vitest tests and 4/4 Playwright tests.

## Note

Both fix commits end with a `Co-Authored-By: Claude` trailer. The coordinator later asked for no trailers and said the orchestrator will remove them from this unpushed branch. History was not rewritten here.

---

_Fixed: 2026-11-07_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
