# Portfolio website: design

Status: DRAFT for Yahya's approval (revision 5: dark Swiss horizontal). Nothing is built. Date: 2026-11-06.
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

## 4. Visual system

Every value lives in `.planning/phases/01-design-gate/01-UI-SPEC.md`; Phases 3 to 6 turn it into `styles/tokens.css` plus CSS Modules. This section restates only what a reader needs to picture the site.

- **Colour:** ground `#0b0b0b` (one flat ground, no second surface, no cards); ink `#f0f0f0` (17.27:1); dim `#8e8e8e` (6.01:1) for labels and secondary lines only; hairline `#2e2e2e` for real structure only; accent `#5fae84` (7.38:1).
- **The accent is reserved for exactly five things:** (1) the current section's rail letter, always paired with its visible numbered name and `aria-current="page"`; (2) the hover and focus colour of every interactive text; (3) the focus ring, 2px solid with a 4px offset; (4) the `75/75` numeral on Achievements; (5) the stroke of cursor variant (b), if that variant wins. Never body text, backgrounds, fills, hairlines, the progress bar, photos or the footer counter.
- **Grid:** 12 columns, 24px gutter and margin on desktop and tablet, 16px on phones. Nested blocks use `subgrid` so everything lands on the master columns. Every element starts and ends on a column line. Text is flush left, ragged right; nothing is centred.
- **Type roles:** Label 12px / Body 16px / Heading 24px / Display `clamp(64px, 9vw, 168px)` / Poster for YAHYA only, `calc(var(--grid-width) / var(--yahya-fit))` capped against `100svh` so it fits short screens. Exactly 2 weights ship. No italics anywhere (D-05). Counters and `75/75` use tabular figures.
- **No ornament:** no icons, no illustrations, no background visuals (D-26, D-29). Rank is set as type.
- **Photos:** pre-converted greyscale files (not a CSS filter), hard-cropped to column edges, no radius, border, shadow or effect (DSGN-05).

### 4.1 Font

Trial status: open. Shortlist of 8 faces (D-01) compared in `docs/reference/font-trial.html`; measured numbers in `docs/reference/font-metrics.md`.

| # | Face | Bucket | Licence status |
|---|------|--------|----------------|
| 1 | Inter Tight | current placeholder | SIL Open Font License |
| 2 | Sofia Sans Extra Condensed + Sofia Sans | condensed | SIL Open Font License |
| 3 | Schibsted Grotesk | free Neue Haas-style | SIL Open Font License |
| 4 | Hanken Grotesk | free Neue Haas-style | SIL Open Font License |
| 5 | Instrument Sans | free Neue Haas-style | SIL Open Font License |
| 6 | Söhne (Klim) | paid Swiss grotesque | paid, web licence must allow self-hosting, price not verified |
| 7 | Suisse Int'l (Swiss Typefaces) | paid Swiss grotesque | paid, web licence must allow self-hosting, price not verified |
| 8 | Neue Haas Grotesk Display (Monotype) | paid Swiss grotesque | paid, web licence must allow self-hosting, price not verified |

Criteria (D-03 to D-07):

- YAHYA is judged first; the body paragraph must still read well at 16px on black.
- Caps with tight negative tracking; the Y arms and A apexes must hold together at giant size.
- Tabular figures are available (a `tnum` feature, or figures tabular by default, as in Hanken Grotesk). No monospace for counters.
- One family.
- A variable file, or 2 static weights, can be self-hosted under the licence.
- Latin-Extended coverage is not a criterion.
- Budget for a paid face: up to about $300 (D-02).
- At most 2 rounds; round 2 uses 3 new faces picked from feedback (D-08).

Notes:

- The Sofia route is one superfamily in two files (Extra Condensed for YAHYA and Display, Sofia Sans for body); if it wins, D-06 is read as one superfamily, two files.
- Inter Tight carries the anti-vibe flag; it can win only on the trial, with a one-sentence reason here.

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

## 6. Navigation and paging

- **Hero letters:** the five letters of YAHYA are five real links: Y `/achievements/`, A `/projects/`, H `/experience/`, Y `/about/`, A `/say-hi/`. Each has a caption under it, "01 Achievements", "02 Projects", "03 Experience", "04 About", "05 Say hi" (dim number, ink name, Label role).
- **Rail:** leaving the hero, the same five letters glide and shrink into a vertical rail in the left margin: 30px on desktop, 22px on phones, gap 8px (28px under `pointer: coarse`), every hit area at least 44x44px. A rail letter shows its section name on hover and focus. The current letter is in the accent, keeps its numbered name visible, and carries `aria-current="page"`. Every rail letter's accessible name is its section name.
- **Header:** fixed, Label role, hairline bottom rule. Cols 1-3 "Yahya Hallani"; cols 4-6 the current section name; cols 10-12 "Resume (PDF)" and "Say hi".
- **Footer:** fixed. Counter `00 / 05` with tabular figures; a "Next, {Section}" control ("Back to the start" on the last page); a 2px progress bar along the bottom edge.
- **Input:** one wheel or trackpad gesture moves exactly one page, and momentum is ignored. Keys: arrows, Page Up/Down, Space, Home/End. Phones swipe horizontally, with the 20px left-edge exclusion from Decision 3.
- **Accessibility:** inactive pages are inert. Focus moves to the new page heading. A live region announces "{Section name}, page {n} of 6". The first Tab stop is a "Skip to content" link. With JavaScript off, every page is a normal route.
- **First visit:** a quiet hint that pages move sideways, and an opening under 1 s that any click or key skips. It never repeats.

## 7. Page compositions

Each page borrows one Swiss layout idea so no two layouts match (DSGN-03, D-10). Each page has exactly one dominant element and one Display group. Content uses verified facts only; final copy is Yahya's (Phase 7).

### 00 Index

- Poster device: Wordmark as image, bottom-anchored
- Columns (desktop): role line and proof line cols 1-4 at the top; meta labels (Software engineering, McGill University, Montréal, Québec) cols 7-12 at the top, three-up; YAHYA across cols 1-12, its bottom edge 96px above the footer, captions beneath.
- Dominant element: the giant YAHYA.
- Display group: YAHYA (Poster role).
- Phone portrait intent: YAHYA fitted to the phone width, captions stacked number over name, role and proof lines above.
- Content: the role line is the plain identity "Software Engineering at McGill". The proof line is one verified fact; its wording comes in Phase 7.

### 01 Achievements

- Poster device (a): Dominant numeral, extreme scale contrast
- Poster device (b): Typographic list, no rules
- Choice open: Yahya picks (a) or (b) in the v7 sketch (D-11). If (b) wins, CONT-02 is rewritten.
- Columns (desktop): in (a), the Label "Canadian Computing Competition, perfect score" then `75/75` in Display and accent, cols 1-7, upper middle; the four first places as a ruled list in cols 8-12 under the title "Achievements" in Heading. In (b), the title "Achievements" in Display across cols 1-12 at the top, then five unruled lines in cols 3-12, the first being "75/75, Canadian Computing Competition, perfect score" with the numeral in the accent.
- Dominant element: in (a), the `75/75` numeral; in (b), the title above the list.
- Display group: in (a), `75/75` (smaller than YAHYA by definition); in (b), the title "Achievements".
- Phone portrait intent: in (a), 75/75 on top at full width, ruled list below; in (b), the title, then lines stacked rank above result.
- Phone fit: in variant (b) the title "Achievements" at the 64px Display floor overflows the 390px frame for every measured face except Sofia Sans Extra Condensed and Instrument Sans at its condensed width (wdth 75), so with any other face that title drops to Heading on phones. Variant (a) already sets the title at Heading.
- Content: "Canadian Computing Competition, perfect score" with `75/75`, then the four first places: DIRO Hackathon 2026 (1st of 18 teams); Intercollegiate Video Game Creation Competition 2026 (with Atlantis); Canadian Robotics Competition robot (2026); Canadian Robotics Competition programming (1st in 2025, 2nd in 2026). Rank is set as type ("1st", "2nd"), never as medals (D-20).

### 02 Projects

- Poster device: Asymmetric split 8/4 with a hard-cropped image
- Columns (desktop): Facturo across cols 1-8 (greyscale screenshot hard-cropped across those columns, name, one Body line each for problem and result, the Label link "Read the deep dive" to `/projects/facturo/`); cols 9-12 hold four compact ruled rows.
- Dominant element: the Facturo block.
- Display group: "Facturo".
- Phone portrait intent: the Facturo block full width first, the four compact rows stacked below.
- Content: Facturo is a local-first invoicing app for a Quebec trucking company, from paper tickets to tax-correct invoices, with 700+ tests. Then Atlantis, CRC problems, Robot firmware and Showdown AI as compact rows, each with problem, role, result and links (D-12). Showdown AI's result reads "In progress, nothing built yet".

### 03 Experience

- Poster device: Ruled two-column table
- Columns (desktop): Work cols 1-5, Involvement cols 6-12, column heads in Display on one row, rows separated by hairlines: years in Label flush left on their own line, role in Heading, organisation in dim Body. Years and roles flush left (D-13).
- Display fit: "Involvement" at Display overflows cols 7-12 at 1366px for most shortlisted faces, so the Involvement column spans cols 6-12 and Work spans cols 1-5 (still one ruled table). Plan 07 confirms this against the winning face in docs/reference/font-metrics.md; if the winner fits cols 7-12, the split returns to 6/6.
- Dominant element: the ruled table.
- Display group: the "Work" and "Involvement" head row.
- Phone portrait intent: the Work table, then the Involvement table, stacked.
- Content, Work: Coding agent evaluator (Mercor, contractor, since Sep 2026); Developer (Facturo, since Jun 2026); Problem author (CRC 2027, volunteer, since Feb 2026); Freelance developer (12 projects for 9 clients, since 2025).
- Content, Involvement: Software (McGill Robotics); Full-stack (Google Developer Group at McGill, subteam project); Competitor (McGill Compete, ICPC NENA).

### 04 About

- Poster device: Photo as column, offset text
- Columns (desktop): portrait cols 1-4, full height between the header and footer; "Two habits" in Display cols 5-12 at the top; text cols 8-12, bottom-aligned, lead paragraph in Heading at weight 400, the rest in Body.
- Dominant element: the portrait.
- Display group: "Two habits".
- Phone portrait intent: portrait cropped to the top half, then the title, then the text.
- Content: a real, recognisable greyscale portrait from `docs/material/portrait-devfest-2026-grey.jpg`, with the Google Developer Group backdrop and the lanyard kept (D-15, D-22). Title "Two habits". The text is in Yahya's voice; the draft line "I decide fast under pressure, and I build things that run themselves." is his to rewrite, and the final copy comes in Phase 7.

### 05 Say hi

- Poster device: Type as interface, stacked giant links
- Columns (desktop): four Display lines in cols 1-9, bottom-anchored; cols 10-12 at the bottom hold the email address as a Label plus the copy status line.
- Dominant element: the four lines.
- Display group: the four lines.
- Phone portrait intent: the four lines at phone Display size, full width.
- Content: Email, LinkedIn, GitHub, Resume (PDF) (D-14). Clicking Email copies the address and the status reads "Copied {address}"; if copying fails it reads "Copy didn't work. The address is {address}, select it to copy." The `mailto:` href stays on the line, so visitors without JavaScript can still write.

Composition rules:

- Hairlines appear only on Achievements (a), the Projects compact rows and Experience. Index, About and Say hi have none.
- The rail appears on pages 01-05 only, not on Index.
- Every element starts and ends on a column line.
- Everything is flush left; no centred text.

## 8. Cursor

The custom cursor stays in v1 (D-18). Its job is to feel crafted and to guide navigation. Requirement: EXP-03.

- Its position is written on every `pointermove`, exactly on the pointer: no lag, lerp or spring.
- Only its shape changes, over `--dur-ui`.
- The native cursor may be hidden where the custom cursor runs.
- It is hidden on `(hover: none)` or `(pointer: coarse)`, so touch keeps the native cursor. Forced-colours mode keeps the native cursor too.
- Under reduced motion, shape changes are instant.

Form open: v7 offers (a) a hard-edged square outline in ink that snaps around the hovered letter or link and shows the section name as a Label, (b) a fine 1px crosshair or registration mark in the accent, (c) the native cursor plus a Label context tag over the YAHYA letters. Yahya picks by feel (D-19).

## 9. Material

Raw, public-safe material lives in `docs/material/` (D-21). Later phases copy optimised versions to `public/`.

| Item | Status |
|------|--------|
| `portrait-devfest-2026-grey.jpg` | present |
| `resume-public.pdf` | pending Yahya's re-export (D-23): freelance "2025 – Present", no phone |
| `links.md` | pending |
| `screenshots/` (Facturo) | pending paths from Yahya |
| `photos/` (robot, Atlantis) | pending paths from Yahya |

## 10. Open items only Yahya can settle

1. CCC "top 1" scope. Until it is confirmed, the site says only "perfect score, 75/75".
2. Atlantis line counts. Not shown until confirmed.
3. Showdown AI status.
4. Domain purchase.
5. Font purchase, if a paid face wins; the licence must name yahya-h.dev.
6. Robot CAD file (Phase 8).
7. Atlantis asset licences and teammates' consent to a public playable build (Phase 8).
8. Whether the public resume keeps the contest-platform bullet.
9. PDF author metadata ("M K" in the old file).
10. Confirm the public email.
11. Confirm the Experience role titles "Developer" (Facturo), "Problem author" (CRC 2027) and "Freelance developer". Only "Coding agent evaluator" is Yahya's own wording.
12. Updating the `portfolio-design` and `portfolio-voice-and-facts` skills and the CLAUDE.md stack section after approval.

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
