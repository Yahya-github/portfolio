---
phase: 02-live-deploy-spike
plan: 05
subsystem: ci-merge-gate
tags: [github, branch-protection, ci, merge-gate]
requires: [02-04]
provides:
  - classic branch protection on main (PR required, lint/typecheck/unit/e2e required, 0 approvals, enforce_admins false)
  - SC3 proof on a real PR (unit=FAILURE, mergeStateStatus=BLOCKED)
affects: [02-06 (code changes now go through PRs; GSD doc commits use the admin bypass)]
tech-stack:
  added: []
  patterns: [required check contexts copied from the ci.yml job names and read back through the API]
key-files:
  created: []
  modified: []
decisions:
  - "main has classic protection: PR required, checks lint/typecheck/unit/e2e, strict false, 0 approvals, enforce_admins false (D-07)"
  - "GitHub pinned app_id 15368 (GitHub Actions) on all four required checks automatically, which mitigates T-02-20 without relying on assumption A6"
metrics:
  duration: 3 min
  completed: 2026-11-08
---

# Phase 02 Plan 05: Branch protection on main and merge-gate proof Summary

`main` now has classic branch protection. A merge needs a PR and four green checks (lint, typecheck, unit, e2e), no approvals are required, and admins can still bypass. A throwaway PR with a deliberately failing unit test showed `unit=FAILURE` and `mergeStateStatus=BLOCKED`. It was then closed unmerged and its branch deleted.

## Tasks

| Task | Name | Commit | Result |
| ---- | ---- | ------ | ------ |
| 1 | Apply classic branch protection on main | none (GitHub settings only) | PASS: `e2e,lint,typecheck,unit false 0` |
| 2 | Throwaway failing PR proves the gate, then clean up | f38af35 (branch `ci/gate-proof` only, never merged, branch deleted) | PASS: unit FAILURE, BLOCKED, closed |

## Protection (Task 1)

Payload applied with `gh api -X PUT repos/Yahya-github/portfolio/branches/main/protection`:

```json
{
  "required_status_checks": { "strict": false, "checks": [{ "context": "lint" }, { "context": "typecheck" }, { "context": "unit" }, { "context": "e2e" }] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null
}
```

What `gh api repos/Yahya-github/portfolio/branches/main/protection` returned afterwards:

```json
{"checks":["e2e","lint","typecheck","unit"],"strict":false,"app_ids":[15368,15368,15368,15368],"admins":false,"reviews":0,"restrictions":null}
```

The plan's verify string came back as `e2e,lint,typecheck,unit false 0`, which matches. The job names in `.github/workflows/ci.yml` were checked before applying the payload: 4 of 4 match.

## Gate proof (Task 2)

- PR: https://github.com/Yahya-github/portfolio/pull/1, "CI gate proof (do not merge)", head `f38af357aa7a85dccf39de487ce63ce941a73e71`
- CI run: https://github.com/Yahya-github/portfolio/actions/runs/42441893762
- Check states from `gh pr checks 1 --json name,state`:
  - `lint=SUCCESS`
  - `typecheck=SUCCESS`
  - `unit=FAILURE` (https://github.com/Yahya-github/portfolio/actions/runs/42441893762/job/128612687813)
  - `e2e=SUCCESS`
  - `Sourcery review=SUCCESS` (a third-party app, not a required check)
- Unit failure in the log: `FAIL tests/gate-proof.test.ts > fails on purpose to prove the merge gate`, `AssertionError: expected 1 to be 2`, `Tests 1 failed | 10 passed (11)`
- `gh pr view 1 --json mergeStateStatus` returned **`BLOCKED`** (`mergeable: MERGEABLE`, so there was no conflict; the block came from the failing required check). GraphQL confirmed `mergeStateStatus: BLOCKED` and `viewerCanMergeAsAdmin: true`, which is the D-07 admin bypass working as intended.
- Check-run apps: lint, typecheck, unit and e2e were all reported by app 15368 (GitHub Actions). Sourcery was app 48477.
- Cleanup: `gh pr close 1 --delete-branch` ran. Afterwards `gh pr view 1` shows `{"state":"CLOSED","mergedAt":null}`, `git ls-remote --heads origin ci/gate-proof` prints nothing, the local branch is deleted, `tests/gate-proof.test.ts` is not on main, and `HEAD == origin/main == cf54a40` (main was not touched by the PR).

## Deviations from Plan

**1. [Permission denial] The non-admin `gh pr merge 1 --squash` attempt was not run**
- **Found during:** Task 2, step 5
- **Issue:** The Claude Code auto-mode permission classifier refused the command ("Merge Without Review"). It was not retried and no workaround was tried.
- **Substitute evidence:** `mergeStateStatus=BLOCKED` from both REST/gh and GraphQL, together with the protection read-back. gh 2.96 refuses to merge a BLOCKED PR without `--admin`/`--auto`, but the refusal text could not be captured here. If Yahya wants that exact text, he can run `gh pr merge <N> --squash` himself on a future throwaway PR.
- **Effect:** SC3 is still shown: a failing required check puts the PR in BLOCKED. The must-have item "a non-admin merge attempt was refused" is covered by the BLOCKED state, not by a captured error string.

**2. [Observation] GitHub pinned app_id automatically**
- The plan chose not to pin `app_id` (assumption A6). Because the checks had already reported from GitHub Actions, GitHub filled in `app_id: 15368` for each context on its own. This closes the T-02-20 spoofing concern (for example, Vercel posting a `lint` context) at no cost.

**3. [Observation] The verify `gh pr list --search 'CI gate proof in:title'` returned 0 right after the PR was closed**
- This looked like search-index lag. `gh pr list --state closed` without `--search` lists PR #1 as CLOSED.

## Notes

- DEP-01 and DEP-02 are not marked complete in this plan (orchestrator instruction). The live deploy is verified in 02-06.
- From now on, code changes go through PRs. GSD doc commits to main go through the admin bypass (enforce_admins=false).

## Self-Check: PASSED

- Protection read-back is `e2e,lint,typecheck,unit false 0`
- PR #1 is CLOSED with mergedAt null; the remote branch is gone; main is still at cf54a40 with no gate-proof test
- Commit f38af35 existed only on the deleted throwaway branch (expected, never merged)
