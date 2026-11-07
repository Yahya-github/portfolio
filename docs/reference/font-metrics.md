# Font trial metrics

Font trial metrics (throwaway reference, Phase 1). Measured with HarfBuzz on the google/fonts files, 2026-11-07.

## How to rerun

```bash
python3 -m venv "$S/venv" && "$S/venv/bin/pip" install fonttools brotli uharfbuzz
mkdir -p "$S/fonts-src"
for f in docs/reference/fonts/*.woff2; do "$S/venv/bin/python" -I -m fontTools.ttLib.woff2 decompress -o "$S/fonts-src/$(basename "${f%.woff2}").ttf" "$f"; done
"$S/venv/bin/python" -I .planning/phases/01-design-gate/metrics.py "$S/fonts-src" --display-weight <w> --yahya-track <t>
```

`$S` is any scratch directory outside the repo.

## Formulas (01-UI-SPEC grid)

- Hero grid `Gh = W - 2*24` desktop; phone `390 - 2*16 = 358`.
- Content grid (pages 01-05, rail padding): desktop `G = W - 104`; phone `G = 390 - (16 + 36) - 16 = 322`.
- Column `c = (G - 11*g)/12`, g = 24 desktop, 16 phone; span of n columns = `n*c + (n-1)*g`.
- Display size `clamp(64px, 9vw, 168px)`: 1366 -> 122.94px, 1440 -> 129.60px, 390 -> 64px.
- Word width = `size * (shaped_advance_em + chars * tracking_em)` (CSS letter-spacing follows every character).
- `--yahya-fit = shaped_advance_em("YAHYA") + 5 * tracking_em`.
- Poster size = `min(Gh / fit, Hb / 0.76)`, `Hb = H - 72 - 56 - 96 - 96` (1440x900: 580px, 1366x768: 448px, 390x844: 524px).

Run settings: display weight 700, YAHYA tracking -0.04em, Display tracking -0.05em, wdth 100.

## Summary

| Face | Tabular figures | Axes | YAHYA 700 (em) | YAHYA 800 (em) | `--yahya-fit` | Poster 1440x900 | Poster 1366x768 | Poster 390x844 |
|---|---|---|---|---|---|---|---|---|
| Inter Tight | `tnum` | wght 100-900 | 3.378 | 3.492 | 3.178 | 438px width-bound | 415px width-bound | 113px width-bound |
| Sofia Sans Extra Condensed + Sofia Sans | `tnum` | wght 1-1000 | 1.940 | 2.048 | 1.740 | 763px height-bound | 589px height-bound | 206px width-bound |
| Schibsted Grotesk | `tnum` | wght 400-900 | 3.351 | 3.423 | 3.151 | 442px width-bound | 418px width-bound | 114px width-bound |
| Hanken Grotesk | tabular by default | wght 100-900 | 3.101 | 3.142 | 2.901 | 480px width-bound | 454px width-bound | 123px width-bound |
| Instrument Sans | `tnum` | wdth 75-100, wght 400-700 | 3.360 | max 700 | 3.160 | 441px width-bound | 417px width-bound | 113px width-bound |

## Inter Tight

- Files: `InterTight-wght.woff2`
- Licence: SIL Open Font License 1.1, self-host allowed (OFL text committed next to the WOFF2)
- Tabular figures: yes (`tnum` feature)
- Axes: wght 100-900
- YAHYA shaped advance (kern on, no tracking): 700 = 3.378 em; 800 = 3.492 em
- Note: Anti-vibe flag (Inter by default): can win only on the trial, with a one-sentence reason in the design doc.

**Poster YAHYA: display weight 700** (tracking -0.04em)

- `--yahya-fit` = 3.178

| Viewport | Hero grid Gh | Height budget Hb | Gh / fit | Hb / 0.76 | Poster size | Bound |
|---|---|---|---|---|---|---|
| 1440x900 | 1392px | 580px | 438px | 763px | 438px | width-bound |
| 1366x768 | 1318px | 448px | 415px | 589px | 415px | width-bound |
| 390x844 | 358px | 524px | 113px | 689px | 113px | width-bound |

**Display-word fit: display weight 700, tracking -0.05em**

| Word / slot | Viewport | Size | Width / available |
|---|---|---|---|
| "Involvement" cols 7-12 | 1366 | 122.94px | 629px / 619px ✗ |
| "Involvement" cols 7-12 | 1440 | 129.60px | 663px / 656px ✗ |
| "Involvement" cols 6-12 | 1366 | 122.94px | 629px / 726px ✓ |
| "Involvement" cols 6-12 | 1440 | 129.60px | 663px / 769px ✓ |
| "Work" cols 1-5 | 1366 | 122.94px | 278px / 512px ✓ |
| "Work" cols 1-6 | 1366 | 122.94px | 278px / 619px ✓ |
| "Achievements" phone full width | 390 | 64.00px | 386px / 322px ✗ |
| "Achievements" cols 1-12 (variant b title) | 1366 | 122.94px | 742px / 1262px ✓ |
| "Facturo" cols 1-8 | 1366 | 122.94px | 391px / 833px ✓ |
| "habits" cols 5-12 (title "Two" / "habits") | 1366 | 122.94px | 315px / 833px ✓ |
| "Resume (PDF)" cols 1-9 | 1366 | 122.94px | 724px / 940px ✓ |
| "Resume (PDF)" cols 1-9 | 1440 | 129.60px | 763px / 996px ✓ |
| "LinkedIn" cols 1-9 | 1366 | 122.94px | 429px / 940px ✓ |
| "LinkedIn" cols 1-9 | 1440 | 129.60px | 453px / 996px ✓ |
| "GitHub" cols 1-9 | 1366 | 122.94px | 365px / 940px ✓ |
| "GitHub" cols 1-9 | 1440 | 129.60px | 385px / 996px ✓ |
| "Email" cols 1-9 | 1366 | 122.94px | 276px / 940px ✓ |
| "Email" cols 1-9 | 1440 | 129.60px | 290px / 996px ✓ |
| "75/75" cols 1-7 (variant a, tabular-nums) | 1366 | 122.94px | 332px / 726px ✓ |

## Sofia Sans Extra Condensed + Sofia Sans

- Files: `SofiaSansExtraCondensed-wght.woff2` (YAHYA, Display) + `SofiaSans-wght.woff2` (body)
- Licence: SIL Open Font License 1.1, self-host allowed (OFL text committed next to the WOFF2)
- Tabular figures: yes (`tnum` feature)
- Axes: wght 1-1000
- Body file (SofiaSans-wght) tabular figures: yes (`tnum` feature); axes: wght 1-1000
- YAHYA shaped advance (kern on, no tracking): 700 = 1.940 em; 800 = 2.048 em
- Note: two files, one superfamily (D-06 reading to be confirmed by Yahya). YAHYA and Display measured with Sofia Sans Extra Condensed; body file Sofia Sans.

**Poster YAHYA: display weight 700** (tracking -0.04em)

- `--yahya-fit` = 1.740

| Viewport | Hero grid Gh | Height budget Hb | Gh / fit | Hb / 0.76 | Poster size | Bound |
|---|---|---|---|---|---|---|
| 1440x900 | 1392px | 580px | 800px | 763px | 763px | height-bound |
| 1366x768 | 1318px | 448px | 757px | 589px | 589px | height-bound |
| 390x844 | 358px | 524px | 206px | 689px | 206px | width-bound |

**Display-word fit: display weight 700, tracking -0.05em**

| Word / slot | Viewport | Size | Width / available |
|---|---|---|---|
| "Involvement" cols 7-12 | 1366 | 122.94px | 390px / 619px ✓ |
| "Involvement" cols 7-12 | 1440 | 129.60px | 412px / 656px ✓ |
| "Involvement" cols 6-12 | 1366 | 122.94px | 390px / 726px ✓ |
| "Involvement" cols 6-12 | 1440 | 129.60px | 412px / 769px ✓ |
| "Work" cols 1-5 | 1366 | 122.94px | 167px / 512px ✓ |
| "Work" cols 1-6 | 1366 | 122.94px | 167px / 619px ✓ |
| "Achievements" phone full width | 390 | 64.00px | 235px / 322px ✓ |
| "Achievements" cols 1-12 (variant b title) | 1366 | 122.94px | 451px / 1262px ✓ |
| "Facturo" cols 1-8 | 1366 | 122.94px | 238px / 833px ✓ |
| "habits" cols 5-12 (title "Two" / "habits") | 1366 | 122.94px | 193px / 833px ✓ |
| "Resume (PDF)" cols 1-9 | 1366 | 122.94px | 425px / 940px ✓ |
| "Resume (PDF)" cols 1-9 | 1440 | 129.60px | 448px / 996px ✓ |
| "LinkedIn" cols 1-9 | 1366 | 122.94px | 259px / 940px ✓ |
| "LinkedIn" cols 1-9 | 1440 | 129.60px | 273px / 996px ✓ |
| "GitHub" cols 1-9 | 1366 | 122.94px | 218px / 940px ✓ |
| "GitHub" cols 1-9 | 1440 | 129.60px | 230px / 996px ✓ |
| "Email" cols 1-9 | 1366 | 122.94px | 167px / 940px ✓ |
| "Email" cols 1-9 | 1440 | 129.60px | 176px / 996px ✓ |
| "75/75" cols 1-7 (variant a, tabular-nums) | 1366 | 122.94px | 230px / 726px ✓ |

## Schibsted Grotesk

- Files: `SchibstedGrotesk-wght.woff2`
- Licence: SIL Open Font License 1.1, self-host allowed (OFL text committed next to the WOFF2)
- Tabular figures: yes (`tnum` feature)
- Axes: wght 400-900
- YAHYA shaped advance (kern on, no tracking): 700 = 3.351 em; 800 = 3.423 em

**Poster YAHYA: display weight 700** (tracking -0.04em)

- `--yahya-fit` = 3.151

| Viewport | Hero grid Gh | Height budget Hb | Gh / fit | Hb / 0.76 | Poster size | Bound |
|---|---|---|---|---|---|---|
| 1440x900 | 1392px | 580px | 442px | 763px | 442px | width-bound |
| 1366x768 | 1318px | 448px | 418px | 589px | 418px | width-bound |
| 390x844 | 358px | 524px | 114px | 689px | 114px | width-bound |

**Display-word fit: display weight 700, tracking -0.05em**

| Word / slot | Viewport | Size | Width / available |
|---|---|---|---|
| "Involvement" cols 7-12 | 1366 | 122.94px | 690px / 619px ✗ |
| "Involvement" cols 7-12 | 1440 | 129.60px | 727px / 656px ✗ |
| "Involvement" cols 6-12 | 1366 | 122.94px | 690px / 726px ✓ |
| "Involvement" cols 6-12 | 1440 | 129.60px | 727px / 769px ✓ |
| "Work" cols 1-5 | 1366 | 122.94px | 299px / 512px ✓ |
| "Work" cols 1-6 | 1366 | 122.94px | 299px / 619px ✓ |
| "Achievements" phone full width | 390 | 64.00px | 410px / 322px ✗ |
| "Achievements" cols 1-12 (variant b title) | 1366 | 122.94px | 787px / 1262px ✓ |
| "Facturo" cols 1-8 | 1366 | 122.94px | 418px / 833px ✓ |
| "habits" cols 5-12 (title "Two" / "habits") | 1366 | 122.94px | 338px / 833px ✓ |
| "Resume (PDF)" cols 1-9 | 1366 | 122.94px | 765px / 940px ✓ |
| "Resume (PDF)" cols 1-9 | 1440 | 129.60px | 806px / 996px ✓ |
| "LinkedIn" cols 1-9 | 1366 | 122.94px | 481px / 940px ✓ |
| "LinkedIn" cols 1-9 | 1440 | 129.60px | 507px / 996px ✓ |
| "GitHub" cols 1-9 | 1366 | 122.94px | 381px / 940px ✓ |
| "GitHub" cols 1-9 | 1440 | 129.60px | 401px / 996px ✓ |
| "Email" cols 1-9 | 1366 | 122.94px | 299px / 940px ✓ |
| "Email" cols 1-9 | 1440 | 129.60px | 316px / 996px ✓ |
| "75/75" cols 1-7 (variant a, tabular-nums) | 1366 | 122.94px | 340px / 726px ✓ |

## Hanken Grotesk

- Files: `HankenGrotesk-wght.woff2`
- Licence: SIL Open Font License 1.1, self-host allowed (OFL text committed next to the WOFF2)
- Tabular figures: yes, tabular by default (no `tnum` feature; all ten digits 560 units)
- Axes: wght 100-900
- YAHYA shaped advance (kern on, no tracking): 700 = 3.101 em; 800 = 3.142 em

**Poster YAHYA: display weight 700** (tracking -0.04em)

- `--yahya-fit` = 2.901

| Viewport | Hero grid Gh | Height budget Hb | Gh / fit | Hb / 0.76 | Poster size | Bound |
|---|---|---|---|---|---|---|
| 1440x900 | 1392px | 580px | 480px | 763px | 480px | width-bound |
| 1366x768 | 1318px | 448px | 454px | 589px | 454px | width-bound |
| 390x844 | 358px | 524px | 123px | 689px | 123px | width-bound |

**Display-word fit: display weight 700, tracking -0.05em**

| Word / slot | Viewport | Size | Width / available |
|---|---|---|---|
| "Involvement" cols 7-12 | 1366 | 122.94px | 615px / 619px ✓ |
| "Involvement" cols 7-12 | 1440 | 129.60px | 648px / 656px ✓ |
| "Involvement" cols 6-12 | 1366 | 122.94px | 615px / 726px ✓ |
| "Involvement" cols 6-12 | 1440 | 129.60px | 648px / 769px ✓ |
| "Work" cols 1-5 | 1366 | 122.94px | 281px / 512px ✓ |
| "Work" cols 1-6 | 1366 | 122.94px | 281px / 619px ✓ |
| "Achievements" phone full width | 390 | 64.00px | 369px / 322px ✗ |
| "Achievements" cols 1-12 (variant b title) | 1366 | 122.94px | 710px / 1262px ✓ |
| "Facturo" cols 1-8 | 1366 | 122.94px | 387px / 833px ✓ |
| "habits" cols 5-12 (title "Two" / "habits") | 1366 | 122.94px | 303px / 833px ✓ |
| "Resume (PDF)" cols 1-9 | 1366 | 122.94px | 683px / 940px ✓ |
| "Resume (PDF)" cols 1-9 | 1440 | 129.60px | 720px / 996px ✓ |
| "LinkedIn" cols 1-9 | 1366 | 122.94px | 416px / 940px ✓ |
| "LinkedIn" cols 1-9 | 1440 | 129.60px | 439px / 996px ✓ |
| "GitHub" cols 1-9 | 1366 | 122.94px | 354px / 940px ✓ |
| "GitHub" cols 1-9 | 1440 | 129.60px | 373px / 996px ✓ |
| "Email" cols 1-9 | 1366 | 122.94px | 275px / 940px ✓ |
| "Email" cols 1-9 | 1440 | 129.60px | 290px / 996px ✓ |
| "75/75" cols 1-7 (variant a, tabular-nums) | 1366 | 122.94px | 296px / 726px ✓ |

## Instrument Sans

- Files: `InstrumentSans-wdth-wght.woff2`
- Licence: SIL Open Font License 1.1, self-host allowed (OFL text committed next to the WOFF2)
- Tabular figures: yes (`tnum` feature)
- Axes: wdth 75-100, wght 400-700
- YAHYA shaped advance (kern on, no tracking): 700 = 3.360 em; 800 = max 700 (no 800, never synthesized)
- YAHYA at wdth 75, weight 700: 2.380 em
- Note: wdth axis gives a condensed YAHYA from the same single file.

**Poster YAHYA: display weight 700, wdth 100** (tracking -0.04em)

- `--yahya-fit` = 3.160

| Viewport | Hero grid Gh | Height budget Hb | Gh / fit | Hb / 0.76 | Poster size | Bound |
|---|---|---|---|---|---|---|
| 1440x900 | 1392px | 580px | 441px | 763px | 441px | width-bound |
| 1366x768 | 1318px | 448px | 417px | 589px | 417px | width-bound |
| 390x844 | 358px | 524px | 113px | 689px | 113px | width-bound |

**Poster YAHYA: display weight 700, wdth 75** (tracking -0.04em)

- `--yahya-fit` = 2.180

| Viewport | Hero grid Gh | Height budget Hb | Gh / fit | Hb / 0.76 | Poster size | Bound |
|---|---|---|---|---|---|---|
| 1440x900 | 1392px | 580px | 639px | 763px | 639px | width-bound |
| 1366x768 | 1318px | 448px | 605px | 589px | 589px | height-bound |
| 390x844 | 358px | 524px | 164px | 689px | 164px | width-bound |

**Display-word fit: display weight 700, tracking -0.05em, wdth 100**

| Word / slot | Viewport | Size | Width / available |
|---|---|---|---|
| "Involvement" cols 7-12 | 1366 | 122.94px | 657px / 619px ✗ |
| "Involvement" cols 7-12 | 1440 | 129.60px | 693px / 656px ✗ |
| "Involvement" cols 6-12 | 1366 | 122.94px | 657px / 726px ✓ |
| "Involvement" cols 6-12 | 1440 | 129.60px | 693px / 769px ✓ |
| "Work" cols 1-5 | 1366 | 122.94px | 294px / 512px ✓ |
| "Work" cols 1-6 | 1366 | 122.94px | 294px / 619px ✓ |
| "Achievements" phone full width | 390 | 64.00px | 400px / 322px ✗ |
| "Achievements" cols 1-12 (variant b title) | 1366 | 122.94px | 768px / 1262px ✓ |
| "Facturo" cols 1-8 | 1366 | 122.94px | 409px / 833px ✓ |
| "habits" cols 5-12 (title "Two" / "habits") | 1366 | 122.94px | 330px / 833px ✓ |
| "Resume (PDF)" cols 1-9 | 1366 | 122.94px | 780px / 940px ✓ |
| "Resume (PDF)" cols 1-9 | 1440 | 129.60px | 822px / 996px ✓ |
| "LinkedIn" cols 1-9 | 1366 | 122.94px | 451px / 940px ✓ |
| "LinkedIn" cols 1-9 | 1440 | 129.60px | 475px / 996px ✓ |
| "GitHub" cols 1-9 | 1366 | 122.94px | 381px / 940px ✓ |
| "GitHub" cols 1-9 | 1440 | 129.60px | 401px / 996px ✓ |
| "Email" cols 1-9 | 1366 | 122.94px | 295px / 940px ✓ |
| "Email" cols 1-9 | 1440 | 129.60px | 311px / 996px ✓ |
| "75/75" cols 1-7 (variant a, tabular-nums) | 1366 | 122.94px | 319px / 726px ✓ |

**Display-word fit at wdth 75** (option if this face wins)

| Word / slot | Viewport | Size | Width / available |
|---|---|---|---|
| "Involvement" cols 7-12 | 1366 | 122.94px | 489px / 619px ✓ |
| "Involvement" cols 7-12 | 1440 | 129.60px | 516px / 656px ✓ |
| "Involvement" cols 6-12 | 1366 | 122.94px | 489px / 726px ✓ |
| "Involvement" cols 6-12 | 1440 | 129.60px | 516px / 769px ✓ |
| "Work" cols 1-5 | 1366 | 122.94px | 205px / 512px ✓ |
| "Work" cols 1-6 | 1366 | 122.94px | 205px / 619px ✓ |
| "Achievements" phone full width | 390 | 64.00px | 290px / 322px ✓ |
| "Achievements" cols 1-12 (variant b title) | 1366 | 122.94px | 557px / 1262px ✓ |
| "Facturo" cols 1-8 | 1366 | 122.94px | 291px / 833px ✓ |
| "habits" cols 5-12 (title "Two" / "habits") | 1366 | 122.94px | 240px / 833px ✓ |
| "Resume (PDF)" cols 1-9 | 1366 | 122.94px | 551px / 940px ✓ |
| "Resume (PDF)" cols 1-9 | 1440 | 129.60px | 581px / 996px ✓ |
| "LinkedIn" cols 1-9 | 1366 | 122.94px | 331px / 940px ✓ |
| "LinkedIn" cols 1-9 | 1440 | 129.60px | 349px / 996px ✓ |
| "GitHub" cols 1-9 | 1366 | 122.94px | 270px / 940px ✓ |
| "GitHub" cols 1-9 | 1440 | 129.60px | 285px / 996px ✓ |
| "Email" cols 1-9 | 1366 | 122.94px | 211px / 940px ✓ |
| "Email" cols 1-9 | 1440 | 129.60px | 222px / 996px ✓ |
| "75/75" cols 1-7 (variant a, tabular-nums) | 1366 | 122.94px | 253px / 726px ✓ |

## Paid faces

| Face | Foundry | Status |
|---|---|---|
| Söhne | Klim | not measured: needs Yahya's test files; price not verified |
| Suisse Int'l | Swiss Typefaces | not measured: needs Yahya's test files; price not verified |
| Neue Haas Grotesk Display | Monotype | not measured: needs Yahya's test files; price not verified |

The trial page measures these live once the files sit in `docs/reference/fonts-private/` (git-ignored) or are installed system-wide.

## Winner

Confirmed by Yahya on 2026-11-07 (plan 01-05). Re-measured on 2026-11-07 (plan 01-06) with the committed script: `metrics.py "$S/fonts-src" --faces InstrumentSans --display-weight 700 --yahya-track -0.045 --wdth 75` (Display tracking -0.05em). For the rerun, the WOFF2 was decompressed to `$S/fonts-src/InstrumentSans.ttf`.

- Face: **Instrument Sans**
- File: `docs/reference/fonts/InstrumentSans-wdth-wght.woff2` (one variable file: wdth 75-100, wght 400-700)
- Licence: SIL Open Font License 1.1 (`docs/reference/fonts/OFL-InstrumentSans.txt`), self-hosted, no purchase
- Display weight: 700 (the font's maximum, so there is no 800)
- Width: wdth 75 for YAHYA and the Display words; wdth 100 for body text
- Tracking: YAHYA -0.045em; Display words -0.05em
- Tabular figures: yes, through a real `tnum` feature
- YAHYA shaped advance at wdth 75, weight 700: 2.380 em
- `--yahya-fit`: **2.155** (2.380 + 5 x -0.045)

Poster YAHYA, `min(Gh / 2.155, Hb / 0.76)`:

| Viewport | Poster size | Bound |
|---|---|---|
| 1440x900 | 646px | width-bound |
| 1366x768 | 589px | height-bound |
| 390x844 | 166px | width-bound |

Display-word fit at weight 700, wdth 75, tracking -0.05em:

| Word / slot | Viewport | Width / available | Fits |
|---|---|---|---|
| "Involvement" cols 7-12 | 1366 | 489px / 619px | yes |
| "Involvement" cols 7-12 | 1440 | 516px / 656px | yes |
| "Involvement" cols 6-12 | 1366 | 489px / 726px | yes |
| "Involvement" cols 6-12 | 1440 | 516px / 769px | yes |
| "Achievements" at 64px, 390 phone | 390 | 290px / 322px | yes |
| "Resume (PDF)" cols 1-9 | 1366 | 551px / 940px | yes |
| "Resume (PDF)" cols 1-9 | 1440 | 581px / 996px | yes |
| "75/75" cols 1-7 (tabular-nums) | 1366 | 253px / 726px | yes |

Consequence: "Involvement" fits cols 7-12 at both 1366 and 1440, so the Experience page uses the 6/6 split (Work cols 1-6, Involvement cols 7-12).
