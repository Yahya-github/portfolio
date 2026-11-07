---
phase: 01-design-gate
verified: 2026-11-07T18:00:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
gaps: []
deferred: []
recommendations:
  - "Carry WR-04 (Space key hijack), WR-05 (px/py reuse), WR-06 (focus on page change), WR-07 (cursor:none before JS), WR-08 (live reduced-motion) into Phases 3-5 as build requirements; none is a Phase 1 gap"
  - "Optionally harden check.sh (WR-01, WR-02, WR-03) if it will be reused; it is a throwaway gate tool"
  - "Reconcile --yahya-fit: 01-05-SUMMARY and the font-metrics.md Winner section still say 2.155; the design doc, STATE.md and the later font-metrics.md section use the corrected 2.188. Use 2.188 in the build"
  - "Two post-approval todos are pending (portfolio skills update, CLAUDE.md stack section for Vercel). CLAUDE.md still describes GitHub Pages, so regenerate it before Phase 2 relies on it"
---

# Phase 1: Design Gate Verification Report

**Phase Goal:** Yahya has approved a design doc for the dark Swiss horizontal direction, and everything needed to build is decided and gathered before any product code exists
**Verified:** 2026-11-07
**Status:** passed
**Re-verification:** No, initial verification

## Goal Achievement

Primary evidence: `bash .planning/phases/01-design-gate/check.sh` printed 19/19 PASS (SC-1a to SC-5b plus REQ-edits), exit 0. I then checked each row by hand rather than relying on the script alone.

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The design doc describes the dark Swiss horizontal design (not the retired light paper design), and Yahya has marked it approved | VERIFIED | Doc line 3 reads `Status: APPROVED by Yahya, 2026-11-07 (revision 5: dark Swiss horizontal)`. Commit 030fee1 `docs(01): design doc revision 5 approved by Yahya` changes exactly one file, 1 insertion and 1 deletion, the Status line only (DRAFT to APPROVED). Yahya's approval is quoted verbatim in 01-08-SUMMARY.md: "approved; showdown: replace the planned by a quick description, keep the in progress; mame-experience: Developper Nov 2026; skills: yes; claude-md: yes". The two conditional edits were applied first (8098aae, 16bc26b), before the approval commit. SC-1a and SC-1b pass: retired terms (#f8f8f8, viscous, folder stack, Sableye, GitHub Pages, CNAME) appear only in the Retired appendix. |
| 2 | The final sans family is chosen after a side-by-side trial on the giant YAHYA and recorded in the doc, with its self-hosting licence confirmed | VERIFIED | `docs/reference/font-trial.html` exists and contains all five trialled families (SC-2a). Doc section 4.1: "Final family: Instrument Sans (chosen by Yahya, 2026-11-07, round 1)", SIL OFL 1.1, self-hosted, `--yahya-fit: 2.188`, weights, widths, tracking. `docs/reference/fonts/` has `InstrumentSans-wdth-wght.woff2` and `OFL-InstrumentSans.txt`. Only OFL faces are tracked. `docs/reference/fonts-private/` holds 4 paid test fonts on disk (Soehne, Suisse) but 0 are tracked and `.gitignore:2` ignores the folder, so SC-2c is a real PASS. |
| 3 | Each of the six pages has a written, distinct composition on the 12-column grid; no two share a layout | VERIFIED | SC-3a: sections for Index, Achievements, Projects, Experience, About and Say hi exist. SC-3b: at least 6 "poster device" lines with no duplicates. SC-3c: the Involvement fit check is recorded. SC-3d: `swiss-horizontal-v7.html` exists with no placeholder URLs or hotlinked fonts. |
| 4 | Real material is in the repo or a listed location: photos and screenshots, resume PDF (private details removed), email, LinkedIn, GitHub and project links | VERIFIED | `docs/material/` holds the portrait (grey and colour), `resume-public.pdf`, event photos plus the robot CAD capture, Facturo and MAME screenshots, and the logo marks. The inventory in `links.md` has 69 file rows. I compared it to the files on disk and they match exactly: no disk-only and no inventory-only entries. `links.md` carries the email, LinkedIn URL, GitHub URL and project links with HTTP check results. The resume text has no phone number, no 10-digit run and no "May 2023". exiftool 13.50 is installed at /usr/bin/exiftool, so SC-4c is a real PASS. I ran exiftool directly: 0 files with GPS, and no camera tags on the colour portrait. Atlantis has no screenshots. This is covered by the explicit waiver line in `links.md`, which SC-4f accepts, and by section 9 of the doc, which approval accepts (01-08-SUMMARY decisions). SC-4e passes: no passport, transcript or client_secret files are tracked. |
| 5 | The v6 sketch is saved under `docs/reference/`, and research Decisions 1-6 are recorded as accepted or overruled, with Vercel as the host | VERIFIED | `docs/reference/swiss-horizontal-v6.html` is tracked (SC-5a). Doc section 3 lists Decisions 1-6, each "Accepted, 2026-11-06", and a Host row "Vercel, Accepted" (SC-5b). |

**Score:** 5/5 truths verified

### Requested Cross-Checks

| Check | Result |
|-------|--------|
| Approval line in its own commit (030fee1) | Confirmed. One file, one line. The gate script's SC-1c also passes. |
| Explicit approval quoted verbatim in 01-08-SUMMARY.md | Confirmed (section "Yahya's approval (verbatim)"). Claude did not decide the approval, matching the plan's D-25 constraint. |
| No product code | Confirmed. The repo root holds only `CLAUDE.md`, `docs/`, `.planning/`, `.gitignore` and a stray `.ruff_cache`. No package.json, tsconfig, next.config, src/app or .ts/.tsx files anywhere. The only HTML/JS is in the throwaway sketches in `docs/reference/`. |
| docs/material matches links.md inventory | Confirmed, 69 of 69. |
| Font decision consistent across 01-05-SUMMARY, STATE.md, design doc, font-metrics.md | Consistent on family, OFL, weight 700, wdth 75 and tracking (-0.045em and -0.05em). One historical inconsistency: 01-05-SUMMARY and the font-metrics.md "Winner" section say `--yahya-fit` 2.155. Plan 06 corrected it to the ink-accurate 2.188, which font-metrics.md records in a later section and which the design doc and STATE.md use. This is a documented supersession, not a conflict; the doc wins (section 4.1). |
| Hanken Grotesk | Appears only as "confirmed first, then replaced by Instrument Sans". Not a stale final-font claim. |

### Requirements Coverage

Phase 1 declares no requirements: all 8 PLAN files have `requirements: []`, and ROADMAP says "None (design gate)". No requirement in REQUIREMENTS.md is mapped to Phase 1, so there are no orphans.

| Check | Result |
|-------|--------|
| Requirement IDs in the file | 45 `**ID**` entries |
| Traceability rows | 45, one per ID. "Coverage: 45 total, Mapped 45, Unmapped 0" is consistent. |
| Edits made this phase | EXP-03 (Phase 5), CONT-10, CONT-11, CONT-12 (all Phase 6): each has exactly one definition and one traceability row |
| REQ-edits check | PASS: the cursor requirement exists, and the "Contact form, custom cursor" out-of-scope line is gone (it now says the cursor moved into v1 as EXP-03) |

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `docs/superpowers/specs/2026-11-03-portfolio-design.md` | VERIFIED | Revision 5, APPROVED. Substantive (sections 3, 4.1, 7, 9). |
| `docs/reference/swiss-horizontal-v6.html`, `-v7.html`, `font-trial.html`, `font-metrics.md` | VERIFIED | Tracked and substantive |
| `docs/reference/fonts/` (OFL faces and licences) | VERIFIED | |
| `docs/material/*` and `links.md` | VERIFIED | Matches the inventory |
| `.planning/phases/01-design-gate/check.sh` | VERIFIED | 19 rows, all pass |
| `.planning/REQUIREMENTS.md` | VERIFIED | Consistent |

### Review Findings (01-REVIEW.md: 0 critical, 8 warnings, 7 info)

None undermines a Phase 1 must-have.

| ID | Judgement |
|----|-----------|
| WR-01 SC-4c false pass without exiftool | Not a gap here. exiftool 13.50 is installed, and I ran the GPS and camera-tag checks myself. The result (no GPS, no camera tags) is real. Script-hardening item. |
| WR-02 Phone regex misses unseparated numbers | Not a gap. I read the resume text directly: no phone, no 10-digit run. Script-hardening only. |
| WR-03 Row dispatch runs any command | Script-hardening only. A full run executes the 19 defined rows. |
| WR-04, WR-05, WR-06, WR-07, WR-08 | These concern the throwaway v7 sketch. Carry-forward items for the build phases (Phase 4 pager and A11Y-01, Phase 5 EXP-03 and A11Y-04). The design doc does not require the sketch to meet them, and the requirements already cover them (A11Y-01, A11Y-02, A11Y-04, EXP-03). Listed as recommendations. |
| IN-01 to IN-07 | Informational |

### Anti-Patterns

The files are throwaway sketches and docs. No stub or placeholder content blocks the goal. Level 4 data-flow tracing does not apply: no product code exists.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Gate script | `bash .planning/phases/01-design-gate/check.sh` | 19 PASS, exit 0 | PASS |
| exiftool available | `exiftool -ver` | 13.50 | PASS |
| GPS in material | `exiftool -if '$GPSLatitude' -r docs/material` | 0 files | PASS |
| Resume privacy | `pdftotext resume-public.pdf` grep for phone and "May 2023" | no match | PASS |
| Approval commit scope | `git show --stat 030fee1` | 1 file, 1 line changed | PASS |

### Human Verification Required

None. The one human decision the phase needed (Yahya's approval) is recorded verbatim with its commit. Yahya judged the sketch across seven review rounds and approved it.

### Gaps Summary

No gaps. All five ROADMAP success criteria hold in the repository, not just in the SUMMARYs. The approval is real, in its own commit, and quoted verbatim. No product code exists. The material inventory matches the files, the font decision is consistent, and requirement coverage is complete (45 of 45, nothing mapped to Phase 1). Items for later phases are listed as recommendations in the frontmatter.

---

_Verified: 2026-11-07_
_Verifier: Claude (gsd-verifier)_
