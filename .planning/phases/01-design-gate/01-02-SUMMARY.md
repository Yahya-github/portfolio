---
phase: 01-design-gate
plan: 02
subsystem: design-reference
tags: [design-gate, fonts, font-trial, harfbuzz, ofl]
requires: []
provides:
  - "6 self-hosted OFL WOFF2 files plus their OFL licence texts in docs/reference/fonts/"
  - "docs/reference/font-metrics.md: HarfBuzz-measured tabular status, axes, YAHYA advance, --yahya-fit, Poster size and bound, Display-word fit table per face"
  - ".planning/phases/01-design-gate/metrics.py: rerunnable metrics CLI (--display-weight, --yahya-track, --display-track, --wdth, --faces)"
  - "docs/reference/font-trial.html: 8-block side-by-side trial with scaled 1440x900 / 1366x768 / 390x844 frames, live --yahya-fit, fit checks, missing-face detection"
affects: [01-05, 01-06, 01-07]
tech-stack:
  added: ["fonttools + brotli + uharfbuzz (scratch venv only, not a project dependency)"]
  patterns: ["Paid faces load only via local() or git-ignored fonts-private/; a missing face hides its specimen instead of showing a fallback"]
key-files:
  created:
    - docs/reference/fonts/InterTight-wght.woff2
    - docs/reference/fonts/SofiaSansExtraCondensed-wght.woff2
    - docs/reference/fonts/SofiaSans-wght.woff2
    - docs/reference/fonts/SchibstedGrotesk-wght.woff2
    - docs/reference/fonts/HankenGrotesk-wght.woff2
    - docs/reference/fonts/InstrumentSans-wdth-wght.woff2
    - docs/reference/fonts/OFL-*.txt (6)
    - docs/reference/font-metrics.md
    - docs/reference/font-trial.html
    - .planning/phases/01-design-gate/metrics.py
  modified: []
decisions:
  - "Live browser measurement agrees with HarfBuzz to 0.001 em (Inter Tight fit 3.178, Sofia EC 1.741 vs 1.740), so font-metrics.md numbers can be quoted in the doc"
  - "Phone (390) trial frames show only the section number under each letter; full names overlap at that width"
metrics:
  duration: "~10 min"
  completed: 2026-11-07
  tasks: 3
  files: 15
---

# Phase 1 Plan 02: Font trial (fonts, metrics, trial page) Summary

The six OFL faces are self-hosted as WOFF2 with their licences. font-metrics.md holds HarfBuzz numbers per face. font-trial.html compares all 8 shortlisted faces on the giant YAHYA in scaled 1440x900, 1366x768 and 390x844 frames, with live `--yahya-fit`, fit checks and "not installed" handling for the 3 paid faces.

## Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Fetch OFL files, convert to WOFF2, measure, write font-metrics.md | e08de96 | docs/reference/fonts/ (6 woff2 + 6 OFL), docs/reference/font-metrics.md, .planning/phases/01-design-gate/metrics.py |
| 2 | font-trial.html shell: font loading, controls, criteria, 8 static blocks | 0d821c3 | docs/reference/font-trial.html |
| 3 | Scaled frames, live --yahya-fit, fit checks, missing-face detection | 2735a64 | docs/reference/font-trial.html |

## Measured results (weight 700, YAHYA tracking -0.04em, Display -0.05em)

| Face | Tabular | YAHYA 700 (em) | `--yahya-fit` | Poster 1440x900 | Poster 1366x768 | Achievements phone (322px) | Involvement cols 7-12, 1366 / 1440 |
|---|---|---|---|---|---|---|---|
| Inter Tight | tnum | 3.378 | 3.178 | 438px width-bound | 415px width-bound | 386 ✗ | 629/619 ✗, 663/656 ✗ |
| Sofia Sans EC (+ Sofia Sans body) | tnum | 1.940 | 1.740 | 763px height-bound | 589px height-bound | 235 ✓ | 390 ✓, 412 ✓ |
| Schibsted Grotesk | tnum | 3.351 | 3.151 | 442px width-bound | 418px width-bound | 409 ✗ | 690 ✗, 727 ✗ |
| Hanken Grotesk | tabular by default | 3.101 | 2.901 | 480px width-bound | 454px width-bound | 369 ✗ | 615 ✓ (tight), 648 ✓ |
| Instrument Sans wdth 100 | tnum | 3.360 | 3.160 | 441px width-bound | 417px width-bound | 400 ✗ | 657 ✗, 693 ✗ |
| Instrument Sans wdth 75 | tnum | 2.380 | 2.180 | 639px width-bound | 589px height-bound | 290 ✓ | 489 ✓, 516 ✓ |

All five research advances were reproduced within 0.001 em. Inter Tight's Involvement widths (629/663px) are slightly below the research table's estimates (635/669px). The measured values supersede the estimates; it overflows either way. Moving Involvement to cols 6-12 fits for every face (see font-metrics.md).

## Verification

- 6 `wOF2` files and 6 OFL texts (all contain "SIL OPEN FONT LICENSE"); no `.ttf` under docs/reference
- `check.sh SC-2a SC-2c`: PASS, PASS
- font-trial.html: no `http(s)://`, no "italic", 8 `class="frames"`, inline script parses
- Headless Chrome render (file://): 5 OFL blocks measured live and match HarfBuzz; the 3 paid blocks show "not installed"; the 800 toggle gives Inter Tight 3.292 (= 3.492 - 0.2) and holds Instrument at "700 (max 700)"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Phone frame captions overlapped**
- **Found during:** Task 3 (headless screenshot)
- **Issue:** At 390 wide, "01 Achievements" and the other captions overlapped under the 113-206px YAHYA
- **Fix:** Phone frames show only the number under each letter, and the frame label says "captions show numbers only"
- **Files modified:** docs/reference/font-trial.html
- **Commit:** 2735a64

**2. [Wording] Criterion "no italic" phrased as "No slanted style is needed or used anywhere (D-05)"**
- The plan forbids the string `italic` anywhere in the file, so the criterion is worded without it.

Otherwise the plan was executed as written.

## Known Stubs

- Paid blocks (Söhne, Suisse Int'l, Neue Haas) are "not installed" by design until Yahya adds test files to docs/reference/fonts-private/ or installs them. The plan expects this ("paid blocks waiting on Yahya's files").

## Notes for plan 05

- Open the page directly (file://) or via any local static server. Headless Chrome loaded the relative `fonts/` URLs from file:// without issue.
- To rerun metrics at the picked weight or tracking, use the "How to rerun" block in font-metrics.md.

## Self-Check: PASSED
