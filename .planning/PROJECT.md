# Yahya Hallani — Portfolio (yahya-h.dev)

## What This Is

A personal portfolio site for Yahya Hallani, a Software Engineering student at McGill, aimed at recruiters and internship leads. It presents his competition record, projects and experience so a visitor leaves thinking "that kid is cracked". It should feel intuitive, never tiring, and make people want to explore the whole site.

## Core Value

The design itself: a distinctive, non-generic dark Swiss experience (giant YAHYA letters that are the navigation, pages that switch horizontally) that a recruiter remembers. Copy and descriptions can come later; the design must be right first.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Dark Swiss design system: black ground, white type, one green accent, one sans family (currently Inter Tight), 12-column grid, flush-left text, no ornament
- [ ] Six full-screen pages switched horizontally: Index (hero), Achievements, Projects, Experience, About, Say hi
- [ ] Page switching by wheel/trackpad (one gesture = one page, inertia ignored), arrow keys, Page Up/Down, Space, Home/End, and swipe
- [ ] Hero: giant YAHYA spanning the page; each letter is a clickable link to its section (Y Achievements, A Projects, H Experience, Y About, A Say hi), with numbered captions
- [ ] Leaving the hero, the five letters shrink and glide into a vertical rail on the left that stays as the navigation, current section in the accent colour
- [ ] Achievements: the 75-test "judge" animation ending on 75/75 (Canadian Computing Competition perfect score), plus the four first places
- [ ] Projects: Facturo, Atlantis, CRC problems, robot firmware, Showdown AI
- [ ] Experience: Work and Involvement lists
- [ ] About ("Two habits") and Say hi (email, LinkedIn, GitHub)
- [ ] Footer pager (00 / 05), "Next" control, progress bar
- [ ] Depth-map aesthetic placed somewhere deliberate (leading idea: a real depth map of a portrait of Yahya on About) — placement still open
- [ ] Accessible: keyboard navigation, focus states, inactive pages inert, reduced-motion versions of every animation, works without the pointer
- [ ] Works on phones (swipe paging, letter rail scaled down)
- [ ] Final copy and descriptions written by Yahya (deferred to a later phase)

### Out of Scope

- Blog, CMS, backend — static portfolio; nothing to manage at runtime
- French at launch — English first, French later
- Icons8 cartoon illustrations — rejected 2026-11-05 as too cartoonish for the Swiss direction
- Paper #f8f8f8 + green light design and the "no lines, no small labels" rule — retired 2026-11-05 for the dark Swiss switch
- Invented metrics, testimonials or logos — only real facts

## Context

- Design was explored as throwaway HTML sketches in a brainstorming preview (light paper versions v1–v44, then dark Swiss hero v1–v3, then horizontal pages v4–v6). Current reference: `swiss-horizontal-v6.html` (scratchpad preview, not in this repo yet).
- References he chose: Swiss posters ("Minimal+" grid, "POLYMER 50"), depth maps (greyscale portrait renders, point-cloud terrain, contour sphere, x-ray flowers), ianwilson.dev (dithered L-system tree), elenagonci.com (single-family restraint).
- Swiss principles adopted from printmag.com and mew.design articles: grid, asymmetry, one sans family with few weights, hierarchy by size and weight, black + white + one accent, more space between groups than within, no decoration, photography over illustration.
- Design doc `docs/superpowers/specs/2026-11-03-portfolio-design.md` is a DRAFT describing the older light design; it must be updated and approved before building.
- Skills available: portfolio-design, portfolio-voice-and-facts, anti-vibe-design, Hallmark (audit only), Taste skill (review only).

## Constraints

- **Tech stack**: Next.js static export hosted on GitHub Pages — free hosting, no server
- **Domain**: yahya-h.dev (not bought yet)
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
| Inter Tight as the single family | Swiss grotesque feel, free, variable | ⚠️ Revisit (final font still open) |
| Remove Icons8 illustrations | "Remove those cartoonish assets" | ✓ Good |
| Design before copy | "getting the design is the most important" | — Pending |
| Depth map placement deferred | He asked to focus on Swiss typography first | — Pending |

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
*Last updated: 2026-11-06 after initialization*
