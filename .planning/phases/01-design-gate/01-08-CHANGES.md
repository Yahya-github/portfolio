# Plan 01-08: Yahya's review changes

Plan 01-08 Task 2 (the approval checkpoint) came back with a change list, not an approval. Each round is recorded here. The design doc Status line is still DRAFT; no APPROVED line was written (D-25).

## Change round 1 (2026-11-07)

### Yahya's reply (verbatim)

> "hero-name: the letters hitbox take the whole screen; ccc-line: drop; lanyard: I don't mind it being readable, it google developper group so it can even be a plus; facturo-showcase: the video doesn't really work sometimes it freezes when you pass and remove your cursor and center the phone image; achievements-images: for the robot competition win, put the club of the year picture because it was thanks to that we won; side-letters: sometimes a letter stays green even when switching into another page so it becomes 2 letters turned green; images-involvement: Robotics [Image #7], GDG [Image #8], ICPC [Image #9], Mercor [Image #10], CRC (https://robo-crc.ca/crc-mark-poly.svg), Facturo (take it from the repo)"

### What was done

| # | Item | Status | Commits |
|---|------|--------|---------|
| 1 | hero-name: letter hit area | Fixed | 8823369, 33fc7d5 |
| 2 | ccc-line: drop | Done | 932dc1f, 922841b |
| 3 | lanyard: readable is fine | Accepted, recorded in the doc (About), no change | 922841b |
| 4 | facturo-showcase: freeze + centre the phone image | Fixed | b07d127 |
| 5 | achievements-images: Club of the Year for the robot competition win | Done | 932dc1f |
| 6 | side-letters: two green letters | Fixed | cd6475f |
| 7 | images-involvement: logos | Done | 0e3528c, 35f1c3c |
| - | Requirements, roadmap, project follow the changes | Done | 1cae472 |
| - | Design doc records round 1 | Done | 922841b |

**1. Hero letters hit area (bug).**
- **Root cause:** the five letters are text inside absolutely positioned links. Chrome hit-tests text against the font's full content area (ascent plus descent, about 1.2em), not the `line-height: 0.76` box. At 1440x900 each letter's box was y 265-748, but it caught the pointer from y=117 to y=893. Together the five letters covered 82% of the viewport, including the intro line, and they also covered the captions under YAHYA.
- **Fix:** the link takes no pointer events. A `::before` that fills its box takes them instead, and it scales with the letter into the rail. In rail mode, `place()` grows that pseudo-element to the rail item: the rail column minus 8px, plus half the gap above and below. With the box-only fix, a rail letter would otherwise have shrunk to 14x23px.
- **Verified** with elementFromPoint sampling on a 20px grid and on 1px columns. At 1440 the hit range is now y 264-747 (box 265-748), and the Index letters cover 50.4% at 1440, 51.5% at 1366 and 12.6% at 390, which is exactly their boxes. Above the letters, the point at (150,120) is now the intro, not a letter. Rail items run x 24-70, about 30px tall each, contiguous from y 92 to 244, and nothing outside the rail column hits a letter. The 01-07 paging-back test (slow, fast and wheel at 1440 and 390) still lands every letter exactly back on its start position.

**2. CCC line.** "Perfect score, 75/75, at the 2026 Canadian Computing Competition." is removed from the Index. Nothing replaces it: the top left holds the role line "Software Engineering at McGill" alone, balanced by the three meta labels on the right (screenshots checked at 1440, 1366 and 390). The design doc Index composition, open item 14 (settled: dropped) and the Retired appendix record it. CONT-01, ROADMAP Phase 2 criterion 2 and PROJECT.md now say "role line" only. The 75/75 Achievements line is unchanged.

**3. Lanyard.** Accepted as readable. The doc's About content line now records "it is the Google Developer Group, it can even be a plus". The portrait files are unchanged.

**4. Facturo walkthrough.**
- **(a) Freeze root cause:** hover and focus shared one `hovering` flag, and `pointerleave` set it to `lead.contains(document.activeElement)`. A mouse click on Pause, Play, Previous or Next leaves focus on that button. So after any click, leaving with the pointer kept the flag true, and the reel stayed paused until focus moved somewhere else. Reproduced with real Playwright pointer input: "mouse click Next then leave" FROZEN, and "Pause, Play, leave" FROZEN.
- **Fix:** pointer and keyboard focus are separate inputs. Only focus-visible inside the block holds the pause, so a mouse-focused button does not. `running()` is the single source of truth, `reelSync()` applies it, and each input only updates its own flag. One clock drives the reel, the current frame's push-in animation. A replaced frame's animation loses its `onfinish`, so a Next click late in a frame cannot also let the old frame advance (no double step). Stale decodes are dropped with a sequence number. Leaving Projects forgets the pointer, and key presses re-sync the focus state. Resume continues the same frame where it stopped (`Animation.play()`).
- **(b) Phone image:** portrait frames are now detected from their width/height attributes, not a hand-set class. They are shown whole (`object-fit: contain`) and centred (`object-position: 50% 50%`), and their push-in is a plain `scale(1.06)` around the centre. Frames 1-8 and 10 are 1440x900 and stay as before (cover, top-left, small pan). Frame 9 (390x844) is the only portrait frame.
- **Verified** with real input (Playwright, Chrome), every case PASS:
  - rapid hover in/out 40 times, then away: advances
  - hovering holds the frame for 6.5s
  - leaving resumes
  - mouse clicks Next/Prev/Next, then leave: advances
  - Pause holds after leaving; Play, then leave: advances
  - hover in/out six times during a crossfade: advances
  - keyboard focus on a control holds; Tab out of the block: resumes
  - hover, page away by key, back, pointer elsewhere: advances
  - hover, wheel away, key back, move away: advances
  - tab hidden holds; tab visible resumes
  - Next clicked 4.95s into a 5.2s frame: exactly one step, stable for 3s
  - 30s of auto-play steps 03 to 09 in order
- **Phone frame position**, content midpoint against reel midpoint, all centred: 441 of 882 at 1440, 416.5 of 833 at 1366, 160.5 of 321 at 390. A mid-push screenshot shows it still centred.

**5. Achievements preview.**
- The CRC robot competition line now previews `photos/club-of-the-year-award-grey.jpg`, captioned "Our school's Club of the Year" / "Photo, Collège André-Grasset". Alt text: "The team on stage with its school's Club of the Year award". The caption is drawn from Yahya's own intake wording ("Winning our school Club of the Year") and from links.md.
- The CRC programming line keeps the trophies photo. Choice: the two CRC lines now show two different photos, so the second one is no longer a duplicate. It gets real alt text and now also shows inline on phones (it was hidden there as a repeat). Keeping the trophies on the programming line ties that result to its 2026 trophy (2nd, Senior Programming), and nothing looks doubled.
- Checked hovering at 1440 and 1366: both previews show inside the viewport, and the last one is nudged up to stop at 704 at 1366. At 390 the two different thumbnails show inline.

**6. Rail letters.**
- **Root cause:** the CSS gave the accent to `.fly a:hover`, `.fly a:focus-visible` and `[aria-current]` alike. A letter stayed green on a page change in three cases:
  - (A) a letter clicked with the mouse keeps focus, and the next key press (an arrow key to page) makes it `:focus-visible` (letters 3 and 4 green);
  - (B) the pointer rests where a rail letter is, so it keeps `:hover` after a wheel page change (letters 1 and 3);
  - (C) both at once after fast key paging (letters 1, 3 and 5).
  The rail names also showed on any focus, including a mouse click, and stayed after paging.
- **Fix:** a rail letter's accent comes from `aria-current` only, which `go()` derives from the page index. Hover and focus never colour a rail letter. On the rail, hover shows as the cursor box and keyboard focus as an ink ring (`outline-color: ink`). On the Index no letter is current, so hover (fine pointer only) and focus keep the usual accent there. Rail names follow `:focus-visible` through CSS `:has()`, so they cannot go stale.
- **Verified:** one green letter, the current one, in cases A, B and C; after taps on touch (390); and after paging away from a keyboard-focused letter, which shows an ink ring and only its own name. Index hover is still the accent. In the final sweep at all three sizes, exactly 1 letter is green on page 05.

**7. Involvement logos.**
- Files in `docs/material/logos/`. Each organisation has a source lockup, a mark in brand colours and a mono twin. PNGs are trimmed, transparent and stripped (only structural PNG fields remain). SVGs were inspected: no script, link, import, `url()`, foreignObject or event attribute.
  - McGill Robotics: robot-arm "M", cut from Yahya's pasted lockup on its dark ground.
  - GDG: chevron mark. The alpha comes from colour saturation, so the white ground, the grey fringe and the black outline drop out.
  - ICPC: the three-square mark. In the mono twin the white line drawings are knocked out.
  - Mercor: the "M" ribbon.
  - CRC: from robo-crc.ca/crc-mark-poly.svg, with the viewBox tightened. The mono twin has every fill and stroke set to one grey.
  - Facturo: the facturo-demo repo's `logo.svg` as the source and its `favicon.svg` geometry as the mark. The repo's dark-scheme colours are fixed in, and the mono twin cuts the fold out with a mask.
- Every file is in the links.md inventory with its source ("Image pasted by Yahya" or the URL) and treatment.
- Treatment (Claude's recommendation, recorded as such in the doc; Yahya may override):
  - marks only, not the full lockups, because a wordmark at 28px is unreadable;
  - 28px tall, vertically centred in the row, right edge on the column's right edge (col 6 for Work, col 12 for Involvement);
  - dim grey `#8e8e8e` by default, from pre-made mono files (not a CSS filter, consistent with the photo rule);
  - brand colours crossfade in (400ms) on row hover with a fine pointer, or on a tap on touch (a second tap hides them), instantly under reduced motion;
  - decorative, with empty alt, because the text names the organisation;
  - not an accent use.
  I chose dim over ink so the marks sit with the dim organisation line and stay far below the Display heads. In ink, McGill Robotics' white mark would also not change at all on hover.
- Rows with a mark: Mercor, Facturo, CRC 2027 (Work); McGill Robotics, Google Developer Group at McGill, McGill Compete / ICPC NENA (Involvement). Freelance has none. Every logo matched an entry that already existed, so no entry or claim was added.
- Doc updated in four places: Experience composition, the photo rule (two hover-colour exceptions: the portrait and the marks), the no-ornament rule (marks are content) and the material table. Requirements: DSGN-05 and DSGN-06 updated, and CONT-12 (new, Phase 6) added; coverage is 45/45.
- check.sh needed no change. SC-4c checks greyscale only on `portrait*.jpg` and scans GPS across `docs/material` (none found). There is no raw-hex rule.
- Checked at 1440, 1366 and 390: all six marks load and sit 28px tall, 0px from the column edge. Hovering rows 0, 4 and 5 shows colour (opacity 1), and a tap on touch shows colour.

### Verification

- `bash .planning/phases/01-design-gate/check.sh`: 18 PASS and 1 FAIL. SC-1c fails because the doc is not approved, as expected:
  `PASS SC-1a, PASS SC-1b, FAIL SC-1c, PASS SC-2a, PASS SC-2b, PASS SC-2c, PASS SC-3a, PASS SC-3b, PASS SC-3c, PASS SC-3d, PASS SC-4a, PASS SC-4b, PASS SC-4c, PASS SC-4d, PASS SC-4e, PASS SC-4f, PASS SC-5a, PASS SC-5b, PASS REQ-edits`
- Design doc: 0 em dashes; the Status line still reads DRAFT.
- v7: the inline script parses; no page errors at 1440x900, 1366x768 or 390x844. All six pages were screenshotted and looked at for each size.
- v7 banned patterns from 01-06 all count 0: Google Fonts, judge, requestAnimationFrame, lerp, spring, italic, weights 200/500/600, medal, em dash, phone regex.
- Not edited: `01-UI-SPEC.md` still describes "role line + proof line" on the Index. The design doc overrides it where they disagree, and Phase 3 should read the doc.

### Needs Yahya

1. **Club of the Year caption:** "Our school's Club of the Year" / "Photo, Collège André-Grasset", alt "The team on stage with its school's Club of the Year award". Is that the right wording, and was the award given to the robotics club (the team) at Collège André-Grasset?
2. **Logo treatment:** keep dim mono with brand colours on hover or tap? Or would you rather have ink mono, always colour, or full lockups instead of the marks?
3. **Facturo's brand green** (`#4ea672`) is close to the site accent (`#5fae84`). On hover the Facturo mark turns that green, which could read as a second accent. Keep it, or keep the Facturo mark mono only?
4. **ICPC row:** the entry is "McGill Compete, ICPC NENA" and the mark is ICPC's (the three squares). Is the ICPC mark right for that row, or would you rather have McGill Compete's own logo (none supplied)? At 28px the squares' line drawings are small; the "icpc" letters are the alternative.
5. **GDG:** the mark is the generic Google Developer Groups chevron, not a "GDG on Campus McGill" chapter lockup. OK?
6. **Rail hit size (build note, no answer needed now):** rail items are about 46x30px on desktop, which meets WCAG 2.5.8 (24x24). The doc's "44x44" target holds on touch in height (28px gap) but not in width (36px rail column on phones). Phase 5 sizes this.
