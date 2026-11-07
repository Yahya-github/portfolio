---
phase: 01-design-gate
plan: 05
subsystem: typography
tags: [design-gate, font, decision, licence]
requires:
  - "01-01: committed v6 reference"
  - "01-02: font trial page, font-metrics.md and metrics.py"
provides:
  - "Confirmed site font: Hanken Grotesk (SIL OFL 1.1), display weight 700, YAHYA tracking -0.035em, display tracking -0.05em"
affects: [01-06, 01-07]
tech-stack:
  added: []
  patterns: []
key-files:
  created:
    - .planning/phases/01-design-gate/01-05-SUMMARY.md
  modified: []
decisions:
  - "Font: Hanken Grotesk (OFL), display weight 700, YAHYA tracking -0.035em; confirmed by Yahya 2026-11-07"
metrics:
  duration: 3 min
  completed: 2026-11-07
  tasks: 3
  files: 1
---

# Phase 1 Plan 05: Font Decision Summary

Yahya picked Hanken Grotesk in round 1. It is self-hosted under SIL OFL 1.1 from `docs/reference/fonts/HankenGrotesk-wght.woff2`, with display weight 700 and YAHYA tracking -0.035em. He confirmed the pick after seeing the re-measured numbers. Round 2 did not run, and no repo files changed.

## Task 1: Round 1 pick

Yahya's reply, verbatim: "pick: Hanken Grotesk, weight 700, tracking -0.035em"

Before judging, Yahya downloaded the Klim (Söhne) and Swiss Typefaces (Suisse Int'l) trial fonts. The Söhne Dreiviertelfett/Buch and Suisse Intl Bold/Regular trial WOFF2s sit in the git-ignored `docs/reference/fonts-private/`. `git check-ignore` matches all four (`.gitignore:2`), and `git ls-files` shows none of them tracked. The Söhne trials are 69-glyph subsets, and none of the trial files had GSUB or `tnum`. Neue Haas was not obtained. Yahya reported no prices.

## Task 2: Round 2

Round 2 not needed: Yahya picked Hanken Grotesk in round 1. No files under `docs/reference/` or `check.sh` changed. `git status --porcelain docs/reference .planning/phases/01-design-gate/check.sh` prints nothing.

## Task 3: Final confirmation

The orchestrator showed these numbers, re-measured with the committed `metrics.py` at weight 700, YAHYA tracking -0.035em and display tracking -0.05em:

- `--yahya-fit` 2.926. Poster YAHYA is 476px at 1440x900, 450px at 1366x768 and 122px at 390x844. All three are width-bound, so the letters run edge to edge on laptops.
- "Involvement" fits cols 7-12 but is tight: 615/619px at 1366 and 648/656px at 1440.
- "Achievements" overflows at full width on a phone: 369px of text in 322px of space. v7 (plan 06) has to handle this, for example with a smaller phone size or Achievements variant b.
- "75/75" fits, at 296 of 726px. Figures are tabular by default: all ten digits are 560 units wide, and there is no `tnum` feature. This passes D-06.
- Licence: SIL OFL 1.1, self-hosted WOFF2, nothing to buy.

Yahya's reply, verbatim: "confirm"

## Confirmed font

| Field | Value |
|-------|-------|
| Face | Hanken Grotesk |
| File | `docs/reference/fonts/HankenGrotesk-wght.woff2` (variable wght), licence `docs/reference/fonts/OFL-HankenGrotesk.txt` |
| Display weight | 700 |
| YAHYA tracking | -0.035em |
| Display tracking | -0.05em (used in the measurements) |
| Licence route | SIL OFL 1.1, self-hosted, no purchase, no price |
| Inter Tight reason | Not applicable (Inter Tight did not win) |

The self-hosting confirmation covers only the winner, Hanken Grotesk. The paid faces that did not win (Söhne, Suisse Int'l, Neue Haas Grotesk) stay "price not verified". Their trial files must never be committed or used live.

## Hand-offs

- Plan 06 writes the numbers above into `docs/reference/font-metrics.md` and builds v7 in Hanken Grotesk 700. It must fix the "Achievements" overflow on phones.
- Plan 07 records the font choice in the design doc. "Involvement" fits cols 7-12, so the Experience split can go back to 6/6, as plan 03 allowed.

## Deviations from Plan

None. Both checkpoints were run by the orchestrator with Yahya in this session, and this executor only recorded the outcomes.

## Verification

- `bash .planning/phases/01-design-gate/check.sh SC-2a SC-2c`: PASS SC-2a, PASS SC-2c
- `git status --porcelain docs/reference .planning/phases/01-design-gate/check.sh`: empty

## Self-Check: PASSED

- FOUND: docs/reference/fonts/HankenGrotesk-wght.woff2
- FOUND: docs/reference/fonts/OFL-HankenGrotesk.txt
- No per-task commits (no file changes by design); the metadata commit carries this SUMMARY
