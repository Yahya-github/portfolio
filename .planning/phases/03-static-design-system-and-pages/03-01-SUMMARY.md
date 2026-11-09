---
phase: 03-static-design-system-and-pages
plan: 01
subsystem: process
tags: [skills, design-doc, facts]
requires: []
provides:
  - portfolio-design skill matching design doc rev 5 (outside repo)
  - portfolio-voice-and-facts skill with verified facts (outside repo)
affects: [all later copy and design work]
key-files:
  created:
    - .planning/todos/done/2026-11-07-update-portfolio-skills-to-design-rev-5.md
  modified:
    - ~/.claude/skills/portfolio-design/SKILL.md (not committed, outside repo)
    - ~/.claude/skills/portfolio-voice-and-facts/SKILL.md (not committed, outside repo)
decisions:
  - Skill files stay outside git; only the todo move is committed.
duration: ~5 min (plus review wait)
completed: 2026-11-08
---

# Phase 3 Plan 01: Portfolio skills to design rev 5 Summary

Both user-level portfolio skills rewritten to match the approved dark Swiss horizontal design (design doc rev 5) and the verified facts; Yahya approved both at the human-verify checkpoint.

## Tasks

| Task | Name | Commit |
| ---- | ---- | ------ |
| 1 | Rewrite portfolio-design, update portfolio-voice-and-facts | none (outside repo) |
| 2 | Yahya review (checkpoint:human-verify) | approved 2026-11-08 |
| 3 | Close the folded todo | 9abb83b |

## What changed

- **portfolio-design:** full rewrite. Covers source of truth, direction, tokens (#0b0b0b, #f0f0f0, #8e8e8e, #2e2e2e, #5fae84), Instrument Sans via next/font/local, four accent uses, page compositions, photos, motion/cursor, and the Never list. All retired light-design material removed.
- **portfolio-voice-and-facts:** targeted update. CCC 75/75 perfect score only; MAME since Nov 2026; Facturo Jun 2026 to Oct 2026; Mercor since Sep 2026; Freelance since 2025, 12 projects for 9 clients; CRC 2nd in Senior Programming 2026; Showdown AI "nothing built yet"; Atlantis line count removed; "Never on the site" list added.

## Deviations

None. Task 3 was run by the orchestrator inline after approval.

## Open items

- Resume mismatch (freelance May 2023 vs 2025) stays on the skill's pre-publish checklist.

## Self-Check: PASSED
