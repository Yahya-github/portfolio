---
phase: 01-design-gate
plan: 05
subsystem: typography
tags: [design-gate, font, decision, licence]
requires:
  - "01-01: committed v6 reference"
  - "01-02: font trial page, font-metrics.md and metrics.py"
provides:
  - "Confirmed site font: Instrument Sans (SIL OFL 1.1), display weight 700, display width wdth 75, YAHYA tracking -0.045em, display tracking -0.05em, body at wdth 100"
affects: [01-06, 01-07]
tech-stack:
  added: []
  patterns: []
key-files:
  created:
    - .planning/phases/01-design-gate/01-05-SUMMARY.md
  modified: []
decisions:
  - "Font: Instrument Sans (OFL), display weight 700, wdth 75 for YAHYA and Display words, YAHYA tracking -0.045em, Display tracking -0.05em, body wdth 100; confirmed by Yahya 2026-11-07 (replaces the earlier Hanken Grotesk confirmation)"
metrics:
  duration: 3 min
  completed: 2026-11-07
  tasks: 3
  files: 1
---

# Phase 1 Plan 05: Font Decision Summary

The site font is Instrument Sans, self-hosted under SIL OFL 1.1 from `docs/reference/fonts/InstrumentSans-wdth-wght.woff2`. Display weight is 700. YAHYA and the Display words use the condensed width (wdth 75); body text uses the same file at wdth 100. YAHYA tracking is -0.045em and Display tracking -0.05em.

Yahya first picked and confirmed Hanken Grotesk, then changed to Instrument Sans in the same session and confirmed that after seeing its re-measured numbers. Instrument Sans was a round 1 face, so this is not a third round (D-08). Round 2 did not run, and no repo files changed.

## Task 1: Round 1 pick

Yahya's reply, verbatim: "pick: Hanken Grotesk, weight 700, tracking -0.035em"

Before judging, Yahya downloaded the Klim (Söhne) and Swiss Typefaces (Suisse Int'l) trial fonts. The Söhne Dreiviertelfett/Buch and Suisse Intl Bold/Regular trial WOFF2s sit in the git-ignored `docs/reference/fonts-private/`. `git check-ignore` matches all four (`.gitignore:2`), and `git ls-files` shows none of them tracked. The Söhne trials are 69-glyph subsets, and none of the trial files had GSUB or `tnum`. Neue Haas was not obtained. Yahya reported no prices.

## Task 2: Round 2

Round 2 not needed: Yahya picked a round 1 face. No files under `docs/reference/` or `check.sh` changed.

## Task 3: Final confirmation

### First confirmation (superseded)

Hanken Grotesk at weight 700, YAHYA tracking -0.035em: `--yahya-fit` 2.926; poster 476px at 1440x900, 450px at 1366x768, 122px at 390x844 (all width-bound); "Involvement" cols 7-12 tight (615/619px at 1366); "Achievements" overflows a 390 phone (369px / 322px); figures tabular by default. Yahya's reply, verbatim: "confirm"

### Change and final confirmation

Yahya's reply, verbatim: "Finally: Instrument Sans
display weight 700
- 75, -0.045em"

The orchestrator read "75" as wdth 75 and re-measured with the committed `metrics.py` (`--display-weight 700 --yahya-track -0.045 --wdth 75 --faces InstrumentSans`, Display tracking -0.05em):

- YAHYA shaped advance at wdth 75, weight 700: 2.380 em. `--yahya-fit` 2.155.
- Poster YAHYA: 646px at 1440x900 (width-bound), 589px at 1366x768 (height-bound), 166px at 390x844 (width-bound).
- Every Display word fits. "Achievements" on a 390 phone: 290px / 322px. "Involvement" cols 7-12: 489/619px at 1366, 516/656px at 1440. "75/75" cols 1-7: 253/726px.
- Tabular figures through a real `tnum` feature. Max weight 700, so there is no 800 option.
- Licence: SIL OFL 1.1, one variable file (wdth 75-100, wght 400-700), already committed with its OFL text.

The orchestrator stated two assumptions: body text at wdth 100, and -0.045em for YAHYA only with Display words staying at -0.05em. Yahya's reply, verbatim: "confirm"

## Confirmed font

| Field | Value |
|-------|-------|
| Face | Instrument Sans |
| File | `docs/reference/fonts/InstrumentSans-wdth-wght.woff2` (variable wdth 75-100, wght 400-700), licence `docs/reference/fonts/OFL-InstrumentSans.txt` |
| Display weight | 700 (font maximum) |
| Display width | wdth 75 for YAHYA and Display words |
| Body width | wdth 100 |
| YAHYA tracking | -0.045em |
| Display tracking | -0.05em |
| Licence route | SIL OFL 1.1, self-hosted, no purchase, no price |
| Inter Tight reason | Not applicable (Inter Tight did not win) |

The paid faces that did not win (Söhne, Suisse Int'l, Neue Haas Grotesk) stay "price not verified". Their trial files must never be committed or used live.

## Hand-offs

- Plan 06 writes the Instrument Sans numbers above into `docs/reference/font-metrics.md` and builds v7 in Instrument Sans 700 at wdth 75 for display, wdth 100 for body. The "Achievements" phone overflow no longer applies at wdth 75. At 1366x768 the poster is height-bound.
- Plan 07 records the font choice in the design doc. "Involvement" fits cols 7-12 comfortably, so the Experience split can go back to 6/6, as plan 03 allowed.

## Deviations from Plan

- Yahya changed the pick after the first Task 3 confirmation. The new face came from round 1, so D-08 (no third round) holds. The summary keeps both confirmations verbatim.

## Verification

- `bash .planning/phases/01-design-gate/check.sh SC-2a SC-2c`: PASS SC-2a, PASS SC-2c
- `git status --porcelain docs/reference .planning/phases/01-design-gate/check.sh`: empty

## Self-Check: PASSED

- FOUND: docs/reference/fonts/InstrumentSans-wdth-wght.woff2
- FOUND: docs/reference/fonts/OFL-InstrumentSans.txt
