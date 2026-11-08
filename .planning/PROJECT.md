# Yahya Hallani — Portfolio (yahya-hallani.dev)

## What This Is

A personal portfolio site for Yahya Hallani, a Software Engineering student at McGill, aimed at recruiters and internship leads. It presents his competition record, projects and experience so a visitor leaves thinking "that kid is cracked". It should feel intuitive, never tiring, and make people want to explore the whole site.

## Core Value

The design itself: a distinctive, non-generic dark Swiss experience (giant YAHYA letters that are the navigation, pages that switch horizontally) that a recruiter remembers. Copy and descriptions can come later; the design must be right first.

## Requirements

### Validated

- [x] Site live on Vercel at https://yahya-hallani.dev over HTTPS, apex canonical, www 308 → apex (DEP-01) — Validated in Phase 2: Live Deploy Spike
- [x] Fonts, images and the resume self-hosted, no third-party asset requests (DEP-02) — Validated in Phase 2: Live Deploy Spike

Phase 1 (Design Gate) complete 2026-11-07: design doc revision 5 approved by Yahya; font, layouts, cursor, material and copy facts decided. Requirements stay Active until built.

Phase 2 (Live Deploy Spike) complete 2026-11-08: placeholder static export live on Vercel; public repo Yahya-github/portfolio with branch-protected main (lint, typecheck, unit, e2e required); baseline JS 132.1 kB gzip recorded in docs/reference/perf-baseline.md.

### Active

- [ ] Dark Swiss design system: black ground, white type, one green accent, one sans family (Instrument Sans), 12-column grid, flush-left text, no ornament
- [ ] Six full-screen pages switched horizontally: Index (hero), Achievements, Projects, Experience, About, Say hi
- [ ] Page switching by wheel/trackpad (one gesture = one page, inertia ignored), arrow keys, Page Up/Down, Space, Home/End, and swipe
- [ ] Hero: giant YAHYA spanning the page; each letter is a clickable link to its section (Y Achievements, A Projects, H Experience, Y About, A Say hi), with numbered captions
- [ ] Leaving the hero, the five letters shrink and glide into a vertical rail on the left that stays as the navigation, current section in the accent colour
- [ ] Achievements: variant (b), letter-pair title with five equal lines (CCC 75/75 included, not dominant) and hover photo previews linking to public sources (chosen in Phase 1)
- [ ] Custom cursor that sits exactly on the pointer (EXP-03), form (a) square outline that snaps to the hovered item (chosen in Phase 1)
- [ ] Projects: Facturo, MAME Tool Rental, Atlantis, CRC problems, robot firmware, Showdown AI
- [ ] Experience: Work and Involvement lists
- [ ] About ("Two habits") and Say hi (email, LinkedIn, GitHub)
- [ ] Footer pager (00 / 05), "Next" control, progress bar
- [ ] Real photos (portrait on About, project screenshots) in one plain greyscale treatment
- [ ] Interactive proof: playable Atlantis in the browser and a rotatable 3D model of the robot
- [ ] Accessible: keyboard navigation, focus states, inactive pages inert, reduced-motion versions of every animation, works without the pointer
- [ ] Works on phones (swipe paging, letter rail scaled down)
- [ ] Hero shows a role line beside the giant YAHYA, readable with no interaction (proof line dropped by Yahya, 2026-11-07)
- [ ] Resume PDF (self-hosted) on Say hi and reachable from every page
- [ ] Contact visible from every page
- [ ] Each page has its own real URL (/achievements/ etc.); Back steps through visited pages
- [ ] First-visit hint and visible Next control
- [ ] SEO and sharing: titles, description, canonical, Person JSON-LD, Open Graph card, favicon, on-brand 404
- [ ] Skip link, live region announcing page changes, contrast-tested tokens (small grey text no lighter than #8a8a8a on black)
- [ ] Final copy and descriptions written by Yahya (deferred to a later phase)

### Out of Scope

- Blog, CMS, backend — static portfolio; nothing to manage at runtime
- French at launch — English first, French later
- Icons8 cartoon illustrations — rejected 2026-11-05 as too cartoonish for the Swiss direction
- Paper #f8f8f8 + green light design and the "no lines, no small labels" rule — retired 2026-11-05 for the dark Swiss switch
- Invented metrics, testimonials or logos — only real facts

## Context

- Design was explored as throwaway HTML sketches in a brainstorming preview (light paper versions v1–v44, then dark Swiss hero v1–v3, then horizontal pages v4–v6). Current reference: `docs/reference/swiss-horizontal-v6.html` (committed); v7 and the font trial live next to it.
- References he chose: Swiss posters ("Minimal+" grid, "POLYMER 50"), depth maps (greyscale portrait renders, point-cloud terrain, contour sphere, x-ray flowers), ianwilson.dev (dithered L-system tree), elenagonci.com (single-family restraint).
- Swiss principles adopted from printmag.com and mew.design articles: grid, asymmetry, one sans family with few weights, hierarchy by size and weight, black + white + one accent, more space between groups than within, no decoration, photography over illustration.
- Design doc `docs/superpowers/specs/2026-11-03-portfolio-design.md` is rewritten as revision 5 (dark Swiss horizontal) and awaits Yahya's approval.
- Skills available: portfolio-design, portfolio-voice-and-facts, anti-vibe-design, Hallmark (audit only), Taste skill (review only).

## Constraints

- **Tech stack**: Next.js static export hosted on Vercel (switched from GitHub Pages 2026-11-06) — free hobby tier, real headers, no basePath stage
- **Domain**: yahya-hallani.dev (bought on Vercel Domains 2026-11-07; apex is canonical, www redirects to the apex; the earlier short domain was dropped)
- **Content**: only verified, real facts; no invented numbers
- **Assets**: self-host fonts and media; no hotlinked sprites in production
- **Process**: no product code until the design doc is approved (brainstorming gate)
- **Accessibility**: WCAG contrast, keyboard, reduced motion

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark Swiss direction (black, white, one green accent) | He chose a full switch from the light paper design on 2026-11-05 | — Pending |
| Horizontal page switching | His idea: "you switch pages with horizontal motions" | — Pending |
| YAHYA letters are the nav, shrink to a left rail | His request; the "name is the map" idea carried over from the light design | — Pending |
| Instrument Sans as the single family | Chosen by Yahya after the Phase 1 side-by-side trial on the giant YAHYA (2026-11-07); SIL Open Font License 1.1, self-hosted; 700 at wdth 75 for display, wdth 100 for body | — Pending |
| Remove Icons8 illustrations | "Remove those cartoonish assets" | ✓ Good |
| Design before copy | "getting the design is the most important" | — Pending |
| Real URLs per page, Back steps through pages | Shareable links, per-page metadata, no load flash (research Decision 1) | — Pending |
| Letters-to-rail FLIP with the native Web Animations API, no library | 0 kB, interruptible; swap to GSAP Flip only if bugs cost over a day (Decision 2) | — Pending |
| Add a resume PDF | Recruiters expect it (Decision 5) | — Pending |
| Domain yahya-hallani.dev, bought on Vercel before the first deploy (earlier short domain dropped) | Avoids the basePath stage and asset-path bugs (Decision 6); apex canonical, www 308 to apex (D-02) | ✓ Good |
| Left rail kept; iOS edge-swipe mitigated (inset, edge exclusion, device test) | His choice "on the left for the name" (Decision 3) | — Pending |
| Pages designed to fit one screen, inner scroll as safety net | Zoom/reflow accessibility (Decision 4) | — Pending |
| Host on Vercel, not GitHub Pages | His choice; real headers, no basePath stage | — Pending |
| Style-led "wow" over a story concept | He finds speed/"cracked" hard to convey; wow must come from craft (letters, distinct page compositions, real interactive proof) | — Pending |
| Green = nature and terminals | His meaning for the accent | ⚠️ Refined 2026-11-06 (see below) |
| Depth map = one treatment for all real photos/screenshots of his work | Solves missing visual proof and gives the aesthetic a purpose | ✗ Dropped 2026-11-06 |
| Drop the 75-dot judge; static typographic 75/75 | Read as a loader in the Swiss direction | ✓ Good |
| Remove pixel stickers; personality via About in his voice | Clash with dark Swiss | ✓ Good |
| Facturo is the flagship project | Real users, 700+ tests | — Pending |
| One motion rule: horizontal, fast, no bounce | Ties all animation together | — Pending |
| Short first-visit intro (<1 s, skippable) | His request, bounded by recruiter research | — Pending |
| Portrait phone version, no rotate gate | Recruiters open links on phones, often rotation-locked | — Pending |
| Depth map placement deferred | He asked to focus on Swiss typography first | ✗ Superseded 2026-11-06 |
| No background visuals; wow = YAHYA letter nav + craft + real interactive proof | Depth map, nature simulations and procedural terrain were all tried and rejected as borrowed, not his; showing "cracked" visually reads as forced; the record proves it | — Pending |
| Photos plain greyscale, hard grid crops | Recruiters should see his face and the real work | — Pending |
| Green = nature (as grandeur) and code, private inspiration only | He is inspired by both but nature must not become a visible theme | — Pending |
| Custom cursor stays in v1, 1:1 with the pointer, no bubble | His call 2026-11-06 (D-18); form picked from three v7 variants; form (a) picked in v7 | — Pending |
| Achievements layout variant (b) | Picked in v7 (2026-11-07), D-11; typographic list with proof previews (photo plus one line, article links) | — Pending |
| Facturo shown as a screenshot walkthrough | Yahya in v7 (2026-11-07): "a cinematic go through of the images not just a static image" | — Pending |
| About portrait shows true colours on hover | Yahya in v7 (2026-11-07); the one exception to greyscale photos, not an accent use | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-08 after Phase 2 (Live Deploy Spike) completion*
