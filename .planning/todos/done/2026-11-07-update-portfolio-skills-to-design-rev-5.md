---
created: 2026-11-07T22:13:02Z
title: Update portfolio-design and portfolio-voice-and-facts skills to design doc rev 5
area: tooling
files:
  - ~/.claude/skills/portfolio-design/SKILL.md
  - ~/.claude/skills/portfolio-voice-and-facts/SKILL.md
  - docs/superpowers/specs/2026-11-03-portfolio-design.md
---

## Problem

The two skills in ~/.claude/skills still describe the retired light design (paper palette, medal icons, vertical scroll). Design doc revision 5 (dark Swiss horizontal) was approved by Yahya on 2026-11-07 (plan 01-08, commit 030fee1) and overrides them wherever they disagree. Yahya said yes to this follow-up ("skills: yes", 2026-11-07).

## Solution

Rewrite portfolio-design from the approved doc (tokens from 01-UI-SPEC.md, Instrument Sans, six poster devices, rail, cursor, marks and colour-on-hover exceptions). Update portfolio-voice-and-facts with the round 6 and 7 facts: MAME Tool Rental (project and Experience row "Developer, since Nov 2026"), Facturo "Jun 2026 to Oct 2026", Showdown AI "An agent that plays ranked Pokémon Showdown battles, in progress, nothing built yet". Only verified facts.

Done 2026-11-08 in plan 03-01; Yahya approved both skills. Skill files live outside the repo and are not committed.
