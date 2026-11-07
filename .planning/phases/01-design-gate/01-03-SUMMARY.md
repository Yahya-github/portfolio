---
phase: 01-design-gate
plan: 03
subsystem: design-doc
tags: [design-gate, design-doc, requirements, cursor]
requires:
  - "01-01: committed v6 reference and the greyscale portrait"
  - "01-02: font trial page and docs/reference/font-metrics.md"
provides:
  - "docs/superpowers/specs/2026-11-03-portfolio-design.md revision 5 draft (dark Swiss horizontal), with the rev 4 baseline kept in git history"
  - "EXP-03 custom cursor requirement in REQUIREMENTS.md, mapped to Phase 5 (42 v1 requirements)"
  - "PROJECT.md refreshed (static 75/75, cursor line, v6 committed, rev 5 status, cursor Key Decision row)"
  - "UI-SPEC tabular-figure criterion that no longer fails Hanken Grotesk"
affects: [01-05, 01-06, 01-07, 01-08]
tech-stack:
  added: []
  patterns: ["Retired items live only in the last ## section of the design doc, so the SC-1b check can confine banned words to it"]
key-files:
  created:
    - .planning/phases/01-design-gate/01-03-SUMMARY.md
  modified:
    - docs/superpowers/specs/2026-11-03-portfolio-design.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
    - .planning/PROJECT.md
    - .planning/phases/01-design-gate/01-UI-SPEC.md
decisions:
  - "Design doc rev 5 keeps three choices open for plan 07: the font, the Achievements variant (a or b) and the cursor form (a, b or c)"
  - "Experience splits Work cols 1-5 and Involvement cols 6-12 until plan 07 checks the winning face; it goes back to 6/6 if the winner fits cols 7-12"
  - "Custom cursor is v1 requirement EXP-03 (Phase 5); the anti-feature line no longer lists it"
metrics:
  duration: 5 min
  completed: 2026-11-07
  tasks: 2
  files: 5
---

# Phase 1 Plan 03: Design Doc Revision 5 Draft Summary

The design doc is rewritten in place as the revision 5 draft (dark Swiss horizontal). It has 11 numbered sections plus a final Retired appendix, six page compositions with distinct poster devices, Decisions 1-6 Accepted with Vercel as the host, and font, Achievements variant and cursor form left open. Separately, EXP-03 (custom cursor) was added to the requirements, roadmap and project files.

## What was done

- **Task 1:** First I committed the rev 4 baseline (2225ec3), then replaced the doc with revision 5 (918073e). It covers intent and wow sources (D-26 to D-28), constraints (Vercel, no basePath, budget, routes, facts only), the Decisions table, the visual system with a 4.1 Font subsection (8-face shortlist, criteria, Sofia and Inter Tight notes), motion tokens, navigation and paging, the six page compositions, the cursor (form open), material, 12 open items, success, and the Retired appendix as the last `##` heading.
- **Task 2 (cbf5fc6):**
  - REQUIREMENTS.md: added the EXP-03 line and its traceability row. The anti-feature line was rewritten and the viscous bubble cursor added to Out of Scope. Coverage is now 42.
  - ROADMAP.md: EXP-03 added to the Phase 5 requirements, plus the cursor sentence in success criterion 2.
  - PROJECT.md: Active, Context and Key Decisions updated.
  - 01-UI-SPEC.md: the tabular-figure bullet reworded.

## Verification

- `check.sh SC-1a SC-1b SC-3a SC-3b SC-3c SC-5b REQ-edits` gives 7 PASS.
- SC-1c and SC-2b FAIL, as expected: plans 07 and 08 turn them green.
- On the doc:
  - 12 `##` headings, the last being `## Appendix: Retired`.
  - 7 `poster device` lines.
  - 0 matches each for `final font/family`, em dashes, `APPROVED` and the phone-number pattern.
  - All required strings present.
- REQUIREMENTS.md: `EXP-03` appears 3 times, and CONT-02 is unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Achievements phone fit line corrected against measured data**
- **Found during:** Task 1
- **Issue:** The verbatim line said "Achievements" at 64px overflows the 390px frame "for every shortlisted face except Sofia Sans Extra Condensed". But `docs/reference/font-metrics.md` shows Instrument Sans at wdth 75 also fits (290px / 322px). The paid faces were never measured, so "every shortlisted face" also claimed more than the data shows.
- **Fix:** The line now reads "for every measured face except Sofia Sans Extra Condensed and Instrument Sans at its condensed width (wdth 75), so with any other face that title drops to Heading on phones". The rest is unchanged. No check row depends on this line.
- **Files modified:** docs/superpowers/specs/2026-11-03-portfolio-design.md
- **Commit:** 918073e

Note: I kept the Experience fit line verbatim because SC-3c depends on it. The data backs it: 3 of the 5 measured OFL faces overflow cols 7-12 at 1366px, and Hanken fits only just (615px / 619px).

## Known Stubs

These items in the doc are intentionally open. Each one is tracked, and none blocks this plan's goal:
- Section 4.1 Font, "Trial status: open": plan 07 fills it from the font checkpoint.
- 01 Achievements, "Choice open (a) or (b)": plan 07.
- Section 8 Cursor, "Form open": plan 07.
- Section 9 Material, pending items: plan 04 (paused at its human checkpoint).
- Index proof line wording and About final copy: Phase 7, by design.

## Threat Flags

None. The doc publishes no phone number and does not mention the contest platform. Showdown AI is shown as in progress, and no Atlantis line counts appear.

## Self-Check: PASSED

- FOUND: docs/superpowers/specs/2026-11-03-portfolio-design.md
- FOUND: commits 2225ec3, 918073e, cbf5fc6
