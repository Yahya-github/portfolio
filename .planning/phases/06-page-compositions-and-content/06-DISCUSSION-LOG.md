# Phase 6: Page Compositions and Content - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-11
**Phase:** 06-page-compositions-and-content
**Areas discussed:** Facturo deep-dive page, Decorative devices scope, JS budget and image weight, Phone layouts and landscape hint

---

## Facturo deep-dive page

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone page (Recommended) | Own route outside the pager, header and chrome kept, vertical scroll, Back to Projects, no counter | ✓ |
| Seventh page in the track | Joins the shared track; counter and NAV-07 conflict | |
| Panel over Projects | Layer over Projects with focus trap | |

**User's choice:** Standalone page (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Editorial scroll (Recommended) | Giant title, ruled Problem / Built / Result / Links with static cropped screenshots | ✓ |
| Walkthrough-led | Large pinned walkthrough beside scrolling text | |
| Screenshot index | Numbered grid of all 10 screenshots | |

**User's choice:** Editorial scroll (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Draft from verified facts (Recommended) | Claude drafts from verified facts only; Yahya rewrites in Phase 7 | ✓ |
| Placeholder structure only | Headings, screenshots and one fact line per section | |
| Yahya writes it now | Blocks the phase on writing | |

**User's choice:** Draft from verified facts (Recommended)

---

## Decorative devices scope

| Option | Description | Selected |
|--------|-------------|----------|
| All five, built last (Recommended) | Content first, devices as the final droppable plans | ✓ |
| Static three, animated two later | Grid lines, rings, "03" now; margin names and spiral later | |
| None in Phase 6 | Devices become their own phase | |

**User's choice:** All five, built last (Recommended)

Second pass (user asked to repeat questions on this area):

| Option | Description | Selected |
|--------|-------------|----------|
| Grid, 03, rings, names, spiral (Recommended) | Static first, spiral last = first cut | ✓ |
| Spiral first, then the rest | De-risk the signature device early | |
| Each device its own plan, any order | Planner orders by dependency | |

**User's choice:** Grid, 03, rings, names, spiral (Recommended)

---

## JS budget and image weight

| Option | Description | Selected |
|--------|-------------|----------|
| Lazy per feature (Recommended) | Keep 150 kB gate, dynamic import per feature | ✓ |
| Raise the gate to 160 kB | Simpler code, tighter Lighthouse | |
| Switch gate to brotli | Restate budget as brotli q11 | |

**User's choice:** Lazy per feature (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-built WebP, committed (Recommended) | One-time sharp script writes sized WebP into public/ | ✓ |
| Build-time script on every build | Conversion in every build | |
| Copy originals as is | Raw PNG/JPG | |

**User's choice:** Pre-built WebP, committed (Recommended)

Second pass (user asked to repeat questions on this area):

| Option | Description | Selected |
|--------|-------------|----------|
| Initial JS 150 + chunk cap (Recommended) | 150 kB initial per route plus about 12 kB cap per lazy chunk | ✓ |
| Gate every route incl. lazy chunks | Total per route at or under 150 kB | |
| Keep gate as is | Only initial scripts on `/` | |

**User's choice:** Initial JS 150 + chunk cap (Recommended)

---

## Phone layouts and landscape hint

| Option | Description | Selected |
|--------|-------------|----------|
| Static Index label (Recommended) | CSS-only Label line, portrait and coarse pointer, Index only | ✓ |
| Second timed hint | After "Swipe sideways", with its own flag | |
| One combined line | Replace the Phase 5 touch string | |

**User's choice:** Static Index label (Recommended)

---

## Claude's Discretion

Per-chunk byte cap and chunk boundaries; WebP sizes and quality; header/footer variants for the Facturo page; visual baselines; Atlantis and robot rows stay text-only; CONT-08 verified on the new page.

## Deferred Ideas

None.
