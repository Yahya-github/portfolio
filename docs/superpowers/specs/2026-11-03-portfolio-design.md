# Portfolio website: design

Status: DRAFT for Yahya's approval (revision 5: dark Swiss horizontal). Nothing is built. Date: 2026-11-07 (Phase 1 picks recorded; review change rounds 1 to 5 applied).
Owner: Yahya Hallani. Domain: `yahya-h.dev` (Yahya buys it before the first deploy). Host: Vercel.

Visual contract: `.planning/phases/01-design-gate/01-UI-SPEC.md` holds every token value; this doc records decisions, the trial results and the page compositions. Where they disagree, this doc wins after approval. This revision overrides the `portfolio-design` skill and the stack notes in `CLAUDE.md` wherever they disagree.

## 1. Intent and where the wow comes from

A personal portfolio for Yahya, a McGill software engineering student. The audience is recruiters and internship leads, who often open the link on a phone, inside LinkedIn's in-app browser. The goal is that a visitor leaves thinking "that kid is cracked". The record carries that feeling, not decoration: the site states true specifics (dated wins, real projects, real numbers) and lets the visitor do the math.

The wow comes from three places (D-26), and nowhere else:

1. The YAHYA letter navigation: the giant name is the menu, and its letters become the rail.
2. Craft: the paging feel, giant Swiss type on a strict grid, and a precise cursor.
3. Real interactive proof: playable Atlantis and the rotatable robot model (Phase 8).

Green stands for nature (as grandeur) and code. That meaning is private inspiration only; nature is never a visible theme (D-27). Yahya's interests outside code, competitive games and building machines, show up as content (the wins, the projects, the two habits in About) and never as decoration (D-28).

Meaning test: every element must answer "why is this here, and why for Yahya?" If it has no answer, it goes.

Anti-goals (any of these makes the site a failure even if it technically works):

- It reads as AI-default or template output. The avoid-list in `anti-vibe-design` is binding.
- It feels heavy: slow first paint, janky paging, or motion that blocks input.
- It brags. The site states facts; the visitor draws the conclusion.
- Any invented number, fake testimonial, or claim Yahya cannot back up.

## 2. Constraints

- **Stack:** Next.js static export (`output: 'export'`) hosted on Vercel. Custom headers through `vercel.json` are available. There is no basePath stage: the site lives at the domain root.
- **Self-hosting:** fonts, images and the resume are self-hosted (DEP-02). Nothing is hotlinked in production.
- **Performance budget:** landing JavaScript under about 150 kB gzipped, CSS under 30 kB, LCP under 2.5 s, CLS under 0.1, INP under 200 ms. Measure; do not guess.
- **Accessibility:** WCAG AA contrast, full keyboard use, reduced motion honoured, and every page works without JavaScript.
- **Routes:** English only: `/achievements/`, `/projects/`, `/experience/`, `/about/`, `/say-hi/` and `/projects/facturo/`. French is v2; copy lives in data files so adding it stays cheap (D-20).
- **Facts:** only facts from `portfolio-voice-and-facts` and the resume. No phone number. The CRC contest platform is not mentioned anywhere.

## 3. Research decisions

| Decision | What | Status | Note |
|----------|------|--------|------|
| Decision 1 | URL model | Accepted, 2026-11-06 | Each page has its own real URL; Back steps through visited pages. |
| Decision 2 | Letters-to-rail FLIP | Accepted, 2026-11-06 | Native Web Animations API, no library; switch to GSAP Flip only if bugs cost more than a day. |
| Decision 3 | Rail inset | Accepted, 2026-11-06 | The left rail stays; on phones it sits 24px from the left edge, and swipes starting within 20px of the edge are left to the system back gesture; tested on a real iPhone and Android. |
| Decision 4 | Inner scroll | Accepted, 2026-11-06 | Pages are designed to fit one screen at 1366x768; at zoom or on short screens the page scrolls vertically and paging happens only at its edge. |
| Decision 5 | Resume | Accepted, 2026-11-06 | A self-hosted resume PDF, reachable from every page. |
| Decision 6 | Domain | Accepted, 2026-11-06 | Buy yahya-h.dev before the first deploy. On Vercel the basePath risk disappears; the domain is still bought first. |
| Host | Vercel | Accepted, 2026-11-06 | Yahya's choice: real headers, no basePath stage. |

### 3.1 References

Design inspiration and a grid guide sent by Yahya on 2026-11-07 (change round 2), recorded verbatim. In change round 3 (2026-11-07) Yahya picked four devices from them (his multi-select answer, verbatim labels: "Word frame on Say hi (Recommended), Letter-pair titles (Recommended), Rotated micro-text + grid lines, Edge-cropped type"); section 4.2 defines them and section 7 places them. In change round 4 (2026-11-07) Yahya sent a second poster for Say hi and asked for a shape on About (his reply, verbatim: "For the hi frame, I was thinking of a frame like this [Image #12] and like an animation rotating in a spiral (lighter and fainter to not be too distracting). For the about me page maybe but a design shape to fill the top right space"). In change round 5 (2026-11-07) he picked the About shape and asked for a true spiral of words (his reply, verbatim: "1. b 2. ok 3. Spiral with the words in the center. A true spiral not only fading in so it starts overscreen before").

- https://www.behance.net/gallery/192265061/Swiss-Typography-Wallpaper-Pack/modules/1087550045
- https://www.behance.net/gallery/239485669/Modern-Swiss-Typography-Poster-System-Exploratio
- https://www.behance.net/gallery/221014645/50-Swiss-Style-Posters/modules/1260764327
- [Image #11] (an image pasted by Yahya in the review chat; not saved to the repo)
- [Image #12] (pasted by Yahya in change round 4; not saved to the repo): two "universe" posters. Top: one large word per edge forming a square, the edges meeting pinwheel-wise at the corners, and inside it rings of letter fragments shrinking toward a small centred word, a tunnel. Bottom: the same rings turned a little more at each step, so the tunnel becomes a spiral.
- Grid guide: https://swissgrid.posterhouse.org/

What each reference gave the site:

- Modern Swiss Typography, Poster System Exploration: the letter-pair stacks (MO/DE/RN, TY/PO/GR/AP/HY) became the letter-pair titles; its vertical "typography" micro-text became the rotated micro-text.
- 50 Swiss Style Posters: FRAMEWORK rotated along both edges, and letters cut by the poster edge, became the edge-cropped type.
- Swiss Typography Wallpaper Pack: the fine grid lines visible behind the type became the Index grid lines.
- Image #11, the "universe" poster: one word round all four edges, each edge rotated a quarter turn further, became the Say hi word frame in round 3 (as a word repeated along each edge). Image #12 replaced that in round 4: one "say hi" per edge of a square, and the tunnel of fragments twisted into a slowly turning spiral. Round 5 turned it into one true spiral made of the words themselves, entering from off-screen (section 4.2, item 2).
- swissgrid.posterhouse.org: the site keeps the strict Zürich grid. The Basel looseness enters only through the one cropped number on Experience, and the grid itself becomes visible on the Index.

## 4. Visual system

Every value lives in `.planning/phases/01-design-gate/01-UI-SPEC.md`; Phases 3 to 6 turn it into `styles/tokens.css` plus CSS Modules. This section restates only what a reader needs to picture the site.

- **Colour:** ground `#0b0b0b` (one flat ground, no second surface, no cards); ink `#f0f0f0` (17.27:1); dim `#8e8e8e` (6.01:1) for labels and secondary lines only; hairline `#2e2e2e` for real structure only; accent `#5fae84` (7.38:1).
- **The accent is reserved for exactly four things:** (1) the current section's rail letter, always paired with its visible numbered name and `aria-current="page"`, and derived from the current page alone, so exactly one rail letter is ever green; (2) the hover and focus colour of every interactive text, except the rail letters, which never take the accent on hover or focus (hover shows as the cursor box, focus as an ink ring); (3) the focus ring, 2px solid with a 4px offset (ink on rail letters); (4) the `75/75` numeral on Achievements. The cursor that won is drawn in ink, so the fifth slot it held in reserve is gone. Never body text, backgrounds, fills, hairlines, the progress bar, photos, the cursor or the footer counter.
- **Grid:** 12 columns, 24px gutter and margin on desktop and tablet, 16px on phones. Nested blocks use `subgrid` so everything lands on the master columns. Every element starts and ends on a column line. Text is flush left, ragged right; nothing is centred.
- **Type roles:** Label 12px / Body 16px / Heading 24px / Display `clamp(64px, 9vw, 168px)` / Poster for YAHYA only, `calc(var(--grid-width) / var(--yahya-fit))` capped against `100svh` so it fits short screens. Exactly 2 weights ship. No italics anywhere (D-05). Counters and `75/75` use tabular figures.
- **No ornament:** no icons, no illustrations, no background visuals (D-26, D-29). Rank is set as type. The real organisation marks on the Experience rows (section 7, 03 Experience) are content, not ornament: they identify where Yahya worked and took part. The typographic devices (section 4.2) are made of the site's own type and grid, never of pictures, and they are the only decorative elements; each is `aria-hidden`. Round 4 adds the one geometric shape, in ink, on About (section 4.2, item 5; which of three is open for Yahya).
- **Photos:** pre-converted greyscale files (not a CSS filter), hard-cropped to column edges, no radius, border, shadow or effect (DSGN-05). Four deliberate exceptions show their own true colours on interaction: the About portrait crossfades to a true-colour twin (section 7, 04 About), the Experience organisation marks rest in one mono colour and crossfade to their brand colours (section 7, 03 Experience), the Facturo walkthrough crossfades its current screenshot to the colour original while it is paused for the visitor (section 7, 02 Projects), and the Achievements proof previews, which only appear on hover or keyboard focus, show the colour photo (section 7, 01 Achievements). Anything on screen at rest stays greyscale. Those colours are the photos', the marks' and the screenshots' own, never the accent, and they are not accent uses. Facturo's brand green inside its screenshots is content, not the accent.

### 4.1 Font

Final family: Instrument Sans (chosen by Yahya, 2026-11-07, round 1).
Licence: SIL Open Font License 1.1, self-hosted, no purchase.
Files: InstrumentSans-wdth-wght.woff2 (one variable file, wdth 75-100, wght 400-700) with OFL-InstrumentSans.txt, both in docs/reference/fonts/.
Weights: 400 and 700
Widths: wdth 75 for YAHYA and the Display words, wdth 100 for body text (same file).
YAHYA tracking: -0.045em
Display tracking: -0.05em
--yahya-fit: 2.188
Poster size: 636px at 1440x900 (width-bound), 589px at 1366x768 (height-bound), 164px at 390x844 (width-bound)

Fit checks (docs/reference/font-metrics.md, "Winner"): every Display word fits. "Involvement" fits cols 7-12 (489px of 619px at 1366, 516px of 656px at 1440); "Achievements" at the 64px floor fits a 390 phone (290px of 322px); "75/75" uses a real `tnum` feature.

Two render rules found in v7 (plan 01-06):

- `--yahya-fit` is the ink-accurate 2.188, not 2.155 (advance plus 5 x tracking). CSS adds letter-spacing after the last A too, and that trailing space is not ink; 2.155 let the A run about 21px past the grid edge at 1440.
- The five hero letters are separate elements (five links that move to the rail), so the browser cannot kern between them. The YA kern pair is put back by hand: `margin-right: -0.063em` on both Y's. Without it YAHYA measures 2.506em instead of 2.380em.

Criteria the trial used (D-03 to D-07):

- YAHYA is judged first; the body paragraph must still read well at 16px on black.
- Caps with tight negative tracking; the Y arms and A apexes must hold together at giant size.
- Tabular figures are available (a `tnum` feature, or figures tabular by default). No monospace for counters.
- One family.
- A variable file, or 2 static weights, can be self-hosted under the licence.
- Latin-Extended coverage is not a criterion.
- Budget for a paid face: up to about $300 (D-02).
- At most 2 rounds; round 2 uses 3 new faces picked from feedback (D-08). Round 2 did not run.

Also tried: Inter Tight, Sofia Sans Extra Condensed with Sofia Sans, Schibsted Grotesk, Hanken Grotesk (confirmed first, then replaced by Instrument Sans the same day), and trial files of Söhne and Suisse Int'l (never committed); see docs/reference/font-trial.html.

### 4.2 Typographic devices (change rounds 3 and 4)

Chosen by Yahya on 2026-11-07 from his references (section 3.1). None of them adds a colour: they use ink, dim and the hairline grey, and the accent stays reserved for its four uses. Two of them move: the grid lines, by opacity, and the Say hi spiral (rounds 4 and 5, item 2), by transform and opacity.

1. **Letter-pair titles.** A page title is set in capitals and broken into rows of two or three letters, each row one tight word, flush left on the title's first column line, line height 0.82 (the MO/DE/RN stacks). Used on Achievements (AC / HI / EV / EM / EN / TS, cols 1-2) and About (TWO / HAB / ITS, cols 5-8). A first try put each letter in its own grid column; the pairs then read as two vertical columns of letters instead of pairs, so the letters of a row stay together. The heading's accessible name is the full word in visually hidden text; the visible rows are `aria-hidden`. Experience has no "Experience" title (its Display group is the Work and Involvement head row) and Projects' Display word is the project name "Facturo", so neither is split; YAHYA on the Index is never split. Phones: About keeps TWO / HAB / ITS (it fits); Achievements falls back to the one-line title "Achievements" in title case at the 64px floor (290px of 322px), because six rows on a scrolling phone page push the list a screen down.
2. **Say hi spiral (change round 5; from Image #12 in round 4).** Replaces the round-4 square of four words with its fading ring slices (Yahya, round 5: "Spiral with the words in the center. A true spiral not only fading in so it starts overscreen before").
   - **Form:** one continuous logarithmic spiral, turning clockwise into a centre in the free right part of the page; each turn is 0.45 the size of the one outside it. The phrase "say hi" (lowercase, bold, body width wdth 100, tracking -0.03em) is set on the path itself, 4.5 words per turn, letter tops facing out, so it reads "say hi say hi ..." round and round into the centre, each word smaller than the one before it. At 1440x900 the outermost word is about 176px; at the centre they are a few pixels and gone.
   - **Starts overscreen:** a word's first position lies wholly past the page's right edge (measured: it draws no pixel on screen), and the outer turn runs on under the footer, so words slide in from off-screen and wind inward. Nothing appears by fading in at a fixed ring.
   - **No static frame:** the round-4 square of four words is gone. Kept over the spiral (screenshot, round 5) it collided with the turns and read as clutter. The moving outer turn is the frame now.
   - **Width:** body width (wdth 100). At the Display width (wdth 75, screenshot, round 5) the shorter word leaves wide gaps along the path and the line stops reading as one continuous spiral.
   - **Place:** desktop, a layer from half a gutter left of col 7 to the page's right edge and the full page height, clipped there (`overflow: clip`, so nothing can scroll). The spiral is sized from that width so its outer band never reaches the layer's left line: measured over a whole loop at 1280, 1366, 1440 and 1920, no word pixel touches it, so no word is ever cut there and none passes behind the links, the address or the control, which sit on plain ground in cols 1-6. Phones (390): a band under the links and the address, from the content's left edge to the page's right edge, with 14 words instead of 22 (the same path and step, fading out sooner); the Pause motion control sits under it.
   - **Motion:** a log spiral maps onto itself under a rotation plus a matching scale about its centre, so every word is the same small SVG (the word on the path) and runs the same CSS keyframes: per step it turns 80 degrees and scales by 0.837, one step every 2.5s. The words are offset by -2.5s each, so every 2.5s each word glides to the next word's place, and the loop is seamless (55s from entering to the centre, about 35s of it clearly visible). Transform and opacity only, on the compositor; no script per frame (measured in headless Chrome at 1440x900: 60 fps, 95th-percentile frame 16.8ms, no layout).
   - **Faint:** ink at 22% at the edge, fading to 0 at the centre. No accent. Measured with the link text hidden, the background behind every link, the address and the control is the ground (`#0b0b0b`) at every moment, so ink stays 17.3:1 and the accent hover 7.4:1.
   - **When it runs:** only while Say hi is the current page and the tab is visible. A Label button, "Pause motion" / "Play motion", on the address line (cols 4-6; under the spiral on phones) stops and restarts it (WCAG 2.2.2); nothing is stored, so every load starts running. Under reduced motion it never runs and the button is hidden: the words stand still along the spiral.
   - The spiral is `aria-hidden` and takes no pointer events. The rotated micro-text in the right margin stays and paints above it.
3. **Edge-cropped type (Basel tension).** On Experience only, the page number "03" in Display weight and width, sized to the free height under the Involvement table (set at about 460px at 1440x900, digits about 330px tall; about 280px at 1366x768), sits on the footer line in cols 9-12 and is cut by the page's right edge through the "3", which stays readable. The page clips it with `overflow: clip` (not `hidden`, which focus could still scroll), so there is never horizontal scroll. It never touches YAHYA, a link, body text or the rail (it sits at the opposite edge). Hidden on phones, where the page scrolls. One page, not two: the other pages have no free area big enough that a crop would not collide with content or a preview.
4. **Rotated micro-text and grid lines.**
   - (a) Pages 01-05 carry one Label line, "Montréal, Québec, 2026", in dim, set vertically (reading top to bottom) in the right page margin, top-aligned under the header. The left margin is the rail's, and the rail's own vertical section name stays as it was. It is `aria-hidden` (the header and the Index already say it). Hidden on phones, where the margin is 16px.
   - (b) The Index draws its 12 columns as 1px hairlines (both edges of every column, in the hairline grey `#2e2e2e`) behind the type, at 45% opacity at rest (about `#191919` on the ground). They come up to full hairline grey over 400ms while the pointer is on a YAHYA letter or a letter has keyboard focus, and go back after (instant under reduced motion). Choice: always on, faint, rather than only on hover. In the screenshots the faint lines show the strict grid the whole site stands on without competing with any text, and hidden lines would be missed by most visitors. Body text contrast is unchanged: the lines sit behind the text, and ink on the brightest line is still 11.9:1. Phones draw one line per column start instead of two per gutter. Yahya can switch this to hover-only.

5. **About shape (change round 4; (b) picked by Yahya in round 5).** Quarter rings round the top-right corner fill About's empty top right: cols 9-12, from the header line down to 48px above the text, cut by the grid's right edge (not the page edge, because the right margin carries the rotated micro-text). Each ring is 0.8 the size of the one outside it and 16.5% thick, the Say hi slices flattened into arcs. Dimmed to the Say hi spiral's faintness (ink at 22%), not solid white: a recommendation, Yahya may still want it brighter. It never touches the portrait, the TWO / HAB / ITS stack or the text. `aria-hidden`, no pointer events, hidden on phones (the page is a single column there and has no empty corner). The other candidates, (a) a half disc and (c) a Y fragment, and the sketch toggle are removed.

Defaults pending Yahya (round-3 questions he has not answered yet; as built, he may still override): the Index grid lines are always on and faint, brighter on a YAHYA letter; the micro-text reads "Montréal, Québec, 2026" in the right margin of pages 01-05; the Say hi word is lowercase "say hi"; the Achievements previews sit in cols 11-12; Experience has no letter-pair title; the edge-cropped number is on Experience only.

## 5. Motion

One rule: movement is horizontal, fast and decisive, with no bounce and no overshoot. Only `transform` and `opacity` animate.

| Token | Value | Used for |
|-------|-------|----------|
| `--dur-page` | 600ms | Track slide and progress bar |
| `--dur-letters` | 600ms, 30ms stagger per letter | Hero letters to rail |
| `--dur-ui` | 150ms | Hover and focus colour, caption fade, cursor shape change |
| `--dur-open` | under 1000ms in total | First-visit opening |
| `--ease-page` | `cubic-bezier(0.77, 0, 0.18, 1)` | Track, progress bar, letters |
| `--ease-ui` | `cubic-bezier(0.16, 1, 0.3, 1)` | Colour and opacity changes |

- Banned: any curve with a control point above 1, springs, parallax, vertical slide-ins.
- Everything is interruptible: new input retargets the animation, it never queues.
- Reduced motion: every duration becomes 0ms. Page changes, the letter move, the opening, the hint and cursor shape changes are instant, and paging still works.
- One exception to "horizontal, fast and decisive" (change round 4, Yahya): the Say hi spiral winds slowly and continuously, as atmosphere, while Say hi is on screen (section 4.2, item 2). It is linear, has no bounce, animates transform and opacity only, can be paused, and does not run under reduced motion.

## 6. Navigation and paging

- **Hero letters:** the five letters of YAHYA are five real links: Y `/achievements/`, A `/projects/`, H `/experience/`, Y `/about/`, A `/say-hi/`. Each has a caption under it, "01 Achievements", "02 Projects", "03 Experience", "04 About", "05 Say hi" (dim number, ink name, Label role).
- **Rail:** leaving the hero, the same five letters glide and shrink into a vertical rail in the left margin (and glide back on the way home: their hero targets are measured against the track's resting position, never its in-flight position, so paging back mid-slide still lands them; v7 bug found and fixed 2026-11-07): 30px on desktop, 22px on phones, gap 8px (28px under `pointer: coarse`), every hit area at least 44x44px. A rail letter shows its section name on hover (the cursor tag) and on keyboard focus. The current letter is in the accent, keeps its numbered name visible, and carries `aria-current="page"`. The accent comes from the current page alone: hover and focus never colour a rail letter, so a pointer resting where a letter lands, or a clicked letter that keeps focus, can never leave a second letter green (v7 bug found by Yahya 2026-11-07). Every rail letter's accessible name is its section name.
- **Letter hit area:** each letter catches the pointer over its own box only (its advance width by 0.76em) on the Index; in the rail it is the whole rail item (the rail column minus 8px, plus half the gap above and below), so the five items tile the rail. Text is hit-tested against the font's full content area (about 1.2em), which at Poster size covered the screen from the header to the footer, the intro and the captions included (v7 bug found by Yahya 2026-11-07: "the letters hitbox take the whole screen"). The build gives the link no pointer events and lets a box-sized pseudo-element take them.
- **Header:** fixed, Label role, hairline bottom rule. Cols 1-3 "Yahya Hallani"; cols 4-6 the current section name; cols 10-12 "Resume (PDF)" and "Say hi".
- **Footer:** fixed. Counter `00 / 05` with tabular figures; a "Next, {Section}" control ("Back to the start" on the last page); a 2px progress bar along the bottom edge.
- **Input:** one wheel or trackpad gesture moves exactly one page, and momentum is ignored. Keys: arrows, Page Up/Down, Space, Home/End. Phones swipe horizontally, with the 20px left-edge exclusion from Decision 3.
- **Accessibility:** inactive pages are inert. Focus moves to the new page heading. A live region announces "{Section name}, page {n} of 6". The first Tab stop is a "Skip to content" link. With JavaScript off, every page is a normal route.
- **First visit:** a quiet hint that pages move sideways, and an opening under 1 s that any click or key skips. It never repeats.

## 7. Page compositions

Each page borrows one Swiss layout idea so no two layouts match (DSGN-03, D-10). Each page has exactly one dominant element and one Display group. Content uses verified facts only; final copy is Yahya's (Phase 7).

### 00 Index

- Poster device: Wordmark as image, bottom-anchored
- Columns (desktop): role line cols 1-4 at the top; meta labels (Software engineering, McGill University, Montréal, Québec) cols 7-12 at the top, three-up; YAHYA across cols 1-12, its bottom edge 96px above the footer, captions beneath.
- Dominant element: the giant YAHYA.
- Display group: YAHYA (Poster role).
- Grid lines (round 3, section 4.2): the 12 columns drawn as faint hairlines behind the type, brighter while a YAHYA letter is hovered or focused.
- Phone portrait intent: YAHYA fitted to the phone width, captions stacked number over name, the role line above.
- Content: the role line is the plain identity "Software Engineering at McGill". There is no proof line: Yahya dropped the CCC line (2026-11-07, "ccc-line: drop"), and nothing replaces it; the top left holds the role line alone, balanced by the meta labels on the right.

### 01 Achievements

- Poster device: Typographic list, no rules
- Chosen: variant (b), by Yahya, 2026-11-07, in v7 (D-11). CONT-02 is rewritten to match.
- Columns (desktop, change round 3): the title is a letter-pair stack, AC / HI / EV / EM / EN / TS, in Display weight and width in cols 1-2, sized to fill the page height (6 rows at line height 0.82, at most the Display size). The five unruled lines sit beside it in cols 3-10 on a subgrid, top-aligned with the title (rank cols 3-4, result cols 5-7 in Heading, detail cols 8-10 in dim Body). The first line is "75/75, Canadian Computing Competition, perfect score", with the numeral in the accent and at the same weight as the other ranks.
- Proof previews (Yahya, 2026-11-07): hovering a line, or focusing it with the keyboard, shows a small photo in its own colours and one Label line in the empty cols 11-12 (cols 1-2 until round 3, which gave them to the title), top-aligned with the line and nudged up so it never leaves the viewport. A line with a public source (an article or a post) is a link that opens it in a new tab (`rel="noopener"`):
  - DIRO Hackathon: the diro.umontreal.ca article; photo `photos/diro-hackathon-2026-award-grey.jpg` ("The winners with their certificates").
  - Intercollegiate Video Game Creation Competition: the neomedia.com article, which names Atlantis and the Collège André-Grasset team (the cegepvalleyfield.ca post is a photo post with a 14-word body); photo `photos/game-competition-2026-team-grey.jpg`.
  - Canadian Robotics Competition, robot competition: the Instagram post https://www.instagram.com/p/DYPS2bGOAQy/ (Yahya, 2026-11-07); photo `photos/club-of-the-year-award-grey.jpg` ("Our school's Club of the Year", source line "Post, instagram.com", alt "The team on stage with its school's Club of the Year award"), because the team won thanks to the club (Yahya, 2026-11-07). The caption and alt wording are agreed (Yahya, 2026-11-07, change round 3: "Club caption agreed").
  - Canadian Robotics Competition, programming: the Instagram post https://www.instagram.com/p/DWmZr18kTA3/ (Yahya, 2026-11-07); photo `photos/crc-2026-trophies-grey.jpg` ("The team with its 2026 trophies").
  - The two CRC lines are links to those posts, like the article lines; their tag reads "See the post" and the preview's source line reads "Post, instagram.com". No CRC article exists; the posts are the proof.
  - Canadian Computing Competition 75/75: a one-line description only, no photo and no link (no public proof exists). It is the only line that is not a link; it takes keyboard focus so its preview can still be seen.
  Colour (Yahya, 2026-11-07, round 2: "photo preview with color preferably"): the hover and focus preview loads the colour original (`photos/<name>.jpg`, the file without `-grey`, metadata-stripped) through a `<picture>` source for hover-capable screens wider than 820px, so only one file is fetched. On touch screens (`hover: none`) and phones the thumbnail sits inline under its line in greyscale: it is on screen at rest, with no hover moment, so it keeps the photo rule. Decided by Yahya (2026-11-07, change round 3: "Greyscale"), no longer a default. The linked lines stay normal links.
  Showing (v7 bug found by Yahya 2026-11-07, round 2: "clicking doesn't make the photo stay"): the preview shows on hover or keyboard focus (`:focus-visible`) only. It used `:focus-within`, and a line clicked with the mouse keeps focus while its source opens in a new tab, so the photo stayed on screen after coming back and moving away (the same cause as the round-1 walkthrough freeze). When the window loses focus the hover previews also go quiet until the pointer really moves again, so a stale hover on return does not bring the photo back.
- Dominant element: the title stack beside the list.
- Display group: the title "Achievements".
- Phone portrait intent: the title on one line ("Achievements", title case; the letter-pair stack is desktop only), then the lines stacked rank above result above detail, each with its thumbnail below (the 75/75 line has none; the two CRC lines show two different photos).
- Phone fit: the title "Achievements" at the 64px Display floor fits the 390px frame in Instrument Sans at wdth 75 (290px of 322px), so it stays Display on phones.
- Content: "Canadian Computing Competition, perfect score" with `75/75` (2026), then the four first places: DIRO Hackathon 2026 (1st of 18 teams from 9 CEGEPs, $2,500 team scholarship); Intercollegiate Video Game Creation Competition 2026 (with Atlantis); Canadian Robotics Competition, robot competition, 1st in 2026 (matches against the other teams' robots); Canadian Robotics Competition, programming, 1st in Programming in 2025 and 2nd in Senior Programming in 2026. The 2026 1st place is the robot competition, not robot construction (Yahya, 2026-11-07). Rank is set as type ("1st", "2nd"), never as medals (D-20).

### 02 Projects

- Poster device: Asymmetric split 8/4 with a hard-cropped image
- Columns (desktop): Facturo across cols 1-8 (a walkthrough of the greyscale screenshots hard-cropped across those columns, its Label controls, name, one Body line each for problem and result, the Label link "Read the deep dive" to `/projects/facturo/`); cols 9-12 hold four compact ruled rows.
- Walkthrough (Yahya, 2026-11-07: "a cinematic go through of the images not just a static image"): the 10 files `screenshots/facturo-*-grey.png` play in order. Each frame pushes in slowly for about 5 s (scale 1 to 1.06 with a small pan, linear) and crossfades to the next over 900ms; only `transform` and `opacity` animate. A portrait screenshot (the phone screen) is shown whole and centred in the frame, and its push-in is a plain scale around its centre so it stays centred (Yahya, 2026-11-07: "center the phone image"). Frames load lazily, one ahead. It pauses while the pointer is over the visible frame or one of its three controls, while keyboard focus is on the frame or a control, when Projects is not the current page, when it is scrolled out of view and when the tab is hidden, and it resumes the same frame as soon as none of these holds. A control clicked with the mouse keeps focus but does not hold the pause; only the Pause control does (v7 bug found by Yahya 2026-11-07: "sometimes it freezes when you pass and remove your cursor"; the hover and focus states shared one flag). The hover area is the visible frame only: the walkthrough box, or for the portrait screenshot the centred picture itself, plus the Pause, Previous and Next buttons. The heading, the two lines, the link, the gaps and the counter never pause it (v7 bug found by Yahya 2026-11-07, round 2: "the hitbox of the showcase is too big that's why it was stopping for no reason"; the listener sat on the whole cols 1-8 block, 882x748px at 1440 for an 882x426px frame). One clock drives it, the current frame's push-in, so a step can never advance twice. Colour on hover (Yahya, 2026-11-07, round 2: "when going over the showcase it stops like usually but also shows color"): the frames are greyscale by default; whatever pauses the walkthrough for the visitor (the pointer over the visible frame or a control, keyboard focus on the frame or a control, or a tap on the frame on touch, which a second tap releases) also crossfades the current frame over 400ms to its colour original, `screenshots/facturo-NN-*.png` (the files without `-grey`, metadata-stripped). Pause and colour are one condition, so they never disagree. Previous and Next while engaged show the new frame in colour; leaving returns it to grey and resumes. Under reduced motion the swap is instant. The colour twins load on demand (the current frame and its neighbours). The frame takes keyboard focus (Tab) but not mouse focus. A visible Pause control (WCAG 2.2.2) plus Previous and Next sit under it in Label, with a counter "01 / 10, Home". Under reduced motion there is no auto-advance: Previous and Next step through the frames, and the switch is instant.
- Dominant element: the Facturo block.
- Display group: "Facturo".
- Phone portrait intent: the Facturo block full width first, the four compact rows stacked below.
- Content: Facturo is a local-first invoicing app for a Quebec trucking company, from paper tickets to tax-correct invoices, with 700+ tests. Then Atlantis, CRC problems, Robot firmware and Showdown AI as compact rows, each with problem, role, result and links (D-12). Robot firmware's result reads "1st place, robot competition, 2026". Showdown AI's result reads "In progress, nothing built yet".

### 03 Experience

- Poster device: Ruled two-column table
- Columns (desktop): Work cols 1-6, Involvement cols 7-12, column heads in Display on one row, rows separated by hairlines: years in Label flush left on their own line, role in Heading, organisation in dim Body. Years and roles flush left (D-13).
- Organisation marks (Yahya, 2026-11-07): a row whose organisation has a real mark shows it 28px tall, vertically centred in the row, its right edge on the column's right edge (col 6 for Work, col 12 for Involvement). Marks rest in one mono colour, the dim grey `#8e8e8e`, from pre-made mono files (not a CSS filter); hovering the row (fine pointer) or tapping it on touch crossfades to the brand colours over 400ms, instantly under reduced motion. Marks are decorative (empty alt); the text already names the organisation. They stay far smaller than the Display heads. Rows: Mercor, Facturo, CRC 2027 (Work); McGill Robotics, Google Developer Group at McGill, McGill Compete / ICPC (Involvement). Freelance has no mark. Treatment recommended by Claude in round 1; Yahya did not answer the round-1 questions, so these defaults stand (change round 2, 2026-11-07): marks dim grey with colour on hover or tap; the Facturo mark keeps its brand green (`#4ea672`) on hover, which is the mark's own colour and content, not the accent; the ICPC three-square mark stays on the McGill Compete / ICPC NENA row; the generic Google Developer Groups chevron stays on the GDG row. Yahya may still override. Files: `docs/material/logos/*-mark.*` and `*-mark-mono.*`.
- Edge-cropped number (round 3, section 4.2): "03", sized to the free height under the Involvement table, sits on the footer line in cols 9-12 and is cut by the page's right edge. It is decorative (`aria-hidden`) and hidden on phones.
- Display fit: "Involvement" at Display fits cols 7-12 at 1366 and 1440 in Instrument Sans (489px of 619px at 1366, 516px of 656px at 1440), so Work spans cols 1-6 and Involvement cols 7-12.
- Dominant element: the ruled table.
- Display group: the "Work" and "Involvement" head row.
- Phone portrait intent: the Work table, then the Involvement table, stacked.
- Content, Work: Coding agent evaluator (Mercor, contractor, since Sep 2026); Developer (Facturo, since Jun 2026); Problem author (CRC 2027, volunteer, since Feb 2026); Freelance developer (12 projects for 9 clients, since 2025).
- Content, Involvement: Software (McGill Robotics); Full-stack (Google Developer Group at McGill, subteam project); Competitor (McGill Compete, ICPC NENA).

### 04 About

- Poster device: Photo as column, offset text
- Columns (desktop): portrait cols 1-4, full height between the header and footer; the title as a letter-group stack TWO / HAB / ITS (round 3, section 4.2) in Display, cols 5-8, at the top; text cols 8-12, bottom-aligned, lead paragraph in Heading at weight 400, the rest in Body.
- Dominant element: the portrait.
- Display group: "Two habits" (visible as TWO / HAB / ITS; its accessible name is "Two habits").
- Shape (round 4, picked in round 5): quarter rings in ink at 22% in cols 9-12 above the text (section 4.2, item 5).
- Phone portrait intent: portrait cropped to the top half, then the title (the same three rows), then the text.
- Content: a real, recognisable greyscale portrait from `docs/material/portrait-devfest-2026-grey.jpg`, with the Google Developer Group backdrop and the lanyard kept (D-15, D-22). The lanyard text is readable; Yahya accepts it (2026-11-07: it is the Google Developer Group, "it can even be a plus"). Title "Two habits".
- Crop: kept as is (Yahya, 2026-11-07: "portrait: ok"). The banner-free master (1512x1240) fills cols 1-4 with `object-fit: cover; object-position: 52% 10%`; no tighter pre-crop.
- Alt text: "Yahya Hallani at DevFest Montreal 2026" (confirmed by Yahya, 2026-11-07).
- Colour on hover (Yahya, 2026-11-07): greyscale by default; with a fine pointer, hovering crossfades (400ms) to `docs/material/portrait-devfest-2026-color.jpg`, a true-colour twin with the same crop and all metadata stripped. On touch a tap toggles it, and the keyboard toggles it as a button with `aria-pressed`. Under reduced motion the swap is instant. This is the one deliberate exception to "photos are greyscale"; it is the photo's own colour and not an accent use. The text is in Yahya's voice; the draft line "I decide fast under pressure, and I build things that run themselves." is his to rewrite, and the final copy comes in Phase 7.

### 05 Say hi

- Poster device: Spiral of words beside stacked giant links (change round 5)
- Columns (desktop): the four Display lines in cols 1-6, top-aligned, on plain ground; the "say hi" spiral (section 4.2, item 2) fills the page from half a gutter left of col 7 to the right edge, entering from off-screen. Under the links on one Label line: the email address and the copy status in cols 1-3 and "Pause motion" in cols 4-6. The links are the Display size (168px at 1440, 123px at 1366), shrunk only if the content height or the six columns are too small for them.
- Dominant element: the four lines.
- Display group: the four lines. The spiral is bold type too but is decoration, faint and `aria-hidden`.
- Phone portrait intent: the four lines at the 64px Display floor, the address, then the spiral band (14 words, entering from the right edge) and its Pause motion button.
- Content: Email, LinkedIn, GitHub, Resume (PDF) (D-14). Clicking Email copies the address and the status reads "Copied {address}"; if copying fails it reads "Copy didn't work. The address is {address}, select it to copy." The `mailto:` href stays on the line, so visitors without JavaScript can still write.

Composition rules:

- Hairlines appear only on the Projects compact rows and Experience. Index, Achievements, About and Say hi have none. The Index grid lines (section 4.2) are the one exception: they draw the grid itself, faintly, not rules between content.
- The rail appears on pages 01-05 only, not on Index. The rotated micro-text uses the right margin, never the rail's column.
- Every element starts and ends on a column line. The edge-cropped "03" starts on one and runs off the page edge on purpose.
- Everything is flush left; no centred text. The Say hi spiral is set on its path, not centred text, and the links beside it stay flush left on col 1.

## 8. Cursor

The custom cursor stays in v1 (D-18). Its job is to feel crafted and to guide navigation. Requirement: EXP-03.

- Its position is written on every `pointermove`, exactly on the pointer: no lag, lerp or spring.
- Only its shape changes, over `--dur-ui`.
- The native cursor may be hidden where the custom cursor runs.
- It is hidden on `(hover: none)` or `(pointer: coarse)`, so touch keeps the native cursor. Forced-colours mode keeps the native cursor too.
- Under reduced motion, shape changes are instant.

Form: (a) a hard-edged 1px square outline in ink that snaps around the hovered letter or link (its box plus 4px) and shows the section or link name as a Label tag, with a 2px ink dot on the pointer, chosen by Yahya 2026-11-07 in v7 (D-19).

- Paging releases the snap (v7 bug found by Yahya 2026-11-07, round 5: "when you hover a letter and press an arrow to go to the next page during the transition the square stays still like a glitch"; it was this square, the cursor box). The snap followed `pointerover` only, and a key, the wheel or a click moves the letters and the page without moving the pointer, so the box and its tag stayed on the letter's old place over empty space. Now a page change drops the snap at once (the box returns to the small square at the still pointer and the tag hides), ignores hover while the page glides, and when the page has landed snaps to whatever is under the pointer, or to nothing. Rail letters keep the snap between pages 01-05, because they do not move.
- The tag never leaves the viewport: it sits right of the box; if that does not fit, above it (right-aligned), then below, then left; the result is clamped 8px inside all four edges (v7 bug found by Yahya 2026-11-07: "team website" ran off the screen).
- Links whose text is long name their action instead (the Achievements article lines read "Read the article", the two CRC post lines "See the post").

## 9. Material

Raw, public-safe material lives in `docs/material/` (D-21). Later phases copy optimised versions to `public/`. Status from `docs/material/links.md` on 2026-11-07.

| Item | Status |
|------|--------|
| `portrait-devfest-2026-grey.jpg` | present |
| `portrait-devfest-2026-color.jpg` (About hover) | present |
| `resume-public.pdf` | present (no phone, no contest-platform bullet, Author "Yahya Hallani") |
| `links.md` (contact, project links, proof links, inventory) | present |
| `screenshots/` Facturo (10 frames, colour and greyscale) | present |
| `photos/` DIRO hackathon, game competition, CRC 2026 trophies, Club of the Year, robot CAD thumbnail | present |
| `logos/` Mercor, Facturo, CRC, McGill Robotics, Google Developer Groups, ICPC (source lockup, colour mark, mono mark) | present |
| Atlantis screenshots | missing (waiver below) |
| Robot photo (physical robot) | missing |

Still missing (copied from links.md):

- Atlantis screenshots: to capture (2-3 greyscale gameplay screenshots from the Godot project; Godot is not installed on this machine, so none were captured in plan 01-04). A short muted loop clip later.
- Robot: no photo of the physical robot; a higher-resolution CAD capture (the Onshape thumbnail is 600x340) is to capture; robot CAD file itself (Phase 8).
- CRC 2026: no article link; the two Instagram posts (Yahya, 2026-11-07) are the proof links.
- CCC 2026: no public proof link.
- Higher-resolution original portrait: none yet.

- Waiver: atlantis material not supplied in Phase 1 (Yahya replied "atlantis: there's the Godot game on the repo, so you tell me if we do screenshots or something else", 2026-11-07); to be accepted at the design approval (01-08)

## 10. Open items only Yahya can settle

1. CCC "top 1" scope. Until it is confirmed, the site says only "perfect score, 75/75".
2. Atlantis line counts. Not shown until confirmed.
3. Showdown AI status.
4. Domain purchase.
5. Font purchase, if a paid face wins; the licence must name yahya-h.dev.
6. Robot CAD file (Phase 8).
7. Atlantis asset licences and teammates' consent to a public playable build (Phase 8).
8. Whether the public resume keeps the contest-platform bullet. Settled 2026-11-07: removed.
9. PDF author metadata ("M K" in the old file). Settled 2026-11-07: "Yahya Hallani".
10. Confirm the public email. Settled 2026-11-07: yahya.hallani.email@gmail.com is public.
11. Confirm the Experience role titles "Developer" (Facturo), "Problem author" (CRC 2027) and "Freelance developer". Only "Coding agent evaluator" is Yahya's own wording.
12. Updating the `portfolio-design` and `portfolio-voice-and-facts` skills and the CLAUDE.md stack section after approval.
13. Accept the material waivers listed in section 9 (screenshots/photos not supplied).
14. The Index proof line. Settled 2026-11-07: dropped ("ccc-line: drop"); the Index keeps the role line only.
15. The public resume's project line "1st Place | Sep 2025 - Feb 2026" should name the category (robot competition). Phase 7 copy; the PDF is not edited in Phase 1.
16. The About shape. Settled 2026-11-07, round 5: (b) quarter rings ("b"), dimmed to 22% as recommended; Yahya may still ask for it brighter.
17. The round-3 defaults listed at the end of section 4.2.

## 11. Success

- A stranger pages through to the end without being pushed.
- Lighthouse performance 95 or better on mobile for the landing page, with the budget above met.
- Every claim traces to a fact in `portfolio-voice-and-facts`.
- Yahya looks at it and thinks it feels like him and not like a template.

## Appendix: Retired

- Light paper palette `#f8f8f8` with ink `#141414` and green `#2f5d46`: replaced by the dark Swiss switch (2026-11-05).
- The "no lines, no small labels" rule: retired with the light design (2026-11-05).
- Sofia Sans as the only family: reopened for a trial (2026-11-06).
- Vertical scroll with letters flying into a top header, and Lenis smooth scroll: replaced by horizontal pages and a left rail (2026-11-05).
- Viscous bubble cursor and the Sableye pink/green hint: dropped for a 1:1 cursor (2026-11-06, D-18).
- Folder stack projects: dropped (2026-11-06, D-20).
- Medal icons: rank is set as type (2026-11-06, D-20).
- EN/FR switch and `/en` `/fr` prefixes: English-only routes, French in v2 (2026-11-06, D-20).
- Credits page: no third-party art remains (2026-11-06, D-20).
- Pixel stickers (furnace, Poke Ball peel) and Icons8 illustrations: clash with dark Swiss (2026-11-05).
- 75-dot judge and the scroll-driven judge: read as a loader (2026-11-06).
- Depth map, nature simulations and procedural terrain: borrowed aesthetics (2026-11-06, D-26).
- GitHub Pages hosting with an Actions workflow, a CNAME file and a basePath: replaced by Vercel (2026-11-06).
- Achievements variant (a), a dominant 75/75 numeral in the accent beside a ruled list of the four first places: not chosen (2026-11-07)
- Cursor variants (b) and (c): not chosen (2026-11-07). (b) was a fine 1px accent crosshair; (c) the native cursor plus a context tag over the letters.
- Static Facturo screenshot on Projects: replaced by the walkthrough (2026-11-07).
- "Canadian Robotics Competition, robot" (read as robot construction): corrected to the robot competition (2026-11-07).
- Index proof line "Perfect score, 75/75, at the 2026 Canadian Computing Competition.": dropped by Yahya (2026-11-07).
- The trophies photo as the preview of the CRC robot competition line: replaced by the Club of the Year photo (2026-11-07).
- Phone screenshot flush left in the Facturo walkthrough: now centred (2026-11-07).
- Pausing the Facturo walkthrough over the whole Facturo block: now only over the visible frame and its controls (2026-11-07, change round 2).
- The Facturo walkthrough as greyscale only: its frames now show their colour while paused for the visitor (2026-11-07, change round 2).
- Greyscale Achievements hover previews: now the colour photos; inline phone thumbnails stay greyscale (2026-11-07, change round 2).
- The two CRC Achievements lines as focusable non-links: they now link to Yahya's Instagram posts (2026-11-07, change round 2).
- The Achievements title as one Display word across cols 1-12 above the list, and the list in cols 3-12 with its previews in cols 1-2: now the AC / HI / EV / EM / EN / TS stack in cols 1-2, the list in cols 3-10 and the previews in cols 11-12 (2026-11-07, change round 3).
- "Two / habits" on two lines in cols 5-12: now TWO / HAB / ITS in cols 5-8 (2026-11-07, change round 3).
- Say hi as four bottom-anchored lines in cols 1-9 with the address in cols 10-12: now inside the "say hi" word frame (2026-11-07, change round 3).
- The round-3 Say hi word frame, "say hi" repeated along all four edges of the content area with the links inside it on col 2: replaced by one word per edge of a square with the spiral vortex (2026-11-07, change round 4).
- The round-4 Say hi square (one "say hi" per edge) and its vortex of ring slices fading in at the frame's inner edge: replaced by one true spiral of the words entering from off-screen (2026-11-07, change round 5). Keeping the square over the spiral was tried and dropped (clutter).
- About shapes (a) half disc and (c) Y fragment, and solid ink: Yahya picked (b), dimmed (2026-11-07, change round 5).
- One letter per grid column for the letter-pair titles (tried in round 3): the pairs read as two vertical columns, so each row is set as one word (2026-11-07).
