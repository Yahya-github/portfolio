# Portfolio website: design

Status: DRAFT for Yahya's approval (revision 4: nav is now the name itself, no folder tabs, no italic serif, neutral paper). Nothing is built. Date: 2026-11-03.
Owner: Yahya Hallani. Domain (to be acquired by Yahya): `yahya-h.dev`.

Companion skills (rules and facts, read them when building): `portfolio-design`, `portfolio-voice-and-facts`, `anti-vibe-design`, `web-inspiration-sources`, `apple-design`.

## 1. Intent and why

A personal portfolio for Yahya, a McGill software engineering student, to be seen by recruiters, hiring managers, and curious strangers. He has been programming for about a year and has an unusually dense record: a perfect CCC score, four first places, a real client product, contract work evaluating AI coding agents. His freelance work starts in 2025 (his resume source said May 2023 and still must be corrected, see section 9).

A visitor should feel **a breath of fresh air**: calm, minimalist, intuitive, and captivating enough to pull them through the whole site. They should be impressed by how much he has done in so little time and feel the experience of someone older, without the site ever saying so. They should sense a kind, passionate, ambitious person who is fun to talk to, and they should want to write to him.

Underlying idea, in two habits: **he decides fast under pressure, and he builds things that run themselves.** Competitive Pokemon (chess with more variables: bluffing, fast damage calculation on a clock) and Minecraft automation packs (SkyFactory, StoneBlock) are where those habits came from. They are mentioned once, plainly, in About. The site must work completely for a visitor who has never heard of either.

## 2. Goals

- A first screen that earns a "huh, this is different" in two seconds.
- Proof of ability through true specifics (dated wins, real projects, real numbers), not adjectives.
- A site that is itself fast: the speed is the personality.
- English at launch, French after.
- Every project page ends in something the visitor can touch or see.
- Easy, friendly contact.

## 3. Non-goals

- Not a blog, a CMS, or an app. No accounts, no database, no server.
- No theming of the site around Pokemon or Minecraft.
- No animated showpiece effects whose only job is to impress. (The cursor bubble is allowed because Yahya chose it and its colour carries a meaning; it must stay out of the way and keep the page fast.)
- No analytics or tracking beyond what Yahya approves.
- No mention of the CRC contest platform (Yahya chose to leave it out).
- No phone number published (Yahya's decision).

## 4. Anti-goals (would make this a failure even if it technically works)

- It reads as AI-default or template output. The avoid-list in `anti-vibe-design` is binding.
- It feels heavy: slow first paint, janky scroll, or motion that blocks input.
- It brags. The visitor should do the math; the site states facts.
- Any invented number, fake testimonial, or claim Yahya cannot back up.
- A gimmick that fails the meaning test: every element must answer "why is this here, and why for Yahya?" Already rejected for this reason: conveyor belts, Pokedex stat bars, a sprite on the hero, a terminal window, a clock, a pill or glass nav.

## 5. Constraints

- **Stack (Yahya's choice):** React and Next.js, hosted on GitHub Pages.
- **Static only.** Next.js `output: 'export'`. No server features: no SSR, ISR, middleware, API routes, or default image optimization. Pages serves no custom headers, so security headers come from the HTML (a `<meta>` CSP where possible); `.dev` is HTTPS-only by browser preload.
- **Performance budget:** landing page at most about 150 kB gzipped JavaScript and 30 kB CSS, LCP under 2.5 s, CLS under 0.1, INP under 200 ms. Three.js and the Atlantis web build load only on their own pages. Measure; do not guess.
- **Accessibility:** semantic HTML, keyboard reach, real contrast, `prefers-reduced-motion` and `prefers-reduced-transparency` honored, a reduced-motion version of every animation (peel, the name flying into the header, furnace glow included).
- **Languages:** English goes live first and French follows; French is not launch-blocking, but the structure must make adding it cheap (`/en` and `/fr` routes, copy in message files; Next's built-in i18n routing is unavailable in static export). The header already carries the EN / FR switch.
- **Facts:** every claim comes from `portfolio-voice-and-facts`.
- **Fonts:** self-hosted, licensed for web use. The chosen families are open-licensed (OFL), so nothing needs buying. Fonts are design tokens so they can be swapped.
- **Third-party art** (stickers, GIFs): taken from online sources and credited on a credits page. Yahya accepts this and explicitly said fan assets may be used with credit. Chosen sources: PokeAPI sprites repository (the Poke Ball item sprite and the Sableye showdown sprites, normal and shiny) and the Minecraft Wiki (furnace image and lit animation). The preview sketches hotlink them; the real site must download, self-host, and credit them. Pokemon and Minecraft names and art belong to their owners. Pokemon and Minecraft art belongs to their owners; prefer assets under an explicit free licence (CC0, CC BY) and credit each one. Using official art anyway is a known, accepted risk, common on fan sites. A credit is not a licence.

## 6. What Yahya decided

**Order of the page:** Arrival, Achievements, Projects, Experience, About, Say hi. Achievements (wins) and Projects (the things made, shown as the folder stack) are separate. **Experience** (decided 2026-11-04) has two categories: Work (jobs and contracts: coding agent evaluator at Mercor, CRC problem author, developer on Facturo, freelance developer) and Involvement (McGill Robotics, Google Developer Group at McGill, McGill Compete). The role names under Work other than Mercor's are the author's wording, to confirm. The nav letters stay Y Achievements, A Projects, H Experience, Y About, A Say hi. The section that used to be called Work is now called Projects so the two names do not clash. Atlantis and the robot appear in both: one line under Achievements linking to the full project under Work.

**Look**
- Neutral light paper `#f8f8f8` (not pure white, and no longer the sand beige, which Yahya called too vibe-coded), near-black ink `#141414`, muted `#737373`, rules `#e0e0e0`, and **one accent: calm dark green `#2f5d46`**. No purple. These values are a placeholder: Yahya wants a later pass to improve the background and other details (see section 9).
- Reference tone: Julian Ozen's calm whitespace and Elena Gonci's idea that the interface itself carries the personality.

**Navigation: the name is the map (decided).** YAHYA has five letters and the site has five sections, so each letter is a link: Y Achievements, A Work, H Involvement, Y About, A Say hi. On arrival the giant letters are the menu, with the section name in small tracked capitals under each letter. When the visitor scrolls, the five letters shrink and fly up into a thin header bar, ending as a centered row of small letters that stays as the nav. It is one set of elements that moves, not a copy that fades in. In the header: hovering a letter shows its section name in a small dark label inside the bar under the letter (it must not cross the header line); the current section's letter turns green with a short underline; clicking scrolls to the section. The header's right side holds EN / FR; the left side is empty (Yahya removed the small "Yahya Hallani" text). A thin rule appears under the header once the letters have landed. No folder tabs, no italic numerals, no clock, no pill, no glass. A working sketch exists (`scroll-nav.html`, throwaway, in the brainstorm preview folder); it is a reference for behavior, not code to keep.

**Arrival (his reference template):** the header above; a small centered line in upright, tracked, condensed capitals that says plainly who he is, **"Software Engineering at McGill"** (his wording, a direct statement, not a tagline); then one giant block of type filling the rest of the viewport, centered and spanning the full width. The giant word is **YAHYA** and doubles as the navigation (see above).

**Type (decided: one family):** Sofia Sans only, used at very different widths. Sofia Sans Extra Condensed at weight 900 for the giant word and the header letters; the same Extra Condensed at medium weight, tracked and uppercase, for the small identity line; Sofia Sans for body, labels and headings. No italic serif and no second family: Yahya said the "cursive" look reads as Claude-coded, and a single family is itself uncommon. No Inter, Geist, or Space Grotesk.

**Cursor (decided): a viscous bubble.** On devices with a mouse, the pointer is a small blob of liquid that follows it on a spring. It lags behind movement, stretches unevenly into a teardrop, settles slowly without bouncing, and its outline is slightly lumpy and imperfect, never a clean ellipse. Faster movement sheds small bubbles of random size behind it, which drift, pop, and are pulled back in when the pointer slows; a "goo" effect melts the bubbles and the body together where they touch. A tiny dot marks the exact pointer position. Colours are inverted from whatever is underneath (white with a difference blend), which turns the green accent pink: pink is base Sableye and green is shiny Sableye, a hidden hint to his favourite Pokemon. Do not neutralise that. Over a link the bubble grows to about 1.75 times its size; pressing shrinks it a little. Touch devices get no bubble, and with `prefers-reduced-motion` it is a plain circle that follows the pointer with no lag, stretch, or trail. The native cursor is hidden only where this runs. The working sketch is `cursor-bubble-v5.html` (throwaway, in the brainstorm preview folder) and holds the behaviour and starting spring values; the builder must measure its cost (a full-screen canvas plus an SVG filter) against the performance budget and simplify if it hurts INP or frame rate.

**Motion:** calm. One staggered entrance, interruptible, instant response to the pointer, compositor-friendly properties only, at most one hover treatment type across the site (a lift or slide).

**Achievements (confirmed facts):**
- Canadian Computing Competition 2026: perfect score, 75/75. Yahya says he finished top 1; the scope of that (division, overall or not) is unconfirmed, so the words "ranked first" are not on the page yet.
- Each result carries a small minimalist medal icon next to it: gold for 1st, silver for 2nd (so the CCC and the 2025 programming first, the hackathon, the game competition and the robot are gold, and the 2026 programming second place is silver). A leaderboard layout (giant rank numerals in place of the medals) is a proposal he has not decided on.
- DIRO Hackathon 2026: 1st of 18 teams.
- Intercollegiate Video Game Creation Competition 2026: 1st place with Atlantis.
- Canadian Robotics Competition, programming: **1st in 2025, 2nd in 2026**.
- Canadian Robotics Competition, robot: **1st in 2026**.

**Work:** presented as a stack of full-width folders that pile up as you scroll (decided; sketch `full-sketch-v8.html`). The technique is the same one used on Elena Gonci's portfolio (an Awwwards nominee, which Yahya gave as a reference): each folder is a full-width panel with a curved-shoulder label tab, pinned with `position: sticky` at a slightly lower offset than the one before. Scrolling slides the next folder up over the previous one, and every earlier folder keeps its tab and name strip showing at the top, so nothing disappears. Each folder is as tall as the screen so the last one pins to the bottom. When a folder arrives, its three papers (the problem, what I built, the result) rise out of it; the real thing to open (demo link, code, 3D model) sits on the folder's bottom strip. The tall folder leaves room for the real artifact once it exists: the playable Atlantis build, the rotatable robot model, GIFs of Facturo and the firmware. Until then the space is empty; a media slot with an honest 'coming' placeholder should fill it. Builder notes: apply the spacing between folders as a top margin on the next folder, because a pinned element counts its bottom margin as part of itself and tall folders get pushed off the top near the end of the stack; add trailing space so the last folder stays pinned briefly; on narrow screens fall back to a plain stack. The folder is original vector artwork (a tab with eased shoulders, panel, papers with a dog-eared corner), so nothing needs a licence. Four or five projects, each told as problem, what was built, result, and each ending in something real:
- **Facturo:** link to the public demo with fictional data.
- **Atlantis:** playable in the browser through a Godot web export. The code lives in his public fork `Yahya-github/atlantis`. The level 3 bug is fixed and pushed (commit `7bdbcd8`): `game_wrapper.tscn` referenced level 5 with level 3's UID, so level 3 loaded twice and level 5 not at all. It has not been run in Godot; level 5 now loads for the first time and may expose unfinished content. The game's assets include Freepik and Google Fonts files listed in `sources.txt`: their licences and attribution must be checked before publishing a web build.
- **CRC problem design:** the 12 problems he designed, their edge cases and reference solutions. No contest-platform code or demo, and the platform is not mentioned.
- **CRC robot firmware:** the real firmware is private, so a new public showcase repo (state-machine design, PID tuning, a simulation) is written fresh; Yahya confirmed all of that is safe to show. A rotatable 3D model of the real robot sits on this page only, from the real CAD file Yahya will supply later. The page works without it.
- **Showdown AI:** shown only as honestly "in progress".

**Involvement:** three short lines with small icons from one consistent set: McGill Robotics (Software), Google Developer Group at McGill (Full-stack, subteam project), McGill Compete (competing in ICPC NENA).

**About:** short, first person, the two habits, where they came from. Beside it, two small stickers and nothing else on the page:
- a **Minecraft furnace** (the real still image and lit animation from the Minecraft Wiki) that **lights up when the cursor passes over it** (and on keyboard focus);
- a **Pokeball** sticker, the real pixel sprite from the PokeAPI sprites repository, whose own pixel shape is the sticker (no circle). The visitor **presses and drags it in any direction**: the edge opposite the drag lifts and folds over, showing a pale grey back, and the **shiny Sableye** (his favourite Pokemon, animated pixel sprite) shows through the cut-out shape underneath. It peels almost all the way: the flap may hang out past the ball, but the fold stops at about 90 percent across so a small sliver always stays stuck on the ball. **Letting go makes it spring back and stick down again**; it never comes off. A damped (no overshoot) spring does the return; the keyboard (Enter or Space) lifts a corner briefly and drops it; reduced motion skips the animation. Sketch: `about-assets-v6.html`, approved by Yahya. Only the shiny Sableye shows for now (his light mode); a dark-mode variant comes later.

**Say hi:** a warm one-liner plus email, LinkedIn, and GitHub from his resume. **No phone number.** No form wall.

**Skills created:** the five skills above, so any session applies these rules.

## 7. Decided by the author of this document (Yahya has not approved these specifically)

- **Fonts:** Sofia Sans alone (extra condensed black for the giant word), chosen because it is closest to his hero reference, is open-licensed, and is off the trending lists. Yahya said he has no UI skills and asked me to decide. It is a token, swappable any time, including for a paid face he buys later.
- **Paper colour:** the neutral `#f8f8f8` and its companion greys are my call after he rejected the beige; he accepted it "for now" and wants a refinement pass later.
- **Scroll flight:** the letters finish landing after the page has scrolled about 60 percent of the viewport height, eased (smoothstep), driven by scroll position. That distance and the easing are my guess; tune by feel.
- The small Arrival line is the plain identity "Software Engineering at McGill" (Yahya's request). The sentence "I decide fast under pressure, and I build things that run themselves" no longer sits on the first screen; it lives in About as a draft for him to rewrite. Whether to add "Montreal" to the Arrival line is left to him.
- At 320 px the five header letters still fit beside EN / FR, so no menu button is needed. The section names under the giant letters are wide at that size ("Involvement" under one narrow letter): the builder must solve that (smaller type, staggered heights, or shortened labels) and show it to Yahya.
- Flight technique: translate and scale transforms, never animating font size; the letters are real links so keyboards and screen readers get a normal nav, and the title keeps a readable "Yahya Hallani" label. With `prefers-reduced-motion`, the letters jump to the header position with a very short transition and no flight.
- The furnace glow is an opacity change on a glow layer; under reduced motion it lights without animating.
- `/` redirects by browser language (French only once `/fr` exists), otherwise to `/en`, and remembers the visitor's choice.
- Next.js App Router with mostly server components so only interactive pieces ship JavaScript; plain CSS with the tokens above, no Tailwind or component-library defaults.
- Atlantis as a single-thread Godot web export, loaded lazily on its own page, because GitHub Pages cannot set the cross-origin headers a threaded export needs. Fallback if too heavy: screenshots plus a link.
- Launch minimum: the shell plus every project that already exists. Projects whose real artifact is not ready (robot 3D model, showcase repo, Showdown AI) are shown honestly as in progress, never as empty placeholders. Copy that depends on unsettled facts does not ship.
- Deployment through a GitHub Actions workflow publishing the static export, with a `CNAME` for `yahya-h.dev`.
- The Atlantis web export and the robot showcase repo are separate pieces of work, after the site shell exists.

## 8. Left to the builder

Component structure, animation implementation (CSS and small hand-written JavaScript versus a library, as long as the budget and reduced-motion rules hold), the peel implementation (pointer drag on a layered element or an SVG, with keyboard activation and a reduced-motion alternative), how the flying letters are measured and positioned (the sketch measures hidden placeholders and moves fixed letters between them), French copy workflow, test strategy (visual regression at 320, 768, 1024, 1440, accessibility, Lighthouse), file layout, and the order of delivery.

## 9. Open items only Yahya can settle

1. **Resume date.** Resume Studio in JobOps still reads "May 2023 - Present" for freelance. Yahya wants "2025 - Present" (month unknown). The database file is not writable by his user and the app needs his login, so he must change it in Resume Studio, then re-export the PDF. A backup of the original is saved in the session scratchpad.
2. **Sticker and GIF sources.** Which specific assets, and that each is credited on the credits page.
3. **Atlantis.** Verify the level fix in Godot, check Freepik and font licences, and confirm teammates are fine with a public playable build.
4. **Domain.** `yahya-h.dev` must be purchased and its DNS pointed at GitHub Pages.
5. **CAD file** for the robot, later.
6. **Month of the 2025 freelance start**, if he wants the resume to show one.
7. **Cursor tuning (later):** how thick, lumpy and gooey the bubble feels, and whether hiding the native cursor is acceptable once he has used it on the real page. Offered tuning: damping (thicker or runnier), edge wobble (lumpier or smoother), goo strength (gooier or crisper).
8. **Section ideas still undecided:** Yahya wants every section to have its own novel way of showing its content, ideally inspired by real sites. Done: Work (folder drawer) and About (stickers). Rough proposals only, in `section-concepts.html`: Achievements as a leaderboard, Involvement as a team roster, Say hi as three giant lines (Email copies the address). None is approved.
9. **Dark mode and light mode:** he will add both later; the shiny Sableye is the light-mode version, and the colour of the shiny sprite from the repository (it looks gold) should be checked against the green he expects.
10. **Visual refinement pass (his request, later):** improve the background and other details. The current grey-white paper and the sketch's details are placeholders he accepted "for now".

## 10. Success

- A stranger reaches the end of the page without being pushed.
- Lighthouse performance 95 or better on mobile for the landing page, with the budget above met.
- Every claim traces to a fact in `portfolio-voice-and-facts`.
- Yahya looks at it and thinks it feels like him and not like a template.
