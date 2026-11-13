# Phase 8: Interactive Proof - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-12
**Phase:** 8-Interactive Proof
**Areas discussed:** Where each piece lives, Atlantis play experience, Robot model look and controls
**Areas offered but not selected:** Licences, consent and publish gate (captured as a plan-time gate)

---

## Where each piece lives

| Option | Description | Selected |
|--------|-------------|----------|
| Atlantis: standalone /projects/atlantis/ | Own route like Facturo, no pager | ✓ |
| Atlantis: inline on Projects row | Expands inside the pager page | |
| Atlantis: standalone plus own sitemap line | Same as first with explicit SEO | |
| Robot: standalone /projects/robot/ | Own route, static first, viewer lazy | ✓ |
| Robot: inline on Projects row | Viewer inside the pager page | |
| Robot: same page as Atlantis | One /projects/proof/ route | |

**User's choice:** Standalone routes for both.

| Option | Description | Selected |
|--------|-------------|----------|
| Same editorial shape as Facturo | Title, piece, ruled sections | |
| Lean: title, piece, links | Minimal page | ✓ |
| You decide | Claude's discretion | |

**User's choice:** Lean pages.

| Option | Description | Selected |
|--------|-------------|----------|
| Sitemap plus title/description | Matches Facturo | ✓ |
| Reachable but not in sitemap | Hold back from indexing | |

**User's choice:** In sitemap with own metadata.

---

## Atlantis play experience

| Question | Options | Selected |
|----------|---------|----------|
| Load | Click to play / Autoload / Click on desktop only | Click to play |
| Embed | Same-origin iframe / Canvas in page | Same-origin iframe |
| Audio | On after Play click / Muted by default / Decide later | On after Play click |
| Too heavy line | Decide after measuring / Hard cap 10 MB / Always ship fallback too | Decide after measuring |
| Touch devices | Research decides / Always embed / Never embed | Research decides |
| Keyboard escape | Esc exits and returns focus / Tab out only | Esc plus Exit button |

---

## Robot model look and controls

| Question | Options | Selected |
|----------|---------|----------|
| Treatment | Greyscale shaded, green accent edges / Real CAD colours / Wireframe | Greyscale shaded |
| Controls | Drag plus arrows, no auto-spin / Drag plus slow auto-rotate until touched / Drag plus zoom and pan | Drag plus slow auto-rotate until touched |
| Viewer | Raw WebGL2, research decides / Pre-rendered frames / three.js | Raw WebGL2 |
| CAD file | Export myself / Researcher tries anonymous link / Not sure | Pasted the Onshape link (researcher tries it) |
| Green on model | Cue only / Edge highlight | Cue only |

**Notes:** Yahya answered the CAD question by pasting the Onshape element URL (with renderMode and uiState query params) rather than choosing an option; recorded as D-16. Auto-rotate off under reduced motion and Pause was added by Claude as the consistent handling and is part of D-13.

---

## Claude's Discretion

Route layout details, iframe sizing, per-chunk cap and load trigger, CAD pipeline, component and asset locations, visual baselines, Pause reuse.

## Deferred Ideas

None. Licences and consent: not discussed, recorded as plan-time gate.
