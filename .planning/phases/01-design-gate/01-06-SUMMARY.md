---
phase: 01-design-gate
plan: 06
subsystem: design-reference
tags: [design-gate, v7-sketch, font, cursor, achievements-variant]
requires:
  - "01-01: committed v6 reference"
  - "01-03: design doc rev 5 draft"
  - "01-04: material (portrait, resume, Facturo screenshots, links.md)"
  - "01-05: confirmed font Instrument Sans 700, wdth 75, -0.045em"
provides:
  - "docs/reference/swiss-horizontal-v7.html: six-page approval sketch in Instrument Sans with Achievements (a)/(b) and cursor (a)/(b)/(c) toggles"
  - "docs/reference/font-metrics.md ## Winner: Instrument Sans numbers plus the ink-accurate --yahya-fit 2.188 correction"
affects: [01-07, 01-08]
tech-stack:
  added: []
  patterns:
    - "Poster size in pure CSS: min((100vw - 2*margin) / --yahya-fit, (100svh - 320px) / 0.76)"
    - "Split hero letters get the font's YA kern pair back by hand (margin-right -0.063em on each Y)"
    - "Cursor layer: position written 1:1 in pointermove, only shape (opacity/scale) animates"
key-files:
  created:
    - docs/reference/swiss-horizontal-v7.html
    - .planning/phases/01-design-gate/01-06-SUMMARY.md
  modified:
    - docs/reference/font-metrics.md
decisions:
  - "--yahya-fit for Instrument Sans is 2.188 (ink-accurate), not the script's 2.155: CSS adds letter-spacing after the last A too, so advance + 5 x tracking overshoots the grid edge by about 21px at 1440"
  - "Hero letters stay separate elements (links + FLIP), so the YA kern pair (-0.063em) is restored with margin-right on both Y's"
  - "Experience uses the 6/6 split: Involvement fits cols 7-12 at 1366 and 1440 (489/619px, 516/656px)"
  - "Current rail section name is set vertically inside the rail column, so it never overlaps page content; the hover name sits to the right on a ground patch"
  - "Phone Index: per-letter captions replaced by a stacked 44px section list under the role lines, because the captions collide at 390px"
metrics:
  duration: 13 min
  completed: 2026-11-07
  tasks: 3
  files: 2
---

# Phase 1 Plan 06: v7 Approval Sketch Summary

`swiss-horizontal-v7.html` shows all six compositions in self-hosted Instrument Sans (700, wdth 75 for display, wdth 100 for body). It uses the real portrait, a Facturo screenshot and only verified copy. The sketch has an Achievements (a)/(b) toggle, three cursor variants that sit exactly on the pointer, and the Winner numbers in `font-metrics.md`. While rendering I found and corrected the `--yahya-fit` value.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Record the winner; v7 base (tokens, font, type roles, motion, header, footer, retired parts removed) | 155c455 | font-metrics.md, swiss-horizontal-v7.html |
| 2 | Pages 01-05, Achievements (a)/(b) toggle, Say hi copy behaviour | 85be7f0 | swiss-horizontal-v7.html |
| 3 | Index poster, rail and paging, skip link, three cursor variants; render fixes | 68d3f44 | swiss-horizontal-v7.html, font-metrics.md |

## What v7 contains

- **Font:** one `@font-face` for `fonts/InstrumentSans-wdth-wght.woff2` (weight range 400-700, stretch 75-100%). Only weights 400 and 700 are used. YAHYA and Display use `font-stretch: 75%`; body uses 100%. There is no Google Fonts link.
- **Tokens:** the UI-SPEC names (`--color-*`, `--grid-*`, `--frame-*`, `--hero-bottom-gap`, `--dur-*`, `--ease-*`, `--yahya-fit`, `--yahya-track`). Under reduced motion, every `--dur-*` and the 30ms letter stagger become 0ms.
- **Frame:** a fixed 72px header (name; current section in dim; a sketch toggle row with "Sketch only: toggles are not part of the site"; Resume (PDF) and Say hi). A fixed 56px footer (tabular `00 / 05` counter; "Next, {Section}" or "Back to the start"; a 2px progress bar).
- **00 Index:** role line and proof line in cols 1-4; meta labels three-up in cols 7-12. The Poster YAHYA is sized in CSS and sits 96px above the footer, with captions underneath. The word stays hidden until `document.fonts.load()` finishes (300ms cap).
- **01 Achievements:** `data-variant="a"` by default. (a) has the Label plus the accent `75/75` at 32% from the top in cols 1-7, and a ruled list of the four first places in cols 8-12. (b) has the title in Display, then five unruled lines on a subgrid in cols 3-12, the first being the accent 75/75. Switch with the header buttons or the V key.
- **02 Projects:** `facturo-01-accueil-grey.png`, hard-cropped across cols 1-8, then "Facturo" in Display, problem and result lines, and "Read the deep dive" (`#facturo`). Cols 9-12 hold four ruled compact rows: Atlantis (Code link), CRC problems, Robot firmware (Team site), and Showdown AI ("In progress, nothing built yet").
- **03 Experience:** a 6/6 ruled table; Work rows carry years.
- **04 About:** the portrait in cols 1-4 at full height (`object-position: 52% 10%`), "Two habits" in Display, and the lead plus the v6 paragraph in cols 8-12 at the bottom.
- **05 Say hi:** four Display lines. Email copies `yahya.hallani.email@gmail.com` (from links.md). The address label stays a `mailto:` link inside an `aria-live="polite"` line and uses the locked success and error copy (4s reset).
- **Rail and paging:** the letters move between the hero and the rail by transform only (600ms, 30ms stagger). The current letter is in the accent with `aria-current="page"`. Wheel, key and swipe paging come from v6; swipes that start within 20px of the left edge are ignored, and vertical swipes do not page while a page scrolls. Inactive pages are `inert`. A skip link and a live region ("{Section}, page n of 6") are included.
- **Cursor:** `data-cursor="a|b|c"` on `<html>`, switched with the C key or the header buttons. (a) is a 1px ink square that snaps to the hovered element's box plus 4px, with a Label tag and a 2px dot on the pointer. (b) is a 1px accent crosshair whose 20px arms scale to 32px. (c) keeps the native cursor and adds a context tag 12px from the pointer over the letters. The cursor layer is hidden under `(hover: none), (pointer: coarse)` and `forced-colors: active`. `cursor: none` applies only to (a) and (b) with a fine pointer.

## Visual check (headless Chrome over HTTP, 1440x900, 1366x768, 390x844)

All six pages, plus Achievements (b) at all three sizes, were rendered and looked at. Defects found and fixed:

1. **YAHYA ran past the right edge at every size.** The five letters are separate elements, so Chrome skips kerning between them (2.506em instead of 2.380em; HarfBuzz and a Chrome probe agree). Fix: put the font's YA kern pair (-0.063em) back on both Y's.
2. **The last A's ink still overshot the grid by about 21px at 1440.** The formula `advance + 5 x tracking` counts the trailing letter-spacing after the last A, which is not ink. Fix: use the ink-accurate `--yahya-fit: 2.188` (poster 636px at 1440x900, 589px at 1366x768, 164px at 390x844). The A now ends exactly on the 1416px grid edge. Recorded under "Correction found in the v7 render" in font-metrics.md.
3. **Phone:** the header wrapped into four lines and clipped the toggle row (fixed with a two-row flex header). Scrolled content showed through the transparent footer (the footer now has the ground). Hero captions collided (replaced on phone by a stacked list with 44px targets). In (b) the rank ran into the result ("1stDIRO"; the rank is now its own line). Say hi lines were pushed right (fixed alignment).
4. Buttons did not inherit the Label uppercase, because browsers reset `text-transform` on buttons. Fixed with `text-transform: inherit`.

Behaviour was also checked with a synthetic-event probe. The cursor layer gets `translate3d(300px, 200px, 0)` from pointermove. The (a) box snaps to the letter's box plus 4px with the tag "01 Achievements". C cycles a, b, c. V switches the variant. ArrowRight goes to page 1 and updates `inert`, `aria-current`, the header and the live region.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `--yahya-fit` 2.155 overshoots the grid; v7 uses 2.188**
- **Found during:** Task 3 render check
- **Issue:** the trailing letter-spacing is counted as ink, and split letters lose kerning.
- **Fix:** restored the YA kern pair by hand and set the ink-accurate constant. Kept the 01-05 measured values in the Winner section and appended a correction subsection with the new poster sizes.
- **Files modified:** docs/reference/swiss-horizontal-v7.html, docs/reference/font-metrics.md
- **Commit:** 68d3f44

**2. [Rule 1 - Bug] Phone layout defects (header, footer show-through, caption collision, (b) rank, Say hi alignment) and button text-transform**
- **Found during:** Task 2 and 3 render checks
- **Fix:** see "Visual check" above.
- **Commits:** 85be7f0, 68d3f44

### Interpretation choices (for Yahya to judge at 01-07)

- **Current rail name:** UI-SPEC puts the current section's name to the right of its letter. On these layouts it would sit over the page content (Facturo screenshot, "Work", the portrait), so v7 sets it vertically in the rail column below the letters. Hover and focus names still appear to the right, on a ground patch.
- **Rail top** sits at `--frame-top + 24px`, in line with the page content, not flush with the header rule.
- **Phone rail inset** is 24px, following design doc Decision 3, not the plan's `--grid-margin` (16px).
- **Achievements (b) on phone keeps the Display title**, because "Achievements" fits at 64px in Instrument Sans wdth 75 (290/322px). The plan's "drops to Heading" applied only to faces that overflow.
- **Plan file name `facturo-01-grey.png`** did not exist; the real file is `facturo-01-accueil-grey.png`. The dark-theme `facturo-07-accueil-sombre-grey.png` is an alternative if the light screenshot feels too bright on the black ground.
- **Portrait crop:** with a landscape source (1512x1240) in a portrait column, `object-fit: cover` shows head to waist. Cropping head to mid-chest would need a scaled-up crop, which is for Yahya to decide.
- **Hero at 1366x768** is height-bound. The role block (3 Body lines) ends about 12px above the YAHYA cap line. This is inside the 96px budget, but it is tight.
- **No proof links on Achievements** (the plan does not list them). links.md has article links for DIRO and the game competition if Yahya wants the others to look more provable than CCC.

## Known Stubs

- `Read the deep dive` points to `#facturo` (sketch only, as the plan says; the real route is `/projects/facturo/`).
- No Atlantis imagery: screenshots are still "to capture" (links.md waiver). The sketch shows Atlantis as a text row only and invents no image.

## Threat Flags

None. No new surface: the only contact data is the email, LinkedIn and GitHub from links.md (the phone regex finds 0 matches), and clipboard access is write-only on a user click (T-1-13 accepted).

## Verification

- Task 1, 2 and 3 automated verify commands: all OK. Every acceptance grep: present strings found, banned patterns count 0 (Google Fonts, overshoot, judge, dots, requestAnimationFrame, example.com, weights 200/500/600, italic, ranked first/medal/contest platform/lines of, phone pattern, lerp/spring).
- `bash .planning/phases/01-design-gate/check.sh SC-2c SC-3d`: PASS SC-2c, PASS SC-3d.
- Inline scripts parse (`new Function`).

## Self-Check: PASSED

- FOUND: docs/reference/swiss-horizontal-v7.html
- FOUND: docs/reference/font-metrics.md (## Winner)
- FOUND: 155c455, 85be7f0, 68d3f44
