# Requirements — Yahya Hallani Portfolio (yahya-h.dev)

Version 1 scope. Design comes first; final copy is written by Yahya later (content lives in data files so wording can change without touching components).

## v1 Requirements

### Design system (DSGN)
- [ ] **DSGN-01**: Visitor sees a dark ground with white type and one green accent (nature/terminal green) used consistently for emphasis and the current section
- [ ] **DSGN-02**: All text uses one sans family on a modular type scale and a 12-column grid (final family chosen in the design phase)
- [ ] **DSGN-03**: Each of the six pages has its own distinct composition on the shared grid (no two pages share the same layout)
- [ ] **DSGN-04**: Every motion follows one rule: movement on the horizontal axis, fast and decisive, no bounce
- [ ] **DSGN-05**: Real photos and screenshots of Yahya's work are shown with one plain treatment: greyscale, hard crops on the 12-column grid, no filters or effects (his face stays clearly visible); exceptions that show their own true colours on hover or tap (instant under reduced motion), never as an accent use: the About portrait (also on keyboard press) the organisation marks on Experience (mono by default) the Facturo walkthrough frames (colour while the visitor holds it paused) and the Achievements and Projects (MAME) hover and focus previews (inline phone thumbnails stay greyscale)
- [ ] **DSGN-06**: No ornament: no cartoon illustrations, pixel stickers, decorative HUD marks or skill bars (the real organisation marks on Experience identify where Yahya worked and took part; they are content, not ornament)

### Paging (NAV)
- [ ] **NAV-01**: Visitor moves one page per wheel or trackpad gesture; trackpad momentum never skips a page
- [ ] **NAV-02**: Visitor can page with arrow keys, Page Up/Down, Space and Home/End
- [ ] **NAV-03**: Visitor on a phone can swipe between pages; the left screen edge is left to the system back gesture
- [ ] **NAV-04**: Each page has its own URL (/achievements/ etc.); opening a link lands on that page directly; Back steps through visited pages
- [ ] **NAV-05**: Visitor always sees where they are: 00 / 05 counter, a "Next" control and a progress bar
- [ ] **NAV-06**: First-time visitor sees a quiet hint that the site moves sideways
- [ ] **NAV-07**: Every page fits one screen at 1366x768 and above; if content overflows (zoom, short screens) the page scrolls vertically and paging happens only at its edge

### Letter navigation (LTR)
- [ ] **LTR-01**: Hero shows YAHYA in giant letters across the page; each letter is a link to its section (Y Achievements, A Projects, H Experience, Y About, A Say hi)
- [ ] **LTR-02**: Each hero letter has a numbered caption naming its section
- [ ] **LTR-03**: Leaving the hero, the letters glide and shrink into a vertical rail on the left; returning to the hero grows them back
- [ ] **LTR-04**: Rail letters reveal their section name on hover and keyboard focus
- [ ] **LTR-05**: The current section's letter is marked by the accent colour plus a non-colour cue; only that letter is ever in the accent (derived from the current page, never from hover or focus), and each letter's hit area is its own box
- [ ] **LTR-06**: On phones the rail sits inset from the left edge so it does not compete with the system back swipe

### Content (CONT)
- [ ] **CONT-01**: Hero shows a role line beside the name, readable without any interaction (the proof line was dropped by Yahya, 2026-11-07)
- [ ] **CONT-02**: Achievements shows 75/75 with "Canadian Computing Competition, perfect score" in one typographic list with the four first places, at the same weight as the other results
- [ ] **CONT-03**: Projects presents Facturo as the flagship with the most space; the other five (MAME Tool Rental first, then Atlantis, CRC problems, Robot firmware, Showdown AI) show problem, role, result and links; the MAME row previews its admin overview screenshot on hover and keyboard focus
- [ ] **CONT-04**: Facturo has a deep-dive page (problem, what was built, result, screenshots, links)
- [ ] **CONT-05**: Experience shows Work and Involvement
- [ ] **CONT-06**: About is written in Yahya's own voice (personality lives here)
- [ ] **CONT-07**: Say hi offers email, LinkedIn, GitHub and a Resume (PDF)
- [ ] **CONT-08**: Resume and contact are reachable from every page
- [ ] **CONT-09**: All site text lives in typed data files; only verified facts ship
- [ ] **CONT-10**: Each Achievements line previews its proof on hover and keyboard focus only, never held by a mouse click (a small photo in its colours and one line, kept inside the viewport); a line with a public source (an article or a post) opens it in a new tab; on touch the thumbnail shows inline under its line, in greyscale; a result with no photo or public source shows a description only
- [ ] **CONT-11**: Projects shows Facturo as a walkthrough of its greyscale screenshots (slow push-in and crossfade, transform and opacity only, frames lazy-loaded) with a visible pause control; it pauses on hover and keyboard focus (over the visible frame and its controls only), off-page and offscreen and always resumes once none of these holds (a mouse-clicked control does not hold it), while the visitor holds it paused (hover, keyboard focus, or a tap on touch) the current frame shows its colour original, portrait screenshots are shown whole and centred, and it becomes a manual previous/next stepper under reduced motion
- [ ] **CONT-12**: Experience rows show the real mark of their organisation (Mercor, Facturo, CRC, McGill Robotics, Google Developer Groups, ICPC) small and flush with the column edge, in one mono colour by default, with its true colours on row hover or tap; marks are decorative (the text names the organisation) and only attach to entries that exist; the MAME mark follows the same rule on its Projects row; an ended role shows its date range, never "since"

### Interactive proof (PROOF)
- [ ] **PROOF-01**: Visitor can play Atlantis in the browser on its project page (single-thread Godot web export, loaded only on that page, with a screenshot and link fallback if too heavy; asset licences and teammates' consent checked first)
- [ ] **PROOF-02**: Visitor can rotate a 3D model of the real CRC robot on the robot project (from Yahya's CAD file; lazy-loaded, static image first, page works without it)

### Opening and phones (EXP)
- [ ] **EXP-01**: First-time visitor sees an opening animation under about 1 second that any click or key skips; content is already loaded underneath; it never repeats
- [ ] **EXP-02**: Phone visitor gets a designed portrait layout of every page and swipes between them; an optional hint says landscape shows the full posters (never blocking)
- [ ] **EXP-03**: On devices with a fine pointer, a custom cursor sits exactly on the pointer (1:1, no lag or spring; only its shape changes) and guides navigation; touch devices and forced-colours mode keep the native cursor; under reduced motion shape changes are instant (form: variant a, a hard-edged ink square that snaps around the hovered letter or link with a Label tag that always stays inside the viewport, picked in Phase 1)

### Discoverability (SEO)
- [ ] **SEO-01**: Each page has its own title and description; canonical URLs; Person structured data
- [ ] **SEO-02**: Sharing the link on LinkedIn shows a branded preview card; site has a favicon and an on-brand 404 page

### Accessibility (A11Y)
- [ ] **A11Y-01**: Keyboard and screen-reader users only reach the current page; focus moves to the new page heading; page changes are announced
- [ ] **A11Y-02**: Skip link and visible focus states on every control
- [ ] **A11Y-03**: All text meets WCAG AA contrast on the dark ground
- [ ] **A11Y-04**: With reduced motion enabled every animation is replaced by an instant change
- [ ] **A11Y-05**: With JavaScript disabled all text is present and every letter link still reaches its page

### Deployment (DEP)
- [ ] **DEP-01**: Site is live on Vercel at yahya-h.dev over HTTPS (domain bought before the first deploy)
- [ ] **DEP-02**: Fonts, images and the resume are self-hosted (no hotlinked assets)

## v2 Requirements (deferred)
- French version
- Showdown AI deep dive (once something is built)
- More project deep dives
- Cookieless analytics
- Writing / notes section

## Out of Scope
- 75-dot judge animation — reads as a loader or decorative counter in the Swiss direction; a static typographic 75/75 replaces it
- Pixel stickers (furnace, Poké Ball peel) and Icons8 illustrations — clash with the dark Swiss style
- "Rotate your phone" gate — recruiters open links on phones (often in LinkedIn's in-app browser, rotation locked) and would leave
- Long or repeating intro — recruiters decide in seconds
- Depth-map treatment and generative background visuals (simulations, terrain) — tried 2026-11-06; borrowed aesthetics that do not come from Yahya. The wow comes from the letter navigation, craft and real interactive proof
- Contact form, sound, light/dark toggle — research anti-features (custom cursor moved into v1 as EXP-03 on 2026-11-06, D-18)
- Viscous bubble cursor and the Sableye pink/green hint — dropped 2026-11-06 (D-18)
- Blog, CMS, backend — static portfolio
- Invented metrics, testimonials or logos — only real facts

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | Phase 3 | Pending |
| DSGN-02 | Phase 3 | Pending |
| DSGN-03 | Phase 6 | Pending |
| DSGN-04 | Phase 5 | Pending |
| DSGN-05 | Phase 6 | Pending |
| DSGN-06 | Phase 3 | Pending |
| NAV-01 | Phase 4 | Pending |
| NAV-02 | Phase 4 | Pending |
| NAV-03 | Phase 4 | Pending |
| NAV-04 | Phase 4 | Pending |
| NAV-05 | Phase 5 | Pending |
| NAV-06 | Phase 5 | Pending |
| NAV-07 | Phase 4 | Pending |
| LTR-01 | Phase 3 | Pending |
| LTR-02 | Phase 3 | Pending |
| LTR-03 | Phase 5 | Pending |
| LTR-04 | Phase 5 | Pending |
| LTR-05 | Phase 5 | Pending |
| LTR-06 | Phase 5 | Pending |
| CONT-01 | Phase 3 | Pending |
| CONT-02 | Phase 6 | Pending |
| CONT-03 | Phase 6 | Pending |
| CONT-04 | Phase 6 | Pending |
| CONT-05 | Phase 6 | Pending |
| CONT-06 | Phase 7 | Pending |
| CONT-07 | Phase 6 | Pending |
| CONT-08 | Phase 6 | Pending |
| CONT-09 | Phase 3 | Pending |
| CONT-10 | Phase 6 | Pending |
| CONT-11 | Phase 6 | Pending |
| CONT-12 | Phase 6 | Pending |
| EXP-01 | Phase 5 | Pending |
| EXP-02 | Phase 6 | Pending |
| EXP-03 | Phase 5 | Pending |
| SEO-01 | Phase 7 | Pending |
| SEO-02 | Phase 7 | Pending |
| A11Y-01 | Phase 4 | Pending |
| A11Y-02 | Phase 3 | Pending |
| A11Y-03 | Phase 3 | Pending |
| A11Y-04 | Phase 5 | Pending |
| A11Y-05 | Phase 3 | Pending |
| DEP-01 | Phase 2 | Pending |
| DEP-02 | Phase 2 | Pending |
| PROOF-01 | Phase 8 | Pending |
| PROOF-02 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 45 total (CONT-10 and CONT-11 added 2026-11-07 from Yahya's v7 review, plan 01-07; CONT-12 added 2026-11-07 from his 01-08 change list)
- Mapped to phases: 45
- Unmapped: 0

Phase 1 (Design Gate) carries no requirement directly; it is the approval gate that enables every later phase.

---
*Defined: 2026-11-06*
