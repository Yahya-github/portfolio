# Phase 4: Horizontal Pager and Input - Context

**Gathered:** 2026-11-09
**Status:** Ready for planning

<domain>
## Phase Boundary

The six full-screen pages, already rendered together in one shared track on every route (Phase 3 D-05), slide sideways. Every input device moves exactly one page per gesture: wheel and trackpad (momentum never skips), arrow keys, Page Up/Down, Space, Home/End, and horizontal swipe on phones. Every page change is a real navigation: the URL updates (`/projects/` etc.), deep links land on their page, and Back/Forward step through visited pages. A page that overflows (zoom, short screens) scrolls vertically and pages only at its edge. Only the current page is reachable by keyboard and screen readers; focus moves to the new page heading and a live region announces the change.

Requirements: NAV-01, NAV-02, NAV-03, NAV-04, NAV-07, A11Y-01.

Not in this phase: letters-to-rail FLIP glide, first-visit hint, opening animation, custom cursor, reduced-motion pass across all motion (Phase 5); page compositions, decorative devices, phone portrait layouts (Phase 6).

</domain>

<decisions>
## Implementation Decisions

### Paging feel
- **D-01:** **Retarget on fast input.** A page intent that arrives mid-slide extends the slide from the track's current position to the new target (e.g. → twice fast = page +2). Input is never dropped during a slide. Holding an arrow key walks pages one after another.
- **D-02:** **Hard stop at the ends.** On 05 Say hi, "next" does nothing; on 00 Index, "previous" does nothing. No wrap, no nudge. Only the footer's "Back to the start" link returns from 05 to 00.
- **D-03:** **Long jumps slide through, same 600ms.** A rail letter or Home/End jump (e.g. 01 → 04) moves the track straight across the pages in between in one 600ms move. Duration does not grow with distance.
- **D-04:** **Both wheel axes page.** Vertical and horizontal wheel deltas both count; the dominant axis of the gesture wins. Wheel down / trackpad swipe right-to-left = next. The horizontal trackpad swipe must not trigger the browser's back/forward swipe on Mac (researcher: `overscroll-behavior-x: none` on the root plus non-passive listeners; verify on Safari and Chrome on macOS).

### Overflow and edges (NAV-07)
- **D-05:** **Fresh gesture at the edge.** On an overflowing page, the wheel scrolls the page. The momentum that brings it to the bottom (or top) is spent; only a new gesture that starts at the edge pages. No accidental page change mid-read.
- **D-06:** **Pages always open at their top**, heading in view, whether reached forwards or backwards. No remembered scroll positions.
- **D-07:** **Phones never page by vertical scroll.** Vertical = read the page (document scroll, per Phase 3), horizontal swipe = change page. No overscroll-to-page.
  - **D-07a (2026-11-09, clarified at plan-phase):** D-07 is touch-only. With wheel/trackpad on a document-scroll layout (narrow desktop window, 200% zoom), the wheel scrolls the page first; momentum reaching the edge never pages; a fresh gesture starting at the edge pages (NAV-07).
- **D-08:** Swipe distance, velocity and "mostly horizontal" angle thresholds are Claude's call, tuned in device tests. The left-edge 20px exclusion from design-doc Decision 3 stands (swipes starting there are left to the system back gesture).

### Chrome during the slide (before Phase 5)
- **D-09:** **Leaving Index, the giant YAHYA letters ride off with the Index page and the static rail appears on landing.** An honest stand-in; Phase 5 replaces it with the FLIP glide. Returning to Index reverses it (rail goes, letters ride back in with the page). The rail is not shown on Index.
- **D-10:** **Chrome switches at slide start.** Header section name, footer `00 / 05` counter, "Next, {Section}" link and the rail's current letter (accent + `aria-current="page"`) update the instant the page change is decided, so the input is confirmed within ~100ms. A retarget updates them again.
- **D-11:** **Footer progress bar animates now**, with the track: same 600ms, same easing, transform only. Phase 5 only verifies it.

### Device testing
- **D-12:** Yahya can test on: **Linux touchpad** (his Fedora laptop), **iPhone** (Safari and the LinkedIn in-app browser), **Android phone** (Chrome), **Mac trackpad and Magic Mouse**. These are real human checkpoints.
- **D-13:** **Windows wheel (and any device not in D-12) is covered by recorded traces**: public or recorded wheel-event traces replayed in unit tests against the wheel accumulator. The phase passes on traces plus the D-12 devices; the gap is noted in VERIFICATION for a later real check.
- **D-14:** **Hand tests run on the Vercel PR preview** (public per Phase 2 D-14) with a short per-device checklist Yahya ticks. A `?debug` overlay shows live wheel deltas, gesture boundaries and pager state for tuning; it is off by default and changes nothing without the query flag.

### Claude's Discretion
- **History details:** a Back entry is pushed per landed page; retargets mid-slide coalesce into one entry (only where the visitor ends up counts). Back/Forward slide the track like any other page change. `document.title` follows the current page's metadata title.
- **Keys on an overflowing page:** Space / Page Down / ↓ scroll the page first and page only at the edge (same fresh-press rule as D-05); ← / → always page; Home/End jump to 00 / 05.
- **Focus after mouse, wheel or swipe paging:** focus still moves to the new heading (A11Y-01, `preventScroll`), with no visible focus ring unless the change came from the keyboard.
- **Easing curve** for the 600ms track (fast, no bounce, per the one motion rule).
- Wheel accumulator thresholds, idle gap and lock timings (research SUMMARY pitfall 1), validated by traces and devices.
- Reduced motion in Phase 4: the track honours `prefers-reduced-motion` live (WR-08) with an instant change; the full reduced-motion pass over every animation stays in Phase 5.
- Code structure (pager reducer/provider, input layer, hooks) within the research architecture (single pager state; inputs emit intents; URL, transform, `inert`, focus and chrome are projections).

### Folded Todos
- **Carry v7 review warnings into the build** (`.planning/todos/pending/2026-11-07-carry-v7-review-warnings-into-build.md`), Phase 4 parts only:
  - WR-04: Space must not page while a button or link has focus.
  - WR-06: on page change, move focus into the new page (its heading) when focus was in the old one; never leave focus on an `inert` page.
  - WR-08: listen to `prefers-reduced-motion` changes live, not once at load.
  - IN-01: reset the wheel accumulator after the idle gap between gestures.
  - WR-05 and WR-07 (cursor) stay for Phase 5. Do not close the todo in Phase 4; mark the Phase 4 items done.
- **Fix gaps inside words in small uppercase labels** (`.planning/todos/pending/2026-11-08-fix-label-letter-gaps.md`): "YAHYA HALL ANI", "RESU ME (PDF)" etc. in the Label role (letter-spacing, kerning/feature settings or the font subset). Fixed here since the track change regenerates the visual baselines anyway. Done when labels render without inner-word gaps in Chromium on Linux and in Yahya's Chrome, `pnpm test:e2e` passes, and baselines are regenerated in the Playwright container (command in 03-10-SUMMARY).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design and requirements
- `docs/superpowers/specs/2026-11-03-portfolio-design.md` — approved design doc rev 5: Decisions table (Decision 3 rail inset / 20px edge exclusion, Decision 4 inner scroll), motion section (one motion rule, 600ms track, motion inventory), navigation section (Input; Accessibility: inert, focus to heading, live region text "{Section name}, page {n} of 6", skip link, JS-off routes), cursor section (paging releases the snap: Phase 5, but the pager must expose a "slide started / landed" signal for it)
- `.planning/REQUIREMENTS.md` — NAV-01..04, NAV-07, A11Y-01
- `.planning/ROADMAP.md` §Phase 4 — goal and five success criteria

### Research
- `.planning/research/SUMMARY.md` — URL model A (real routes + pushState, coalescing), pitfalls 1-3 (trackpad momentum, non-passive wheel listeners + `overscroll-behavior`, offscreen a11y), architecture (single pager reducer; inputs emit intents; URL/transform/inert/focus are projections)
- `.planning/research/ARCHITECTURE.md` — pager controller, InputLayer, Track, history model
- `.planning/research/PITFALLS.md` — wheel inertia, iOS Safari edge swipe, address bar, rubber-band
- `.planning/research/FEATURES.md` — conventions: wheel down = next, swipe left = next, no scrolljacking inside text pages, deep links
- `.planning/research/STACK.md` — hand-written `usePager`; no Lenis / fullPage / Swiper / `@use-gesture`; Vitest for reducer and trace tests, Playwright for paging e2e incl. WebKit

### Prior phase context
- `.planning/phases/03-static-design-system-and-pages/03-CONTEXT.md` — D-05 shared track, D-06 JS-off routes, D-08..D-10 static header/footer/rail
- `.planning/phases/03-static-design-system-and-pages/03-REVIEW.md` — open warnings WR-01..03
- `.planning/phases/03-static-design-system-and-pages/03-10-SUMMARY.md` — visual baseline regeneration command (Playwright container)
- `.planning/phases/01-design-gate/01-REVIEW.md` — WR-04, WR-06, WR-08, IN-01 details (v7 sketch bugs)
- `.planning/phases/02-live-deploy-spike/02-CONTEXT.md` — D-14 public previews for device tests, D-15 Playwright against the static export

### Todos folded
- `.planning/todos/pending/2026-11-07-carry-v7-review-warnings-into-build.md`
- `.planning/todos/pending/2026-11-08-fix-label-letter-gaps.md`

### Reference sketch
- `docs/reference/swiss-horizontal-v6.html` (and the v7 sketch beside it) — reference for feel only, not code to copy (its pager bugs are the WR list)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/shell/Track.tsx`: already renders all six pages as `<section data-page inert>` inside `<main id="content" data-current>`; heading level 1 on the current page, 2 elsewhere. Phase 4 turns this into the sliding track (client state drives `data-current`, `inert`, heading level).
- `components/shell/shell.module.css`: `.page[inert] { display: none }` with the comment "Phase 4 overrides this one rule under html[data-js]". Pages are `100svh` with `overflow-y: auto` on desktop and document scroll under 820px.
- `components/shell/Shell.tsx`: binding DOM order SkipLink, Header, LetterNav, Track, Footer. The persistent shell is where pager state lives.
- `components/frame/Header.tsx`, `Footer.tsx`, `components/letters/LetterNav.tsx`: server-rendered per route from `current`; they become projections of pager state (D-10, D-11).
- `content/site.ts` / `lib/sections.ts`: sections, slugs, routes, letters, captions; source for page order, URLs and live-region names.
- `lib/metadata.ts`: per-route titles (for `document.title` on page change).
- `components/pages/Heading.tsx`: page headings (focus target; needs `tabIndex={-1}`).
- `styles/base.css`: focus-visible rules, `main:focus`.

### Established Patterns
- CSS Modules + `styles/tokens.css`, no Tailwind; durations and easings as tokens.
- Server Components render all content; client code stays a thin layer (JS baseline 132.2 kB gzip, `pnpm measure:js`).
- Text only from typed `content/*.ts` files (no literals in components); live-region strings go there too.
- Tests: Vitest (jsdom) for logic; Playwright against built `out/`; axe on all routes; 18 visual baselines at 1440x900, 1366x768, 390x844 pinned in the Playwright container.

### Integration Points
- `app/*/page.tsx` each render `<Shell current=...>`; client navigation keeps these as real routes (deep link lands directly, JS off still works) while pushState handles in-app changes without remount.
- `html[data-js]` hook (set by script) separates the JS-on track layout from the JS-off one-page-per-route view.
- Phase 5 will need from the pager: current/target index, a "slide started / landed" signal, and the track's resting position (letters measure against it, design doc rail note).

</code_context>

<specifics>
## Specific Ideas

- "Retarget" should feel like the slide never refuses you: pressing → mid-slide continues smoothly from where the track is, with no restart from zero.
- The Index → 01 stand-in in Phase 4 must not look broken: letters leave with the page, the rail appears cleanly on landing.
- The `?debug` overlay is a tuning tool for Yahya's own device sessions (Mac trackpad, Magic Mouse, Linux touchpad, phones).

</specifics>

<deferred>
## Deferred Ideas

- Letters-to-rail FLIP glide, first-visit hint, opening animation, custom cursor and full reduced-motion pass — Phase 5 (already on the roadmap).
- Real Windows-wheel hand test — noted as a gap (D-13); do it when a Windows machine is available.

### Reviewed Todos (not folded)
None — both matching todos were folded.

</deferred>

---

*Phase: 04-horizontal-pager-and-input*
*Context gathered: 2026-11-09*
