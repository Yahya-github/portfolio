# Roadmap: Yahya Hallani Portfolio (yahya-h.dev)

## Overview

The site goes from an approved design to a live dark Swiss portfolio on Vercel at yahya-h.dev. Phase 1 is a design gate: no product code until Yahya approves the updated design doc, the final font, each page's composition and the real material (photos, screenshots, resume, links). After that, a live deploy spike proves the hosting. Then come a static, server-rendered version of all six pages that works without JavaScript, the horizontal pager with its input model tuned on real hardware, the signature letters-to-rail navigation and its motion, the six page compositions with their content, and finally his own copy, sharing metadata and launch checks. Interactive proof (playable Atlantis, rotatable robot model) is its own track. It can start once the static pages exist, and it does not block the launch.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design Gate** - Updated design doc approved for the dark Swiss horizontal direction, final font chosen, six page compositions defined, real material collected
- [ ] **Phase 2: Live Deploy Spike** - Scaffolded Next.js static export live on Vercel at yahya-h.dev over HTTPS with self-hosted font, image and PDF
- [ ] **Phase 3: Static Design System and Pages** - Tokens, grid, giant YAHYA letter links and all six pages server-rendered at their own routes, fully usable without JavaScript
- [ ] **Phase 4: Horizontal Pager and Input** - One page per gesture by wheel, trackpad, keys and swipe, with real URLs, Back history and accessible page hand-off
- [ ] **Phase 5: Letter Navigation and Motion** - Letters glide from the hero into the left rail, footer pager, first-visit hint, opening animation and reduced-motion versions
- [ ] **Phase 6: Page Compositions and Content** - Each page gets its distinct composition: 75/75, Facturo flagship plus deep dive, Experience, Say hi with resume, phone portrait layouts
- [ ] **Phase 7: Copy, Sharing and Launch** - Yahya's final copy, per-page SEO metadata, LinkedIn share card, favicon, 404 and launch verification
- [ ] **Phase 8: Interactive Proof** - Playable Atlantis in the browser and a rotatable 3D model of the robot (parallel track, does not gate launch)

## Phase Details

### Phase 1: Design Gate
**Goal**: Yahya has approved a design doc for the dark Swiss horizontal direction, and everything needed to build is decided and gathered before any product code exists
**Depends on**: Nothing (first phase)
**Requirements**: None (design gate; it enables every later phase)
**Success Criteria** (what must be TRUE):
  1. `docs/superpowers/specs/2026-11-03-portfolio-design.md` describes the dark Swiss horizontal design (not the retired light paper design), and Yahya has marked it approved
  2. The final sans family is chosen after a side-by-side trial on the giant "YAHYA" and recorded in the doc, with its self-hosting licence confirmed
  3. Each of the six pages (Index, Achievements, Projects, Experience, About, Say hi) has a written, distinct composition on the 12-column grid; no two share a layout
  4. Real material is in the repo or a listed location: photos and screenshots, the resume PDF (without private details he does not want public), and email, LinkedIn, GitHub and project links
  5. The v6 sketch is saved under `docs/reference/`, and research Decisions 1-6 (URL model, WAAPI FLIP, rail inset, inner scroll, resume, domain) are recorded as accepted or overruled, with Vercel as the host
**Plans**: 8 plans
Plans:
- [x] 01-01-PLAN.md — Wave 0: commit v6, .gitignore font/secret guard, check.sh, greyscale portrait master
- [x] 01-02-PLAN.md — Font trial: OFL WOFF2 files, measured font-metrics.md, side-by-side font-trial.html
- [x] 01-03-PLAN.md — Design doc rewritten as revision 5 draft; EXP-03 cursor requirement and project/UI-SPEC edits
- [x] 01-04-PLAN.md — Material intake: redacted resume re-export, screenshots/photos, links.md (Yahya action)
- [x] 01-05-PLAN.md — Font pick checkpoint with Yahya (round 2 only if needed, max 2 rounds)
- [x] 01-06-PLAN.md — v7 sketch: six compositions in the winning font, Achievements a/b and cursor a/b/c toggles
- [ ] 01-07-PLAN.md — v7 picks checkpoint (Achievements, cursor, portrait crop) and picks written into the doc and requirements
- [ ] 01-08-PLAN.md — Pre-approval sweep and Yahya's approval commit (gate)
**UI hint**: yes

### Phase 2: Live Deploy Spike
**Goal**: A minimal build is live at yahya-h.dev on Vercel, which proves the hosting, domain, assets and CI before any real feature work
**Depends on**: Phase 1
**Requirements**: DEP-01, DEP-02
**Success Criteria** (what must be TRUE):
  1. Opening https://yahya-h.dev shows the placeholder build over HTTPS with no certificate warning, and pushing to the main branch redeploys it on Vercel
  2. The placeholder renders the chosen font, one image and a link to the resume PDF, all served from yahya-h.dev itself (no third-party asset requests in the network panel)
  3. A pull request runs lint, type check, unit tests and Playwright against the built static export, and a failure blocks the merge
  4. The baseline JavaScript size of the empty App Router build is measured and written down
**Plans**: TBD

### Phase 3: Static Design System and Pages
**Goal**: All six pages exist as real, readable, server-rendered HTML in the dark Swiss system, and the giant YAHYA letters already work as navigation, even without JavaScript
**Depends on**: Phase 2
**Requirements**: DSGN-01, DSGN-02, DSGN-06, CONT-01, CONT-09, LTR-01, LTR-02, A11Y-02, A11Y-03, A11Y-05
**Success Criteria** (what must be TRUE):
  1. Visitor sees a black ground, white type in one sans family on a modular scale and the 12-column grid, with the green accent used only for emphasis, and no ornament anywhere
  2. The hero shows YAHYA across the page with a numbered caption under each letter, plus a role line and one proof line that can be read with no interaction; the giant letters do not shift when the font loads
  3. With JavaScript disabled, all page text is present and clicking any letter (Y Achievements, A Projects, H Experience, Y About, A Say hi) reaches that page's own route
  4. A keyboard user's first Tab reveals a skip link, and every control shows a visible focus state
  5. An automated contrast check passes WCAG AA for every text token on the dark ground (no grey text darker than #8a8a8a), and all site text comes from typed data files
**Plans**: TBD
**UI hint**: yes

### Phase 4: Horizontal Pager and Input
**Goal**: Visitors move between the six full-screen pages sideways with any input device, one page at a time, and every page change is a real, shareable, accessible navigation
**Depends on**: Phase 3
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-07, A11Y-01
**Success Criteria** (what must be TRUE):
  1. One wheel notch or one trackpad flick moves exactly one page, and trackpad momentum never skips a page (verified on a Mac trackpad, a Magic Mouse, a Windows wheel and a Linux touchpad, plus recorded-trace tests)
  2. Arrow keys, Page Up/Down, Space and Home/End page correctly; on a phone a horizontal swipe pages, and a swipe that starts at the left edge is left to the system back gesture (tested on a real iPhone in Safari and the LinkedIn in-app browser, and on Android)
  3. Opening yahya-h.dev/projects/ lands directly on Projects; the URL updates on every page change, and the browser Back button steps back through the visited pages
  4. Every page fits one screen at 1366x768; at 200% zoom or on a short screen the page scrolls vertically, and paging happens only once the visitor reaches its edge
  5. Keyboard and screen-reader users only reach the current page; after a page change focus moves to the new page's heading and a live region announces the page
**Plans**: TBD
**UI hint**: yes

### Phase 5: Letter Navigation and Motion
**Goal**: The signature experience works: the name is the map, every motion follows one horizontal rule, and visitors always know where they are and that the site moves sideways
**Depends on**: Phase 4
**Requirements**: LTR-03, LTR-04, LTR-05, LTR-06, NAV-05, NAV-06, DSGN-04, EXP-01, EXP-03, A11Y-04
**Success Criteria** (what must be TRUE):
  1. Leaving the hero, the five letters glide and shrink into a vertical rail on the left; returning to the hero grows them back, and fast repeated paging or a window resize mid-flight never leaves letters stranded
  2. Hovering or focusing a rail letter reveals its section name; the current section's letter shows the accent colour plus a non-colour cue; on phones the rail sits inset from the left edge. With a mouse or trackpad, the custom cursor (form a, an ink square that snaps to letters and links) sits exactly on the pointer, and its label tag never runs past a screen edge; touch devices keep the native cursor.
  3. The footer shows a 00 / 05 counter, a "Next" control and a progress bar that track the current page; a first-time visitor sees a quiet hint that the site moves sideways
  4. A first-time visitor sees an opening animation under about 1 second, with content already loaded underneath; any click or key skips it, and it never plays again
  5. Every motion moves on the horizontal axis, fast with no bounce; with reduced motion enabled every animation (opening, paging, letters, hint) becomes an instant change
**Plans**: TBD
**UI hint**: yes

### Phase 6: Page Compositions and Content
**Goal**: Each of the six pages carries its own composition and real content, so a recruiter can see the record, the projects and how to reach Yahya on any screen, desktop or phone
**Depends on**: Phase 5
**Requirements**: DSGN-03, CONT-02, CONT-03, CONT-04, CONT-05, CONT-07, CONT-08, CONT-10, CONT-11, EXP-02
**Success Criteria** (what must be TRUE):
  1. Achievements shows 75/75 with "Canadian Computing Competition, perfect score" and the four first places as one typographic list, readable at once
  2. Projects gives Facturo the most space and links to a Facturo deep-dive page (problem, what was built, result, screenshots, links); Atlantis, CRC problems, robot firmware and Showdown AI each show problem, role, result and links
  3. Experience shows Work and Involvement; Say hi offers email, LinkedIn, GitHub and Resume (PDF); the resume and contact can be reached from every page
  4. No two of the six pages share a layout, side by side, each matching its approved composition from Phase 1
  5. On a phone in portrait every page has a designed layout and swipes to the next; an optional, never-blocking hint says landscape shows the full posters
  6. Hovering or focusing an Achievements line shows its proof photo and one line inside the viewport, and the DIRO and game-competition lines open their articles; Facturo plays as a pausable walkthrough of its screenshots (a stepper under reduced motion); the About portrait shows its true colours on hover or tap
**Plans**: TBD
**UI hint**: yes

### Phase 7: Copy, Sharing and Launch
**Goal**: The site speaks in Yahya's voice, every claim is verified, sharing the link looks branded, and the launch checks pass
**Depends on**: Phase 6
**Requirements**: CONT-06, SEO-01, SEO-02
**Success Criteria** (what must be TRUE):
  1. About ("Two habits") and all other text are Yahya's final, approved copy in the data files, and every fact on the site has been checked against a real source
  2. Each page has its own title, description and canonical URL, and a search engine sees Person structured data
  3. Pasting yahya-h.dev into LinkedIn shows a branded preview card; the tab shows the favicon; a mistyped URL shows an on-brand 404 that leads back into the site
  4. A five-second test with someone new shows they can say who Yahya is, one proof point and how to contact him; axe, Lighthouse budgets and a VoiceOver or NVDA pass are clean
**Plans**: TBD
**UI hint**: yes

### Phase 8: Interactive Proof
**Goal**: Visitors can touch Yahya's real work on the site itself: play Atlantis and rotate the real robot, without slowing any other page
**Depends on**: Phase 3 (parallel track; can run alongside Phases 4-7 and land before or just after launch; v1 is complete only when it ships). Robot model needs Yahya's CAD file
**Requirements**: PROOF-01, PROOF-02
**Success Criteria** (what must be TRUE):
  1. Atlantis runs in the browser on its project page as a single-thread Godot web export, loaded only there; its asset licences and teammates' consent are confirmed before publishing; if too heavy, screenshots plus a link replace it
  2. The robot project shows a rotatable 3D model built from the real CAD file, lazy-loaded with a static image first; the page works fully without it
  3. Neither piece adds JavaScript or requests to any other page; both respect reduced motion and keyboard use
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7. Phase 8 can start any time after Phase 3 and runs alongside the rest; it does not gate the Phase 7 launch.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design Gate | 6/8 | In Progress|  |
| 2. Live Deploy Spike | 0/TBD | Not started | - |
| 3. Static Design System and Pages | 0/TBD | Not started | - |
| 4. Horizontal Pager and Input | 0/TBD | Not started | - |
| 5. Letter Navigation and Motion | 0/TBD | Not started | - |
| 6. Page Compositions and Content | 0/TBD | Not started | - |
| 7. Copy, Sharing and Launch | 0/TBD | Not started | - |
| 8. Interactive Proof | 0/TBD | Not started | - |

## Research Flags

- Phase 4: needs real hardware (trackpads, wheels, iPhone Safari and LinkedIn in-app browser, Android) to tune the gesture model.
- Phase 5: needs a spike on FLIP interruption and resize (native WAAPI; switch to GSAP Flip only if bugs cost more than a day).
- Phase 8: Godot single-thread web export size and loading, and the CAD-to-web model pipeline (format, size, viewer) need research.
