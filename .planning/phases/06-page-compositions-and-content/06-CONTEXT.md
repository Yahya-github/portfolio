# Phase 6: Page Compositions and Content - Context

**Gathered:** 2026-11-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Each of the six pages carries its own final composition and real content, so a recruiter can see the record, the projects and how to reach Yahya on any screen, desktop or phone. Phase 3 built the static desktop layouts; this phase adds behaviour, real media and the decorative devices, plus the Facturo deep-dive page and designed phone portrait layouts.

Requirements: DSGN-03, CONT-02, CONT-03, CONT-04, CONT-05, CONT-07, CONT-08, CONT-10, CONT-11, CONT-12, EXP-02. DSGN-05 (photo treatment and its colour-on-hover exceptions) is built here too.

Design doc section 7 (rev 5, approved) is the contract for every page composition, the copy and facts, and the exact hover, preview and walkthrough behaviour (Achievements previews, MAME preview, Facturo walkthrough with Pause/Previous/Next, Experience organisation marks, About portrait colour twin, Say hi copy-email). This discussion did not reopen any of it; only the open questions below were decided.

Not in this phase: final copy in Yahya's voice, About text rewrite, per-page SEO, share card, favicon, 404 (Phase 7); playable Atlantis and the rotatable robot model (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Facturo deep-dive page (CONT-04)
- **D-01:** **Standalone page outside the pager.** `/projects/facturo/` is its own route, not a seventh page in the shared track. It keeps the fixed header (and Resume / Say hi links) and the footer style, scrolls vertically, and has a "Back to Projects" link. No `00 / 05` counter, no progress bar, no pager input. The six-page pager, its live region ("page n of 6") and the shared track stay untouched. The Projects "Read the deep dive" link targets it.
- **D-02:** **Editorial scroll layout.** A giant "Facturo" Display title at the top, then four ruled sections on the 12-column grid: Problem, What I built, Result, Links, each with its matching screenshots hard-cropped beside the text. Screenshots are **static** here (greyscale, the walkthrough stays on Projects). Dark Swiss rules still apply: flush left, one dominant element, one Display group, only verified facts, no ornament.
- **D-03:** **Copy is drafted from the verified facts only** (`portfolio-voice-and-facts`: tax-correct invoices, TPS/TVQ, Excel/PDF, supplier payment reconciliation, local vision model with edit-distance snapping and blank uncertain fields, GitHub Actions and PyInstaller release pipeline, SHA-256-verified in-app updates with rollback, 700+ tests, public demo repo). Nothing invented. Yahya rewrites in Phase 7 by editing the data file (same rule as Phase 3 D-11). The page needs its own typed content file under `content/`.

### Decorative devices scope
- **D-04:** **All five devices are built in Phase 6, as the last plans.** Index grid lines, About quarter rings (22% ink), Experience edge-cropped "03", scrolling margin section names, and the Say hi spiral. Each is decorative and `aria-hidden`, so any can be cut at the end without breaking a success criterion.
- **D-05:** **Build order (last built = first cut):** Index grid lines, Experience "03", About rings, margin section names, Say hi spiral. The static CSS/SVG devices come first; the spiral is heaviest (motion, Pause control, phone band) and is planned last. Each device is its own independently droppable plan.
- **D-06:** The Pause motion control (footer, doc section 5 and round 6) ships with the first motion device and covers the spiral and margin names, under the existing one-motion-rule and reduced-motion handling.

### JS budget and loading (performance)
- **D-07:** **Lazy per feature.** Initial JS on every route stays under the existing 150 kB gzip gate (143.3 kB on `/` after Phase 5, about 6.7 kB left). The Facturo walkthrough, the spiral, the margin names and copy-email load by dynamic import only when their page is first visited or near. Previews and hover colour are CSS-first with a small hook; the cursor stays lazy as in Phase 5.
- **D-08:** **Gate shape: initial JS 150 kB plus a per-chunk cap.** Keep 150 kB gzip for initial scripts on every route and add a cap on each lazy chunk of about 12 kB gzip (walkthrough, spiral, margin names, copy-email), checked by `pnpm measure:js` in CI so no single feature creeps. The exact cap value is Claude's call within that intent.
- **D-09:** **Images are pre-built WebP, committed.** A one-time, dev-only script (sharp) converts every grey and colour file in `docs/material/` to sized WebP in `public/`. Pages use plain `<img>` / `<picture>` with explicit `width` and `height`, lazy below the fold. No `next/image` optimiser (+5.7 kB JS), no runtime image code. Originals stay in `docs/material/`. The colour twins (Achievements preview, Facturo walkthrough colour state, About portrait, MAME preview) load on demand.

### Phone layouts and landscape hint (EXP-02)
- **D-10:** **The landscape hint is a static Label line on the Index only**, shown by CSS media query for portrait plus coarse pointer (`orientation: portrait` and `pointer: coarse`), reading along the lines of "Landscape shows the full posters". No JavaScript, no storage, no flash; it hides itself in landscape, never covers content and never blocks. It does not compete with the Phase 5 footer "Swipe sideways" hint, which keeps working unchanged. The string lives in `content/`.
- **D-11:** Phone portrait layouts follow the intents in design doc section 7 for each page. Touch behaviour follows the doc: Achievements thumbnails inline under each line in greyscale, MAME preview as an inline greyscale thumbnail, a tap on the Facturo frame holds and shows colour (a second tap releases), a tap toggles the About portrait and Experience marks to colour.

### Claude's Discretion
- Exact per-chunk byte cap, chunk boundaries and how pages request their lazy modules, within D-07/D-08.
- WebP sizes and quality per image, and the script's location and naming, within D-09.
- Whether the Facturo deep-dive page reuses the existing header/footer components with variants or gets lean siblings.
- Visual regression baselines for the new states and routes (1440x900, 1366x768, 390x844, plus 320 for phones).
- Atlantis and robot rows stay text-only; missing Atlantis screenshots and a physical robot photo are not blockers (Phase 8 and Yahya's material).
- Resume and contact reachability from every page (CONT-08): the fixed header already carries "Resume (PDF)" and "Say hi" on every route; plans verify it on the new Facturo page too.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contract
- `docs/superpowers/specs/2026-11-03-portfolio-design.md` — approved rev 5. Section 5 Motion, section 6 Navigation and chrome, **section 7 Page compositions** (per-page columns, copy, previews, walkthrough, marks, portrait twin, spiral, phone intents), section 8 Cursor, section 9 Material, section 4.2 Typographic devices (grid lines, quarter rings, cropped "03", margin names, spiral).
- `.planning/phases/01-design-gate/01-UI-SPEC.md` — token values.
- `.planning/REQUIREMENTS.md` — DSGN-03, DSGN-05, CONT-02..05, CONT-07, CONT-08, CONT-10..12, EXP-02.
- `.planning/ROADMAP.md` section Phase 6 — goal and six success criteria.

### Prior phase context
- `.planning/phases/03-static-design-system-and-pages/03-CONTEXT.md` — D-01 (desktop layouts built), D-02 (decorative devices wait), D-04 (phones readable only), D-12 (typed content files), D-13 (deep dive here).
- `.planning/phases/04-horizontal-pager-and-input/04-CONTEXT.md` — pager contract, inert pages, signals, scroll-at-edge paging (NAV-07).
- `.planning/phases/05-letter-navigation-and-motion/05-CONTEXT.md` — D-16 opt-in cursor snap attribute for the Achievements lines, D-07..D-10 hint, reduced-motion handling, JS budget notes.

### Facts and material
- `docs/material/links.md` — contact, project and proof links, and the full image inventory.
- `docs/material/photos/`, `docs/material/screenshots/`, `docs/material/logos/` (`*-mark.*` and `*-mark-mono.*`), `docs/material/portrait-devfest-2026-{grey,color}.jpg` — source files for the WebP script.
- `~/.claude/skills/portfolio-voice-and-facts/SKILL.md` — verified facts and "never on the site" list.
- `docs/reference/perf-baseline.md` — budget method and the gzip-vs-brotli note.

### Reference sketch
- `docs/reference/swiss-horizontal-v7.html` (and v6) — approved sketch for feel; a reference, not code to copy (its bugs are the WR list in `01-REVIEW.md`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/pages/*Page.tsx` + `*-page.module.css`: the six static desktop compositions (Achievements letter-pair stack and subgrid lines, Projects 8/4 split with five compact rows, Experience two-column table, About portrait and title stack, Say hi four lines). Phase 6 adds behaviour and devices to these.
- `content/*.ts` (`achievements`, `projects`, `experience`, `about`, `say-hi`, `site`, `types`): typed data with `as const satisfies`; no literals in components. The Facturo deep dive needs a new file here and types.
- `components/media/Photo.tsx`: existing photo component (portrait and Facturo still).
- `components/frame/Header.tsx`, `Footer.tsx`, `useHint.ts`: header carries Resume (PDF) and Say hi; footer has counter, Next, progress bar and the Phase 5 hint.
- `lib/cursor/` and the Phase 5 opt-in snap attribute: Achievements lines and previews mark themselves as snap targets without touching cursor code.
- `lib/first-visit/`, `lib/js-flag.ts`, `components/shell/PagerProvider.tsx` (live reduced-motion listener), `styles/tokens.css` (`--dur-*`, `--ease-*`).
- `public/yahya-hallani-resume.pdf` is in place; `scripts/measure-js.mjs` is the budget gate to extend with the per-chunk cap.

### Established Patterns
- CSS Modules plus `tokens.css`, transform and opacity only for motion, no Tailwind, no animation library.
- Server Components carry content; client code is a thin lazy layer; everything interruptible and reduced-motion aware.
- Hairlines only on Projects rows and Experience; every element starts and ends on a column line; flush left.
- Tests: Vitest (jsdom) for logic, Playwright against built `out/`, axe on every route, visual baselines pinned in the Playwright container.

### Integration Points
- `app/projects/facturo/page.tsx` is a new route outside the `Shell` track; it must not enter the pager's six-route model, counter, live region or progress bar.
- The Facturo walkthrough, spiral, margin names and copy-email attach to their existing pages as lazy client modules.
- The Index landscape hint renders inside the Index page, hidden by CSS media query.

</code_context>

<specifics>
## Specific Ideas

- The Facturo deep dive reads like a case-study spread: giant name, then ruled Problem / What I built / Result / Links with cropped screenshots, not a gallery.
- The phone landscape hint is deliberately static and CSS-only, so it can never flash, block or fight the "Swipe sideways" hint.

</specifics>

<deferred>
## Deferred Ideas

None. Discussion stayed within phase scope. (Atlantis screenshots and the physical robot photo remain open material items for Yahya; Phase 8 covers the playable game and the 3D model.)

### Reviewed Todos (not folded)
None. No pending todos matched this phase.

</deferred>

---

*Phase: 06-page-compositions-and-content*
*Context gathered: 2026-11-11*
