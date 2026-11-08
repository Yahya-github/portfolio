---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Phase 2 context gathered
last_updated: "2026-11-08T00:46:59.983Z"
last_activity: 2026-11-08 -- Phase 2 planning complete
progress:
  total_phases: 8
  completed_phases: 1
  total_plans: 14
  completed_plans: 8
  percent: 13
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-11-06)

**Core value:** The design itself: a distinctive, non-generic dark Swiss experience (giant YAHYA letters that are the navigation, pages that switch horizontally) that a recruiter remembers.
**Current focus:** Phase 2 — live deploy spike

## Current Position

Phase: 2
Plan: Not started
Status: Ready to execute
Last activity: 2026-11-08 -- Phase 2 planning complete

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 8
- Average duration: -
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 8 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01 P01 | 3 min | 2 tasks | 4 files |
| Phase 01 P02 | 10 min | 3 tasks | 15 files |
| Phase 01 P03 | 5 min | 2 tasks | 5 files |
| Phase 01 P05 | 3 min | 3 tasks | 1 files |
| Phase 01 P04 | 12 min | 3 tasks | 33 files |
| Phase 01 P06 | 13 min | 3 tasks | 2 files |
| Phase 01 P07 | 30 min | 3 tasks | 9 files |
| Phase 01 P08 | 281 min | 3 tasks | 46 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Hosting is Vercel (not GitHub Pages); yahya-h.dev is bought before the first deploy, so there is no basePath stage
- [Roadmap]: Phase 1 is a design gate; no product code until the updated design doc is approved
- [Phase 1 discuss]: Depth map and background visuals dropped (2026-11-06). Photos are plain greyscale (DSGN-05, now Phase 6). Phase 8 is now Interactive Proof (PROOF-01 Atlantis, PROOF-02 robot model), a parallel track that does not gate launch
- [Roadmap]: Research phases 4 (pager core) and 5 (input model) merged into one phase for standard granularity
- [Phase 1 P01]: Portrait master is one full-width banner-free greyscale crop (1512x1240); About framing via object-position 52% 10% in v7
- [Phase 1 P02]: Font trial numbers in docs/reference/font-metrics.md are HarfBuzz-measured and match live browser measurement within 0.001 em; quote them directly
- [Phase 1 P03]: Design doc rev 5 draft written; font, Achievements variant and cursor form stay open for plan 07; Experience split 5/7 until the winning face is checked
- [Phase 1 P03]: Custom cursor is v1 requirement EXP-03 (Phase 5), 1:1 with the pointer
- [Phase 1 P05]: Font: Instrument Sans (OFL), display weight 700, wdth 75 for YAHYA and Display words (body wdth 100), YAHYA tracking -0.045em, Display tracking -0.05em; confirmed by Yahya 2026-11-07 (replaces Hanken Grotesk)
- [Phase 1 P04]: Public resume re-rendered read-only from JobOps resume JSON (ultra-compact Typst); no phone, no contest-platform bullet, Author Yahya Hallani
- [Phase 1 P04]: AG logo not used; Atlantis = 2-3 greyscale screenshots + repo link; CCC 75/75 a regular line (Claude recommendations; Yahya may override at 01-07)
- [Phase 1 P06]: Instrument Sans --yahya-fit is 2.188 (ink-accurate; 2.155 counted the trailing letter-spacing), and split hero letters restore the YA kern pair (-0.063em) by hand
- [Phase 1 P06]: v7: Experience 6/6 split; current rail name set vertically in the rail column; phone Index uses a stacked section list instead of per-letter captions
- [Phase 1 P07]: Achievements is variant (b), a typographic list with hover/focus proof previews (photo plus one line) and article links for DIRO and the game competition; CONT-02 rewritten, CONT-10 added
- [Phase 1 P07]: Cursor is variant (a), an ink square snapping to letters and links; its Label tag is clamped inside the viewport; accent has four uses
- [Phase 1 P07]: About portrait crossfades to a true-colour twin on hover/tap: the one exception to greyscale photos, not an accent use
- [Phase 1 P07]: Facturo is a 10-frame screenshot walkthrough (transform/opacity, pausable, stepper under reduced motion); CONT-11 added
- [Phase 1 P07]: CRC wording: 1st robot competition 2026, 1st Programming 2025, 2nd Senior Programming 2026
- [Phase 1 P07]: Hero FLIP targets are measured relative to the sliding track, fixing letters vanishing when paging back to the Index
- [Phase 1 P08]: Design doc revision 5 approved by Yahya 2026-11-07 (commit 030fee1); Phase 1 gate 19/19
- [Phase 1 P08]: Experience Work runs newest first with a MAME Developer row (since Nov 2026); below 880px height ruled rows close to 8px and Experience heads cap to the free height

### Pending Todos

- Update ~/.claude/skills/portfolio-design and portfolio-voice-and-facts to match design doc rev 5 (approved 2026-11-07) (`.planning/todos/pending/2026-11-07-update-portfolio-skills-to-design-rev-5.md`)
- Regenerate the CLAUDE.md stack section for Vercel (GitHub Pages notes are stale) (`.planning/todos/pending/2026-11-07-regenerate-claude-md-stack-for-vercel.md`)

### Blockers/Concerns

- yahya-h.dev must be bought before Phase 2 (the `.dev` HTTPS setup can take up to 24 h)
- Material collected (plan 04); still missing: Atlantis screenshots (to capture), higher-res robot CAD capture, physical robot photo (see docs/material/links.md)
- Font decided (Instrument Sans 700, wdth 75 display, plan 05); every Display word fits incl. "Achievements" on a 390px phone; poster is height-bound at 1366x768
- Phase 4 needs real devices: Mac trackpad, Magic Mouse, Windows wheel, Linux touchpad, iPhone (Safari and LinkedIn in-app browser), Android
- The canonical policy for six routes that each contain all content is still to decide (Phase 3/7)

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-11-07T23:50:57.734Z
Stopped at: Phase 2 context gathered
Resume file: .planning/phases/02-live-deploy-spike/02-CONTEXT.md
