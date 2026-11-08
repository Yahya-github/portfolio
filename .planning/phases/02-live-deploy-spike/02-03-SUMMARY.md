---
phase: 02-live-deploy-spike
plan: 03
subsystem: deploy-config-and-test-gate
tags: [vercel, csp, security-headers, playwright, axe, ci, github-actions, perf-budget]
requires: [02-02]
provides:
  - vercel.json edge headers (noindex, CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, XFO DENY, immutable static cache)
  - unit test pinning the headers (tests/vercel-config.test.ts)
  - baseline JS measurement + 150 kB gzip gate (scripts/measure-js.mjs)
  - Playwright e2e suite against the built export (first-party assets, CSP with negative control, axe)
  - four-job CI workflow (lint, typecheck, unit, e2e)
affects: [02-04 (first push), 02-05 (branch protection check names), 02-06 (perf baseline write-up)]
tech-stack:
  added: []
  patterns: [CSP injected via page.route for local runs, measure-js gzip gate in CI, BASE_URL switch for live Playwright runs]
key-files:
  created: [vercel.json, tests/vercel-config.test.ts, scripts/measure-js.mjs, playwright.config.ts, e2e/assets.spec.ts, e2e/csp.spec.ts, e2e/a11y.spec.ts, .github/workflows/ci.yml]
  modified: []
decisions:
  - "Unit test resolves vercel.json from process.cwd() because jsdom gives import.meta.url a non-file scheme"
  - "Baseline JS for / is 5 files, 447 kB raw, 132.1 kB gzip -9, 112.5 kB brotli q11 (150 kB gzip gate in CI)"
metrics:
  duration: ~8min
  completed: 2026-11-07
---

# Phase 02 Plan 03: Deploy headers, JS budget, e2e suite and CI Summary

`vercel.json` now sets a first-party-only CSP, noindex and security headers on every path, and a unit test pins them. A measure script gates the baseline JS at 150 kB gzip. A Playwright suite runs against the served `out/` and checks four things: there are zero foreign requests, the site passes under the real production CSP (a strict negative control proves the harness catches violations), axe finds nothing, and the PDF and font load. A four-job CI workflow (`lint`, `typecheck`, `unit`, `e2e`) is ready for the first push.

## Tasks

| Task | Name | Commit |
| ---- | ---- | ------ |
| 1 (RED) | Failing vercel.json header tests | 9311844 |
| 1 (GREEN) | vercel.json noindex and security headers | 3aba7a7 |
| 1 | measure-js script with gzip gate | c1f1bd1 |
| 2 | Playwright config and three e2e specs | 37a83f3 |
| 3 | CI workflow (lint, typecheck, unit, e2e) | 772e5fb |

## measure:js output (exact, for plan 06)

```
$ pnpm measure:js -- --max-gzip-kb 150
{"route":"/","files":5,"rawKB":447,"gzipKB":132.1,"brotliKB":112.5}
```

This matches the research spike (132.1 kB gzip). Brotli comes out 0.1 kB lower than the spike's 112.6. Negative control: `pnpm measure:js -- --max-gzip-kb 100` printed `JS budget exceeded: 132.1 kB gzip > 100 kB` and exited 1.

## Verification

- `pnpm exec vitest run vercel-config`: 5/5. `pnpm test`: 10/10
- `pnpm test:e2e`: 4 passed on chromium. `-g "first-party"` selected 1, `-g "CSP"` 2 and `-g "axe"` 1, and all passed
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm build`: all exit 0
- ci.yml: parsed with PyYAML. Job names are exactly {e2e, lint, typecheck, unit}, the triggers are `pull_request` plus push to `[main]`, `--frozen-lockfile` appears 4 times, and there are no `paths:`/`paths-ignore:`/`pull_request_target`/`secrets.` entries. `actionlint` is not installed, so that check was skipped
- No `public/robots.txt` exists. vercel.json has no `outputDirectory`. `grep` finds no `any` in `e2e/*.ts`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] vercel.json path resolution in the unit test**
- **Found during:** Task 1 GREEN
- **Issue:** The planned `new URL("../vercel.json", import.meta.url)` threw `The URL must be of scheme file`, because Vitest's jsdom environment does not give `import.meta.url` a `file:` scheme. The RED run had therefore failed for the wrong reason.
- **Fix:** Read the file from `join(process.cwd(), "vercel.json")` (the Vitest root is the repo root). I then re-checked RED with vercel.json moved away (ENOENT on all 5 tests) and GREEN with it back (5/5).
- **Files modified:** tests/vercel-config.test.ts
- **Commit:** 3aba7a7

**2. [Rule 2 - Robustness] measure-js argument parsing**
- `pnpm measure:js -- --max-gzip-kb N` forwards a literal `--`. I also made the out-dir lookup skip the value that follows `--max-gzip-kb`, and the script now exits 2 when that value is not a number. The output and the exit-1 behaviour match the research code. Commit c1f1bd1.

## Threat Flags

None. The surface matches the plan's threat model (T-02-08 to T-02-13 mitigated as specified; the CSP keeps `script-src 'unsafe-inline'` as the documented trade-off for inline RSC payload scripts).

## Known Stubs

None.

## Notes for later plans

- The headers in vercel.json have not yet been seen live. Plan 04/06 should confirm them with `curl -I` on the deployment.
- Phase 4 adds the Firefox and WebKit Playwright projects. Phase 8 (Atlantis wasm) will need `'wasm-unsafe-eval'` in script-src.

## Self-Check: PASSED

All 8 created files exist on disk; commits 9311844, 3aba7a7, c1f1bd1, 37a83f3 and 772e5fb are present in `git log`.
