# Phase 5: Letter Navigation and Motion - Context

**Gathered:** 2026-11-09
**Status:** Ready for planning

<domain>
## Phase Boundary

The signature experience. The five YAHYA letters glide from the hero into a left rail and back, replacing Phase 4's D-09 stand-in (letters ride off with page 00, static rail appears on landing). A first-time visitor gets a short opening animation and a quiet hint that the site moves sideways. The custom cursor (form a, an ink square) guides navigation. Every motion follows the one horizontal rule, and every animation has an instant reduced-motion version.

Requirements: LTR-03, LTR-04, LTR-05, LTR-06, NAV-05, NAV-06, DSGN-04, EXP-01, EXP-03, A11Y-04.

NAV-05 (00 / 05 counter, Next control, progress bar) was built in Phase 4 (D-10, D-11); this phase only verifies it against the finished choreography.

Not in this phase: page compositions, hover previews on Achievements/Projects, the Facturo walkthrough, the Say hi spiral, the margin section names and the Pause motion control (Phase 6); phone portrait layouts (Phase 6); final copy, SEO, sharing (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### Opening animation (EXP-01)
- **D-01:** **Letters slide in.** On a black ground the five YAHYA letters slide in horizontally with the 30ms stagger and land in their hero positions, then captions and chrome appear. The name is the show. No curtain, no grid-line draw, no counter (a counter reads as a loader). Total under about 1 second, with the real page already rendered underneath.
- **D-02:** **Index only.** The opening plays only when the page being viewed is the Index. A deep link (e.g. `/projects/` from LinkedIn) shows content at once.
- **D-03:** **A deep-link visit does not use up the opening.** The first time the Index is actually viewed (a fresh load of `/`, or paging/navigating to the Index), the opening plays. When it is reached by paging, the opening plays instead of the rail-to-hero glide that one time.
- **D-04:** **Remembered in `localStorage`, forever.** One key, set when the opening plays or is skipped. Every read and write is wrapped in try/catch: if storage throws (private window, blocked data), the opening plays at most once per page load and the page works normally.
- **D-05:** **Hidden-until-script, no black cover.** A tiny inline script (same mechanism as `lib/js-flag.ts` / `html[data-js]`) sets a class before first paint only when the flag is unset, so letters start offscreen and never flash in place. With JavaScript off, or storage unreadable, nothing is hidden and no opening runs. The server HTML must stay complete and readable.
- **D-06:** **Skip: click, tap, or any key except Tab.** Pointer-down or key-down jumps to the final state instantly. The skipping input is consumed (it does not also page). Tab and Shift+Tab are never intercepted. Wheel and swipe do not skip.

### First-visit hint (NAV-06)
- **D-07:** **Footer label plus a Next nudge.** A short Label line near the "Next, {Section}" link, and the Next arrow shifts a few px horizontally and back once. Real text in the existing footer chrome; nothing covers page content and screen readers get it.
- **D-08:** **Per-device wording.** Fine pointer: "Scroll or use the arrow keys". Touch (`pointer: coarse`): "Swipe sideways". Strings live in `content/` (no literals in components). Chosen at runtime, so the server HTML carries neither string (no flash, no hydration mismatch).
- **D-09:** **Ends on the first page change or after 8 seconds**, whichever comes first, with a `--dur-ui` fade. It never returns: its own `localStorage` flag, separate from the opening's, same try/catch rule.
- **D-10:** **Timing and routes.** Appears on every route. About 1s after the opening ends or is skipped; about 1.5s after load when there is no opening (deep link, or the opening already seen but the hint not). The first page change dismisses it.

### Letter glide choreography (LTR-03, DSGN-04)
- **D-11:** **Horizontal leads.** Per letter, one FLIP: the X travel runs on the page easing across the full 600ms; the Y travel and the shrink finish about 100ms later on a gentler ease. It reads as "slides left, then settles into a column" and stays inside the one motion rule. Same stagger and ease logic reversed on return.
- **D-12:** **Y first, both directions.** Stagger is 30ms per letter in reading order (Y A H Y A), whether going to the rail or back to the hero. No direction-dependent order.
- **D-13:** **The glide shares the track's 600ms, whatever the distance.** It starts at slide start (D-10 of Phase 4), so an Index to 04 jump has letters and track moving together. Rail-to-rail paging (01 to 05) does not move the rail.
- **D-14:** **Captions fade; the rest rides off with page 00.** The hero captions ("01 Achievements" and so on) fade out over `--dur-ui` at slide start, since they belong to the big letters. The role line and the Index grid lines are page 00 content and slide away with the page. On return they ride back in and the captions fade up once the letters have landed.
- **D-15:** The letters are detached from page 00's track and animated against the track's **resting** position (design doc section 6; Phase 4 `restingOffsetPx` comment already reserves this), never the in-flight position, so paging back mid-slide still lands them.

### Cursor and rail labels (EXP-03, LTR-04)
- **D-16:** **Snap targets: the letters plus every link and button.** Hero and rail letters, header and footer links, Next, Resume, and any content link or button. Add an opt-in attribute so Phase 6 can mark non-link hover targets (Achievements lines) without touching cursor code.
- **D-17:** **Label tag on letters and external links only.** Letters show their section name; external links and the Resume show the destination or action. Internal chrome links (Next, Say hi, header) snap the square only, because their text is already visible beside the pointer. Long text names its action instead (design doc section 8).
- **D-18:** **Keyboard focus on a rail letter shows the same Label tag** beside the letter (static, right of it, `--dur-ui` fade), so LTR-04 works without a cursor. One tag component serves hover and focus.
- **D-19:** **Difference blend.** `mix-blend-mode: difference` on the square and the dot so they stay visible over light areas of photos and screenshots, plain ink as the fallback.

### Folded Todos
- **Carry v7 review warnings into the build** (`.planning/todos/pending/2026-11-07-carry-v7-review-warnings-into-build.md`), Phase 5 parts only:
  - **WR-05:** one pointer-position state; "no pointer yet" must never become (0, 0). Nothing renders before the first real `pointermove`.
  - **WR-07:** hide the native cursor only after the custom cursor is running (class set by script), never from first paint, and never when the custom cursor cannot run.
  - Phase 4 already handled WR-04, WR-06, WR-08 and IN-01. Close the todo after this phase.
  - Also from the todo: use `--yahya-fit` 2.188 with the manual Y-A kerning rule, not 2.155 (`--yahya-fit: 2.188` is already in `styles/tokens.css` and the hero kern is in `letters.module.css`; keep both when the letters move).

### Claude's Discretion
- **Resize mid-flight:** cancel running letter animations and snap to the correct resting state for the current viewport; never leave letters stranded (success criterion 1).
- **Phone:** the same glide, with the 22px rail inset by 24px from the left edge (LTR-06, design doc section 6). The phone Index shows its stacked section list instead of per-letter captions (Phase 3), so the caption fade applies only where captions exist.
- **Easing values:** `--ease-page` for X; the "gentler" ease for Y/scale and the exact 100ms lag are Claude's call (no control point above 1, no bounce).
- **Cursor mechanics (per the design doc and WR-05/07):** the native cursor is hidden only after the custom cursor is running and has a real position; touch (`(hover: none)`, `(pointer: coarse)`) and forced-colours keep the native cursor; a page change drops the snap at once and re-snaps to whatever is under the pointer after landing; the tag is clamped 8px inside all four viewport edges; pointer leaving the window hides the cursor.
- **Reduced motion (A11Y-04):** the opening, glide, hint nudge and cursor shape changes all become instant (`--dur-*` tokens are already 0ms under `prefers-reduced-motion`), applied live (WR-08 pattern from Phase 4). The opening under reduced motion shows the final state with no slide.
- **Accessibility of the new pieces:** the opening is decoration (content is already in the DOM); the hint is real text in the footer and need not be announced; the cursor is `aria-hidden`.
- **NAV-05 verification:** confirm counter, Next and progress bar track the page correctly under the new choreography, including retargets and the opening.
- **Interruption:** every new animation is interruptible and retargets from its rendered position, never queues (design doc section 5).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design and requirements
- `docs/superpowers/specs/2026-11-03-portfolio-design.md` — approved rev 5. Section 5 Motion (one rule, tokens `--dur-page`, `--dur-letters`, `--dur-ui`, `--dur-open`, `--ease-page`, `--ease-ui`; banned curves; interruptibility; reduced motion). Section 6 Navigation (hero letters, rail size and hit areas, accent rule, hero targets measured against the resting position, first-visit line). Section 8 Cursor (form a, 1:1 tracking, paging releases the snap, tag never leaves the viewport, touch and forced-colours keep native).
- `.planning/REQUIREMENTS.md` — LTR-03..06, NAV-05, NAV-06, DSGN-04, EXP-01, EXP-03, A11Y-04
- `.planning/ROADMAP.md` §Phase 5 — goal and five success criteria; research flag "FLIP interruption and resize (native WAAPI; switch to GSAP Flip only if bugs cost more than a day)"

### Research
- `.planning/research/SUMMARY.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md` — FLIP, pager signals, fitted-type and font-shift pitfalls
- `.planning/research/STACK.md` — native WAAPI, no animation library; GSAP Flip only as the fallback named in the roadmap

### Prior phase context
- `.planning/phases/04-horizontal-pager-and-input/04-CONTEXT.md` — D-09 stand-in to replace, D-10/D-11 chrome and progress bar, signals contract, Phase 5 integration points
- `.planning/phases/03-static-design-system-and-pages/03-CONTEXT.md` — hero letter geometry, rail, static header/footer
- `.planning/phases/01-design-gate/01-REVIEW.md` — WR-05, WR-07 details (v7 sketch cursor bugs)
- `.planning/phases/04-horizontal-pager-and-input/04-HUMAN-UAT.md` — open real-device items that still gate NAV-01, NAV-03, A11Y-01

### Todos folded
- `.planning/todos/pending/2026-11-07-carry-v7-review-warnings-into-build.md` (WR-05, WR-07)

### Reference sketch
- `docs/reference/swiss-horizontal-v6.html` and the v7 sketch beside it — feel and FLIP reference only, not code to copy (its bugs are the WR list)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/letters/LetterNav.tsx` + `letters.module.css`: one set of five letter links, `data-mode` `hero`/`rail`, fixed-width letter boxes (`--adv-y/a/h`), box-sized `::before` hit areas, YA kern, accent only from `aria-current`. Phase 5 FLIPs these exact elements; the file already says so.
- `lib/pager/signals.ts` (`onSlideStart`, `onLanded`) and `lib/pager/types.ts` (`PagerState.lettersMode`, `railEnter`, `slideId`, `retarget`): the choreography subscribes here rather than reading router state.
- `lib/pager/animator.ts`: WAAPI animator with `SLIDE_MS`, `translateXOf`, `restingOffsetPx` (commented "Phase 5 replaces the viewport width with the rail measurement"), `cancelOn`/`isCssDriven`, and a `letters` target already wired for the riding hero row.
- `components/frame/Footer.tsx`: counter, Next link, progress bar (`--page-index`); the hint attaches here.
- `components/shell/PagerProvider.tsx`: live `prefers-reduced-motion` listener, `controller.isReducedMotion()`, `data-phase`/`data-land` projection.
- `styles/tokens.css`: `--dur-page`, `--dur-letters`, `--dur-ui`, `--ease-page`, `--ease-retarget`, `--ease-ui`, `--rail-size`, `--rail-col`, `--rail-gap`, `--hit-min`; all `--dur-*` go to 0ms under reduced motion.
- `lib/js-flag.ts` (`JS_FLAG_SCRIPT`) and `html[data-js]`: the existing before-paint inline script, the model for the opening's hide class.
- `styles/tokens.css` `--yahya-fit` (2.188) and the `.nav[data-mode="hero"]` YA kern in `letters.module.css`: the moving letters must keep both.

### Established Patterns
- CSS Modules + tokens, no Tailwind; transform and opacity only for motion.
- Server Components carry all content; client code is a thin layer on top; JS budget gate at 150 kB gzip (`pnpm measure:js`, 140.3 kB after Phase 4), so cursor, opening and hint code must stay small and ideally load lazily.
- All text from typed `content/*.ts` files; no literals in components (`jsx-no-literals` guard). Hint strings and tag text go there.
- Tests: Vitest (jsdom) for logic, Playwright against the built `out/`, axe on all routes, visual baselines at 1440x900, 1366x768, 390x844 pinned in the Playwright container.

### Integration Points
- `LetterNav` `lettersMode` currently comes from the pager reducer (D-09 stand-in); the glide replaces its hero-to-rail switch with an animated hand-off driven by slide-start and landed signals.
- The cursor needs the pager's slide-started/landed signal to drop and re-take the snap (already exposed in Phase 4).
- The opening and the hint both read `localStorage` flags; both must be inert when storage throws.

</code_context>

<specifics>
## Specific Ideas

- The opening is the letters themselves: "the name is the show". Nothing else is added to the screen for it.
- The hint is deliberately quiet: a line of footer text and a small Next nudge, not a modal or a callout.
- The glide should read as "slides left, then settles into a column", horizontal first.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (Pause motion control, hover previews and the walkthrough were never raised; they remain Phase 6.)

### Reviewed Todos (not folded)
None — the one matching todo was folded (Phase 5 parts).

</deferred>

---

*Phase: 05-letter-navigation-and-motion*
*Context gathered: 2026-11-09*
