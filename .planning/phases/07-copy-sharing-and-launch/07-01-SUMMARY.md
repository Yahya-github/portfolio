---
phase: 07-copy-sharing-and-launch
plan: 01
subsystem: content-verification
tags: [fact-check, resume, vitest, CONT-06]
requires: []
provides:
  - SHA-256 pin and fact-string test for the public resume
  - 07-FACT-CHECK.md inventory of 36 claims with Yahya's dated confirmations and resolved decisions F-1 to F-6
affects: [07-06]
key-files:
  created:
    - docs/material/resume-public.txt
    - tests/resume-facts.test.ts
    - .planning/phases/07-copy-sharing-and-launch/07-FACT-CHECK.md
key-decisions:
  - "F-1: Facturo ended Oct 2026; re-export the resume with the Oct 2026 end, site stays"
  - "F-2: keep Since 2025"
  - "F-3: add MAME Tool Rental to this repo's resume PDF on re-export only (jobops resume untouched)"
  - "F-4: Yahya pastes the Achievements meta description (160 chars or fewer) and About wording in chat during 07-06; Claude applies to content/*.ts"
  - "F-5: remove Atlantis line counts from the resume on re-export"
  - "F-6: C-03, C-06, C-14, C-29 confirmed accurate"
metrics:
  tasks-complete: 3 of 3
  completed: 2026-11-12
---

# Phase 7 Plan 01: Fact base for CONT-06 Summary

Resume PDF pinned by SHA-256 with a committed pdftotext extract and a unit test, plus a 36-claim fact-check file with Yahya's dated confirmations and every open mismatch resolved.

## Tasks

1. Resume extract, SHA-256 pin, fact-string test (9d4c370). 9 tests pass; typecheck and lint clean.
2. 07-FACT-CHECK.md with claims, mismatches, never-on-the-site check (43ad25b).
3. Checkpoint answered by Yahya on 2026-11-12; answers recorded in `## Confirmations`, 21 claim rows marked confirmed with the date, decision rows annotated.

## For plan 07-06

- Re-export the resume: Facturo "Jun 2026 - Oct 2026", add MAME Tool Rental, remove "about 770 of 1,900 lines" from Atlantis. Then update RESUME_SHA256, regenerate docs/material/resume-public.txt, copy the PDF to both public/ and docs/material/, and add the Facturo range to FACT_STRINGS.
- Apply Yahya's pasted Achievements meta description and "Two habits" wording to content/*.ts.

## Deviations from Plan

- [Rule 3 - Blocking] Worktree base was 7861a39, reset to dc83998 so the phase 07 plan files exist. Ran `pnpm install --frozen-lockfile` since node_modules was absent.
- Commits were made without `--no-verify` because a PreToolUse hook blocks that flag.
- Extra findings beyond the plan: F-5 (Atlantis line counts in the public PDF) and F-6 (claims sourced only from the skill and links.md); both resolved by Yahya.

## Self-Check: PASSED

Files exist, commits 9d4c370 and 43ad25b exist, no em dashes in the fact-check file.
