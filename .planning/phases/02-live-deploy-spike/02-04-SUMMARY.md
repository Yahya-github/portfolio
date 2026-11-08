---
phase: 02-live-deploy-spike
plan: 04
subsystem: public-repo-and-first-ci
tags: [github, public-repo, gitleaks, audit, ci]
requires: [02-01, 02-03]
provides:
  - public repo https://github.com/Yahya-github/portfolio with full history (D-05)
  - first green CI run on main (lint, typecheck, unit, e2e)
affects: [02-05 (branch protection can now require the four checks), 02-06]
tech-stack:
  added: []
  patterns: [gitleaks v8.30.1 checksum-verified scan before first public push]
key-files:
  created: []
  modified: []
decisions:
  - "Repo goes public with full history including .planning/, CLAUDE.md, docs/ (photos, resume) and author email; Yahya signed off verbatim: \"Public ok\""
metrics:
  duration: ~multi-session (checkpointed at sign-off and SSH auth)
  completed: 2026-11-07
---

# Phase 02 Plan 04: Public-safety audit, public repo and first CI run Summary

The repo passed a gitleaks scan of all 111 commits with zero findings, and Yahya approved going public. It is now public at https://github.com/Yahya-github/portfolio. Local `main` and `origin/main` both point at `95eef4a`, and the first CI run on main passed all four jobs.

## Tasks

| Task | Name | Commit | Result |
| ---- | ---- | ------ | ------ |
| 1 | Public-safety audit (D-06) | none (no file changes) | PASS |
| 2 | Yahya sign-off (checkpoint) | n/a | "Public ok" |
| 3 | Create public repo, push, first CI | none (push of 95eef4a) | CI success |

## Audit results (Task 1)

- gitleaks v8.30.1, downloaded with `gh release download`, SHA-256 checked against the release checksums file, run from a scratch dir outside the repo.
- `gitleaks git` scan: 111 commits, **0 findings**.
- `gitleaks dir` scan: 8 `generic-api-key` findings. All of them are in `.next/` (Next.js preview/encryption keys from local builds). `.next/` is gitignored and has never been tracked, so these are not an issue.
- git-grep credential pattern scan: 0 hits.
- Tracked-file checks (secret file extensions, client_secret, fonts-private, OFL licence next to each woff2, single commit identity, exiftool GPS/camera): all PASS.

## Sign-off (Task 2)

Yahya's verbatim reply: **"Public ok"**. He was told beforehand that `.planning/` (including the DISCUSSION-LOGs), `CLAUDE.md`, `docs/` (photos and resume) and the author email `yahya.hallani.email@gmail.com` would all become public. He chose to have gitleaks run before he signed off.

## Repo and CI (Task 3)

- Repo: https://github.com/Yahya-github/portfolio, visibility `PUBLIC`
- `git rev-parse HEAD` == `git rev-parse origin/main` == `95eef4a9725dfeb103691ad2538272b2b3743a0c`
- First CI run (push to main): https://github.com/Yahya-github/portfolio/actions/runs/42439719971, conclusion **success**

| Job | Conclusion | URL |
| --- | ---------- | --- |
| lint | success | https://github.com/Yahya-github/portfolio/actions/runs/42439719971/job/128606140754 |
| typecheck | success | https://github.com/Yahya-github/portfolio/actions/runs/42439719971/job/128606140823 |
| unit | success | https://github.com/Yahya-github/portfolio/actions/runs/42439719971/job/128606140742 |
| e2e | success | https://github.com/Yahya-github/portfolio/actions/runs/42439719971/job/128606140631 |

## Deviations from Plan

**1. [Rule 3 - Blocking / auth gate] SSH push failed with "Permission denied (publickey)"**
- **Found during:** Task 3
- **Issue:** `gh repo create` made the public, empty repo and set `origin` to `git@github.com:Yahya-github/portfolio.git`, but the first push was refused because SSH did not offer the right key.
- **Fix:** Yahya fixed it himself by adding a `Host github.com` / `IdentityFile ~/.ssh/github-key` / `IdentitiesOnly yes` entry to `~/.ssh/config`. The executor did not touch the SSH or git auth config. `git push -u origin main` then worked. The repo was not created a second time.
- **Effect on plan:** the plan's single `gh repo create --public --source . --push` step ended up as two steps: create, then a separate push. The result is the same.

## Notes

- DEP-01 and DEP-02 are deliberately not marked complete here. The live deploy and its verification come in later plans of this phase.
- There is no branch protection yet. Plan 05 will add it, and the four check names are now registered on GitHub.

## Self-Check: PASSED

- Repo exists and is PUBLIC (`gh repo view`)
- origin/main == local HEAD (95eef4a)
- CI run 42439719971: four jobs success
