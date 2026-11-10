# Phase 5: Letter Navigation and Motion - Research

**Researched:** 2026-11-09
**Domain:** Hand-written WAAPI FLIP choreography, first-visit state (localStorage + before-paint script), custom cursor, reduced-motion pass, inside an existing Next.js 16 static-export pager
**Confidence:** HIGH for codebase integration and browser API facts. MEDIUM for choreography tuning (easing, opening direction), which needs eyes on real hardware.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Opening animation (EXP-01)
- **D-01:** **Letters slide in.** On a black ground the five YAHYA letters slide in horizontally with the 30ms stagger and land in their hero positions, then captions and chrome appear. The name is the show. No curtain, no grid-line draw, no counter (a counter reads as a loader). Total under about 1 second, with the real page already rendered underneath.
- **D-02:** **Index only.** The opening plays only when the page being viewed is the Index. A deep link (e.g. `/projects/` from LinkedIn) shows content at once.
- **D-03:** **A deep-link visit does not use up the opening.** The first time the Index is actually viewed (a fresh load of `/`, or paging/navigating to the Index), the opening plays. When it is reached by paging, the opening plays instead of the rail-to-hero glide that one time.
- **D-04:** **Remembered in `localStorage`, forever.** One key, set when the opening plays or is skipped. Every read and write is wrapped in try/catch: if storage throws (private window, blocked data), the opening plays at most once per page load and the page works normally.
- **D-05:** **Hidden-until-script, no black cover.** A tiny inline script (same mechanism as `lib/js-flag.ts` / `html[data-js]`) sets a class before first paint only when the flag is unset, so letters start offscreen and never flash in place. With JavaScript off, or storage unreadable, nothing is hidden and no opening runs. The server HTML must stay complete and readable.
- **D-06:** **Skip: click, tap, or any key except Tab.** Pointer-down or key-down jumps to the final state instantly. The skipping input is consumed (it does not also page). Tab and Shift+Tab are never intercepted. Wheel and swipe do not skip.

#### First-visit hint (NAV-06)
- **D-07:** **Footer label plus a Next nudge.** A short Label line near the "Next, {Section}" link, and the Next arrow shifts a few px horizontally and back once. Real text in the existing footer chrome; nothing covers page content and screen readers get it.
- **D-08:** **Per-device wording.** Fine pointer: "Scroll or use the arrow keys". Touch (`pointer: coarse`): "Swipe sideways". Strings live in `content/` (no literals in components). Chosen at runtime, so the server HTML carries neither string (no flash, no hydration mismatch).
- **D-09:** **Ends on the first page change or after 8 seconds**, whichever comes first, with a `--dur-ui` fade. It never returns: its own `localStorage` flag, separate from the opening's, same try/catch rule.
- **D-10:** **Timing and routes.** Appears on every route. About 1s after the opening ends or is skipped; about 1.5s after load when there is no opening (deep link, or the opening already seen but the hint not). The first page change dismisses it.

#### Letter glide choreography (LTR-03, DSGN-04)
- **D-11:** **Horizontal leads.** Per letter, one FLIP: the X travel runs on the page easing across the full 600ms; the Y travel and the shrink finish about 100ms later on a gentler ease. It reads as "slides left, then settles into a column" and stays inside the one motion rule. Same stagger and ease logic reversed on return.
- **D-12:** **Y first, both directions.** Stagger is 30ms per letter in reading order (Y A H Y A), whether going to the rail or back to the hero. No direction-dependent order.
- **D-13:** **The glide shares the track's 600ms, whatever the distance.** It starts at slide start (D-10 of Phase 4), so an Index to 04 jump has letters and track moving together. Rail-to-rail paging (01 to 05) does not move the rail.
- **D-14:** **Captions fade; the rest rides off with page 00.** The hero captions ("01 Achievements" and so on) fade out over `--dur-ui` at slide start, since they belong to the big letters. The role line and the Index grid lines are page 00 content and slide away with the page. On return they ride back in and the captions fade up once the letters have landed.
- **D-15:** The letters are detached from page 00's track and animated against the track's **resting** position (design doc section 6; Phase 4 `restingOffsetPx` comment already reserves this), never the in-flight position, so paging back mid-slide still lands them.

#### Cursor and rail labels (EXP-03, LTR-04)
- **D-16:** **Snap targets: the letters plus every link and button.** Hero and rail letters, header and footer links, Next, Resume, and any content link or button. Add an opt-in attribute so Phase 6 can mark non-link hover targets (Achievements lines) without touching cursor code.
- **D-17:** **Label tag on letters and external links only.** Letters show their section name; external links and the Resume show the destination or action. Internal chrome links (Next, Say hi, header) snap the square only, because their text is already visible beside the pointer. Long text names its action instead (design doc section 8).
- **D-18:** **Keyboard focus on a rail letter shows the same Label tag** beside the letter (static, right of it, `--dur-ui` fade), so LTR-04 works without a cursor. One tag component serves hover and focus.
- **D-19:** **Difference blend.** `mix-blend-mode: difference` on the square and the dot so they stay visible over light areas of photos and screenshots, plain ink as the fallback.

#### Folded Todos
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. (Pause motion control, hover previews and the walkthrough were never raised; they remain Phase 6.)

Reviewed Todos (not folded): None — the one matching todo was folded (Phase 5 parts).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LTR-03 | Letters glide and shrink into a vertical rail; return grows them back | Pattern 1 (hero-geometry flight, scale at most 1), Pattern 2 (split X / Y easing via `translate` + `transform`), Pattern 3 (retarget and resize), Pitfalls 1-6 |
| LTR-04 | Rail letters reveal their section name on hover and keyboard focus | Pattern 6 (focus tag in CSS on `:focus-visible`; hover via the cursor tag, with a CSS hover fallback when the cursor is not running), Pitfall 12 |
| LTR-05 | Current letter: accent plus a non-colour cue; only that letter, derived from the page; own box hit area | Existing `aria-current` accent rule and the `.now` numbered name (non-colour cue) stay; Pattern 1 keeps the `::before` hit areas; `.now` must stop depending on `lettersMode` (Pattern 1 notes) |
| LTR-06 | Phone rail inset from the left edge | Already in `letters.module.css` (`left: var(--space-lg)` under 820px); the glide measures the real rail rects, so the inset is honoured automatically. Verify at 390x844 |
| NAV-05 | 00 / 05 counter, Next, progress bar | Built in Phase 4 (Footer.tsx, animator bar). Verification only: Validation map rows NAV-05-a..c |
| NAV-06 | Quiet first-visit hint | Pattern 5 (hint state machine, runtime string choice, own storage key), Pitfall 9 |
| DSGN-04 | One motion rule: horizontal, fast, no bounce | Easing analysis (X always leads Y), token guard test (no bezier y outside [0,1]), sampler e2e (monotonic, no overshoot) |
| EXP-01 | Opening under ~1s, any click or key skips, content loaded underneath, never repeats | Pattern 4 (before-paint script + WAAPI opening + failsafe), Pitfalls 7, 8, 10 |
| EXP-03 | Custom cursor, form a, 1:1, shape-only changes, tag inside viewport, native cursor kept on touch and forced colours | Pattern 7 (lazy imperative cursor module), Pitfalls 11-14, `placeTag()` pure function |
| A11Y-04 | Reduced motion: every animation is an instant change | Pitfall 2 (WAAPI ignores CSS tokens), reduced-motion inventory table, live `matchMedia` listener reuse |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Stack is fixed: Next.js 16.4 App Router, React 19.3, TypeScript 6.0, `output: 'export'`, `trailingSlash: true`, deployed on Vercel. Headers and CSP live in `vercel.json` (current CSP allows `script-src 'self' 'unsafe-inline'`, so a second inline script needs no CSP change). [VERIFIED: vercel.json, next.config.ts]
- Styling: CSS Modules plus one global `styles/tokens.css`. No Tailwind. Raw hex colours only in `tokens.css` (enforced by `tests/css-guard.test.ts`). No `font` shorthand. [VERIFIED: tests/css-guard.test.ts]
- Motion: native WAAPI, **no animation library**. GSAP Flip is only the fallback named in the roadmap ("switch only if bugs cost more than a day"). No gesture or smooth-scroll library. [VERIFIED: CLAUDE.md, ROADMAP research flag]
- Only `transform` and `opacity` animate (design doc section 5). Individual transform properties (`translate`, `scale`) count as transform.
- Content: all text in typed `content/*.ts`; no literal `aria-label`/`alt`/`title` in components (`tests/source-guard.test.ts`); `jsx-no-literals` lint guard.
- New `"use client"` files must be added deliberately to `CLIENT_ALLOWLIST` in `tests/source-guard.test.ts`.
- JS budget: 150 kB gzip for `/` (`pnpm measure:js`); 140.3 kB after Phase 4. Only scripts referenced from `out/index.html` count, so lazily `import()`ed chunks are outside the gate. [VERIFIED: scripts/measure-js.mjs]
- Accessibility: WCAG contrast, keyboard, reduced motion. Self-host all assets.
- Testing: Vitest 5 (jsdom) for logic, Playwright 1.65 against built `out/`, axe on all routes, visual baselines 1440x900, 1366x768, 390x844 in the Playwright container.
- GSD workflow: edits only through GSD commands. Commits: conventional format, **no Co-Authored-By trailer and no "Generated with Claude Code" footer** (user memory overrides the default attribution).

## Summary

The codebase is already shaped for this phase. `LetterNav` renders one set of five links with `data-mode="hero" | "rail"`, fixed em-sized letter boxes and `::before` hit areas. The pager exposes `onSlideStart` / `onLanded`. The hero row is **not** inside the track (it is an absolutely positioned sibling of `main#content`), so D-15 ("measure against the resting position, never the in-flight one") holds by construction: the hero resting layout is plain CSS that never depends on the track transform. The Phase 4 stand-in is three things to delete: the animator's "riding letters" WAAPI call, the reducer's `lettersMode` / `railEnter` / `lettersInert`, and the `rail-in` keyframe.

The main design decision is **which layout the letters fly in**. Classic FLIP flips to the destination layout and inverts. Going to the rail, that means a 30px glyph scaled up 15-25x, which Chromium and WebKit rasterise once and stretch, so it looks blurry. Fly in **hero geometry both ways**, with scale at most 1. To the rail, keep `data-mode="hero"` while the letters animate toward the measured rail rects, then swap to `data-mode="rail"` and drop the animations in the same frame. To the hero, swap to hero at the start and animate in from the measured rendered rail rects. The resting text is always real `font-size`. D-11's split timing (X on the page ease, Y and scale lagging) works without `composite` by putting X on the individual `translate` property and Y plus scale on `transform`. These compose in a fixed order (translate, then rotate, then scale, then transform). Numerical analysis shows a "gentler" ease run over 700ms with no delay makes Y **lead** X early on, which breaks D-11. A 100ms delay on the Y/scale animation keeps X ahead the whole way.

The opening uses the existing before-paint script pattern (`data-opening="pending"` on `<html>`, only on `/`, only when storage is readable and the flag is unset, never under reduced motion). The opening module then claims it and plays a WAAPI slide-in that `finish()` can skip. An inline failsafe timer removes the attribute if the bundle never claims it. The cursor is a lazily imported, React-free module, so it stays out of the 150 kB gate. It writes the dot position directly in `pointermove`. The snap box is drawn with transform-only hairlines, and `mix-blend-mode` goes on the fixed root itself, because blending only reaches content in the same stacking context. A key cross-cutting pitfall: the `--dur-*` tokens become 0ms under reduced motion only for CSS. Every WAAPI call uses numeric durations, so each one must check reduced motion itself.

**Primary recommendation:** Build one small `lib/letters/glide.ts`, a pure plan plus a DOM runner. Flights always run in hero geometry with scale at most 1, X on `translate`, Y/scale on `transform` with a 100ms delay, `fill: "both"`, and retargets measured from `getBoundingClientRect()` before `cancel()`. Drive it from `onSlideStart`, and make it the only writer of `data-mode` after hydration.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Hero and rail resting layouts | CDN / Static (CSS in server HTML) | — | Both rest states are pure CSS, so resize and no-JS need no script |
| Letter glide (FLIP) | Browser / Client | — | Measurement and WAAPI exist only in the browser; driven by pager signals |
| Which mode the letters show (semantics) | Browser / Client (pager signals) | Static (initial `data-mode` from server prop) | Server HTML picks the initial mode per route; the choreographer owns it after hydration |
| Opening "hidden" first-paint state | Static (inline `<head>` script in `app/layout.tsx`) | Browser / Client (opening module) | It must run before first paint, so it cannot wait for hydration |
| First-visit memory | Browser / Client (`localStorage`) | — | No server; must degrade when storage throws |
| Hint text choice | Browser / Client | Static (`content/site.ts` strings) | Depends on `pointer: coarse` at runtime (D-08); the server renders neither string |
| Custom cursor | Browser / Client (lazy chunk) | — | Fine-pointer only; outside the JS budget gate |
| Reduced motion | Static (CSS tokens) | Browser / Client (live `matchMedia`) | CSS covers transitions; WAAPI code must check it itself |

## Standard Stack

### Core
| Library / API | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Web Animations API (`Element.animate`, `Animation.finish/cancel/finished`, `getAnimations`) | Native | Glide, opening, hint nudge | Locked by STACK.md and the roadmap; already used by `lib/pager/animator.ts`. 0 kB |
| CSS individual transform properties (`translate`, `scale`) | Native, Baseline since Aug 2022 | Lets X animate on its own easing next to the `transform` Y/scale animation | Applied in a fixed order: translate, rotate, scale, then `transform`. [CITED: developer.mozilla.org/en-US/docs/Web/CSS/translate] [VERIFIED: Playwright Chromium probe, `translate` WAAPI animation moves `getBoundingClientRect()`] |
| `mix-blend-mode: difference` | Native, Baseline since Jan 2020 | D-19 cursor visibility | Blends only with content in the same stacking context. [CITED: developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode] |
| `matchMedia` (`prefers-reduced-motion`, `pointer`, `hover`, `forced-colors`) | Native | Live mode switches | Already the WR-08 pattern in `PagerProvider` |

### Supporting (already installed, no new dependency)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest + jsdom + Testing Library | 5.1.0 / 31.0.0 / 16.3.3 | Pure math (FLIP deltas, tag placement), storage wrappers, hint timer, skip-key filter | Everything without real layout |
| Playwright | 1.65.0 | Glide sampling, opening, cursor 1:1, reduced motion, forced colours | Anything needing layout or WAAPI (jsdom has no `el.animate`) |
| @axe-core/playwright | 4.14.0 | Hint and focus tag contrast | A11y pass |

**Installation:** none. Phase 5 adds **no packages**. [VERIFIED: package.json]

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-written WAAPI FLIP | GSAP 3.15 + Flip | Roadmap fallback only, if interruption or resize bugs cost more than a day. Adds weight to a budget with about 9.7 kB of headroom |
| `translate` + `transform` split | `composite: "add"` on two `transform` animations | Also works (Baseline 2023), but harder to read and debug; the individual-property split is clearer |
| Hairline-line cursor box | Animating `width`/`height` of a bordered box | Breaks "only transform and opacity animate"; scaling one bordered box distorts the 1px border |

## Architecture Patterns

### System Architecture Diagram

```
 first paint (inline <head> script)                         hydration
 ┌───────────────────────────────┐                ┌───────────────────────────────┐
 │ data-js=''                    │                │ PagerProvider creates         │
 │ if path=='/' && !reduced &&   │                │ controller + signals          │
 │    storage ok && !flag:       │──CSS hides───▶ │  │                            │
 │    data-opening="pending"     │  letters/chrome│  ├─▶ useGlide (LetterNav)     │
 │    + failsafe timeout         │                │  ├─▶ Opening (claims pending) │
 └───────────────────────────────┘                │  ├─▶ Hint (Footer)            │
                                                  │  └─▶ import('cursor') if fine │
                                                  └──────────────┬────────────────┘
 inputs (wheel/key/swipe/link/history)                           │
        │                                                        ▼
        ▼                                         controller.intent()
  pager reducer ──▶ commit ──▶ scroll.beforeSlide ──▶ animator.slideTo (track+bar)
                                                  └─▶ signals.slideStart{from,to}
                                                          │
          ┌───────────────────────┬───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼                       ▼
  glide: dest = to==0?hero:rail   opening: first Index    hint: dismiss          cursor: release snap
   same dest as heading? → no-op   view by paging? → play  (once, fade --dur-ui)  (keep if rail→rail)
   else measure rendered → cancel  opening instead of glide                       ignore pointerover
   → measure rests → animate                                                       │
          │                                                                         │
          ▼                                                                         ▼
   glide settled (own event) ──────────────────────────────────────────▶ resnap via elementFromPoint
   track landed (signals.landed) ─────────────────────────────────────▶   (only when BOTH done and
                                                                           a real pointer position exists)
 window resize mid-flight ──▶ glide: cancel + set dest data-mode;  opening: finish()
 prefers-reduced-motion change ──▶ controller.setReducedMotion + glide/opening/hint read it live
```

### Recommended Project Structure
```
lib/
├── letters/
│   ├── geometry.ts      # pure: rects → {dx, dy, s} deltas, rect math (unit tested)
│   └── glide.ts         # DOM runner: measure, cancel, animate, settle, resize; emits "settled"
├── first-visit/
│   ├── storage.ts       # safeGet/safeSet wrapping localStorage (never throws), key constants
│   ├── script.ts        # OPENING_SCRIPT string for <head> (code, not copy, like js-flag.ts)
│   ├── opening.ts       # claim pending, play/skip, D-03 paging path, "opening done" channel
│   └── hint.ts          # pure timing state machine (show at, hide at, dismiss on slide)
└── cursor/
    ├── mount.ts         # lazy, imperative: creates aria-hidden DOM, listeners, returns cleanup
    ├── targets.ts       # pure: snapTargetOf(el), tagTextOf(el) from data-* attributes
    ├── place-tag.ts     # pure: right → above → below → left, clamp 8px (unit tested)
    └── cursor.module.css
components/
├── letters/LetterNav.tsx      # adds data-cursor-tag, uses useGlide(controller); data-mode constant after hydration
├── letters/useGlide.ts        # thin hook: subscribe glide to signals, cleanup
└── frame/Footer.tsx           # hint line + Next nudge
content/site.ts                # hint.fine, hint.coarse strings
```

### Pattern 1: Fly in hero geometry (scale at most 1), swap mode at the end
**What:** The letters always animate laid out at hero `font-size`, so in-flight scale stays at or below 1. The rail rest is real 30px / 22px type.
**When to use:** Every hero to rail and rail to hero change.
**Sequence at `onSlideStart({ to })`:**
1. `dest = to === 0 ? "hero" : "rail"`. If `dest === heading` (the mode the letters are already at or heading to), do nothing. This covers rail-to-rail paging (D-13) and retargets inside the rail.
2. **Read rendered rects first** (`getBoundingClientRect()` on each `a`; it includes running WAAPI values). Then `cancel()` the letter animations. Cancel drops `fill` and snaps to the underlying style, which is the same "read before cancel" rule as `animator.ts`.
3. Measure both rests in one synchronous block: set `data-mode="rail"`, read R[i]; set `data-mode="hero"`, read H[i] (no paint happens between them).
4. Leave `data-mode="hero"`, set `data-flight` (adds `transform-origin: 0 0`, turns caption pointer events off and fades captions per D-14).
5. Animate from (rendered relative to H) to (dest relative to H): to the rail ends at `R - H`, scale `R.h / H.h`; to the hero ends at identity.
6. When all five finish, set `data-mode = dest`, remove `data-flight`, cancel the letter animations in the same frame, and emit "glide settled".

Letter boxes are em-based (`--adv-*`, height `0.76em`, letter-spacing in em), so a hero glyph scaled by `R.h / H.h` matches the real rail glyph geometrically. The YA kern is a hero-only `margin-right`; the per-letter rect measurement absorbs it. [VERIFIED: letters.module.css]

**Ownership:** React renders `data-mode` from the **initial server prop only** and never changes it, so React never overwrites the choreographer's writes. This is the established Footer `--page-index` pattern ("React keeps the initial value so it never overwrites the animator's inline write"). `aria-current` keeps following `state.target`. Change `.now` to render whenever `target !== 0`, and hide it in hero mode with CSS (`.nav[data-mode="hero"] .now { display: none }`), so it no longer depends on `lettersMode`.

### Pattern 2: Split X and Y/scale timing without `composite`
```ts
// Source: CSS Transforms 2 order (translate → rotate → scale → transform), MDN translate page
const i = letterIndex;            // 0..4, Y A H Y A (D-12)
const stagger = i * STAGGER_MS;   // 30
el.animate(
  [{ translate: `${dx0}px 0` }, { translate: `${dx1}px 0` }],
  { duration: 600, delay: stagger, easing: easePage /* or --ease-retarget on a retarget */, fill: "both" },
);
el.animate(
  [{ transform: `translateY(${dy0}px) scale(${s0})` }, { transform: `translateY(${dy1}px) scale(${s1})` }],
  { duration: 600, delay: stagger + Y_LAG_MS /* 100 */, easing: easeSettle, fill: "both" },
);
// The effective matrix is translate(dx,0) · translateY(dy) · scale(s) with transform-origin 0 0.
```
**Easing (Claude's discretion; numerically checked):**

| Y/scale option | Min X-minus-Y lead | Verdict |
|---|---|---|
| `cubic-bezier(0.5,0,0.2,1)`, 700ms, no delay | **-0.158** (Y ahead near 100-300ms) | Rejected: breaks "horizontal leads" |
| `--ease-page`, 700ms, no delay | 0.000 / max 0.32 | Acceptable |
| **`cubic-bezier(0.5,0,0.2,1)`, 100ms delay, 600ms** | **0.000 / max 0.27** | **Recommended**: gentler and never ahead, ends at 700ms |

Add `--ease-settle: cubic-bezier(0.5, 0, 0.2, 1)` to `tokens.css` (y values within [0,1], no bounce). [VERIFIED: local numeric bezier evaluation in this session]

### Pattern 3: Interruption and resize
- **Retarget (hero↔rail flip mid-flight):** same sequence as Pattern 1. The "from" is always the rendered rect, so there is never a snap. Use `--ease-retarget` for X when the pager reports `retarget` (matches the track).
- **Retarget within the same destination** (0→3, then →4 mid-slide): the letters keep their running animation. Do not restart it.
- **Resize / orientationchange while gliding or opening:** `finish()` the opening; for the glide, cancel and write the destination `data-mode` immediately (the CSS rest reflows to the new viewport). Do not re-measure mid-flight. iOS fires `resize` on address-bar changes, which just ends a glide early; that is acceptable.
- **At rest:** no JS on resize (both rests are CSS).

### Pattern 4: Opening (EXP-01)
1. `lib/first-visit/script.ts` exports an inline string (code, not copy), placed beside `JS_FLAG_SCRIPT` in `app/layout.tsx`:
   `try{if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&localStorage.getItem(KEY)===null){var d=document.documentElement;d.dataset.opening="pending";setTimeout(function(){if(d.dataset.opening==="pending")delete d.dataset.opening},FAILSAFE_MS)}}catch(e){}`
   (Inline the constants at build time.) If storage throws, nothing is hidden (D-05). `trailingSlash: true` makes the Index path exactly `/`.
2. CSS under `html[data-opening]`: letters start with `translate: <offscreen> 0`; header, footer, hero captions and page 00 content other than the letters start at `opacity: 0` ("on a black ground").
3. The opening module (in the initial bundle; it is small) runs on mount: set `data-opening="running"`, write the flag (`safeSet`) when the opening **starts** (D-04), create WAAPI animations with `fill: "both"` (letters: `translate` X to `0 0`, 600ms `--ease-page`, 30ms stagger; then chrome and captions opacity 0→1 over `--dur-ui`), and only then remove `data-opening` in the same task, so the WAAPI fill holds the hidden state with no flash. Total: 4×30 + 600 + 150 = **870ms** (under 1s).
4. **Skip (D-06):** capture-phase listeners on `window` for `keydown` and `pointerdown` while running. For `keydown`, ignore `Tab` (and Shift+Tab) and bare modifiers (`Shift`, `Control`, `Alt`, `Meta`). For other keys, `finish()` every opening animation, then `preventDefault()` + `stopPropagation()` so the pager's bubble-phase window listener never sees the key. Do not `preventDefault` when `ctrlKey`/`metaKey`/`altKey` are set, so browser shortcuts (reload, address bar) still work. For `pointerdown`, `finish()`, then add a one-shot capture `click` listener that `preventDefault()`s + `stopPropagation()`s the click that follows (preventing `pointerdown` does not cancel `click`). Remove it on the next task after `pointerup`/`pointercancel`.
5. **Wheel or swipe paging during the opening:** it is not a skip, but `onSlideStart` arriving while running calls `finish()` and then the normal glide runs from the rendered rects (interruptible, never queued).
6. **D-03 paging path:** on `onSlideStart({to:0})` when the flag is unset and storage is readable, write the flag and play the slide-in instead of the rail-to-hero glide (`data-mode="hero"` immediately, letters from offscreen, captions after).
7. **Reduced motion:** the script never hides anything; the module writes the flag and does nothing else.

### Pattern 5: Hint (NAV-06)
Pure state machine in `lib/first-visit/hint.ts`: inputs `{openingRan, openingEndedAt, loadedAt, flagSeen}`; outputs `showAt` (opening end + 1000ms, or load + 1500ms) and `hideAt` (show + 8000ms). Dismiss on the first `onSlideStart`. The Footer renders an empty `<span>` on the server. After mount it reads `matchMedia("(pointer: coarse)")`, picks `site.hint.coarse` or `site.hint.fine`, writes the hint flag when it **appears** (recommended, see Open Questions), fades in and out over `--dur-ui`, and nudges the Next link once with a WAAPI `translate` of `0 → 4px → 0` (`--ease-ui`; no overshoot past the start). Under reduced motion: no nudge, instant show and hide.

### Pattern 6: Rail focus tag (LTR-04, D-18) in CSS, not in the cursor
The rail caption already exists as the visually hidden accessible name. On `.nav[data-mode="rail"] .letter:focus-visible .caption`, un-hide it as a tag right of the letter (`--dur-ui` opacity). This is real text and works with no cursor and no JS. Share one tag style (`tag.module.css` or a `t-tag` utility) between this and the cursor tag. The cursor tag itself is `aria-hidden`, lazy and fine-pointer only, so "one tag component" should mean **one visual style**, not one runtime element. Also add a hover fallback, `html:not([data-cursor]) .nav[data-mode="rail"] .letter:hover .caption`, so forced-colours and no-cursor mouse users still get the hover name.

### Pattern 7: Cursor as a lazy, React-free module (EXP-03)
- **Load:** in `PagerProvider` (same shape as the `DebugOverlay` lazy import), `import("@/lib/cursor/mount")` only when `matchMedia("(hover: hover) and (pointer: fine)")` matches and `(forced-colors: active)` does not. Re-check on `change`; unmount when they stop matching.
- **DOM:** append to `<body>`, outside the shell. Root A (the fixed square plus the dot) carries `mix-blend-mode: difference` **on the fixed root itself**. Root B (the tag) is a separate fixed element with no blend. Both are `aria-hidden="true"` and `pointer-events: none`.
- **State (WR-05):** `let pos: {x:number;y:number} | null = null`. Render nothing (`opacity: 0`) until the first `pointermove` with `pointerType` `mouse` or `pen`. `resnap()` hit-tests only when `pos !== null`.
- **Native cursor (WR-07):** on that first real move, set `html[data-cursor]`. CSS: `@media (hover: hover) and (pointer: fine) and (forced-colors: none) { html[data-cursor], html[data-cursor] * { cursor: none } }`. The media wrapper restores the native cursor even if the attribute goes stale. Remove the attribute on unmount, on a `pointerType === "touch"` pointerdown (hybrid laptops) and when the media stops matching.
- **Position:** write `translate3d(x,y,0)` directly in the `pointermove` handler. No rAF queue, no lerp. While unsnapped, the box follows with transitions **off**. Transitions (`--dur-ui`, transform and opacity only) apply only for the snap and unsnap change itself.
- **Box:** four 1px hairlines (top, right, bottom, left), each positioned and sized with `transform: translate() scaleX()/scaleY()`. Transform-only, and the 1px edge stays crisp.
- **Targets:** `el.closest("a, button, [data-cursor-snap]")` (opt-in attribute for Phase 6, D-16). Tag text = `data-cursor-tag` when present, else none (D-17). LetterNav renders `data-cursor-tag={`${s.number} ${s.name}`}` from content. The header Resume link gets its tag from content. Externals in Phase 6 get theirs from content.
- **Paging:** `onSlideStart` → release the snap unless the target is a rail letter and `from !== 0 && to !== 0`; ignore `pointerover` until **both** `onLanded` and "glide settled" have fired, then `resnap()` via `document.elementFromPoint`. The `a` has `pointer-events: none`, but hit-testing its `::before` returns the `a`.
- **Tag placement:** `placeTag(box, tag, viewport, pad=8)`. Try right, then above (right-aligned), then below, then left; the first that fits wins, then clamp all four edges. A pure function, ported in spirit from v7 (`docs/reference/swiss-horizontal-v7.html` `tagPos`).
- **Leave:** `pointerleave` on `document.documentElement` sets `opacity: 0`.

### Anti-Patterns to Avoid
- **Destination-layout FLIP to the rail:** this scales a 30px glyph up 15-25x mid-flight, and it rasterises blurry. Fly in hero geometry instead.
- **Letting React re-render `data-mode` from pager state:** it fights the measurement toggles in Pattern 1 and re-introduces the stand-in.
- **Making the letters `inert` during flight:** if a clicked letter still has focus, `inert` blurs it to `<body>`. Phase 5 letters are always live (one set). Remove `lettersInert`.
- **Measuring the hero rect against the track:** the hero row is not in the track; its rest is its own CSS layout.
- **A rAF loop for the cursor:** it adds a frame of lag and constant work. Event-driven writes only.
- **Hiding the native cursor in CSS from first paint** (WR-07).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Independent X and Y easing on one element | Per-frame rAF interpolation | Two WAAPI animations on `translate` and `transform` | Runs on the compositor, interruptible, `finish()`/`cancel()` for free |
| Skipping the opening | Timers and manual style resets | `Animation.finish()` on the opening animations | Jumps exactly to the end state, fills preserved |
| Hit-testing the target under a still pointer after landing | Rect loops over every link | `document.elementFromPoint(x, y)` + `closest()` | Matches the browser's own hit-testing, including `::before` hit areas |
| Reduced-motion detection | One-shot read | `matchMedia(...).addEventListener("change")` (already in `PagerProvider`) | WR-08 |
| Tween library | — | Native WAAPI | Locked by the stack |

**Key insight:** everything hard here (interruption, skip, retarget) is already a WAAPI primitive (`cancel`, `finish`, the rendered value read through `getBoundingClientRect`). The custom code is only measurement and choreography.

## Common Pitfalls

### Pitfall 1: Staggered letters flash at their destination during the delay
**What goes wrong:** Letters 2-5 jump to their final layout for 30-120ms, then animate.
**Why:** WAAPI's default `fill: "none"` does not hold the first keyframe during `delay`.
**How to avoid:** `fill: "both"` on every glide and opening animation.
**Warning signs:** One-frame flicker in Playwright traces or video.

### Pitfall 2: WAAPI ignores the reduced-motion tokens
**What goes wrong:** Under reduced motion the CSS transitions are instant, but the glide, opening and nudge still animate.
**Why:** `--dur-*` → 0ms only affects CSS. `el.animate(..., { duration: 600 })` is a number.
**How to avoid:** Every WAAPI caller checks `controller.isReducedMotion()` (or a shared live `matchMedia`) and takes the instant path. Alternatively, read the duration from the computed token (`--dur-letters`), which is 0 under reduced motion. The instant path still writes the final state (mode, flag).
**Warning signs:** e2e under `emulateMedia({ reducedMotion: "reduce" })` finds `getAnimations().length > 0` on letters.

### Pitfall 3: Phase 4 settle cancels or races the glide
**What goes wrong:** The track lands at 600ms, but the last letter finishes at 120 + 700 = 820ms. Landing code that touches the letters cuts the glide short, and a cursor resnap at landing hits moving letters.
**How to avoid:** Delete the `letters` target from `createWaapiAnimator` (the riding row) and keep the glide's lifecycle separate. Gate the cursor resnap on both "landed" and "glide settled".

### Pitfall 4: A "gentler" ease makes Y lead X
See the easing table in Pattern 2. A softer curve has more early progress. Lag the Y/scale animation with a delay instead of only a longer duration.

### Pitfall 5: Caption flash when flying back to the hero
**What goes wrong:** In rail mode the caption is visually hidden by clip but still at `opacity: 1`. Switching to hero plus `data-flight` un-clips it, and the 150ms opacity transition to 0 shows it briefly.
**How to avoid:** Use `data-flight="in"` (to the hero) with captions at `opacity: 0; transition: none`. Only on settle does the transition to 1 run (D-14 "fade up once the letters have landed"). `data-flight="out"` fades from 1 to 0.

### Pitfall 6: Phone scroll reset shifts the first rect
**What goes wrong:** On phones the Index document may be scrolled. The controller order is commit, then `scroll.beforeSlide` (which `scrollTo(0)` and holds the outgoing page with `translateY`), then the animator, then `slideStart`. By the time the glide listener reads the "rendered" rects, the absolutely positioned hero row has already jumped to its scroll-0 place. [VERIFIED: lib/pager/controller.ts, lib/pager/scroll.ts]
**How to avoid:** Add a pre-scroll hook or extend `SlideStartEvent` with the held `scrollY`, and offset the hero "first" rect by it. Alternatively, accept it: the hero row is only partly visible when scrolled. Decide in the plan, test at 390x844 with the Index scrolled.

### Pitfall 7: The opening hides content forever if the bundle fails
**What goes wrong:** `data-opening` is set before paint; a blocked or failed chunk means the letters and chrome never appear.
**How to avoid:** An inline failsafe `setTimeout` (about 2500-3000ms) removes the attribute if it is still `"pending"`. The module sets `"running"` when it claims it.

### Pitfall 8: Skip consumes the wrong input
**What goes wrong:** Consuming Shift breaks Shift+Tab; consuming Ctrl+R breaks reload; `pointerdown.preventDefault()` does not stop the letter's `click`, so the click also navigates.
**How to avoid:** Pattern 4 step 4 (modifier filter, capture-phase `stopPropagation`, one-shot click suppressor).

### Pitfall 9: Existing e2e and visual tests break on a fresh profile
**What goes wrong:** Every Playwright context starts with empty `localStorage`. After this phase, `/` plays the opening and every route shows the hint, so `open()`, the pager specs and the visual baselines all change.
**How to avoid:** Seed both flags for every test by default. Generate a `storageState` with `origins: [{ origin: baseURL, localStorage: [...] }]` in `playwright.config.ts`, or use a fixture with `page.addInitScript` (it runs before the inline head script). Opening and hint specs opt out with an empty `storageState`.

### Pitfall 10: Hydration mismatch from first-visit state
**How to avoid:** The `<html>` already has `suppressHydrationWarning`. Never render hint text or opening state into server HTML. Read storage only in effects.

### Pitfall 11: The blend does nothing
**Why:** `mix-blend-mode` blends only within its stacking context [CITED: MDN mix-blend-mode]. Putting it on a child of a fixed, z-indexed wrapper blends against a transparent wrapper.
**How to avoid:** Put it on the fixed root that is a direct child of `<body>`. Keep the tag in a separate root.

### Pitfall 12: No hover name for mouse users without the custom cursor
**What goes wrong:** Forced-colours mode keeps the native cursor, so the cursor tag never appears and LTR-04's "on hover" fails.
**How to avoid:** Pattern 6 CSS hover fallback under `html:not([data-cursor])`.

### Pitfall 13: Cursor snapped to (0,0) or a stale box after paging
WR-05 and v7 round 5. Use a nullable position, release on `slideStart`, and resnap only after both landing and glide settle.

### Pitfall 14: The unsnapped box lags the pointer
**What goes wrong:** A permanent `transition: transform` on the box makes every `pointermove` retarget the transition, so the box lags.
**How to avoid:** Turn transitions on only for the snap and unsnap change (an attribute that is set, then cleared after `--dur-ui`).

### Pitfall 15: Captions keep catching the pointer during flight
**What goes wrong:** The hero `.caption` has `pointer-events: auto`. At `opacity: 0` it still blocks clicks.
**How to avoid:** `[data-flight] .caption { pointer-events: none }`.

## Code Examples

### Read rendered rects before cancel (retarget-safe)
```ts
// Source: same rule as lib/pager/animator.ts ("Read every 'from' before cancelling")
function beginGlide(letters: HTMLElement[], nav: HTMLElement, dest: "hero" | "rail") {
  const first = letters.map((el) => el.getBoundingClientRect()); // includes running WAAPI values
  for (const el of letters) for (const a of el.getAnimations()) a.cancel();
  nav.dataset.mode = "rail";
  const rail = letters.map((el) => el.getBoundingClientRect());
  nav.dataset.mode = "hero";
  const hero = letters.map((el) => el.getBoundingClientRect());
  nav.dataset.flight = dest === "rail" ? "out" : "in";
  return { first, rail, hero };
}
```

### Pure FLIP delta (unit-testable)
```ts
export interface Box { readonly left: number; readonly top: number; readonly height: number }
/** Transform that places a hero-geometry letter (origin 0 0) onto `to`. */
export function deltaOnto(hero: Box, to: Box) {
  return { dx: to.left - hero.left, dy: to.top - hero.top, s: to.height / hero.height };
}
```

### Tag placement (pure)
```ts
// Source: design doc section 8; v7 tagPos() logic, rewritten
export function placeTag(box: DOMRectReadOnly, w: number, h: number, vw: number, vh: number, pad = 8, gap = 12) {
  const spots: Array<[number, number]> = [
    [box.right + gap, box.top - 4],
    [box.right + 4 - w, box.top - gap - h],
    [box.right + 4 - w, box.bottom + gap],
    [box.left - gap - w, box.top - 4],
  ];
  const fits = ([x, y]: [number, number]) => x >= pad && y >= pad && x + w <= vw - pad && y + h <= vh - pad;
  const [x, y] = spots.find(fits) ?? spots[0];
  return { x: Math.min(Math.max(x, pad), vw - pad - w), y: Math.min(Math.max(y, pad), vh - pad - h) };
}
```

### Safe storage
```ts
export function safeGet(key: string): string | null | undefined { // undefined = storage unusable
  try { return window.localStorage.getItem(key); } catch { return undefined; }
}
export function safeSet(key: string, value: string): boolean {
  try { window.localStorage.setItem(key, value); return true; } catch { return false; }
}
```

## Reduced-motion inventory (A11Y-04)

| Motion | Driver | Reduced path |
|---|---|---|
| Track + progress bar | WAAPI (Phase 4) | Already `settle()` when reduced |
| Letter glide | WAAPI (new) | Set dest `data-mode` at slide start, no animations |
| Caption fade | CSS `--dur-ui` | Token is 0ms |
| Opening | Script + WAAPI | Script never hides; module writes the flag only |
| Hint fade | CSS `--dur-ui` | Token is 0ms |
| Hint nudge | WAAPI | Skipped |
| Cursor shape | CSS `--dur-ui` | Token is 0ms |
| Hover/focus colour | CSS `--dur-ui` | Token is 0ms |
| `rail-in` keyframe | CSS | Removed with the D-09 stand-in |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| One `transform` animation, or `composite: "add"` for split timing | Individual `translate` / `scale` properties next to `transform` | Baseline Aug 2022 | Separate easings per axis without composite maths |
| GSAP Flip for interruptible FLIP | Native WAAPI with rendered-rect reads | — | 0 kB; the roadmap keeps GSAP as a fallback only |
| Phase 4 D-09 stand-in (row rides off, rail fades in) | Glide | This phase | Delete `lettersMode`, `railEnter`, `lettersInert`, the animator letters target and `rail-in` |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Scaling a small glyph up 15-25x in a WAAPI transform renders visibly blurry in Chromium/WebKit, which justifies the hero-geometry flight | Summary, Pattern 1 | Low: hero-geometry flight is correct either way, just more code than needed |
| A2 | Opening direction: letters enter from the right on a fresh load. On the D-03 paging path the track moves right (page 00 enters from the left), so entering from the left would match the track | Pattern 4 | Visible choreography choice; needs the user or the UI-SPEC to decide |
| A3 | "On a black ground" means header, footer and page 00 content (role line, grid lines) are also hidden until the letters land | Pattern 4 | If only the captions and chrome should hide, the CSS selector list shrinks |
| A4 | The hint flag is written when the hint appears (not when it is dismissed) | Pattern 5 | A visitor who closes the tab within 8s would not see it again |
| A5 | With storage unreadable, the opening never runs (D-05), rather than once per page load (D-04 wording) | Pattern 4 | Small: both satisfy "at most once per page load" |
| A6 | Failsafe timeout of about 2.5-3s | Pitfall 7 | Too short on a very slow device could reveal letters before the module claims them (harmless: no opening plays) |

## Open Questions (RESOLVED)

1. **Opening direction (A2).** What we know: D-01 says "horizontally" only. Recommendation: from the right on a fresh load, from the left when reached by paging back (follows the track). Settle in the UI-SPEC (`ui_phase` is on).
   **RESOLVED:** UI-SPEC opening section; plan 05-09 (fresh load from the right, D-03 paged arrival from the left).
2. **Phone scroll offset for the first rect (Pitfall 6).** Recommendation: extend `SlideStartEvent` with `heldScrollY` (0 when not held), set by the scroll port, and subtract it from the hero "first" rect.
   **RESOLVED:** UI-SPEC phone row (line 115); plan 05-06 adds `heldScrollY`.
3. **When does the current rail letter turn accent?** The accent rule is scoped to `data-mode="rail"`, which arrives at glide settle (about 820ms). Recommendation: also allow it under `data-flight="out"`, so the accent arrives with the move. UI-SPEC call.
   **RESOLVED:** UI-SPEC and plan 05-04 (flight/accent CSS).
4. **Hint placement on 390px.** The footer is crowded (counter, Next, bar). This is a layout decision for the UI-SPEC.
   **RESOLVED:** UI-SPEC (hint ends 16px before Next, `--space-md`); plan 05-07 phone fit rule.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, tests | ✓ | 22.22.2 | — |
| pnpm | scripts | ✓ | 12.11.2 | — |
| Playwright Chromium | e2e | ✓ | builds 1208-1254 cached | — |
| Docker / Podman | Firefox/WebKit + visual baselines container | ✓ | /usr/bin/docker, /usr/bin/podman | — |
| Playwright `hasTouch` → `(pointer: coarse)` + `(hover: none)` | Hint wording, cursor-off tests | ✓ | [VERIFIED: probe this session] | — |
| `emulateMedia({ forcedColors, reducedMotion })` | Forced-colours and reduced-motion tests | ✓ | [VERIFIED: probe this session] | — |
| Real Mac trackpad / iPhone | Feel of glide and cursor, iOS resize | Human only | — | 04-HUMAN-UAT style items |

**Missing dependencies with no fallback:** none.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.1.0 (jsdom) + Playwright 1.65.0 (+ @axe-core/playwright 4.14.0) |
| Config file | `vitest.config.*`, `playwright.config.ts` (both exist) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm build && pnpm test && pnpm test:e2e && pnpm measure:js -- --max-gzip-kb 150` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LTR-03 | Delta math, plan picks no-op for rail→rail and same-dest retargets | unit | `pnpm vitest run tests/letters-glide.test.ts` | ❌ Wave 0 |
| LTR-03 | Glide ends exactly on rail / hero rest rects; no animations or inline transforms left; fast 0→1→0→1 and resize mid-flight both converge | e2e | `pnpm playwright test e2e/letters-glide.spec.ts` | ❌ Wave 0 |
| LTR-03 / DSGN-04 | rAF sampler: X fraction ≥ Y fraction per letter; monotonic; no overshoot past the target; Y letter starts first | e2e | same file | ❌ Wave 0 |
| LTR-04 | Rail focus shows a tag right of the letter; hover tag via cursor; hover fallback under forced colours | e2e | `pnpm playwright test e2e/letters-labels.spec.ts` | ❌ Wave 0 |
| LTR-05 | Exactly one accent letter after any sequence; `.now` visible; hit area = own box | e2e (existing layout.spec extended) | `pnpm playwright test e2e/layout.spec.ts` | ✅ extend |
| LTR-06 | 390x844: rail left = 24px after the glide | e2e | `e2e/letters-glide.spec.ts` | ❌ Wave 0 |
| NAV-05 | Counter/Next/bar at target after retargets, after the opening, after D-03 opening | e2e | `pnpm playwright test e2e/pager-motion.spec.ts` | ✅ extend |
| NAV-06 | Hint timing machine (1s / 1.5s / 8s / dismiss) | unit (fake timers) | `pnpm vitest run tests/first-visit-hint.test.ts` | ❌ Wave 0 |
| NAV-06 | Fine vs touch string; absent from server HTML; never returns after reload; storage throwing is harmless | e2e | `pnpm playwright test e2e/first-visit.spec.ts` | ❌ Wave 0 |
| EXP-01 | Storage wrappers never throw; skip-key filter (Tab, Shift+Tab, modifiers excluded) | unit | `pnpm vitest run tests/first-visit-opening.test.ts` | ❌ Wave 0 |
| EXP-01 | `data-opening` present at first paint on `/` only; total < 1000ms; click and key skip without paging (pathname stays `/`); reload = no opening; deep link doesn't consume; throwing storage = no hide; JS off = readable (nojs project) | e2e | `e2e/first-visit.spec.ts` + `routes.spec.ts` (nojs) | ❌ Wave 0 / ✅ |
| EXP-03 | `placeTag` four fallbacks + clamp; `snapTargetOf`, `tagTextOf` | unit | `pnpm vitest run tests/cursor.test.ts` | ❌ Wave 0 |
| EXP-03 | Dot at exact pointer coords; no cursor element visible and no `html[data-cursor]` before the first move; native cursor kept under `hasTouch` and `forcedColors: active`; release on paging and resnap after landing; tag 8px inside at the right edge; cursor chunk not in `out/index.html` scripts | e2e | `pnpm playwright test e2e/cursor.spec.ts` | ❌ Wave 0 |
| A11Y-04 | Reduced motion: zero running animations on letters, opening, nudge; live toggle mid-session | e2e | `e2e/reduced-motion.spec.ts` | ❌ Wave 0 |
| DSGN-04 / A11Y-04 | Guard: every bezier in `tokens.css` has y ∈ [0,1]; every CSS `transition`/`animation` duration is a `var(--dur-*)` | unit | `pnpm vitest run tests/motion-guard.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test` (plus the one relevant e2e spec after `pnpm build`)
- **Per wave merge:** `pnpm build && pnpm test && pnpm test:e2e && pnpm measure:js -- --max-gzip-kb 150`
- **Phase gate:** full suite green, plus the container run (`ALL_BROWSERS=1`, visual baselines updated deliberately), before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] Playwright default `storageState` (or fixture) seeding both first-visit flags; opt-out for first-visit specs (Pitfall 9)
- [ ] `e2e/helpers/letters.ts`: rect reader, rAF sampler of per-letter `translate`/`transform`, "glide settled" wait (expose `nav[data-flight]` absence + `getAnimations().length === 0`)
- [ ] `tests/letters-glide.test.ts`, `tests/first-visit-opening.test.ts`, `tests/first-visit-hint.test.ts`, `tests/cursor.test.ts`, `tests/motion-guard.test.ts`
- [ ] `e2e/letters-glide.spec.ts`, `e2e/letters-labels.spec.ts`, `e2e/first-visit.spec.ts`, `e2e/cursor.spec.ts`, `e2e/reduced-motion.spec.ts`
- [ ] Update `tests/pager-state.test.ts`, `tests/letters.test.tsx`, `e2e/pager-a11y.spec.ts` (lines 141-152 assert the `inert` stand-in) once `lettersMode`/`railEnter`/`lettersInert` are removed
- [ ] `tests/source-guard.test.ts` `CLIENT_ALLOWLIST` if any new `"use client"` file is added

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (minimal) | Treat `localStorage` values as untrusted: compare against an exact constant, never parse or eval. Cursor tag text set via `textContent`, never `innerHTML` |
| V6 Cryptography | no | — |
| V14 Configuration | yes | The new inline script fits the existing CSP (`'unsafe-inline'`); keep it a fixed build-time constant, no interpolation of runtime data |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| DOM XSS through the tag text | Tampering | `textContent` only; tag strings from `data-cursor-tag` rendered from typed content |
| Storage denial (blocked, quota, private mode) breaking the page | Denial of Service | try/catch wrappers; failsafe reveal timer |
| Input capture during the opening blocking keyboard users | Denial of Service (a11y) | Never intercept Tab/Shift+Tab or modifier shortcuts; listeners removed when the opening ends |

## Sources

### Primary (HIGH confidence)
- Codebase: `components/letters/LetterNav.tsx`, `letters.module.css`, `lib/pager/{animator,controller,state,signals,types,scroll}.ts`, `components/shell/{PagerProvider,usePagerInput}.tsx`, `components/frame/Footer.tsx`, `styles/tokens.css`, `app/layout.tsx`, `lib/js-flag.ts`, `vercel.json`, `next.config.ts`, `scripts/measure-js.mjs`, `tests/{css-guard,source-guard}.test.ts`, `playwright.config.ts`, `e2e/helpers/pager.ts`
- `docs/superpowers/specs/2026-11-03-portfolio-design.md` sections 5, 6, 8
- `docs/reference/swiss-horizontal-v7.html` (cursor `tagPos`, `release`/`resnap`, `place()`), plus `.planning/phases/01-design-gate/01-REVIEW.md` WR-05 and WR-07
- [MDN: translate](https://developer.mozilla.org/en-US/docs/Web/CSS/translate): composition order, animatable, Baseline Aug 2022
- [MDN: mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode): blends within the stacking context, Baseline Jan 2020
- Playwright probe (this session): `hasTouch` → `pointer: coarse` + `hover: none`; `forcedColors`/`reducedMotion` emulation; WAAPI `translate` reflected in `getBoundingClientRect`
- Local numeric bezier analysis (this session): X-leads-Y easing table

### Secondary (MEDIUM confidence)
- `.planning/research/{ARCHITECTURE,STACK,PITFALLS,SUMMARY}.md` (FLIP Pattern 4, WAAPI over GSAP recommendation)
- [Chrome developers: re-rastering composited layers](https://developer.chrome.com/blog/re-rastering-composite?hl=en): Chrome does not re-raster on scale changes by default

### Tertiary (LOW confidence)
- [Chromium-discuss: blurry text during scale transform](https://groups.google.com/a/chromium.org/g/chromium-discuss/c/eVRxjSOG1qI), and community threads on scale-up blur (supports A1)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. No new dependencies; browser APIs verified against MDN and in a probe.
- Architecture: HIGH for integration points (read from code); MEDIUM for the hero-geometry flight (sound reasoning, unproven on real hardware).
- Pitfalls: HIGH for the code-derived ones (settle race, scroll order, storageState, `fill`, blend context); MEDIUM for feel (easing).

**Research date:** 2026-11-09
**Valid until:** 2026-12-09 (stable platform APIs; the codebase is the moving part)
