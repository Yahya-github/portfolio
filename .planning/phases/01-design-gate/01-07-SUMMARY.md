---
phase: 01-design-gate
plan: 07
subsystem: design-doc
tags: [design-gate, picks, achievements, cursor, portrait, facturo, bugfix]
requires:
  - "01-03: design doc rev 5 draft"
  - "01-05: font decision (Instrument Sans)"
  - "01-06: v7 approval sketch"
provides:
  - "Design doc rev 5 with every Phase 1 choice filled in (font, Achievements (b) with proof previews, cursor (a), portrait colour hover, Facturo walkthrough, CRC wording)"
  - "v7 showing only the chosen design, with the hero-letter return bug and the cursor-tag overflow fixed"
  - "docs/material/portrait-devfest-2026-color.jpg (same crop as the grey master, stripped)"
  - "REQUIREMENTS CONT-02 rewritten, CONT-10 and CONT-11 added (Phase 6), EXP-03 form recorded, DSGN-05 exception"
affects: [01-08, 03, 05, 06, 07]
tech-stack:
  added: []
  patterns:
    - "Hero FLIP targets measured relative to the sliding track (rect.left - track.left), never from the in-flight on-screen box"
    - "Cursor tag placement: right, above, below, left, first fully inside wins, then clamp 8px inside all edges"
    - "Walkthrough driven by WAAPI: each frame's push-in animation finishing advances the reel, so pause is Animation.pause()"
key-files:
  created:
    - docs/material/portrait-devfest-2026-color.jpg
    - .planning/phases/01-design-gate/01-07-SUMMARY.md
  modified:
    - docs/reference/swiss-horizontal-v7.html
    - docs/superpowers/specs/2026-11-03-portfolio-design.md
    - docs/material/links.md
    - .planning/phases/01-design-gate/check.sh
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
    - .planning/PROJECT.md
decisions:
  - "Achievements is variant (b), a typographic list; each line previews its proof (greyscale photo plus one line) on hover and focus; DIRO and the game competition open their articles; CRC has a photo but no link; CCC has a description only"
  - "Cursor is variant (a), an ink square snapping to letters and links with a Label tag clamped inside the viewport; accent now has four uses, not five"
  - "About portrait crossfades to a true-colour twin on hover, tap or press: the one exception to greyscale photos, not an accent use"
  - "Facturo is a 10-frame walkthrough (push-in plus crossfade, transform/opacity only) with Pause/Previous/Next; a stepper under reduced motion"
  - "CRC wording: 1st robot competition 2026 (matches against other robots), 1st Programming 2025, 2nd Senior Programming 2026"
  - "Game competition proof link is the neomedia.com article (names Atlantis and the André-Grasset team); the cegepvalleyfield.ca post has a 14-word body"
metrics:
  duration: 30 min
  completed: 2026-11-07
  tasks: 3
  files: 9
---

# Phase 1 Plan 07: Phase 1 Picks Recorded Summary

Yahya's v7 picks are applied: Achievements (b) with hover/focus proof previews and article links, cursor (a), a colour-on-hover portrait and a Facturo screenshot walkthrough. The CRC wording is corrected. Both reported v7 bugs are fixed: the hero letters now return when you page back, and the cursor tag stays on screen. The design doc rev 5, REQUIREMENTS, ROADMAP and PROJECT record every Phase 1 choice. Only the approval (plan 08) remains.

## Task 1: Yahya's reply (checkpoint answered through the orchestrator)

Verbatim:

> "ach: b but with articles maybe picture with quick description when hovering over and clicking goes to the article; cursor: a; portrait: maybe passing over with the mouse gives the true colors; wording: It was not robot construction it was robot competition so competting against other robots during the game. Add senior programming okay.; other-facturo: a cinematic go through of the images not just a static image; other-hero-name: there is a bug where when it goes to the left when you come back the letter don't go back to ther place and just disappear; other-links: when you pass over a link there is sometimes text (team website) and it goes out of screen;"

The orchestrator's interpretation, shown to Yahya and implemented here:

1. Achievements is (b). Each line gets a hover/focus preview (small greyscale photo plus one line). Clicking opens the source article in a new tab. DIRO links to the diro.umontreal.ca article. The game competition links to an article, with its team photo. CRC gets the trophies photo and no link, because no article exists. CCC 75/75 gets a description only. On touch the thumbnail is shown inline. Previews stay inside the viewport.
2. Cursor is (a). Variants (b)/(c) and both sketch toggles are removed.
3. The portrait is greyscale and crossfades to true colour on hover, or on a tap on touch; the swap is instant under reduced motion. The colour derivative uses the same crop and has its metadata stripped. Crop "ok" and alt "ok" (unchanged).
4. CRC 2026 is "1st Place, robot competition" and "2nd Place, Senior Programming". CRC 2025 is "1st Place, Programming".
5. Facturo becomes a cinematic walkthrough of the 10 screenshots, with pause, offscreen pause and a reduced-motion stepper.
6. Bug: hero letters disappear after paging back. Fix it and verify at three viewports, including fast back-and-forth.
7. Bug: the cursor tag runs off screen. Clamp or flip it on all four edges.
8. The hero CCC proof line stays as it is; see "Open for 01-08".

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Picks checkpoint | (answered via orchestrator, no commit) | |
| 2a | Colour portrait twin, links.md, SC-4c exception | c119b40 | portrait-devfest-2026-color.jpg, links.md, check.sh |
| 2b | v7: picks applied, both bugs fixed | 1668c18 | swiss-horizontal-v7.html |
| 2c | Design doc rev 5: font, picks, fit results | 47a035d | 2026-11-03-portfolio-design.md |
| 3 | Requirements, roadmap, project | 753d15a | REQUIREMENTS.md, ROADMAP.md, PROJECT.md |

## Bug 1: hero letters vanish on the way back (root cause and fix)

- **Reproduced** in headless Chrome (playwright-core driving /usr/bin/google-chrome) at 1440x900 by pressing ArrowRight twice, then Home. The letters ended at x = -2856, -2603, ... , which is exactly the track's old offset of -2 x 1440.
- **Root cause:** `place(0)` measured `placeholder.getBoundingClientRect()`. The placeholders sit inside the sliding track. When `go(0)` runs, the track has only just been given its new transform, so the measured box still sits where the old page was (or mid-slide). The letters were sent to that off-screen point. Paging forward was unaffected, because the rail slots are `position: fixed`.
- **Fix:** measure the hero targets against the track (`rect.left - track.getBoundingClientRect().left`) and add page 0's resting offset, which is 0.
- **Verified** at 1440x900, 1366x768 and 390x844. Each size was tested three ways: slow keys, wheel, and a fast interrupted sequence (Right, Left after 150ms, Right, Left). In every case the end positions equal the start positions exactly (for example 24,277,560,859,1112 at 1440). An End-then-Home interruption 250ms in was sampled every 120ms, and the letters retarget and settle with no stray positions. I looked at the screenshots: YAHYA is whole at all three sizes.

## Bug 2: cursor tag runs off screen

The tag was always placed to the right of the snapped box. It now tries right, then above (right-aligned), then below, then left. The first spot fully inside the viewport wins, and the result is clamped 8px inside all four edges. Checked on "Team site" (right edge), header "Say hi" (top right), the footer "Next, Experience" (bottom right) and the wide Achievements rows: all INSIDE at 1440 and 1366. The first fix only flipped the tag left, and on the wide Achievements rows it landed on top of the preview photo. That is why "above" was added.

## Other v7 checks (headless Chrome, screenshots viewed)

- Achievements previews show at opacity 1 on hover and on keyboard focus. The last line's preview at 1366x768 is nudged up so its bottom sits at 704 (footer limit 704). Phone shows the thumbnails inline, without the text-only CCC preview or a duplicate CRC photo. Both article links have `target="_blank" rel="noopener"`.
- Reel: advances 01 to 02 after about 5.2s; stays put while hovered for 6.5s; stays put after Pause (button reads "Play"); under `reducedMotion: 'reduce'` there is no advance in 6s, Next steps, and Pause is hidden.
- Portrait: colour layer opacity 1 on hover (1440, 1366); a tap on a 390 touch context sets `aria-pressed="true"` and shows colour.
- Banned patterns from 01-06 all count 0 (Google Fonts, judge, requestAnimationFrame, lerp/spring, italic, weights 200/500/600, medal, contest platform, em dash, phone regex); no `data-variant` or `data-cursor` left; the inline script parses; no page errors (the only console 404 is `/favicon.ico` from the test server).

## Requirement changes

- **CONT-02** is rewritten with the plan's exact (b) wording (D-11). ROADMAP Phase 6 criterion 1 is rewritten too, so "giant static 75/75" now appears 0 times in both files.
- **CONT-10 (new, Phase 6):** Achievements proof previews (hover/focus, inside the viewport, article links, inline on touch, description-only when no proof exists).
- **CONT-11 (new, Phase 6):** the Facturo walkthrough (transform/opacity only, lazy frames, visible pause, pauses on hover/focus/off-page/offscreen, reduced-motion stepper).
- Both are numbered after CONT-09 and fall in the content category. They are mapped to Phase 6, which owns the Achievements and Projects compositions, and added to the Phase 6 requirement list plus a new success criterion 6. Coverage is now 44 of 44.
- **DSGN-05:** adds the portrait colour exception ("never as an accent use"). It stays in Phase 6, because a new ID for one exception would split the photo rule.
- **EXP-03:** now reads "(form: variant a, ... picked in Phase 1)". ROADMAP Phase 5 criterion 2 names form (a) and the tag rule. I also restored a missing full stop there ("...left edge With a mouse").
- **PROJECT.md:** Instrument Sans replaces the Inter Tight row. Rows added for Achievements variant (b), the Facturo walkthrough and the portrait colour hover. The cursor row is updated.

## Font values recorded (design doc 4.1)

Instrument Sans, SIL OFL 1.1, one variable file `InstrumentSans-wdth-wght.woff2`; weights 400 and 700; wdth 75 display / wdth 100 body; YAHYA tracking -0.045em; Display tracking -0.05em; `--yahya-fit` 2.188, not 2.155. The 2.155 formula counted the trailing letter-spacing. Split letters lose kerning, so the YA pair is restored with `margin-right: -0.063em` on both Y's. Poster sizes: 636px at 1440x900 (width), 589px at 1366x768 (height), 164px at 390x844 (width). "Involvement" fits cols 7-12, so Experience is now 6/6 in the doc, matching v7.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] SC-4c would fail on the requested colour portrait**
- **Found during:** Task 2 (colour twin)
- **Issue:** SC-4c required every `docs/material/portrait*.jpg` to be Gray. The orchestrator asked for `portrait-devfest-2026-color.jpg`.
- **Fix:** `*-color.jpg` is now the single documented exception in check.sh. It must still carry no Make/Model/Software/SerialNumber tags, and the GPS scan still covers every file.
- **Commit:** c119b40

**2. [Rule 1 - Bug] Hero letters and cursor tag** (see the two bug sections above). Commit 1668c18.

**3. [Rule 1 - Bug] Reel frame snap-back**
- **Issue:** cancelling the outgoing frame's push-in at the start of the crossfade would snap it back to scale 1 mid-fade.
- **Fix:** the old animation is cancelled after the fade (1s).
- **Commit:** 1668c18

### Interpretation choices (for Yahya at 01-08)

- The toggles are removed rather than kept "for the record". The plan does not ask to keep them, and v7 should show the chosen design. The losing variants are listed in the doc's Retired appendix.
- I chose the game-competition article from neomedia.com because it names Atlantis and the André-Grasset team. The cegepvalleyfield.ca post has a 14-word body.
- The CRC lines are focusable (`tabindex="0"`) so keyboard users can see the photo preview, although they are not links.
- I removed accent slot 5 (it was reserved for cursor (b)), so the accent now has four uses.
- Preview captions are short labels drawn from the material only: "The winners with their certificates", "The Atlantis team at Cégep de Valleyfield", "The team with its 2026 trophies", and the source domain or "Photo, CRC 2026". The CCC preview reads "75 of 75 points / Canadian Computing Competition 2026". Final copy is Phase 7.
- CRC detail line on Achievements: "Matches against the other teams' robots, 2026". This is drawn from Yahya's own sentence.

## Open for 01-08

1. **Hero proof line vs "CCC not the main thing":** the Index still reads "Perfect score, 75/75, at the 2026 Canadian Computing Competition." This conflicts with Yahya's earlier statement that CCC should not be the main thing. Not changed here. Ask: keep, replace (for example with a DIRO or Facturo fact), or drop. It is listed as design doc section 10 item 14.
2. **Resume PDF category:** resume-public.pdf's project line "1st Place | Sep 2025 - Feb 2026" should name the category (robot competition). This is Phase 7 copy; the PDF was not edited. Listed as section 10 item 15.
3. **Atlantis material waiver:** accept at approval (section 10 item 13; the waiver line was copied verbatim into section 9).
4. The rest of section 10 is still open: CCC "top 1" scope, Atlantis line counts, Showdown AI status, domain, robot CAD, Atlantis licences and consent, Experience role titles, and skill/CLAUDE.md updates after approval.

## Known Stubs

- "Read the deep dive" still points to `#facturo` (sketch only; the real route is `/projects/facturo/`).
- Atlantis still has no imagery (waiver).

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: outbound-links | docs/reference/swiss-horizontal-v7.html | Two new external article links (diro.umontreal.ca, neomedia.com), `target="_blank" rel="noopener"` |
| threat_flag: new-photo | docs/material/portrait-devfest-2026-color.jpg | Colour portrait in the public repo. Same crop as the grey master Yahya approved ("portrait: ok"); metadata stripped. The colour may make the lanyard badge easier to read than in greyscale (T-1-14). Yahya should glance at the badge at 01-08. |

## Verification

- `bash .planning/phases/01-design-gate/check.sh`: every row PASS except SC-1c (approval, plan 08).
- Task 2 acceptance: `Final family: ` 1; numeric `--yahya-fit`; "poster device" 6; `Form open|Choice open|Trial status: open` 0; `APPROVED` 0; em dash 0.
- Task 3 acceptance: REQ-edits PASS; `form: variant a` 1; "giant static 75/75" 0 in REQUIREMENTS and ROADMAP; "final font still open" 0; "Achievements layout variant" present.

## Self-Check: PASSED

- FOUND: docs/material/portrait-devfest-2026-color.jpg, docs/reference/swiss-horizontal-v7.html
- FOUND commits: c119b40, 1668c18, 47a035d, 753d15a
