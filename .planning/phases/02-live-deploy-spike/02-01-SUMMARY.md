---
phase: 02-live-deploy-spike
plan: 01
subsystem: docs
tags: [domain, vercel, claude-md, stack-research]
requires: []
provides:
  - "Live docs name yahya-hallani.dev (apex canonical, www 308 to apex)"
  - "STACK.md and the regenerated CLAUDE.md prescribe Vercel only"
affects: [02-02, 02-03, 02-04, 02-05, 02-06, all later phases reading CLAUDE.md]
tech-stack:
  added: []
  patterns:
    - "CLAUDE.md stack block is generated from research/STACK.md by gsd-tools generate-claude-md; never hand-edited"
key-files:
  created: []
  modified:
    - .planning/PROJECT.md
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
    - .planning/STATE.md
    - .planning/research/STACK.md
    - .planning/research/ARCHITECTURE.md
    - .planning/research/FEATURES.md
    - .planning/research/PITFALLS.md
    - .planning/research/SUMMARY.md
    - docs/superpowers/specs/2026-11-03-portfolio-design.md
    - CLAUDE.md
    - .planning/todos/done/2026-11-07-regenerate-claude-md-stack-for-vercel.md (moved from pending)
decisions:
  - "Domain is yahya-hallani.dev, bought on Vercel Domains; apex canonical, www 308 to apex; the earlier short domain is dropped"
  - "STACK.md Key Configuration notes are written as bullets so the CLAUDE.md generator, which keeps only headings, bullets and tables, carries them over"
metrics:
  duration: "6 min"
  completed: 2026-11-07
  tasks: 2
  files: 12
requirements: [DEP-01]
---

# Phase 2 Plan 01: Domain rename and Vercel stack docs Summary

Every live planning, research and design doc now names yahya-hallani.dev, and DEP-01 says the apex is canonical with www redirecting to it. `.planning/research/STACK.md` was rewritten for Vercel (Git-integration deploys, `vercel.json` headers, Corepack and Node 22 pins, CI jobs lint/typecheck/unit/e2e, no basePath), and CLAUDE.md was regenerated from it with `gsd-tools generate-claude-md`.

## Tasks

| Task | Name | Commit |
|------|------|--------|
| 1 | Rename the domain in planning, research and design docs | 3c83a26 |
| 2 | Rewrite STACK.md for Vercel and regenerate CLAUDE.md; close the stack todo | 6cf1b4e |

## Verification

- `git grep -n "yahya-h\.dev" -- ':!.planning/phases/'` prints nothing
- `grep -nEi "configure-pages|withBase|CNAME|PAGES_BASE_PATH|upload-pages-artifact|deploy-pages" CLAUDE.md .planning/research/STACK.md` prints nothing
- CLAUDE.md contains `vercel.json`, `ENABLE_EXPERIMENTAL_COREPACK`, `next typegen && tsc --noEmit` and `yahya-hallani.dev`, and still has its stack-start and workflow-start markers
- `grep -ci "github pages" CLAUDE.md` = 2, and both are history: the Tech stack constraint and the Alternatives row
- The workflow and profile blocks of CLAUDE.md are byte-identical to the copy from before regeneration
- `.planning/phases/01-design-gate` is unchanged. The v7-warnings todo is still pending.

## Deviations from Plan

**1. [Rule 1 - Bug] Reworded the mandated "Updated" note in STACK.md**
- **Found during:** Task 2
- **Issue:** Step 1 asked for a note that read "...the GitHub Pages workflow, basePath and CNAME notes are removed". Its own step 13 grep gate forbids the string `CNAME` in STACK.md.
- **Fix:** Changed it to "basePath and custom-domain DNS notes are removed".
- **Commit:** 6cf1b4e

**2. [Rule 3 - Blocking] Wrote the Key Configuration notes as bullets**
- **Found during:** Task 2
- **Issue:** The first regeneration dropped the plain `**vercel.json:**`, `**CI:**` and `**Domain:**` paragraphs, because the generator only keeps headings, bullets and tables. The `next typegen && tsc --noEmit` acceptance check failed as a result.
- **Fix:** Made the three notes into `- **...:**` bullets in STACK.md and regenerated CLAUDE.md. It is still fully generated, with no hand edits.
- **Commit:** 6cf1b4e

**3. [Rule 1 - Accuracy] Removed "link to the GitHub Pages template" from the Next static-exports source line in STACK.md**, so the stack doc no longer points to a GitHub Pages template. Commit 6cf1b4e.

## Known Stubs

None.

## Self-Check: PASSED
