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

## Change round 2 (2026-11-07)

### Yahya's reply (verbatim)

> "club-of-the-year: https://www.instagram.com/p/DYPS2bGOAQy/; trophies-photo: https://www.instagram.com/p/DWmZr18kTA3/?img_index=1; facturo-showcase: the hitbox of the showcase is too big that's why it was stopping for no reason; design-inspo: https://www.behance.net/gallery/192265061/Swiss-Typography-Wallpaper-Pack/modules/1087550045, https://www.behance.net/gallery/239485669/Modern-Swiss-Typography-Poster-System-Exploratio, https://www.behance.net/gallery/221014645/50-Swiss-Style-Posters/modules/1260764327, [Image #11], grid guide https://swissgrid.posterhouse.org/; facturo-showcase-color: when going over the showcase it stops like usually but also shows color;"

Follow-up (verbatim, relayed by the orchestrator):

> "achievements: photo preview with color preferably and clicking doesn't make the photo stay;"

### What was done

| # | Item | Status | Commits |
|---|------|--------|---------|
| 1 | club-of-the-year / trophies-photo: Instagram links on the two CRC lines | Done | 59efe77 |
| 2 | facturo-showcase: pause area too big | Fixed | 9ca7f32 |
| 3 | facturo-showcase-color: colour while paused | Done | a4b863f |
| 4 | design-inspo and grid guide | Recorded verbatim, pending discussion (no redesign) | 3ded714 |
| 5 | Unanswered round-1 questions | Defaults applied and recorded | 3ded714 |
| 6 | achievements: colour preview photos | Done | c623e9b |
| 7 | achievements: clicked line keeps its photo | Fixed | c623e9b |

**1. CRC lines link to the posts.**
- The robot competition line (Club of the Year photo) links to https://www.instagram.com/p/DYPS2bGOAQy/. The programming line (trophies photo) links to https://www.instagram.com/p/DWmZr18kTA3/. The `?img_index=1` query was dropped because it only picks the first image of the post.
- Both lines behave like the DIRO and game lines: `target="_blank" rel="noopener"`, cursor tag "See the post", and the preview source line now reads "Post, instagram.com".
- links.md proof table: both URLs answered 200 with no redirect to a plain request, recorded as such. Instagram gates post content from scripts, so the post body was not read and the account name is not known. Fetching the preview metadata with a crawler user agent was refused by the tool permission system, and that was not pursued.
- Doc: "both CRC lines are not links" is replaced. Only the CCC line is not a link now. CONT-10 says "public source (an article or a post)".

**2. Facturo pause area.**
- **Root cause:** `pointerenter` and `pointerleave` were on `.proj .lead`, the whole cols 1-8 block: the frame, the controls, the "Facturo" heading, the two lines, the deep-dive link and the block's bottom padding. At 1440 that block is 882x748px (x 80-962, y 96-844), but the frame is 882x426px (y 96-522). With real Playwright pointer moves, before the fix the reel paused 2px below the frame, on the heading (120,602), on the paragraph (180,784) and in the bottom padding (480,840). It behaved the same at 1366 (block y 96-712, frame y 96-396).
- **Fix:** hover is a geometry test against the visible frame. For landscape frames that is the reel box. For the portrait phone frame (`object-fit: contain`) it is the centred picture at its current push-in scale, clipped to the reel. The test also runs when a frame changes under a still pointer. The three control buttons each count as hover too. Keyboard pause is limited to the frame and the controls.
- **Verified** with real pointer moves at 1440x900, 1366x768 and 390x844 (57 probes, 0 wrong):
  - Inside the frame, at its centre and 3px in from two opposite corners: paused.
  - 2px outside on all four sides: running.
  - Heading, paragraph, bottom padding, the gap between Pause and Previous, and the counter text: running.
  - Next button: paused.
  - Phone frame: on the picture, paused. 14px beside it on either side (clear of the 1.06 push-in) and in the empty reel corner: running.

**3. Facturo colour.**
- Each frame is now a `.fr` holding its grey picture and a colour twin `img.c`. The twin's `data-src` is `screenshots/facturo-NN-*.png`. All 10 twins exist, have the same size as their grey files, and hold only IHDR/IDAT/IEND chunks. They load on demand: the current frame and its neighbours.
- One condition, `engaged()`, drives both pause and colour, so they cannot disagree. It is true for:
  - the pointer on the visible frame or on a control;
  - keyboard `:focus-visible` on the frame or a control (the frame is now `tabindex="0"`, and a mouse click does not focus it);
  - a tap on the frame on touch, released by a second tap; swipes are ignored.
- Previous and Next while engaged wait for the new frame's colour, so it arrives in colour. Leaving returns to grey and resumes. Paging away clears the state. Under reduced motion the swap is instant (`transition: none`).
- Doc: the Facturo screenshots join the portrait and logos as colour exceptions, not accent uses. Facturo's brand green inside the screenshots is content. DSGN-05 and CONT-11 updated.
- **Verified** with real input, 21/21 PASS:
  - rest grey; hover shows colour (`facturo-01-accueil.png`) and pauses; unhover goes grey and runs;
  - hovering Next shows colour; clicking Next shows the new frame (02) in colour, paused; Prev twice gives frame 10 in colour;
  - leaving the controls goes grey; hover then page away clears colour; back with the pointer elsewhere stays grey and running;
  - keyboard focus on the frame gives colour and pause; Tab to Pause stays in colour; Tab out to "Read the deep dive" goes grey and runs;
  - a mouse click does not focus the frame;
  - phone frame: beside the picture grey and running, on it colour;
  - touch tap: colour and pause; second tap: grey and running;
  - reduced motion: instant colour (`0s`), Next then back on the frame shows colour, unhover goes grey;
  - no page errors.

**4. Design inspiration and grid guide (pending discussion).** Recorded verbatim in the design doc, new section 3.1 References. Nothing was redesigned.
- https://www.behance.net/gallery/192265061/Swiss-Typography-Wallpaper-Pack/modules/1087550045
- https://www.behance.net/gallery/239485669/Modern-Swiss-Typography-Poster-System-Exploratio
- https://www.behance.net/gallery/221014645/50-Swiss-Style-Posters/modules/1260764327
- [Image #11] (pasted in chat, not saved to the repo)
- Grid guide: https://swissgrid.posterhouse.org/

**5. Defaults for the unanswered round-1 questions** (recorded in the doc's Experience section as defaults, which Yahya may still override):
- Logos: dim grey mono, brand colours on hover or tap.
- The Facturo mark keeps its brand green on hover. It is content, not the accent.
- The ICPC three-square mark stays on the McGill Compete / ICPC NENA row.
- The generic GDG chevron stays.
- Round-1 question 1 (the Club of the Year caption wording) is still open. The source line of that caption is now "Post, instagram.com".

**6. Colour preview photos.**
- The hover and focus preview loads the colour original through `<picture><source media="(hover: hover) and (min-width: 821px)" srcset="<name>.jpg">`. The grey `<img>` stays as the fallback, so each context fetches one file.
- All four colour files exist (`diro-hackathon-2026-award.jpg`, `game-competition-2026-team.jpg`, `club-of-the-year-award.jpg`, `crc-2026-trophies.jpg`). Each matches its grey twin's size, and exiftool finds no EXIF, XMP, IPTC, GPS, ICC or comment metadata (JFIF header only).
- **Choice on touch and phones:** the inline thumbnails stay greyscale. They are on screen at rest under each line and there is no hover moment, so colour there would break "photos are greyscale at rest". Every other colour exception (portrait, marks, Facturo) is grey at rest and colour on interaction. In the 390 screenshot the grey thumbnails sit well with the list.
- Doc: the previews are the fourth colour exception ("anything on screen at rest stays greyscale"). CONT-10 and DSGN-05 updated.

**7. Clicked line keeps its photo.**
- **Root cause:** the same family as the round-1 freeze. The CSS showed the preview on `li:focus-within`. A link clicked with the mouse keeps focus while its source opens in a new tab, so after coming back and moving away the photo stayed. Reproduced on the pre-fix file with real input: "line 1 clicked, back, pointer moved away: shown=1" and the same for line 3. The CCC line (a focusable div) had the same problem after a mouse click.
- **Fix:** the preview shows on `:hover` or `li:has(.row:focus-visible)` only. Window `blur` and `visibilitychange` also add `.quiet` to the page, which hides hover-only previews (desktop only) until the pointer really moves again or leaves the page, so a stale `:hover` on return does not bring the photo back.
- **Verified** with real input, 17/17 PASS:
  - hover on lines 1-4 shows the colour photo;
  - line 1 and line 3 are clicked (a new tab opens, stubbed), then the test switches back. With the pointer resting on the line after a blur: hidden. A real move over it: shown. Pointer moved away: hidden, even though focus is still on the link. Hovering again: shown;
  - the CCC line clicked then left: hidden;
  - keyboard focus on line 1 and Tab to lines 2 and 3 show each preview (in colour);
  - on a 390 touch phone the inline thumbnails are visible and grey.
  - Headless Chrome does not blur the opener when the new tab opens, so the test sends the blur a real browser sends.

### Verification

- `bash .planning/phases/01-design-gate/check.sh`: 18 PASS and 1 FAIL. SC-1c fails because the doc is not approved, as expected:
  `PASS SC-1a, PASS SC-1b, FAIL SC-1c, PASS SC-2a, PASS SC-2b, PASS SC-2c, PASS SC-3a, PASS SC-3b, PASS SC-3c, PASS SC-3d, PASS SC-4a, PASS SC-4b, PASS SC-4c, PASS SC-4d, PASS SC-4e, PASS SC-4f, PASS SC-5a, PASS SC-5b, PASS REQ-edits`
- Round-1 walkthrough regression, re-run after items 2 and 3, all PASS:
  - rapid hover in/out x40, then away, advances;
  - hovering holds; leaving resumes;
  - mouse Next/Prev/Next, then leave, advances;
  - Pause holds after leaving; Play resumes;
  - hover in/out during a crossfade advances;
  - keyboard focus in the controls holds; Tab out resumes;
  - hover, page away, back, pointer elsewhere advances;
  - hover, wheel away, key back, move away advances;
  - tab hidden holds; tab visible resumes;
  - Next at 4.95s of a 5.2s frame: exactly one step (`reel3`);
  - 30s auto-play steps 03 to 09 in order.

  The older `reel2` "Next late in a frame" line reports 03 instead of 02 on both the pre-change and the new file. Its 900ms load wait plus 4800ms is past one 5.2s frame, so the reel is already on 02 when Next is clicked, and it then steps exactly once. This is a timing flaw in that test, not a regression; `reel3` is the exact check.
- Screenshots looked at, Projects (rest and hover or tap) and Achievements (hover on lines 1, 3 and 4 on desktop; top and bottom on the phone), at 1440x900, 1366x768 and 390x844: no page errors. Previews stay inside the viewport, the phone frame is centred, and colour shows only while engaged.
- v7: the inline script parses. The 01-06 banned patterns all count 0. The design doc has 0 em dashes, its Status line still reads DRAFT, and no APPROVED line exists.

### Needs Yahya

1. Discuss the design references (item 4); the orchestrator is handling this.
2. Round-1 question 1 is still open: the Club of the Year caption wording "Our school's Club of the Year", alt "The team on stage with its school's Club of the Year award".
3. Achievement thumbnails on phones are greyscale (item 6 choice). Say if you want them in colour there too.

## Change round 3 (2026-11-07)

### Yahya's reply (verbatim)

Multi-select answer on the design references (verbatim labels):

> "Word frame on Say hi (Recommended), Letter-pair titles (Recommended), Rotated micro-text + grid lines, Edge-cropped type"

Two open questions answered (verbatim, relayed by the orchestrator):

> "Club caption agreed"

> "Greyscale"

### What was done

| # | Item | Status | Commits |
|---|------|--------|---------|
| 1 | Letter-pair titles | Done (Achievements, About) | c78f9f2, c08dd4f |
| 2 | Word frame on Say hi | Done | c78f9f2, c08dd4f |
| 3 | Edge-cropped type | Done (Experience) | c78f9f2, c08dd4f |
| 4 | Rotated micro-text + grid lines | Done (pages 01-05; Index) | c78f9f2, c08dd4f |
| 5 | Club of the Year caption | Agreed, recorded, no change | c08dd4f |
| 6 | Phone/touch Achievements thumbnails | Greyscale, recorded as decided, no change | c08dd4f |

**1. Letter-pair titles.**
- Achievements: AC / HI / EV / EM / EN / TS in capitals, cols 1-2, line height 0.82, sized to fill the page height (at most the Display size): 130px at 1440x900, 120px at 1366x768. The list moves beside it into cols 3-10 (rank 3-4, result 5-7, detail 8-10) and the hover previews move from cols 1-2 to cols 11-12.
- About: TWO / HAB / ITS, cols 5-8.
- A first try set one letter per grid column. The pairs then read as two vertical columns ("AHEEET", "CIVMNS"), so each row is set as one word.
- Accessibility: the heading's name is the full word in visually hidden text ("Achievements", "Two habits"). The rows (and the phone fallback) are `aria-hidden`.
- Not split: Experience has no "Experience" title (its Display group is Work and Involvement), Projects' Display word is "Facturo", Say hi has no title, and YAHYA is untouched.
- Phones: About keeps the three rows. Achievements falls back to the one-line title "Achievements" in title case (290px of 322px), so six rows do not push the list a screen down.

**2. Word frame on Say hi.**
- "say hi" (lowercase) in Display weight and width runs round all four edges, pinwheel-wise like the "universe" poster: top 0, right 90, bottom 180, left 270 degrees, letter tops out.
- The band is exactly one grid column (89px at 1440, 83px at 1366), so the frame stands on cols 1 and 12.
- JS fills each edge with as many words as fit and shares the leftover equally, the corner gap included. At 1440 that is 6, 3, 6 and 3 words; at 1366, 6, 2, 6 and 2.
- The four links start on col 2, centred in the frame's height. They shrink below Display only when the inside is too short: 108px at 1366x768, while 1440x900 keeps the Display size. The address sits at the bottom of cols 9-11, flush left.
- The frame is `aria-hidden`, has no pointer events and is static (nothing changes under reduced motion).
- Phone: top and bottom edges only (44px band). With the side edges the inside would be about 250px, narrower than "Resume (PDF)" at 64px.
- The depth tunnel of fragments was not added (too noisy next to four giant links).

**3. Edge-cropped type.** On Experience, "03" in Display weight and width, set at about 460px (1440) or 280px (1366), sits on the footer line under the Involvement table. The page's right edge cuts through the "3".
- The page uses `overflow: clip`: scrollLeft and scrollTop stay 0 even when set.
- No collision: at 1440 the number starts at y 528 (list ends at 488) and x 1116 (Work ends at 736), far from the rail.
- Hidden on phones.
- One page only: no other page has a free area that a crop would not collide with.

**4. Rotated micro-text and grid lines.**
- (a) "Montréal, Québec, 2026" in dim Label is set vertically in the right page margin of pages 01-05, `aria-hidden`. The rail keeps the left margin. Hidden on phones (16px margin).
- (b) The Index draws its 12 columns as hairlines (`#2e2e2e`): 45% opacity at rest, full while a YAHYA letter is hovered or keyboard-focused (400ms opacity, instant under reduced motion). Phones draw one line per column start.
- Choice: always on, faint. In the screenshots it shows the grid without competing with the text, and a hover-only grid would go unseen. Body text contrast is unchanged: ink on the brightest line is 11.9:1.

**5 and 6.** The design doc's Achievements composition records the agreed caption and alt, and that the phone/touch thumbnails are greyscale "decided by Yahya", no longer a default.

### Verification

- Device checks (`r3dev.js`, real Playwright input):
  - Grid lines: 0.45 at rest, 1 on a letter, 0.45 after, at 1440 and 1366.
  - Previews in cols 11-12, right of the detail column and inside the viewport: x 1213-1415 at 1440, 1151-1341 at 1366.
  - The title stack ends before the list. Both bottoms are 734 at 1440 and 688 at 1366, above the footer.
  - The crop cannot be scrolled and touches nothing.
  - Say hi: all four links and the address sit inside the frame and take the pointer (elementFromPoint) at 1440 and 1366. At 390 the Display links start 2px left of the frame's top band; that is the -0.03em optical pull-in every Display word has, not a defect.
  - Heading names: "Achievements" and "Two habits", with the visible rows aria-hidden.
- Regression scripts re-run, all unchanged:
  - `hit2`: the Index letter hit range is y 264-747; rail items x 24-70, y 92-244.
  - `green2`: exactly 1 green letter after paging with a focused letter.
  - `hitreel`: 0 wrong probes at 1440, 1366 and 390. The reel and control boxes are identical to round 2.
  - `colour`: 21/21 PASS.
  - `achpv`: 17/17 PASS, including colour previews from their new place and greyscale phone thumbnails.
  - `reel3`: exactly one advance.
- All six pages screenshotted and looked at, at 1440x900, 1366x768 and 390x844, plus a reduced-motion pass at 1440:
  - 0 page errors;
  - document scrollWidth equals the viewport at every size (no horizontal scroll);
  - 1366 Achievements now fits the screen (768 of 768; it overflowed by 8px before).
- v7: the inline script parses. The 01-06 banned patterns all count 0 (Google Fonts, judge, requestAnimationFrame, lerp, spring, italic, weights 200/500/600, medal, em dash).
- Design doc: 0 em dashes; the Status line still reads DRAFT; no APPROVED line.
- `check.sh`: 18 PASS and 1 FAIL (SC-1c, not approved, as expected).

### Needs Yahya

1. Grid lines on the Index: always on and faint (current), or only while the pointer is on YAHYA?
2. The micro-text wording "Montréal, Québec, 2026", and whether it should be in the right margin of every page 01-05.
3. The frame word in lowercase "say hi" (like "universe"), or "Say hi" / "SAY HI"?
4. Achievements: the letter-pair stack moved the photo previews to the right (cols 11-12). OK?
5. Letter-pair titles on two pages only (Achievements, About). Should Experience get a page title ("EX / PE / RI / EN / CE") above or instead of the Work / Involvement heads? Experience fills 1366x768 today, so a stacked title only fits if the Work / Involvement heads go or shrink.
6. Edge-cropped "03" on Experience only; should other pages get their number too? There is no free area on them today without moving content.

## Change round 4 (2026-11-07)

### Yahya's reply (verbatim)

> "For the hi frame, I was thinking of a frame like this [Image #12] and like an animation rotating in a spiral (lighter and fainter to not be too distracting). For the about me page maybe but a design shape to fill the top right space"

Image #12 (pasted in chat, not saved to the repo): two "universe" posters. Top: one large word per edge forming a square, the edges meeting pinwheel-wise, and rings of letter fragments shrinking toward a small centred word (a tunnel). Bottom: the same rings turned a little more at each step, so the tunnel becomes a spiral.

### What was done

| # | Item | Status | Commits |
|---|------|--------|---------|
| 1 | Say hi square and spiral vortex | Done | 852e289, 35d5597 |
| 2 | About top-right shape, three candidates | Built behind a sketch toggle; open, Yahya picks | 852e289, 35d5597 |
| 3 | Round-3 choices not yet answered | Kept as built, recorded as "defaults pending Yahya" | 35d5597 |

**1. Say hi square and vortex** (replaces the round-3 frame of repeated small words).

- **Frame:** one "say hi" per edge of a square, pinwheel corners as in the poster (top 0, right 90, bottom 180, left 270 degrees, letter tops out). The font size is the side / 3.423, so the word plus its band fills each edge exactly.
- **Why a square and not the round-3 band:** one word per edge cannot fill both the long and the short edges of the landscape content area. On the 1290px top edge the word would need a font size of about 750px.
- **Grid:** the square is six columns wide (cols 7-12, 654px at 1440x900), or as tall as the page allows (552px at 1366x768, right-aligned on col 12's edge). It is top-aligned with the links, which go back to cols 1-6 at the Display size (168px at 1440, 123px at 1366). The address goes under the links and "Pause motion" under the square, on one Label line.
- **Width:** bold at the body width (wdth 100), not Display wdth 75. At wdth 75 the short word made the band 35% of the side and the tunnel only 30% wide. That was tried and screenshotted (first pass); at wdth 100 the tunnel is 45% of the side, closer to the poster.
- **Tunnel:** 14 rings (8-14 asked). Each ring is a copy of the four words cut by a `clip-path` (evenodd polygon) to a slice through the x-height, 0.50em to 0.70em in from the outer edge, so stems become squares and bowls become arcs, as in the poster. Each ring is 0.8 the size of the one outside it and turned 6.5 degrees further, so the twist reaches about 90 degrees at the centre.
- **Animation (approach):** CSS keyframes only. Every ring runs the same `@keyframes vx` (15 stops: scale and rotate per step, plus opacity), lasting 35s and linear, with `animation-delay: calc(var(--i) * -2.5s)`. The rings therefore flow inward along the spiral one step every 2.5s, and the loop is seamless: a ring fades in at the frame's inner edge and out at the centre.
  - Chosen over canvas because it animates transform and opacity only, which run on the compositor. No script runs per frame (`requestAnimationFrame` is banned in v7 anyway), and pausing is just `animation-play-state`.
  - Under reduced motion, the paused negative delays leave every ring at its own step, which is exactly the static twisted frame of the bottom poster.
- **Perf (`perf4.js`, headless Chrome 1440x900, running):** 60.0 fps, 95th-percentile frame 16.8ms, max 16.8ms. Over 3.0s there was 0 layout and 0.03s of style recalc; the 0.11s of main-thread task time includes the measuring loop. Paused: 0.000s of main-thread work over 3s. 14 ring layers are promoted (`will-change: transform, opacity`).
- **Lighter and fainter:** the frame is ink at 22%, the rings at 20% falling to 0 at the centre. No accent.
- **Link contrast (`con4.js`):** link, address and control text was made transparent, then the brightest pixel inside each box was taken as the effective background, at three animation moments (t, t+6s, t+12s) at 1440, 1366 and 390. Every box measured background 11 (the ground `#0b0b0b`), so ink is 17.3:1 and the accent hover 7.4:1 (worst 7.38:1). The square never sits behind a link, so no mask was needed.
- **When it runs:** only on Say hi (`html[data-page="5"]`) with the tab visible (a `tab-hidden` class set on `visibilitychange`).
  - "Pause motion" / "Play motion" is a Label button under the square (WCAG 2.2.2), reachable from the keyboard. Nothing is stored, so a reload runs again.
  - Reduced motion: never runs, and the button is hidden.
  - The square is `aria-hidden` and has `pointer-events: none`.
- **Phone 390:** the square is the full content width (322px), under the links and the address. It has 7 rings (`vx7`: 0.64 per step, 13 degrees, 17.5s) and the Pause motion button under it. All four links and the address are clear of it and take the pointer.

**2. About top-right shape.** Three candidates are behind a temporary header toggle, "About shape: a / b / c" with "Sketch only, not part of the site". The toggles are buttons with `aria-pressed`, like the earlier v7 sketch toggles (Achievements, cursor). Hidden on phones.

- **Box:** cols 9-12, from the header line down to 48px above the text (`grid-template-rows: auto 1fr auto`, with the text moved to row 3). Measured clear of the TWO / HAB / ITS stack, the portrait and the text at 1440 and 1366.
- **Crop:** the shapes are cut by the grid's right edge, not the page edge, because the right margin carries the rotated micro-text "Montréal, Québec, 2026". A shape running to the page edge would cross it.
  - (a) Half disc: a disc centred on the box's right edge, as tall as the box.
  - (b) Quarter rings round the top-right corner: each 0.8 of the last and 16.5% thick, the Say hi tunnel slices flattened into arcs.
  - (c) A Y fragment: a giant Y in Display weight and width (the YAHYA face), 2.2 times the box height. The crotch and both arms show, cut by the box. A first pass at 1.25x showed the whole Y and read as a sixth letter, so it was enlarged.
- All three are solid ink, `aria-hidden`, with no pointer events. The doc records them as "open: Yahya picks".

**3. Defaults pending Yahya** (round-3 questions, kept as built):
- grid lines faint always, brighter on a YAHYA letter;
- micro-text "Montréal, Québec, 2026";
- lowercase "say hi";
- previews in cols 11-12;
- Experience not stacked;
- the crop on Experience only.

### Verification

- `r3dev.js` (adjusted for the new frame): ALL PASS. The Say hi block now checks:
  - one "say hi" per edge;
  - the square inside the viewport, `aria-hidden`, with no pointer events;
  - the four links, the address and the control clear of the square and taking the pointer (elementFromPoint) at 1440, 1366 and 390.
  - Squares measured: 1440 [759,96,1415,752] (font 192px); 1366 [789,96,1341,648] (font 161px); 390 [51,393,373,715] (7 rings).
- `perf4.js`: 8/8 PASS. On About it is paused and does not advance. On Say hi it runs. Pause holds and relabels to "Play motion". Keyboard Enter resumes. Tab hidden pauses and visible resumes. A reload runs again. Under reduced motion it is static and the button is hidden.
- `con4.js`: link contrast as above, PASS.
- Regression scripts, all unchanged:
  - `hit2`: Index hit range y 264-747; rail items the same as in round 3.
  - `green2`: exactly 1 green letter.
  - `hitreel`: reel and control boxes identical to round 3; all probes as before.
  - `colour`: 21/21 PASS.
  - `achpv`: 17/17 PASS.
  - `reel3`: exactly one advance.
- Screenshots looked at, in `/tmp/claude-1000/-home-atlas-dev-mine-portfolio/b665a55a-f583-43bd-8a8f-9e449fcf2104/scratchpad/shots4/`:
  - contact sheets `sheet-desktop.png` and `sheet-phone.png`;
  - Say hi at t0, t+9s and t+18s at 1440, at 1366, at 390, and under reduced motion at 1440 and 390;
  - About a, b and c at 1440 and 1366, and at 390 (shape hidden).
  - 0 page errors; document scrollWidth equals the viewport at every size.
- v7: the inline script parses. The 01-06 banned patterns all count 0 (Google Fonts, judge, requestAnimationFrame, lerp, spring, italic, weights 200/500/600, medal, em dash).
- Design doc: 0 em dashes, Status still DRAFT, no APPROVED line; six distinct Poster device lines.
- `check.sh`: 18 PASS and 1 FAIL (SC-1c, not approved, as expected).

### Needs Yahya

1. About shape: (a) half disc, (b) quarter rings or (c) Y fragment? Solid ink as built, or dimmer?
2. Say hi: is the spiral speed right (one ring step every 2.5s, 35s from edge to centre) and faint enough (frame 22%, rings 20%)?
3. The frame word at the body width (wdth 100) for a bigger tunnel, or the Display width (wdth 75) like the other Display words? The tunnel shrinks from 45% to 30% of the side.
4. The round-3 defaults above (grid lines, micro-text wording, "say hi" case, preview columns, Experience title, crop on one page) still stand until you say otherwise.

## Change round 5 (2026-11-07)

### Yahya's reply (verbatim)

> "1. b 2. ok 3. Spiral with the words in the center. A true spiral not only fading in so it starts overscreen before"

The questions were: 1) About shape a / b / c (recommended: b, dimmed to about 20%); 2) the spiral's speed and faintness; 3) the frame word at the body or the Display width. Answer 3 is a change to the spiral itself instead.

Added mid-round (verbatim, relayed by the orchestrator):

> "Add also another fix when you hover a letter and press an arrow to go to the next page during the transition the square stays still like a glitch"

> "No for the bug it's not cursor-square it's the square around the letter that stays fixed"

### What was done

| # | Item | Status | Commits |
|---|------|--------|---------|
| 1 | About shape (b), dimmed; (a), (c) and the toggle removed | Done | 47427cc, bd82c51 |
| 2 | Spiral speed and faintness | Kept (step 2.5s, 22% fading to 0) | 47427cc, bd82c51 |
| 3 | Say hi: a true spiral of the words, entering from off-screen | Done | 47427cc, bd82c51 |
| 4 | Round-3 defaults | Unchanged, still "defaults pending Yahya" | none |
| 5 | Square stuck over a letter while paging | Fixed | c999ce7, bd82c51 |

**1. About shape.**
- (b) quarter rings, as Yahya picked.
- Dimmed to the Say hi spiral's faintness: the shape layer is ink at 22% opacity, not solid white. The dimming was the orchestrator's recommendation; Yahya may still ask for it brighter.
- Candidates (a) half disc and (c) Y fragment, their CSS and markup, the header sketch toggle "About shape: a / b / c" and its script are removed. The header has no sketch toggles left.
- The geometry is unchanged (`ab5.js`): at 1440 the visible rings are [986,72,1415,501] with the stack ending at x 962 and the text starting at y 643; at 1366 they are [974,72,1341,439] (stack ends at x 913, text starts at y 487). The shape is hidden on phones.

**3. Say hi spiral** (replaces the round-4 square and its fading ring slices).
- **Form:** ONE logarithmic spiral path turning clockwise into a centre in the free right part of the page; each turn is 0.45 the size of the one outside it. "say hi" (lowercase, bold, wdth 100) is set on the path with SVG `textPath`, 4.5 words per turn, letter tops out, so it reads "say hi say hi ..." round into the centre, each word smaller than the last. The outermost word is about 176px at 1440x900.
- **Approach (compositor only):** a log spiral maps onto itself under rotate(a) plus scale(0.45^(a/360)) about its centre.
  - Every word is the same small inline SVG (`<use>` of one word on the path), sized to the word's measured ink (getBBox plus 2 units), with its `transform-origin` on the spiral's centre.
  - All 22 words run the same keyframes: 80 degrees and a scale of 0.837 per step, 2.5s per step, 22 steps = 55s, two keyframe stops per step. Each word is offset by -2.5s.
  - Every 2.5s each word glides to the next word's place, shrinking as it winds in, and the loop is seamless.
  - Transform and opacity only. No per-frame script.
  - Offset-path was not needed (and so no Safari fallback question): rotate plus scale moves a word exactly along a log spiral and keeps it tangent.
- **Starts overscreen:** the step-0 position lies wholly past the page's right edge. With only that word shown, it draws 0 pixels on screen at 1280, 1366, 1440, 1920 and 390. The outer turn also runs under the footer. No word fades in at a fixed ring.
- **Static frame:** dropped. Both were screenshotted (`variants.png`). With the round-4 square kept over the spiral, its four big words collide with the turns and read as clutter; without it, the moving outer turn is the frame.
- **Width (Q3, unanswered):** wdth 100 kept. At wdth 75 (`variants.png`, right) the shorter word leaves wide gaps along the path, so the line stops reading as one spiral.
- **Place:**
  - Desktop: a layer from half a gutter left of col 7 to the page's right edge, full page height, with `overflow: clip` (it can never scroll).
  - The spiral is sized from that width (`--u`) so its outer band stays clear of the layer's left line.
  - The links stay in cols 1-6 on plain ground. The address moves to cols 1-3 and "Pause motion" to cols 4-6 on the same Label line, out of the spiral's area.
- **Phone 390:** a band under the links and the address, from the content's left edge to the page's right edge. 14 words instead of 22: the same path and step, with keyframes `sp14` (35s) so they fade out sooner. Pause motion sits under it.
- **Kept:** ink at 22% fading to 0 at the centre, no accent, `aria-hidden`, no pointer events. It runs only while Say hi is current and the tab is visible. Pause motion / Play motion (WCAG 2.2.2), nothing stored. Under reduced motion the words stand still along the spiral and the control is hidden. The rotated micro-text stays in the right margin and paints above the spiral.

**5. The square that stays behind while paging.**
- **Identified:** the cursor (a) snap box, `#cur .box`, with its tag `.btag`.
- **How:** with the pointer on the A of YAHYA, ArrowRight was pressed with real Playwright input and a screenshot taken 250ms in, on the round-4 build. The same was done with each candidate disabled: the cursor (`.cur`), the letter's `::before` hit area and every outline.
  - The 1px square and its "02 PROJECTS" tag stayed on the A's old place in every run except with `.cur` hidden.
  - Hiding `::before` also removed it, but only because the letter can then never be hovered (`::before` is its only hit area; it paints nothing).
  - No outline is involved: a hovered letter has no focus.
  - Screenshots: `sq-old-vs-new.png` and `sq-old-*`.
- **Root cause:** the snap followed `pointerover` only, and `layoutBox()` read the snapped element's rect. A key, the wheel or a click moves the letters and the page without moving the pointer, so no event updated the box. It stayed on the old rect until the next pointer move.
- **Fix (no per-frame work):**
  - A page change releases the snap at once: the box goes back to the small square at the still pointer and the tag hides.
  - `pointerover` is ignored while the page glides.
  - When the page has landed (the existing end-of-transition timeout; only the latest page change counts), one `elementFromPoint` at the last pointer position re-snaps to what is under it, or to nothing.
  - Rail letters keep the snap between pages 01-05, because they do not move.

### Verification

- `sp5px.js` (pixels, new). A whole loop was sampled every 0.625s (88 moments on desktop, 56 on phones) at 1280x720, 1366x768, 1440x900, 1920x1080 and 390x844, with the link text hidden.
  - No word pixel touches the layer's inner left line (max grey 11 = the ground), so no word is ever cut there.
  - On phones none touches the band's bottom either.
  - The step-0 word draws nothing on screen at any size.
- `sp5.js` (boxes, new): no word box overlaps a link, the address or the control over the whole loop at all five sizes. Document scrollWidth equals the viewport everywhere, and there are 0 errors.
- `perf5.js` (`perf4` adapted to the words), headless Chrome at 1440x900: 8/8 PASS.
  - While running: 60.0 fps, 95th-percentile frame 16.8ms, max 16.8ms. Over 3.0s there was 0 layout, 0.05s of style recalc and 0.16s of main-thread task time; the task time includes the measuring loop.
  - Paused: 0.000s of main-thread work over 3s. 22 word layers are promoted.
  - Behaviour: paused on About, runs on Say hi. Pause holds and relabels to "Play motion"; keyboard Enter resumes. A hidden tab pauses it and a visible one resumes it. A reload runs again. Under reduced motion it is static and the button is hidden.
- `con5.js` (link contrast, text hidden, brightest pixel in each box at t, t+6s and t+12s, at 1440, 1366 and 390; on phones each element is scrolled into view, because unscrolled the fixed footer covers the control): every box has background 11, so ink is 17.3:1 and the accent 7.4:1 (worst 7.38:1). PASS.
- `r3dev.js` (Say hi block adapted to the spiral): ALL PASS.
  - One word on the path, 22 copies (14 on phones), the layer clipped, `aria-hidden` and with no pointer events.
  - The four links, the address and the control are clear of the layer and take the pointer at 1440, 1366 and 390.
- `ab5.js`: the About shape is ink at 0.22, no toggles or other candidates remain, the shape is clear of the stack, the text and the portrait, and it is hidden on phones.
- `cur5.js` (new, real input, 1440 and 1366): 49 PASS.
  - Scenarios: a hovered Index letter with ArrowRight and with the wheel; a rail letter with ArrowRight, ArrowLeft, Home and a click on another letter; a Say hi link with ArrowLeft; a Projects row with ArrowRight.
  - During the glide the box is the free 12px square at the pointer (on rail-to-rail paging it stays on the rail letter, which does not move).
  - After landing, it snaps to whatever `elementFromPoint` finds, or to nothing.
  - The same script run on the round-4 build fails, showing the stranded 291x492 box over the old A.
- Regression scripts, all unchanged:
  - `hit2`: Index hit range y 264-747; rail items as before.
  - `green2`: exactly 1 green letter.
  - `hitreel`: the same boxes and probes as round 4.
  - `colour`: ALL PASS.
  - `achpv`: ALL PASS.
  - `reel3`: exactly one advance.
- Screenshots looked at, in `/tmp/claude-1000/-home-atlas-dev-mine-portfolio/b665a55a-f583-43bd-8a8f-9e449fcf2104/scratchpad/shots5/`:
  - contact sheets `sheet-desktop.png` and `sheet-phone.png`;
  - the motion sequence `seq-1440.png` (8 frames over 10s);
  - the variants `variants.png`;
  - the square bug `sq-old-vs-new.png`.
  - Say hi is shown at t0, +5s, +12s and +20s; t0, +5s and +20s look the same because they fall on whole 2.5s steps and the spiral is self-similar one step later.
  - 0 page errors; document scrollWidth equals the viewport at every size.
- v7: the inline script parses. The 01-06 banned patterns all count 0 (Google Fonts, judge, requestAnimationFrame, lerp, spring, italic, weights 200/500/600, medal, em dash).
- Design doc: 0 em dashes, Status still DRAFT, no APPROVED line.
- `check.sh`: 18 PASS and 1 FAIL (SC-1c, not approved, as expected).

### Needs Yahya

1. The spiral's speed. It keeps the round-4 step (2.5s), but a step now carries a word a whole word-length along the path, about 80 degrees per 2.5s. The outer words, near the page edges, move noticeably faster than the round-4 rings did; the inner ones are slow. Judge from the sequence `seq-1440.png`; slower (for example 4s per step) is one number.
2. "the words in the center": the words now wind into the centre and vanish there. The poster also has one small still word at the very centre. Add a small static "say hi" at the core?
3. The About rings at 22% (recommended), or brighter?
4. The round-3 defaults (grid lines, micro-text wording, "say hi" case, preview columns, Experience title, crop on one page) still stand until you say otherwise.

## Change round 6 (2026-11-07)

### Yahya's messages (verbatim)

> "Oh yes btw I built another project for MAME the McGill Association of Mechanical Engineers [Image #13]: https://mame-tool-rental.vercel.app/. Tool and machine rental with admin dashboard"

> "Built for MAME, in use at MAME."

> "I stopped being a dev for facturo in october 2026"

His answers to the round-5 questions (verbatim, relayed by the orchestrator mid-round):

> "1. keep 2. vanish is good 3. keep 4. dw"

Meaning, as the orchestrator relayed it: (1) the spiral speed stays at 2.5s per step; (2) the words vanish at the centre, no still core word; (3) the About quarter rings stay at 22%; (4) "dw" (don't worry): keep the MAME live-site link as is. No code change was needed for these; they are recorded as settled in the design doc (section 4.2 items 2 and 5, section 10 items 18 to 20).

Facts used for MAME come only from the orchestrator's check of the private repo `Yahya-github/mame-tool-rental` (gh) and the live site, and from Yahya's words above.

### What was done

| # | Item | Status | Commits |
|---|------|--------|---------|
| 1 | Projects: MAME Tool Rental row with live link and hover preview | Done | 67836ba, 4876643 |
| 2 | Experience: MAME entry | Not added (no entry exists; see Needs Yahya) | none |
| 3 | Facturo: past role, Jun 2026 to Oct 2026 | Done | 67836ba, 4876643 |
| 4 | links.md: MAME live URL, private repo, screenshots, logo | Done | 4876643 |
| 5 | MAME mark on the Projects row | Done | a0b7629, 67836ba |
| 6 | Round-5 answers recorded | Done | 4876643 |
| 7 | REQUIREMENTS (CONT-03, CONT-12, DSGN-05) and PROJECT.md project list | Updated | bfd9f9d |

**1. Projects row.**
- MAME Tool Rental is the first compact row (02.2; the others move to 02.3 to 02.6), because it is shipped and in use.
- Lines: "Tool and machine rental with an admin dashboard" (Yahya's words); "FastAPI and Next.js, deployed only after every test passes"; "Built for MAME, in use at MAME" (Yahya's words). Link "Live site" to https://mame-tool-rental.vercel.app/ in the existing Label link style. The repo is private, so no code link.
- Preview: the admin overview (`mame-05-admin-overview-grey.jpg`, colour twin on hover), with the caption "Admin overview, demo data / McGill Association of Mechanical Engineers".
  - Place: two columns wide in cols 7-8, its bottom on the lead's last line beside the Facturo name. The rows fill cols 9-12, so there is no empty column next to the row as on Achievements; this is the only free area that never covers the walkthrough. To keep it clear, the two Facturo lines now stop at col 6 (they rewrap by at most a word).
  - Behaviour: the same as the Achievements previews. It shows on row hover and on keyboard focus of "Live site", in colour; after a mouse click on the link it stays hidden until the pointer moves again (the `quiet` rule now covers both pages). On phones it is an inline greyscale thumbnail under the row.
- Height budget: five rows of three lines ran about 100px past the footer at 1366x768. The consistent tightening: below 880px of viewport height (desktop only), every row drops its middle line (role or how) and the rows close from 12px to 8px. At 1440x900 and taller, and on phones, all three lines show. Rows end at 794 of 820 (1440x900), 634 of 688 (1366x768) and 634 of 640 (1280x720, which already ended on the footer line before this round).

**3. Facturo.**
- Experience Work row: "Since Jun 2026" becomes "Jun 2026 to Oct 2026". Rule recorded in the design doc: a current role reads "Since Mon YYYY", an ended one "Mon YYYY to Mon YYYY", never "since". The row keeps its place (start-date order).
- Design doc section 7 (03 Experience) updated. The Projects copy ("Paper tickets from a Quebec trucking company...") never said current, so it is unchanged. PROJECT.md did not describe Facturo as current.
- Not edited: `resume-public.pdf` may still describe Facturo as current. That is Phase 7 copy; the PDF is not edited in Phase 1. The retired v6 reference and the old plan files keep their history.

**4 and 5. Material and mark.**
- `screenshots/mame-01-home` to `mame-08-admin-catalog` (`.jpg`, all metadata and the ICC profile stripped) plus `-grey` twins. Demo data only.
- `logos/mame.png` (source lockup, trimmed), `mame-mark.png` (the shield, 96px, brand red with its white "M"), `mame-mark-mono.png` (#8e8e8e, alpha scaled by the red so the white details are knocked out and the shield keeps its detail, like the ICPC mono mark).
- The mark sits after the name on the Projects row, 28px, mono at rest and red on row hover or a tap on touch. Never an accent use. Experience has no MAME entry, so no mark there.

### Verification

- `pv6.js` (new): ALL PASS at 1440x900, 1366x768, 1280x720 and 1920x1080, plus the 390 phone.
  - At rest the preview is hidden and the mark is mono. On hover the preview shows the colour file and the mark its colour; the preview stays inside the viewport and no text box of the Facturo lines, link or controls, and not the walkthrough, overlaps it.
  - Keyboard: Tab onto "Live site" shows it; Tab on hides it. After a click on the link and coming back, it is quiet.
  - Phone: inline grey thumbnail, 156px wide.
  - Experience reads "Jun 2026 to Oct 2026" for Facturo, the three others "Since", and no MAME entry.
  - Document scrollWidth equals the viewport everywhere; 0 page errors.
- Regression scripts (port 8794), all unchanged: `hit2` (Index hit range y 264-747, rail as before), `green2` (exactly 1 green letter), `hitreel` (same boxes and probes), `colour` ALL PASS, `achpv` ALL PASS, `reel3` (exactly one advance), `cur5` ALL PASS (its Projects-row case now snaps on "Live site"), `perf5` ALL PASS, `con5` (worst accent 7.38:1, PASS), `r3dev` ALL PASS, `ab5` (0 errors, scrollWidth equals the viewport).
- Screenshots looked at, in `/tmp/claude-1000/-home-atlas-dev-mine-portfolio/b665a55a-f583-43bd-8a8f-9e449fcf2104/scratchpad/shots6/`: contact sheets `sheet-desktop.png` and `sheet-phone.png`; `r6-proj-*` and `r6-xp-*` at 1440x900, 1366x768 and 390x844 (with hover); `before-*` for comparison; `mame-mono.png`.
- v7: the inline script parses; the 01-06 banned patterns all count 0.
- Design doc: 0 em dashes, Status still DRAFT, no APPROVED line.
- `check.sh`: 18 PASS and 1 FAIL (SC-1c, not approved, as expected).

### Needs Yahya

1. Should MAME also appear on Experience (Work or Involvement), and with what role title? Nothing was invented; if yes, the mark goes on that row too.
2. Projects at laptop heights: below 880px every row hides its middle line (for example "Architected 6 gameplay systems"). Keep this, or drop a row (Showdown AI, "nothing built yet") so all three lines show everywhere?
3. The MAME live site still shows the "Demo: extended lab hours" banner and demo student data. The link stays (your "dw"); remove the banner on your side when it suits you.
4. `resume-public.pdf` may still list Facturo as current (Phase 7 copy).
5. The round-3 defaults (grid lines, micro-text wording, "say hi" case, preview columns, Experience title, crop on one page) still stand until you say otherwise.
