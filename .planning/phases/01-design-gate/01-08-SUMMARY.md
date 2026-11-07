---
phase: 01-design-gate
plan: 08
subsystem: design-doc
tags: [design-gate, approval, review-rounds, mame, experience, showdown]
requires:
  - "01-07: design doc rev 5 with every Phase 1 choice filled in, v7 showing only the chosen design"
provides:
  - "Design doc revision 5 APPROVED by Yahya, 2026-11-07, in its own commit (030fee1); the Phase 1 gate passes (check.sh 19/19)"
  - "v7 reflecting seven review rounds (Swiss devices, say hi spiral, About quarter rings, scrolling section names, global Pause motion, MAME Tool Rental on Projects and Experience, Facturo a past role, Showdown AI description)"
  - "Two post-approval todos (skills, CLAUDE.md stack section)"
affects: [02, 03, 04, 05, 06, 07]
tech-stack:
  added: []
  patterns:
    - "Short-height rule (desktop, below 880px of viewport height): ruled rows close from 12px to 8px on Projects and Experience; Projects also hides each row's middle line"
    - "Display heads keep the Display size unless the free height is too small (max(64px, min(Display, (100svh - fixed) / 0.88))), the Say hi links rule, now also on Experience"
    - "Dates: a current role reads 'Since Mon YYYY', an ended one 'Mon YYYY to Mon YYYY'; Work rows run newest first"
key-files:
  created:
    - .planning/phases/01-design-gate/01-08-CHANGES.md
    - .planning/phases/01-design-gate/01-08-SUMMARY.md
    - .planning/todos/pending/2026-11-07-update-portfolio-skills-to-design-rev-5.md
    - .planning/todos/pending/2026-11-07-regenerate-claude-md-stack-for-vercel.md
    - docs/material/logos (MAME and other organisation marks, mono twins)
    - docs/material/screenshots (mame-01 to mame-08, colour and grey)
  modified:
    - docs/superpowers/specs/2026-11-03-portfolio-design.md
    - docs/reference/swiss-horizontal-v7.html
    - docs/material/links.md
    - .planning/REQUIREMENTS.md
    - .planning/PROJECT.md
    - .planning/STATE.md
decisions:
  - "Design doc revision 5 (dark Swiss horizontal) approved by Yahya on 2026-11-07 (D-25); the approval commit 030fee1 changes only the Status line"
  - "Showdown AI keeps its Projects row: 'A competitive battle agent' / 'An agent that plays ranked Pokémon Showdown battles' / 'In progress, nothing built yet'"
  - "MAME gets a Work row on Experience: Developer, MAME Tool Rental, McGill Association of Mechanical Engineers, Since Nov 2026, first (newest), with its mark"
  - "Below 880px of height, Experience rows close to 8px like Projects, and the Work/Involvement heads shrink only if the free height requires it (68px at 1280x720, full size at 1366x768)"
  - "Approving the doc accepts the section 9 material waiver (Atlantis material not supplied in Phase 1)"
metrics:
  duration: 281 min (seven review rounds, 2026-11-07 12:32 to 17:13)
  completed: 2026-11-07
  tasks: 3
  files: 46
---

# Phase 1 Plan 8: Design gate approval Summary

Yahya reviewed design doc revision 5 over seven change rounds and approved it on 2026-11-07, conditional on two final edits (Showdown AI description, MAME Developer row on Experience). Both edits were applied and verified first. Then the approval line went into its own commit, and the Phase 1 gate passes 19/19.

## Yahya's approval (verbatim)

> "approved; showdown: replace the planned by a quick description, keep the in progress; mame-experience: Developper Nov 2026; skills: yes; claude-md: yes"

Follow-up answer, when the orchestrator asked for the Showdown line with options shown: he picked "Plays Pokémon Showdown", whose option text is:

> "An agent that plays ranked Pokémon Showdown battles"

Gate check on the reply: it matches `grep -Eiw 'approve[d]?'` ("approved") and does not match `grep -Ei "not approve|disapprove|don.t approve|do not approve"`. Date of approval: 2026-11-07 (today; Yahya gave no other date).

## Tasks

| Task | Name | Commit(s) |
|------|------|-----------|
| 1 | Pre-approval gate sweep and brief | check.sh 18 PASS + SC-1c FAIL before each presentation (rounds 1 to 7) |
| 2 | Yahya reviews and approves (checkpoint) | Seven change rounds, then "approved" (see above) |
| 3 | Approval line in its own commit, follow-ups recorded | 030fee1 (approval), 27c9783 (follow-ups) |

Round 7 (final edits, before the approval commit):

- 8098aae feat(01-08): round 7 final edits (Showdown AI description, MAME Developer row on Experience)
- 16bc26b docs(01-08): record change round 7 (final edits before approval)

**Approval commit: 030fee1** `docs(01): design doc revision 5 approved by Yahya`. `git show --numstat` prints exactly `1	1	docs/superpowers/specs/2026-11-03-portfolio-design.md`. The Status line now reads `Status: APPROVED by Yahya, 2026-11-07 (revision 5: dark Swiss horizontal). Nothing is built yet.`

## Change rounds

The full record, with Yahya's verbatim messages, what was done, commits and verification per round, is in `.planning/phases/01-design-gate/01-08-CHANGES.md`:

1. Change round 1: Yahya's first review, logo defaults
2. Change round 2: verbatim replies, fixes (walkthrough freeze, hit area, colour on hover)
3. Change round 3: Swiss typographic devices (letter-pair titles, edge-cropped 03, micro-text, Index grid lines)
4. Change round 4: say hi square and vortex, About shape candidates
5. Change round 5: true say hi spiral, About quarter rings at 22%, stuck cursor square fixed
6. Change round 6: MAME Tool Rental on Projects, Facturo a past role, scrolling section names, one global Pause motion
7. Change round 7 (final): Showdown AI description, MAME Developer row on Experience, Experience short-height rule

## Round 7 details

- **Showdown AI:** "Planned" is replaced by "An agent that plays ranked Pokémon Showdown battles". It fits one line at 1440 and wider, is hidden below 880px of height like every middle line, and wraps to two lines on phones. The Projects budget is unchanged: rows end 794/820 at 1440x900, 634/688 at 1366x768, 634/640 at 1280x720 and 746/1000 at 1920x1080.
- **MAME on Experience:** the role is "Developer" (Yahya typed "Developper"; the site uses the correct spelling). The organisation line is "MAME Tool Rental, McGill Association of Mechanical Engineers" and the date "Since Nov 2026". It is the first Work row because rows run newest first, and it carries the MAME mark (mono at rest, red on hover or tap).
- **Height budget:** five Work rows overflowed by 36px at 1366x768 and by 77px at 1280x720. The fix uses the same tightening as Projects: rows close to 8px below 880px of height. On top of that, the Experience heads follow the Say hi links rule and keep the Display size unless the free height is too small. Work now ends 684/688 at 1366x768 (heads at the full 123px) and 636/640 at 1280x720 (heads at 68px). The cropped "03" and the scrolling margin strip stay clear of all content.

## Final check.sh output (after the approval commit)

```
PASS SC-1a
PASS SC-1b
PASS SC-1c
PASS SC-2a
PASS SC-2b
PASS SC-2c
PASS SC-3a
PASS SC-3b
PASS SC-3c
PASS SC-3d
PASS SC-4a
PASS SC-4b
PASS SC-4c
PASS SC-4d
PASS SC-4e
PASS SC-4f
PASS SC-5a
PASS SC-5b
PASS REQ-edits
exit=0
```

`git log -1 --format=%s -- docs/superpowers/specs/2026-11-03-portfolio-design.md` prints `docs(01): design doc revision 5 approved by Yahya`.

## Follow-up todos (Yahya: "skills: yes; claude-md: yes")

Recorded only; neither was done in this plan (T-1-15):

- `.planning/todos/pending/2026-11-07-update-portfolio-skills-to-design-rev-5.md`: update `~/.claude/skills/portfolio-design` and `portfolio-voice-and-facts` to match design doc rev 5. They still describe the light design and medal icons.
- `.planning/todos/pending/2026-11-07-regenerate-claude-md-stack-for-vercel.md`: regenerate the CLAUDE.md stack section for Vercel. It still says GitHub Pages and basePath.
- Both are also listed under STATE.md "Pending Todos" (commit 27c9783).

## Verification (round 7)

- `xp7.js` (new), `pv7.js` (pv6 with the Experience expectations updated) and `mq6.js` all pass. The unchanged regression scripts also all pass on port 8794: `hit2`, `green2`, `hitreel`, `colour`, `achpv`, `reel3`, `cur5`, `perf5`, `con5` (worst accent 7.38:1), `r3dev` and `ab5`. Zero page errors.
- The screenshots below were viewed. Path: `/tmp/claude-1000/-home-atlas-dev-mine-portfolio/b665a55a-f583-43bd-8a8f-9e449fcf2104/scratchpad/shots7/`
  - `r7-proj-*` and `r7-xp-*` at 1440x900, 1366x768, 1280x720 and 1920x1080
  - `r7-xp-390-work.png`
  - `r7-proj-390-rows.png`
- v7's inline script parses, and the 01-06 banned patterns all count 0. The design doc and the CHANGES log have 0 em dashes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Experience Work overflowed at short heights after the MAME row**
- **Found during:** Round 7 edits (before Task 3)
- **Issue:** with five rows, Work ran 36px past the footer gap at 1366x768 and 77px past it at 1280x720.
- **Fix:** below 880px of height, the rows close from 12px to 8px (the Projects rule). The Work/Involvement heads are now capped by the free height (the Say hi links rule). Both rules are documented in design doc section 7 and in CHANGES round 7.
- **Files modified:** docs/reference/swiss-horizontal-v7.html, docs/superpowers/specs/2026-11-03-portfolio-design.md
- **Commit:** 8098aae

**2. [Process] Follow-up todos also written as GSD todo files**
- The plan asked for STATE.md lines only. The orchestrator asked for GSD todos as well, so `.planning/todos/pending/*.md` files were added to the same commit (27c9783), which uses the plan's message.

## Known Stubs

None in this plan's scope. v7 is a design sketch, not product code. The About draft line is explicitly marked in the doc as Yahya's to rewrite in Phase 7.

## Self-Check: PASSED

- FOUND: docs/superpowers/specs/2026-11-03-portfolio-design.md (Status: APPROVED by Yahya, 2026-11-07)
- FOUND: .planning/phases/01-design-gate/01-08-CHANGES.md (rounds 1 to 7)
- FOUND: both todo files under .planning/todos/pending/
- FOUND commits: 8098aae, 16bc26b, 030fee1, 27c9783
