# Phase 8: Interactive Proof - Context

**Gathered:** 2026-11-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Visitors can touch Yahya's real work on the site itself: play Atlantis (Godot 4 web export) and rotate the real CRC 2026 robot (3D model built from his CAD), without adding JavaScript or requests to any other page. Parallel track after Phase 3; it does not gate launch (the site is already live), but v1 is complete only when it ships.

Requirements: PROOF-01, PROOF-02.

Not in this phase: new pages beyond the two interactive routes, French, Showdown AI, Facturo changes, new accent uses, any change to the six-page pager.

</domain>

<decisions>
## Implementation Decisions

### Where each piece lives
- **D-01:** **Atlantis is a standalone route `/projects/atlantis/`**, outside the pager, same shape as `/projects/facturo/` (Phase 6 D-01): fixed header with Resume / Say hi, vertical scroll, "Back to Projects" link, no `00 / 05` counter, no pager input. Godot is requested only from this route, so "no cost on other pages" holds structurally.
- **D-02:** **The robot model is a standalone route `/projects/robot/`**, same shape. Projects rows link to both new routes (Atlantis "Play", Robot "3D model"), in addition to the existing Code and Team site links.
- **D-03:** **Lean page shape for both routes:** giant Display title, the interactive piece as the dominant element, a few verified lines, links. No Problem / What I built / Result sections (unlike Facturo). Copy comes only from verified facts (`portfolio-voice-and-facts`) in a typed file under `content/`, editable by Yahya later. Reuse the deep-dive header/footer components where they fit (see Code Context).
- **D-04:** **Both routes join `sitemap.xml` and get their own title, description and canonical** (Phase 7 patterns). Sitemap goes from 7 to 9 URLs. The never-on-the-site list still binds all copy (no Atlantis line counts, no top-1 wording, no CRC platform mention).

### Atlantis play experience (PROOF-01)
- **D-05:** **Click to play.** The route shows a greyscale poster (Atlantis screenshots, still to capture) and a Play button. Godot's wasm and pck are fetched only on that click, never on arrival.
- **D-06:** **Same-origin iframe** loads Godot's own HTML shell from a first-party path. Header changes apply to `/projects/atlantis/` (and the game files' path) only: `X-Frame-Options: SAMEORIGIN`, `frame-src 'self'`, `frame-ancestors 'self'`, and the CSP additions Godot needs (`'wasm-unsafe-eval'` and whatever research proves necessary). Every other route keeps today's strict CSP and `X-Frame-Options: DENY`. `tests/vercel-config.test.ts` is extended to pin both cases, with a negative control.
- **D-07:** **Game audio is on after the Play click** (the click is the required user gesture), with a visible mute control beside the game. The "no sound" rule in the design applies to the site chrome, not the game.
- **D-08:** **The "too heavy" threshold is decided after measuring the real export.** Starting guess for research to confirm or replace: over ~30 MB raw, ~10 MB brotli, or over ~5 s to playable on throttled 4G falls back. The fallback is screenshots plus the repo link. Screenshots plus link are also what no-JS visitors and failed loads see, so that content always exists on the page.
- **D-09:** **Touch devices: research decides from Atlantis's controls.** If the game needs keyboard or mouse, phones get screenshots, the repo link and a "Best on desktop" line instead of the embed; if it is playable by touch, it embeds. Recorded as an open item, not a preference for either outcome.
- **D-10:** **Keyboard escape:** a visible "Exit game" button sits before the iframe in tab order, and Esc returns focus to the Play button (the standalone route has no pager keys to conflict with). No keyboard trap in any state. Single-thread export only (no SharedArrayBuffer, so no COOP/COEP headers).

### Robot model (PROOF-02)
- **D-11:** **Look: plain greyscale shaded material** on the black ground, lit from one side. The model is a render of his CAD, not a photo, and follows the greyscale system without needing a DSGN-05 exception.
- **D-12:** **Green is a cue only:** focus outline and the "Drag to rotate" hint. Not an edge highlight on the model, so the accent does not gain a fifth decorative use (Phase 1 P07 logged four).
- **D-13:** **Controls: pointer and touch drag orbit, arrow keys rotate when the viewer is focused, a Reset control, slow auto-rotate until the first touch.** Auto-rotate is off entirely under reduced motion and under the footer Pause control. No zoom, no pan, no scroll-hijack (horizontal-first drag, vertical scroll stays with the page on touch). Keyboard focus never traps.
- **D-14:** **Static image first, viewer lazy.** The page renders fully without the viewer: a greyscale render of the model as `<img>` with width and height, plus caption and links. WebGL2 viewer loads by dynamic import on this route only (on click or when near the viewport; planner chooses). WebGL unsupported or the chunk failing leaves the static image and nothing else breaks.
- **D-15:** **Viewer is raw WebGL2 (per STACK.md); research decides model format, decimation and size.** Escalate to OGL only if raw WebGL2 cannot meet the per-chunk cap or the format forces it; three.js only for loaders or post-processing the cap makes unaffordable. The viewer chunk obeys the per-lazy-chunk gate from Phase 6 D-08 (extend `scripts/measure-js.mjs`); the model file is a separate data asset with its own size budget set by research.
- **D-16:** **CAD source:** Yahya's Onshape document, opened by link without login: `https://cad.onshape.com/documents/abedb5644d206f1966ceab07/w/16e1ac37475a79f8f8a83c91/e/fa98af52c3491c90afc18920` (he also supplied the same element with `?renderMode=0&uiState=6aee41af6c245c3af0ec578d`). Research tries the anonymous export route first (glTF or STEP to mesh). If that is not reachable without credentials, Yahya exports a file into `docs/material/`; the plan then builds against a placeholder mesh until it exists. Not a new decision to publish: see the gate below.

### Claude's Discretion
- Route-level layout details (title size, where the piece sits on the 12-column grid, caption wording) within the dark Swiss rules.
- Whether the Atlantis iframe fills the viewport width or sits on a grid span; aspect ratio from the game's native resolution.
- Exact per-chunk cap for the viewer, loading trigger (click vs near viewport), and the pipeline from CAD to the committed model asset.
- Names and location of new components (`components/proof/` or alongside `components/deep-dive/`) and of the model/game asset folders under `public/`.
- Visual regression baselines for the new routes and states (1440x900, 1366x768, 390x844, 320).
- Footer Pause control reuse for auto-rotate (see D-13).

### Plan-time gate (not discussed, must be resolved before publishing)
- **Licences and consent were not discussed in this session.** Success criterion 1 requires the asset licences of Atlantis (a fork of `plastikup/atlantis`) and teammates' consent to be confirmed before the game is published. Success criterion 2's robot CAD may belong to the CRC team; confirm Yahya may publish it. The planner must make "cleared" an explicit checkpoint plan with Yahya before any public build ships, and define what ships if a piece is not cleared (Atlantis: screenshots plus link; Robot: static image only).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contract
- `docs/superpowers/specs/2026-11-03-portfolio-design.md` — approved rev 5. Motion (section 5), chrome (section 6), page compositions (section 7, Projects intent), material (section 9). Dark Swiss rules still apply on the new routes.
- `.planning/ROADMAP.md` section Phase 8 — goal, three success criteria, research flag (Godot export size and loading, CAD-to-web pipeline).
- `.planning/REQUIREMENTS.md` — PROOF-01, PROOF-02, DSGN-05 (greyscale treatment), A11Y-04 (reduced motion).
- `.planning/PROJECT.md` — Constraints (self-host media, only verified facts), Key Decisions (green accent meaning, one motion rule).

### Prior phase context
- `.planning/phases/06-page-compositions-and-content/06-CONTEXT.md` — D-01 (standalone deep-dive route), D-07/D-08 (lazy per feature, 150 kB initial gate plus ~12 kB per-chunk cap), D-09 (pre-built WebP images).
- `.planning/phases/07-copy-sharing-and-launch/07-CONTEXT.md` — metadata, sitemap, share card, never-on-the-site list, headers.
- `.planning/phases/01-design-gate/01-CONTEXT.md` — accent uses, cursor form.

### Stack and constraints
- `.planning/research/STACK.md` — WebGL later: raw WebGL2 lazily imported with static poster fallback; OGL only if meshes or point clouds need it; three.js only for loaders or post-processing.
- `.planning/research/PITFALLS.md` — read for headers, CSP and lazy-loading pitfalls.
- `vercel.json` and `tests/vercel-config.test.ts` — current CSP/frame headers and the test that pins them.
- `scripts/measure-js.mjs` — budget gate to extend for the viewer chunk cap.
- `docs/reference/perf-baseline.md` — baseline and brotli-vs-gzip note.

### Material and facts
- `docs/material/links.md` — Atlantis repo link, Onshape CAD link, competition proof links, inventory (`photos/robot-cad-01.png`, `robot-cad-01-grey.png`); notes Atlantis screenshots and physical robot photo still missing.
- `~/.claude/skills/portfolio-voice-and-facts` — verified facts and never-on-the-site list for any copy.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/projects/facturo/page.tsx` and `components/deep-dive/` (`FacturoDeepDive.tsx`, `DeepDiveFooter.tsx`, `StandaloneClient.tsx`, `deep-dive.module.css`): the standalone-route pattern with fixed header, footer and Back link to mirror or generalise.
- `components/walkthrough/` and `lib/walkthrough/`: existing lazy client feature with Pause, reduced-motion stepper and hold handling; the lazy-mount pattern to copy for the viewer.
- `lib/features/registry.ts`: how lazy features register and load.
- `content/projects.ts` (Atlantis row 02.3 with `link: Code`, Robot firmware row 02.5): rows to extend with links to the new routes; `content/` typed data files for new route copy.
- `app/sitemap.ts`, `lib/metadata.ts`, `lib/structured-data.ts`: add the two routes.
- `scripts/build-media.mjs`: the WebP pipeline for the poster and robot still.
- `docs/material/photos/robot-cad-01.png` (600x340 Onshape thumbnail): too small for the static render; a higher-res capture is still missing.

### Established Patterns
- Server Components carry content; client code is a thin lazy layer, interruptible and reduced-motion aware (Phase 6).
- Initial JS on every route under 150 kB gzip; lazy chunks capped (~12 kB) and checked by `pnpm measure:js` in CI.
- Self-hosted assets only; strict CSP, with headers pinned by `tests/vercel-config.test.ts`; e2e injects the vercel.json CSP locally with a strict negative control.
- Playwright against the built `out/` folder, axe on every route, Podman-pinned visual baselines.

### Integration Points
- Projects page rows (Atlantis, Robot firmware) gain the new links; Projects content tests and the layout-signature test must stay green.
- `vercel.json` gets per-route header overrides for the Atlantis route and game files; the vercel-config test and e2e CSP injection are extended.
- Sitemap and robots tests (`tests/robots-sitemap.test.ts`) expect 7 URLs today.

</code_context>

<specifics>
## Specific Ideas

- Yahya picked the recommended option on almost every choice; the two he changed: the new routes are **lean** (title, piece, links) rather than Facturo-style editorial, and the robot **auto-rotates slowly until first touch** rather than staying still.
- The robot should look like the site (plain grey on black), not like a CAD viewer.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (Licences and consent were skipped by choice and are captured as a plan-time gate above, not deferred scope.)

</deferred>

---

*Phase: 08-interactive-proof*
*Context gathered: 2026-11-12*
