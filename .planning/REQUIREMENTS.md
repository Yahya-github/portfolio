# Requirements — Yahya Hallani Portfolio (yahya-h.dev)

Version 1 scope. Design comes first; final copy is written by Yahya later (content lives in data files so wording can change without touching components).

## v1 Requirements

### Design system (DSGN)
- [ ] **DSGN-01**: Visitor sees a dark ground with white type and one green accent (nature/terminal green) used consistently for emphasis and the current section
- [ ] **DSGN-02**: All text uses one sans family on a modular type scale and a 12-column grid (final family chosen in the design phase)
- [ ] **DSGN-03**: Each of the six pages has its own distinct composition on the shared grid (no two pages share the same layout)
- [ ] **DSGN-04**: Every motion follows one rule: movement on the horizontal axis, fast and decisive, no bounce
- [ ] **DSGN-05**: Real photos and screenshots of Yahya's work are shown with one consistent depth-map visual treatment
- [ ] **DSGN-06**: No ornament: no cartoon illustrations, pixel stickers, decorative HUD marks or skill bars

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
- [ ] **LTR-05**: The current section's letter is marked by the accent colour plus a non-colour cue
- [ ] **LTR-06**: On phones the rail sits inset from the left edge so it does not compete with the system back swipe

### Content (CONT)
- [ ] **CONT-01**: Hero shows a role line and one proof line beside the name, readable without any interaction
- [ ] **CONT-02**: Achievements shows a giant static 75/75 with "Canadian Computing Competition, perfect score", plus the four first places
- [ ] **CONT-03**: Projects presents Facturo as the flagship with the most space; the other four show problem, role, result and links
- [ ] **CONT-04**: Facturo has a deep-dive page (problem, what was built, result, screenshots, links)
- [ ] **CONT-05**: Experience shows Work and Involvement
- [ ] **CONT-06**: About is written in Yahya's own voice (personality lives here)
- [ ] **CONT-07**: Say hi offers email, LinkedIn, GitHub and a Resume (PDF)
- [ ] **CONT-08**: Resume and contact are reachable from every page
- [ ] **CONT-09**: All site text lives in typed data files; only verified facts ship

### Opening and phones (EXP)
- [ ] **EXP-01**: First-time visitor sees an opening animation under about 1 second that any click or key skips; content is already loaded underneath; it never repeats
- [ ] **EXP-02**: Phone visitor gets a designed portrait layout of every page and swipes between them; an optional hint says landscape shows the full posters (never blocking)

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
- Contact form, custom cursor, sound, light/dark toggle — research anti-features
- Blog, CMS, backend — static portfolio
- Invented metrics, testimonials or logos — only real facts

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | Phase 3 | Pending |
| DSGN-02 | Phase 3 | Pending |
| DSGN-03 | Phase 6 | Pending |
| DSGN-04 | Phase 5 | Pending |
| DSGN-05 | Phase 8 | Pending |
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
| EXP-01 | Phase 5 | Pending |
| EXP-02 | Phase 6 | Pending |
| SEO-01 | Phase 7 | Pending |
| SEO-02 | Phase 7 | Pending |
| A11Y-01 | Phase 4 | Pending |
| A11Y-02 | Phase 3 | Pending |
| A11Y-03 | Phase 3 | Pending |
| A11Y-04 | Phase 5 | Pending |
| A11Y-05 | Phase 3 | Pending |
| DEP-01 | Phase 2 | Pending |
| DEP-02 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0

Phase 1 (Design Gate) carries no requirement directly; it is the approval gate that enables every later phase.

---
*Defined: 2026-11-06*
