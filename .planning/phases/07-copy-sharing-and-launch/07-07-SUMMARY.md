---
phase: 07-copy-sharing-and-launch
plan: 07
subsystem: release
tags: [visual-baselines, lighthouse, branch-protection, vercel, noindex]
requires: [07-03, 07-04, 07-05, 07-06]
provides:
  - final visual baselines (38) including the 404
  - Phases 3-7 live on production with noindex
  - lighthouse as a required status check on main
affects: [07-08]
key-files:
  modified:
    - e2e/visual.spec.ts
    - e2e/visual.spec.ts-snapshots/
  created:
    - .planning/phases/07-copy-sharing-and-launch/07-HUMAN-UAT.md
decisions:
  - "Shipped via PR #6 with a merge commit (Yahya chose 'PR + merge commit')"
metrics:
  completed: 2026-11-12
---

# Phase 7 Plan 07: Baselines, gate, ship with noindex Summary

Final visual baselines (with the 404) regenerated in the pinned container, full local gate green, Phases 3-7 shipped via PR #6 (merge commit), `lighthouse` made a required check, and live Vercel behaviour verified with noindex still on.

## Tasks and commits

| Task | Commit | Result |
|------|--------|--------|
| 1 baselines | e2c95df | `not-found` route added; 38 baselines regenerated; two further container runs 38/38 green |
| 1 format (deviation) | 684a256 | prettier on 5 files |
| 1 UAT | bc680c2 | 07-HUMAN-UAT.md (optional, non-blocking) |
| 2 decision | n/a | Yahya approved |
| 3 ship | merge e6647c6 | PR #6 |

## Local gate

lint, format, typecheck, 722 unit tests, build, measure:js (150/12 KB), Chromium e2e 467 passed / 1 skipped (port 4177), LHCI on 8 routes: all green.

Lighthouse best-of-3 (perf / a11y / best-practices / seo; SEO is low because noindex is on and `is-crawlable` is off):

| Route | Perf | A11y | BP | SEO |
|---|---|---|---|---|
| / | 99 | 100 | 100 | 63 |
| /achievements/ | 96 | 100 | 100 | 66 |
| /projects/ | 99 | 100 | 100 | 66 |
| /experience/ | 100 | 100 | 100 | 63 |
| /about/ | 96 | 100 | 100 | 66 |
| /say-hi/ | 99 | 100 | 100 | 63 |
| /projects/facturo/ | 98 | 100 | 100 | 66 |
| 404 | 98 | 100 | 96 | 40 |

The 404 now passes accessibility (the 07-05 `landmark-one-main` item is resolved); no fix needed.

## Decision (Task 2)

Yahya chose "PR + merge commit": push to branch phase-07-prelaunch, open a PR (all 5 checks plus Vercel preview), merge with a merge commit that keeps every plan SHA, add `lighthouse` as a required check, then verify live. He said the share card, favicon and 404 are all good.

## Shipping

- PR: https://github.com/Yahya-github/portfolio/pull/6, merge method: merge commit (e6647c6).
- Checks: lint pass, typecheck pass, unit pass, e2e pass, lighthouse pass, Vercel preview deployment pass. The preview deployed; its URL was not curled.
- Required checks on main (GET confirmed): e2e, lighthouse, lint, typecheck, unit (strict false, app_id 15368).
- Local main fast-forwarded to origin/main.

## Live verification (https://yahya-hallani.dev)

- /about/ : HTTP/2 200
- /about : HTTP/2 308, location /about/
- /this-page-does-not-exist/ : 404, body contains "Page not found"
- /share-card.png : 200, content-type image/png
- /icon.svg?icon.3izp99altv09-.svg (icon href from Index head) : 200, image/svg+xml
- / : 200, x-robots-tag: noindex, nofollow

## Deviations from Plan

**1. [Rule 3 - Blocking] Formatted 5 files with pre-existing prettier warnings** (proof-preview.module.css, lib/features/types.ts, scripts/measure-js.mjs, tests/decode-images.test.ts, tests/use-features.test.tsx). `format:check` runs in the CI lint job, a required check, so the warnings would have blocked the PR. Formatting only. Commit 684a256.

Known accepted: Achievements meta description is 184 chars (commented exception in tests/metadata.test.ts).

## Self-Check: PASSED
