# Phase 3: Static Design System and Pages - Context

**Gathered:** 2026-11-08
**Status:** Ready for planning

<domain>
## Phase Boundary

All six pages (Index, Achievements, Projects, Experience, About, Say hi) exist as real, readable, server-rendered HTML at their own routes in the dark Swiss system: tokens, 12-column grid, Instrument Sans on the modular scale, giant YAHYA letter links with numbered captions and the role line, a skip link and visible focus states, contrast-tested tokens, and all text from typed data files. Everything works with JavaScript disabled.

Not in this phase: paging/input (Phase 4), the letter glide, cursor, opening, hint and motion (Phase 5), interactive and decorative page devices, phone portrait designs and the Facturo deep dive (Phase 6), final copy and SEO polish (Phase 7).

Requirements: DSGN-01, DSGN-02, DSGN-06, CONT-01, CONT-09, LTR-01, LTR-02, A11Y-02, A11Y-03, A11Y-05.

</domain>

<decisions>
## Implementation Decisions

### Composition depth
- **D-01:** Build each page's **final desktop static layout now**: the column spans and type roles from design doc §7 (Index YAHYA bottom-anchored with captions, role line cols 1-4 and meta labels cols 7-12; Achievements AC/HI/EV/EM/EN/TS stack cols 1-2 with the five lines on a subgrid in cols 3-10; Projects Facturo cols 1-8 with five compact ruled rows in cols 9-12, including the below-880px-height rule; Experience ruled Work/Involvement table cols 1-6 / 7-12 with the head-size rule; About portrait cols 1-4, TWO/HAB/ITS cols 5-8, text cols 8-12 bottom-aligned; Say hi four Display lines cols 1-6 with the address line). Phase 6 adds behaviour, not layout.
- **D-02:** Decorative devices wait for **Phase 6**: Index grid lines, About quarter rings, Experience cropped "03", margin section names, Say hi spiral. Leave their columns empty (the compositions already reserve them).
- **D-03:** Photos now: **About portrait and one Facturo still**, greyscale pre-converted files, hard-cropped, explicit dimensions so nothing shifts (portrait `object-position: 52% 10%`). Achievements previews, colour twins, the Facturo walkthrough, the MAME preview and Experience org marks are Phase 6.
- **D-04:** Phones are **readable, not designed**: single-column stack, no horizontal overflow at 320-390px, YAHYA fitted to the width. The design doc's phone portrait intents are Phase 6.

### Route markup model
- **D-05:** Every route renders **all six pages in one shared track** (shared layout), with its own page active and the other five present but hidden and `inert`. Phase 4 slides this track; nothing remounts, so the Phase 5 letter FLIP has stable elements.
- **D-06:** With JS off, a route shows **only its own page** (others hidden by CSS); letter links, the rail, header and the Next link navigate between routes like a normal site.
- **D-07:** **Self-canonical per route**, each with its own title and description (resolves the STATE.md canonical blocker). Full SEO metadata, OG card and JSON-LD stay Phase 7. The site stays noindex until launch (Phase 2 D-12).

### Chrome without JS
- **D-08:** **Fixed header now**, server-rendered per route: cols 1-3 "Yahya Hallani", cols 4-6 current section name, cols 10-12 "Resume (PDF)" and "Say hi" as plain links (Label role, hairline bottom rule).
- **D-09:** **Footer now, static**: `00 / 05` counter with tabular figures reflecting the route, "Next, {Section}" as a real `<a>` to the next route ("Back to the start" on Say hi), progress bar at the static width for the route. The Pause motion button waits for Phase 6 (nothing moves yet).
- **D-10:** **Static rail now** on pages 01-05: the five letters as a vertical rail of links in the left margin, current one in the accent with its numbered name and `aria-current="page"`; hover/focus never colour rail letters (focus = ink ring). Index has no rail. Phase 5 replaces the route jump with the FLIP glide.

### Data files & copy
- **D-11:** Copy = **design doc §7 facts verbatim** (ranks, roles, dates, project lines, About draft line, contact). Yahya rewrites in Phase 7 by editing data files only. Only verified facts; no CCC "top 1", no Atlantis line counts, no phone number, no CRC contest platform.
- **D-12:** Data shape: **`content/site.ts`** (name, role line, sections/letters/routes/captions, contact, resume path) plus **one typed file per page** (`content/achievements.ts`, `projects.ts`, `experience.ts`, `about.ts`, `say-hi.ts`, and an index file if needed), typed with TS interfaces and `as const satisfies`. No text literals in components. French later = parallel files.
- **D-13:** `/projects/facturo/` deep dive is **Phase 6**; the "Read the deep dive" link waits with it (no dead link in Phase 3).
- **D-14:** Contrast: a **Vitest unit test** computes the WCAG ratio of every text token against the ground and fails below AA or if any text grey is darker than `#8a8a8a`; plus the existing `@axe-core/playwright` run extended to all six routes.

### Claude's Discretion
- Component and folder structure (shared track layout, Page components, CSS Module split), within CSS Modules + `tokens.css`.
- How hidden pages are hidden without JS (CSS by route attribute vs `hidden`), as long as D-05/D-06 hold and Phase 4 can take over.
- Font loading strategy that keeps the giant letters from shifting (next/font/local with the committed variable file, size-adjusted fallback, preload).
- Visual regression baselines (Playwright screenshots at 1440x900, 1366x768, 390x844) now or later.
- Exact Facturo still frame and image sizes/formats.
- Header current-section text on Index.

### Folded Todos
- **Update portfolio-design and portfolio-voice-and-facts skills to design doc rev 5** (`.planning/todos/pending/2026-11-07-update-portfolio-skills-to-design-rev-5.md`): the skills still describe the retired light design and would mislead Phase 3 builders. Do it first in this phase: rewrite `~/.claude/skills/portfolio-design/SKILL.md` from the approved doc and 01-UI-SPEC tokens; update `~/.claude/skills/portfolio-voice-and-facts/SKILL.md` with the round 6-7 facts (MAME Tool Rental project and Experience row "Developer, since Nov 2026", Facturo "Jun 2026 to Oct 2026", Showdown AI lines).
- **Carry v7 review warnings into the build** (already referenced from Phase 2): in Phase 3 only the `--yahya-fit` 2.188 + manual YA kerning rule applies; WR-04..08 and IN-01 stay for Phases 4-5.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contract
- `docs/superpowers/specs/2026-11-03-portfolio-design.md` — approved design doc rev 5; §4 visual system, §4.1 font render rules, §6 navigation (hero letters, rail, header, footer, a11y), §7 page compositions and content. Wins over everything else.
- `.planning/phases/01-design-gate/01-UI-SPEC.md` — every token value (colour, type scale, spacing, grid, durations).
- `docs/reference/font-metrics.md` — measured Instrument Sans metrics and fit checks.
- `docs/reference/swiss-horizontal-v7.html` (and v6) — approved sketch; a reference, not code to copy.

### Requirements and prior decisions
- `.planning/REQUIREMENTS.md` — DSGN-01/02/06, CONT-01/09, LTR-01/02, A11Y-02/03/05.
- `.planning/phases/01-design-gate/01-CONTEXT.md` — Phase 1 decisions (font, compositions, cursor, no ornament).
- `.planning/phases/02-live-deploy-spike/02-CONTEXT.md` — deploy, noindex, CI, self-hosting decisions.
- `.planning/phases/01-design-gate/01-REVIEW.md` and `.planning/todos/pending/2026-11-07-carry-v7-review-warnings-into-build.md` — v7 bugs not to repeat.

### Material and facts
- `docs/material/links.md` — contact, project and proof links, inventory.
- `docs/material/portrait-devfest-2026-grey.jpg`, `docs/material/screenshots/facturo-*-grey.png` — Phase 3 photos.
- `docs/reference/perf-baseline.md` — 132.1 kB gzip baseline, 150 kB CI gate.
- `~/.claude/skills/portfolio-voice-and-facts/SKILL.md` — verified facts (update first, folded todo).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/fonts.ts` + `app/fonts/InstrumentSans-wdth-wght.woff2`: self-hosted variable font already wired (Phase 2); extend for the wdth 75/100 axes.
- `app/layout.tsx`, `app/globals.css`, `app/page.tsx`: Phase 2 placeholder test page, to be replaced.
- `assets/portrait-800.webp`: optimised greyscale portrait from Phase 2 (check size against cols 1-4 at full height).
- `public/yahya-hallani-resume.pdf`: resume link target for header and Say hi.
- `e2e/a11y.spec.ts`, `e2e/assets.spec.ts`, `e2e/csp.spec.ts`: extend to all six routes (axe, no third-party requests, CSP).
- `scripts/measure-js.mjs`: JS budget check (150 kB gzip gate in CI).

### Established Patterns
- Static export (`output: 'export'`), Vercel headers in `vercel.json` (CSP keeps `'unsafe-inline'` for the RSC payload).
- Tests: Vitest (jsdom) in `tests/`, Playwright against the built `out/` in `e2e/`.
- No `styles/tokens.css` yet; no `content/` yet.

### Integration Points
- New routes under `app/` (`achievements/`, `projects/`, `experience/`, `about/`, `say-hi/`) sharing one layout that renders the track.
- CI jobs lint/typecheck/unit/e2e are required checks on `main`.

</code_context>

<specifics>
## Specific Ideas

- The track markup decided here (all six pages per route) is the foundation Phase 4 slides and Phase 5 animates letters across; keep element identity stable across routes.
- Rail accent comes from the current route alone, never from hover or focus (v7 bug).
- Letter hit area: the link has no pointer events; a box-sized pseudo-element (advance width x 0.76em) takes them (design doc §6).

</specifics>

<deferred>
## Deferred Ideas

- Decorative devices (grid lines, quarter rings, cropped 03, margin names, spiral) — Phase 6 (D-02).
- Designed phone portrait layouts — Phase 6 (D-04).
- `/projects/facturo/` deep dive — Phase 6 (D-13).
- Pause motion control — Phase 6.

</deferred>

---

*Phase: 03-static-design-system-and-pages*
*Context gathered: 2026-11-08*
