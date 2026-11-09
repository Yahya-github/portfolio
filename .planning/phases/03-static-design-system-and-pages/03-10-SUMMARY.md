---
phase: 03-static-design-system-and-pages
plan: 10
subsystem: e2e / ci
tags: [playwright, visual-regression, container, ci, vercel, trailing-slash]
requires:
  - "03-09: chromium and chromium-nojs projects, full e2e suite green"
provides:
  - "18 visual baselines (6 routes x 1440x900, 1366x768, 390x844) pinned to mcr.microsoft.com/playwright:v1.65.0-noble"
  - "visual Playwright project, enabled only when VISUAL=1"
  - "CI e2e job running in the Playwright container (job name unchanged)"
  - "Vercel preview check: /about returns 308 to /about/, and noindex is sent"
affects:
  - "Every later phase: a visual change needs its baselines regenerated in the container, never on the host"
  - "Bumping @playwright/test requires the same bump to the CI container tag"
tech-stack:
  added: []
  patterns:
    - "Env-gated Playwright project (VISUAL=1) so host runs on Fedora never compare against container baselines"
    - "Baselines regenerated with podman run in the CI image, followed by a host pnpm install --frozen-lockfile"
key-files:
  created:
    - e2e/visual.spec.ts
    - e2e/visual.spec.ts-snapshots/ (18 PNGs, {slug}-{viewport}-visual-linux.png)
  modified:
    - playwright.config.ts
    - .github/workflows/ci.yml
decisions:
  - "The CI e2e job runs in mcr.microsoft.com/playwright:v1.65.0-noble as --user 1001 with VISUAL=1; the browser install step is removed"
  - "vercel.json gets no trailingSlash: the Next builder already returns a 308 from /about to /about/ on the preview"
metrics:
  duration: "~35 min (including the checkpoint wait)"
  completed: 2026-11-08
requirements: [DSGN-01, DSGN-02, DSGN-06]
---

# Phase 3 Plan 10: Visual baselines, design approval and Vercel trailing-slash check Summary

All six static pages now have 18 screenshot baselines, generated and compared in the official Playwright v1.65.0-noble container. CI's `e2e` job runs in that same image. Yahya approved the design, and the Vercel preview shows the 308 trailing-slash redirect with no config change.

## Tasks

| Task | Name | Commit | Result |
| ---- | ---- | ------ | ------ |
| 1 | Visual spec, VISUAL-gated project, CI container, baselines | 9eebea9 | 18 baselines; two container comparison runs passed 18/18 each; host run 162/162 with no visual tests |
| 2 | Checkpoint: Yahya approves the six pages and the push | none | Yahya replied "approved push ok" (verbatim, relayed by the orchestrator). **Push: ok** |
| 3 | Vercel preview trailing-slash check and green PR checks | none (no file change needed) | Draft PR #5; 4/4 checks green; 308 confirmed |

## Verification

- **PR:** https://github.com/Yahya-github/portfolio/pull/5 (draft, base `main`, branch `gsd/phase-03-static-design-system-and-pages`, no attribution footer)
- **Checks** (`gh pr checks 5`):

  | Check | Result | Time |
  | ----- | ------ | ---- |
  | lint | pass | 21s |
  | typecheck | pass | 24s |
  | unit | pass | 28s |
  | e2e | pass | 1m25s |
  | Vercel | pass | n/a |

  The CI e2e log shows `Running 180 tests` and then `180 passed` (162 regular + 18 visual), so the container baselines match in CI.
- **Preview:** https://portfolio-git-gsd-phase-03-static-design-sys-3c214a-yahya-s-org.vercel.app
  ```
  curl -sI $PREVIEW/about   -> HTTP/2 308, location: /about/, x-robots-tag: noindex
  curl -sI $PREVIEW/about/  -> HTTP/2 200, x-robots-tag: noindex, nofollow
  curl -sI $PREVIEW/        -> HTTP/2 200, x-robots-tag: noindex, nofollow
  ```
  The 308 is already in place, so neither `vercel.json` nor `tests/vercel-config.test.ts` changed (`git diff main -- vercel.json` is empty).
- **Host:** lint, format:check, typecheck and build are clean. Unit tests 180/180, e2e 162/162.

## Deviations from Plan

1. **[Rule 3 - Blocking] The preview URL came from the Vercel bot's PR comment, not the GitHub Deployments API.** The plan's `gh api .../deployments?ref=...` query returned nothing: this Vercel integration posts commit statuses and a PR comment and creates no GitHub deployments. The curl checks were run against the URL from that comment.
2. **The worktree started behind main.** It was fast-forwarded from 7861a39 to bbc704d before Task 1.

## Known Issues (not fixed; Yahya approved as-is)

- **Gaps inside words in small uppercase labels** at 1440x900 in Chromium on Linux: "YAHYA HALL ANI", "RESU ME (PDF)", "SOFTWARE ENGINE ERING", "NE XT, ACHIE VEMENTS". This is probably a tracking or kerning problem with the font in Chromium on Linux. Fix it later and regenerate the baselines in the container.
- **About at 390x844:** the Display heading "TWO HABITS" breaks inside the word as "TWO / HAB / ITS" (`about-390x844-visual-linux.png`). It was flagged at the checkpoint, and the approval covered the pages as they are. This needs a follow-up in the display-fit or word-break rules for phone Display words. Regenerate the baselines afterwards.

## Threat Flags

None. T-03-31 is mitigated: the image tag is pinned to v1.65.0-noble and runs as `--user 1001`, and the workflow keeps `permissions: contents: read`. T-03-32 is mitigated: the noindex header is confirmed on the preview. T-03-33 is mitigated: the 308 is verified. T-03-34 is accepted: the PR stays a draft, and merging is Yahya's call.

## Self-Check: PASSED

- FOUND: e2e/visual.spec.ts
- FOUND: e2e/visual.spec.ts-snapshots/ (18 PNGs)
- FOUND: commit 9eebea9
- FOUND: PR #5, 4/4 required checks passing
