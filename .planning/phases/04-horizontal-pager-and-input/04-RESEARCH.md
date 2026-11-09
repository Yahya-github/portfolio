# Phase 4: Horizontal Pager and Input - Research

**Researched:** 2026-11-09
**Domain:** Client-side paging controller on a Next.js 16 static export (WAAPI track, wheel/key/pointer input, History API under the App Router, focus and live-region a11y)
**Confidence:** HIGH for the Next.js history integration (probed live against the built `out/`) and for the code structure. MEDIUM for the wheel and swipe thresholds, which only device sessions can settle. LOW-MEDIUM for the cause of the label letter gaps.

## Summary

The approved UI-SPEC (04-UI-SPEC.md) already decides almost every visible behaviour and every starting threshold. This research covers what the spec leaves out: how to build it on the existing code, and which platform and framework behaviours will break it if the plan does not account for them.

Three findings change the plan:

1. **Next.js's route announcer announces every page change a second time, and on Back it reads the wrong title.** This was confirmed with Playwright against the current `out/`. Next 16.4.5 patches `window.history.pushState` and also listens to `popstate`. Each push or traversal dispatches `ACTION_RESTORE`, which gives the router a new `tree` object. That re-runs `AppRouterAnnouncer`, which copies `document.title` into an `aria-live="assertive"` `role="alert"` node. If the title is set after the push, the announcement runs one navigation late: Back to `/projects/` announced "Experience, Yahya Hallani". A capture-phase `popstate` listener added on `window` after hydration cannot get ahead of Next's listener. The probe showed Chromium ran the earlier bubble listener first. **The fix is to remove the `<next-route-announcer>` element once it exists.** The probe showed no announcer node in the DOM afterwards, Back/Forward still did not reload, and the tree did not remount. The pager's own polite live region is then the only announcement.
2. **Use the patched `window.history.pushState` and let Next handle `popstate`.** The probe confirmed that Back and Forward keep the same document (a window marker survived), never reload, and never remount `Shell`. `main[data-current]` keeps the value the server rendered, so the pager must own `current` in client state and read `location.pathname` on `popstate`. `history.scrollRestoration` is currently `'auto'`. Set it to `'manual'`, otherwise the browser restores the phone document scroll on Back, which breaks D-06.
3. **Some existing tests and layout rules conflict with the pager.** `tests/source-guard.test.ts` asserts "has no client components", so it has to become an allowlist. At 200% zoom on 1366x768 the CSS viewport is 683px wide, below the 820px breakpoint, so the page uses **document scroll** and the page element is not the scroller. The NAV-07 edge detector therefore has to handle both scroll containers. jsdom has no `Element.animate` and no layout, so the animator has to be injectable for unit tests.

**Primary recommendation:** Build one plain-TypeScript pager controller: a pure reducer plus injected animator, history and focus effects, exposed to React through `useSyncExternalStore`. Write each input as a pure, timestamp-driven state machine behind a thin `addEventListener` hook. Animate the track, the progress bar and the hero row with WAAPI starting from their current read positions; do not use CSS transitions. Silence Next's route announcer and make the pager the only source of announcements.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Paging feel
- **D-01:** **Retarget on fast input.** A page intent that arrives mid-slide extends the slide from the track's current position to the new target (e.g. → twice fast = page +2). Input is never dropped during a slide. Holding an arrow key walks pages one after another.
- **D-02:** **Hard stop at the ends.** On 05 Say hi, "next" does nothing; on 00 Index, "previous" does nothing. No wrap, no nudge. Only the footer's "Back to the start" link returns from 05 to 00.
- **D-03:** **Long jumps slide through, same 600ms.** A rail letter or Home/End jump (e.g. 01 → 04) moves the track straight across the pages in between in one 600ms move. Duration does not grow with distance.
- **D-04:** **Both wheel axes page.** Vertical and horizontal wheel deltas both count; the dominant axis of the gesture wins. Wheel down / trackpad swipe right-to-left = next. The horizontal trackpad swipe must not trigger the browser's back/forward swipe on Mac (researcher: `overscroll-behavior-x: none` on the root plus non-passive listeners; verify on Safari and Chrome on macOS).

#### Overflow and edges (NAV-07)
- **D-05:** **Fresh gesture at the edge.** On an overflowing page, the wheel scrolls the page. The momentum that brings it to the bottom (or top) is spent; only a new gesture that starts at the edge pages. No accidental page change mid-read.
- **D-06:** **Pages always open at their top**, heading in view, whether reached forwards or backwards. No remembered scroll positions.
- **D-07:** **Phones never page by vertical scroll.** Vertical = read the page (document scroll, per Phase 3), horizontal swipe = change page. No overscroll-to-page.
- **D-08:** Swipe distance, velocity and "mostly horizontal" angle thresholds are Claude's call, tuned in device tests. The left-edge 20px exclusion from design-doc Decision 3 stands (swipes starting there are left to the system back gesture).

#### Chrome during the slide (before Phase 5)
- **D-09:** **Leaving Index, the giant YAHYA letters ride off with the Index page and the static rail appears on landing.** An honest stand-in; Phase 5 replaces it with the FLIP glide. Returning to Index reverses it (rail goes, letters ride back in with the page). The rail is not shown on Index.
- **D-10:** **Chrome switches at slide start.** Header section name, footer `00 / 05` counter, "Next, {Section}" link and the rail's current letter (accent + `aria-current="page"`) update the instant the page change is decided, so the input is confirmed within ~100ms. A retarget updates them again.
- **D-11:** **Footer progress bar animates now**, with the track: same 600ms, same easing, transform only. Phase 5 only verifies it.

#### Device testing
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

### Deferred Ideas (OUT OF SCOPE)
- Letters-to-rail FLIP glide, first-visit hint, opening animation, custom cursor and full reduced-motion pass — Phase 5 (already on the roadmap).
- Real Windows-wheel hand test — noted as a gap (D-13); do it when a Windows machine is available.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | One page per wheel or trackpad gesture; momentum never skips | Wheel FSM (Pattern 3); Pitfalls 4-6 (Safari low-delta notched mouse, Firefox deltaMode, passive-by-default listeners); trace test harness (Validation) |
| NAV-02 | Arrow keys, Page Up/Down, Space, Home/End | Key map (Pattern 4); WR-04 guard; scroll-first on overflowing pages when no scroller has focus (Pitfall 8) |
| NAV-03 | Phone swipe; left edge left to the system | Pointer Events recogniser (Pattern 5); `touch-action: pan-y pinch-zoom` on `html` (Pitfall 7) |
| NAV-04 | Own URL per page, deep link lands, Back steps through pages | History integration (Pattern 2, probe results); announcer silencing (Pitfall 1); `scrollRestoration` (Pitfall 2) |
| NAV-07 | Fits 1366x768; overflow scrolls, pages only at edge | Edge detector for both scroll containers (Pitfall 3); fresh-gesture rule inside the wheel FSM |
| A11Y-01 | Only the current page is reachable; focus moves to heading; announced | Commit `inert` before focus (Pitfall 9); `focus({ preventScroll, focusVisible })` (Pattern 6, Pitfall 10); a single live region |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Next.js 16.4 static export (`output: 'export'`, `trailingSlash: true`) on Vercel. No `headers` or middleware in the Next config; headers live in `vercel.json`. The CSP allows `'unsafe-inline'` scripts, so an inline `<head>` script is permitted.
- CSS Modules plus one global `styles/tokens.css`. No Tailwind. Raw hex only in `tokens.css` (enforced by `tests/css-guard.test.ts`). Never use the `font` shorthand.
- **Input paging is a hand-written hook. No gesture or smooth-scroll library:** no Lenis, Locomotive, fullPage.js, `@use-gesture`, `react-swipeable`, Swiper or Embla.
- The paging transform needs no library (CSS or WAAPI). GSAP is reserved for the Phase 5 choreography.
- Testing: Vitest 5 (jsdom + Testing Library) for logic and hooks; Playwright 1.65 against the built `out/`; `@axe-core/playwright`; visual baselines only in the `mcr.microsoft.com/playwright:v1.65.0-noble` container.
- Accessibility: WCAG contrast, keyboard, reduced motion.
- Text comes only from typed `content/*.ts` files, with no literals in components. `source-guard` enforces this for literal `aria-label`, `alt` and `title`.
- JS gate: `pnpm measure:js -- --max-gzip-kb 150` (baseline 132.2 kB gzip).
- User rules: immutable updates; small files (under 800 lines) and functions (under 50 lines); no `console.log` in shipped code; 80% coverage on new logic; TDD for logic; conventional commits with no Claude co-author trailer (per memory).
- GSD workflow: changes go through `/gsd-execute-phase`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| HTML for all six pages, per-route metadata, first-paint `--track-index` | Static (build-time RSC) | — | Deep links and JS-off must work from the exported HTML alone |
| Pager state (current, target, phase, source) | Browser (client controller) | — | The single source of truth; everything else is a projection |
| Input recognition (wheel, keys, swipe, link clicks) | Browser (pure FSMs + listeners) | — | Needs event timestamps and non-passive listeners |
| Track, bar and hero-row motion | Browser (WAAPI on the compositor) | CSS (resting position via `--track-index`) | A retarget needs the current position read back and an explicit `from` |
| URL and history | Browser (History API through Next's patch) | Next router (`popstate` restore, harmless) | Next owns `popstate`; the pager reads `location.pathname` |
| Announcements | Browser (one polite live region in Shell) | — | Next's announcer is removed (Pitfall 1) |
| Security headers | CDN (Vercel `vercel.json`) | — | Unchanged |

## Standard Stack

### Core (all already installed; no new runtime dependency)
| Library / API | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.4.5 | App Router, static export, patched History API | Installed. The `pushState` patch is in `node_modules/next/dist/client/components/app-router.js` [VERIFIED: codebase] |
| react / react-dom | 19.3.1 | `useSyncExternalStore`, boolean `inert`, `flushSync` | Installed [VERIFIED: package.json] |
| Web Animations API (`Element.animate`) | platform | Track, progress bar, hero row | An explicit `from` keyframe lets a retarget start from the current position; the `finished` promise gives the landed signal; `cancel()` avoids reversal shortening [CITED: developer.mozilla.org/docs/Web/API/Element/animate] |
| Pointer Events + `touch-action` | platform | Phone swipe | CLAUDE.md mandates native Pointer Events [CITED: CLAUDE.md] |
| `matchMedia('(prefers-reduced-motion: reduce)')` + `change` event | platform | WR-08 live reduced motion | Standard |

### Supporting (dev, already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 5.1.0 | Reducer, wheel FSM traces, swipe, key guards | Every pure module |
| @testing-library/react / user-event | 16.3.3 / 14.6.8 | Provider and hooks under jsdom (with a stub animator) | Projection tests (inert, heading level, aria-current) |
| @playwright/test | 1.65.0 | `mouse.wheel`, keyboard, `emulateMedia({ reducedMotion })`, `goBack()`, touch via CDP | E2E against `out/` |
| @axe-core/playwright | 4.14.0 | axe after paging | A11Y-01 |

**No installation step.** No `pnpm add` is needed. The host has no Firefox or WebKit Playwright browsers (`~/.cache/ms-playwright` holds Chromium builds only). Both ship in the pinned container image; see Environment Availability.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| WAAPI | CSS `transition` on `transform`, driven by `--track-index` | Simpler, but: (a) when a transition reverses to its before-change value, the CSS Transitions spec shortens its duration ("reversing shortening factor"), which breaks "a fresh 600ms" on a ← then → retarget; (b) `transitionend` does not fire on an interrupted transition; (c) switching easing on a retarget needs a style-flush ordering trick. Use CSS transitions only as the fallback when the JS timing is unavailable [CITED: w3.org/TR/css-transitions-2 §3.1] |
| Patched `window.history.pushState` | `History.prototype.pushState.call(...)` (unpatched) plus a capture `popstate` listener | Probed: in Chromium, a capture listener added after hydration does **not** run before Next's earlier `popstate` listener, so it cannot stop Next's restore. Making it work needs a `<head>` script, which is more fragile than silencing the announcer [VERIFIED: Playwright probe] |
| `useSyncExternalStore` controller | `useReducer` + context | Also workable, but the timers, the WAAPI handle and history writes live outside React anyway, and an external store keeps them unit-testable without rendering |
| `focus({ focusVisible })` | Data attribute plus CSS only | `focusVisible` works in Chrome 145+, Firefox 104+ and Safari/iOS 18.4+. Older browsers ignore the option and fall back to their own heuristic [CITED: caniuse.com/mdn-api_htmlelement_focus_options_focusvisible_parameter] |

## Architecture Patterns

### System Architecture Diagram

```
 wheel (window, passive:false) ─► wheelFsm(event, t, edgeProbe) ─┐
 keydown (window) ─────────────► keyMap(event, guards, edgeProbe)┤
 pointer* (window, touch only) ─► swipeFsm(event, t) ────────────┤  intent:
 click on internal <a> (delegated) ─► linkIntent(href, modifiers)┤  next | prev | goto(i)
 popstate (window) ─► indexOf(location.pathname) ─────────────────┤  + source
                                                                  ▼
                                      ┌───────────── PagerController ─────────────┐
                                      │ reduce(state, intent) → state' + effects  │
                                      │ (clamp ends, same-target no-op, relative  │
                                      │  intents apply to target, key-repeat gate)│
                                      └──────┬────────────────────────────────────┘
               flushSync(setSnapshot) ◄──────┤ (1) React commit: chrome, inert, h1/h2,
                                             │     aria-current, document.title
               animator.slideTo(i, ease) ◄───┤ (2) WAAPI from read position → target
               scrollReset / phone hold ◄────┤ (3) target scrollTop=0 / window.scrollTo
               focus heading ◄───────────────┤ (4) first change from rest only
                                             │
                 animation.finished ─────────► land(i): pushState (unless source=history),
                                               live region text, focus if needed,
                                               collapse non-current (phone), 'landed' signal
```

### Recommended Project Structure
```
lib/pager/
├── state.ts          # PagerState type, reduce(state, intent) — pure
├── controller.ts     # createPagerController({ animator, history, focus, clock }) + subscribe/getSnapshot
├── animator.ts       # WAAPI implementation (track, bar, hero row); stub for tests
├── history.ts        # pushRoute(route), routeToIndex, silenceNextAnnouncer(), scrollRestoration
├── signals.ts        # 'slideStart' | 'landed' emitter for Phase 5
└── input/
    ├── wheel.ts      # pure FSM: step(state, sample) → { state, intent, preventDefault }
    ├── keys.ts       # pure: keyIntent(event-like, ctx) → intent | 'native-scroll' | null
    ├── swipe.ts      # pure FSM for pointer samples
    ├── edge.ts       # scrollerFor(page) + atEdge(scroller, dir) (DOM, tiny)
    └── normalize.ts  # deltaMode → px
components/shell/
├── PagerProvider.tsx # 'use client'; owns controller, listeners, context
├── PageSection.tsx   # 'use client'; <section inert={...}> + PageLevel context
├── LiveRegion.tsx    # 'use client'
├── DebugOverlay.tsx  # 'use client'; loaded by dynamic import() only when ?debug
content/site.ts       # + liveRegionTemplate, debug field names
tests/pager-*.test.ts # reducer, wheel traces, swipe, keys
tests/traces/*.json   # recorded and synthetic wheel traces
e2e/pager-*.spec.ts
```
The names are the planner's call. What matters is the split between pure modules and thin hooks.

### Pattern 1: Server pages stay server; only projections become client

Page bodies (`IndexPage` and the rest) are Server Components that take `headingLevel` and `isCurrent`. `headingLevel` also drives sub-headings (`headingLevel + 1` in Projects and Experience). Server Components cannot re-render on client state, so:
- Wrap each page in a client `PageSection`. It reads the pager snapshot and renders `<section inert={!live} ...>{children}</section>`, plus a context `PageLevel = 1 | 2`.
- Make `Heading` and `PageTitle` client components that read `PageLevel` and apply an offset (0 for the title, +1 for sub-headings). The server bodies stop computing levels and pass `offset` instead. `PageTitle` gets `tabIndex={-1}`.
- `Header`, `Footer` and `LetterNav` become client components; they are small. Their first-paint HTML for each route stays identical, because the initial snapshot comes from the `current` prop.
- `isCurrent` only feeds `Photo eager`. Keep it as the **initial** route value (a load hint), not live state.
- Server Components passed as `children` to a client provider do not re-render when the provider's state changes; only the client consumers do [CITED: react.dev/reference/rsc/use-client].

**`tests/source-guard.test.ts` currently asserts "has no client components".** It must become an allowlist of the new client files, or the first task fails CI.

### Pattern 2: History through Next's patch (probed)

```ts
// lib/pager/history.ts  (sketch)
export function pushRoute(route: Route): void {
  silenceNextAnnouncer();                         // idempotent, see Pitfall 1
  try { window.history.pushState(null, "", route + window.location.search); } // keeps ?debug
  catch { /* UI-SPEC: the slide still happens, the URL stays, no console output */ }
}
export function silenceNextAnnouncer(): void {
  document.querySelector("next-route-announcer")?.remove();
}
// on mount: history.scrollRestoration = "manual";
// popstate: window.addEventListener("popstate", () => controller.intent({ type: "goto", index: indexOfRoute(location.pathname), source: "history" }));
```
What the probe showed [VERIFIED: Playwright probe against out/, Chromium, 2026-11-09]:
- The patched `pushState(null, "", "/projects/")` writes `{ __NA, __PRIVATE_NEXTJS_INTERNALS_TREE }` into the entry, so Next's own `popstate` handler restores the same tree. Across Back, Back, Forward there was **no reload and no remount**: a window marker survived.
- Next does not change `document.title` on a traversal. The pager must set it from `sections[i].title`, which holds the same strings `lib/metadata.ts` uses.
- `main[data-current]` keeps its server-rendered value. Never read pager state from the DOM.
- `history.scrollRestoration` defaults to `'auto'`. Set it to `'manual'`.
- Take the initial index from the server `current` prop, **not** from `usePathname()`. This avoids a render delayed by the router transition.
- **Remove the announcer lazily:** just before the first push and on the first `popstate`. `AppRouterAnnouncer` creates its node in a mount effect, and parent effects run *after* child effects, so a removal in `PagerProvider`'s mount effect could run before the node exists.

### Pattern 3: Wheel FSM (pure, timestamp-driven)

```ts
// lib/pager/input/wheel.ts (shape only; values from the UI-SPEC)
export interface WheelSample { dx: number; dy: number; mode: 0 | 1 | 2; t: number; ctrl: boolean; vh: number }
export interface EdgeInfo { overflowing: boolean; atStart: boolean; atEnd: boolean }
type Phase = "idle" | "accumulating" | "scrolling" | "spent";
export interface WheelState { phase: Phase; sumX: number; sumY: number; lastT: number; recent: readonly number[]; gestureId: number }
export function stepWheel(s: WheelState, e: WheelSample, edge: EdgeInfo):
  { state: WheelState; intent: "next" | "prev" | null; preventDefault: boolean }
```
Rules (all from the UI-SPEC; export the constants for tests and the debug overlay):
- `ctrl` set: ignore the event and never call `preventDefault` (this is pinch-zoom).
- Normalise **after reading `deltaMode` first**: lines × 16, pages × `vh`. Reading `deltaMode` first matters in Firefox (Pitfall 5).
- If `t - lastT > 160`, a new gesture starts. The reset is lazy (IN-01), so the FSM needs no timer. The debug overlay may run its own timer to show `spent → idle`.
- At the start of a new gesture: if it is vertical-dominant on an overflowing page that is **not at the edge in the gesture's direction**, the phase becomes `scrolling` for the whole gesture. That gesture never calls `preventDefault` and never pages (D-05). Otherwise the phase becomes `accumulating` and events are `preventDefault`ed.
- In `accumulating`, emit the intent on the first event where |dominant sum| ≥ 48, then switch to `spent`. Swallow every later event of that gesture with `preventDefault`.
- A fresh flick inside a continuous stream (during `spent` or `scrolling`) starts a new gesture when |d| ≥ 2 × min(last 3 |d|) and |d| > 16.
- Use `event.timeStamp` (monotonic, in ms) as `t`, so trace tests replay exact timings without fake timers.

Register the listener as `window.addEventListener("wheel", h, { passive: false })`. Chrome and Safari treat wheel listeners on window, document and body as **passive by default**, so the explicit `passive: false` is required [CITED: chromestatus "Treat document level wheel listeners as passive"; MDN EventTarget.addEventListener]. Do not use React's `onWheel`, which React registers as passive.

### Pattern 4: Keys
`keyIntent({ key, shiftKey, altKey, ctrlKey, metaKey, repeat, defaultPrevented, targetKind }, ctx)` is a pure function. `targetKind` comes from `document.activeElement`: `"control"` for a, button, summary and [role=button|link]; `"text"` for input, textarea, select and contenteditable; `"none"` otherwise. It returns `next`, `prev`, `goto`, `"native-scroll"` or `null`. The repeat gate (accept a repeat only after landing and at least 600ms after the last accepted step) lives in the controller, which owns the clock.

### Pattern 5: Swipe (Pointer Events)
- Start tracking on `pointerdown` from touch input with `clientX >= 20`.
- Lock the axis after 12px of movement: horizontal if |dx| > 1.5|dy|, vertical otherwise.
- On `pointerup`, commit if |dx| ≥ 48, or if |dx| ≥ 24 with a velocity of at least 0.3 px/ms over the last 100ms.
- `pointercancel` aborts the gesture.
- Listen on `window`, but put `touch-action` on `html`, because it is read from the element where the touch **starts** (Pitfall 7).

### Pattern 6: Commit order for one page change (from rest)
1. `reduce` produces the new target. A target equal to the in-flight one, or a refused move at an end, is a no-op.
2. `flushSync(() => publish(snapshot))` commits synchronously, inside the input's task: chrome text, `aria-current`, `inert` off on the target, the target title as `h1`, and `document.title`.
3. Reset scroll: `target.scrollTop = 0` on desktop, or the phone hold plus `window.scrollTo(0, 0)` (per the UI-SPEC).
4. `animator.slideTo(index, retarget ? "--ease-retarget" : "--ease-page")`. For each animated element, it reads the current translateX (`new DOMMatrixReadOnly(getComputedStyle(el).transform).m41`), cancels the old animations, and starts new ones with `fill: "forwards"`.
5. Focus `#title-{slug}` with `focus({ preventScroll: true, focusVisible: source === "key" })`. Do this only on the first change from rest.
6. When the **latest** animation's `finished` resolves:
   - set `--track-index` inline to the target, then `cancel()` the animations in the same frame (no flicker);
   - push history, unless `source === "history"`;
   - write the live region;
   - apply the landing focus rule, then set the page that held focus `inert`;
   - collapse the non-current pages (phone);
   - emit `landed`.

Under reduced motion the animator resolves immediately without calling `animate`, so steps 2 and 6 run in the same task.

### Anti-Patterns to Avoid
- **Reading pager state from the DOM or from `usePathname()`:** `data-current` is static, and `usePathname` updates inside a transition.
- **Focusing before the commit:** focusing an element inside an `inert` subtree silently fails (Pitfall 9).
- **A CSS transition with `transitionend` as the landed signal:** `transitionend` never fires for an interrupted slide.
- **React `onWheel` or `onTouchMove`:** they are passive, so `preventDefault` is ignored and logs a console warning.
- **`touch-action: pan-y` alone:** it disables pinch-zoom (WCAG 1.4.4).
- **A timer-based debounce for the wheel:** it drops deliberate second flicks (PITFALLS P1).
- **Mixing `100vw` with `innerWidth`/`clientWidth`:** they differ by the scrollbar width when a classic scrollbar is present. Use `vw` in CSS and `window.innerWidth` in JS, which match each other.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Retarget interpolation | Your own rAF tween loop | WAAPI `el.animate([{transform: from},{transform: to}], {duration, easing, fill})` | Runs on the compositor, takes cubic-bezier easing directly, and provides a `finished` promise and `cancel()` |
| History sync with Next | A custom router, `router.push`, or a hash scheme | The patched `window.history.pushState` (Next documents this as "Using the native History API") | Probed: no remount, no reload |
| Making inactive pages unreachable | `tabindex=-1` sweeps, `aria-hidden` toggles | The `inert` attribute (a boolean prop in React 19) | One attribute removes focus, assistive-tech access and find-in-page |
| Focus-ring heuristic | A global keydown/mousedown "modality" tracker | `focus({ focusVisible })` with `:focus-visible` | Native; older browsers fall back to their own heuristic |
| Reduced-motion detection | Reading the CSS token value | `matchMedia(...).addEventListener("change")` | Required by WR-08 |

**Key point:** per CLAUDE.md, only the input interpretation is hand-written. Motion, history, focus and reachability all have platform primitives that already handle the edge cases.

## Common Pitfalls

### Pitfall 1: Next's route announcer double-announces and mis-announces (VERIFIED)
**What goes wrong:** every `pushState` and `popstate` makes `AppRouterAnnouncer` copy `document.title` into an assertive `role="alert"`. A screen reader hears "Projects, Yahya Hallani" (assertive, so it interrupts), then the heading, then our "Projects, page 3 of 6". If the title is set after the push, Back announces the *previous* title.
**Why:** `ACTION_RESTORE` produces a new `tree` object, and the announcer's effect depends on `[tree]` (`node_modules/next/dist/client/components/app-router-announcer.js`).
**How to avoid:** call `silenceNextAnnouncer()`, which removes `<next-route-announcer>`, before the first push and on the first `popstate`. In the probe the node stayed gone (Next creates it only once, in a mount effect) and history kept working.
**Warning signs:** after the first page change, the e2e assertion `document.querySelectorAll('next-route-announcer').length === 0` fails. The fix depends on Next internals (MEDIUM durability), so re-check it after any `next` upgrade.

### Pitfall 2: Browser scroll restoration on Back (phones)
The probe found `history.scrollRestoration` set to `'auto'`. On Back, the browser then restores the entry's `window.scrollY`, which breaks D-06 and fights the phone hold. Set it to `'manual'` once on mount.

### Pitfall 3: 200% zoom switches to the phone layout
At 1366x768 and 200% zoom the CSS viewport is 683x384, which is **≤ 820px**. Pages then use `height: auto` and **document** scroll (shell.module.css), so the page element is not a scroller. `edge.ts` must choose the scroller at runtime:
- the current page, if its computed `overflow-y` is `auto` and `scrollHeight - clientHeight > 1`;
- otherwise `document.scrollingElement`.

D-07 ("phones never page by vertical scroll") concerns **touch**. A wheel on a narrow desktop window should still follow the fresh-gesture-at-edge rule, applied to the document scroller (NAV-07 criterion 4). Raise this with Yahya if he reads D-07 differently (Open Question 1).
To emulate 200% zoom in Playwright: `viewport: { width: 683, height: 384 }, deviceScaleFactor: 2`.

### Pitfall 4: Low-delta notched mice (Safari) may never reach 48px
One Mozilla bug report measured a single notch of the same macOS mouse as 12 in Safari, 120 in Chrome and 48 in Gecko [CITED: bugzilla.mozilla.org/show_bug.cgi?id=1708829, single source, LOW]. With a 48px threshold, one slow notch in Safari might do nothing.
**Recommended mitigation:** if the event that opens a gesture has `deltaMode === 1`, or a legacy `wheelDeltaY` that is a non-zero multiple of 120, treat it as discrete and page immediately. Add a trace for this case. This device is not on the D-12 list, so record it as a D-13 trace gap.

### Pitfall 5: Firefox deltaMode depends on read order
Firefox reports `DOM_DELTA_LINE` for X11 and Windows wheels. If the page reads `deltaY` before `deltaMode`, Firefox converts the deltas to pixels and reports mode 0 [CITED: groups.google.com/g/mozilla.dev.platform/c/fUXLgaSoeLI]. Read `deltaMode` first, then normalise. Either way, one Firefox notch is 3 lines × 16 = 48px, exactly the threshold, so the comparison must be `>=`, not `>`.

### Pitfall 6: Safari on macOS ignores `overscroll-behavior-x` for the history swipe
WebKit bug 240183 (2022) reports that Safari does not honour `overscroll-behavior-x` for history navigation, while `preventDefault()` on the horizontal `wheel` event does stop it [CITED: bugs.webkit.org/show_bug.cgi?id=240183, current status not re-checked]. The FSM must therefore `preventDefault` **every** event of a horizontal-dominant gesture. That includes the momentum tail and gestures at the ends (00 "prev", 05 "next"), even though no page change happens. This is a mandatory Mac Safari item on the D-12 checklist.

### Pitfall 7: `touch-action` placement and pinch-zoom
`touch-action` is read from the element where the touch starts. With `pan-y` on `main` only, swipes that start on the header, footer or rail go to the browser, which fires `pointercancel`, and nothing pages.
- Put `touch-action: pan-y pinch-zoom` on `html`, under `html[data-js]`, at ≤820px or `(pointer: coarse)`. Plain `pan-y` disables pinch-zoom [CITED: developer.mozilla.org/docs/Web/CSS/touch-action].
- While the visitor is pinch-zoomed (`visualViewport.scale > 1`), skip swipe paging so a horizontal finger movement pans the zoomed view.
- `pan-y` may also block horizontal panning of the zoomed view. That is Open Question 3, for the device test.

### Pitfall 8: Space and Page Down scroll the wrong element when focus is on `body`
On first load focus is on `body`, so the native Space and Page Down scroll the **document**. On desktop the document does not scroll, so nothing moves on an overflowing page.
**Fix:** when a key maps to `native-scroll` and `document.activeElement` is not inside the current page's scroller, call `preventDefault` and `scroller.scrollBy({ top, behavior: reduced ? "instant" : "auto" })`. Use `top` = ±0.875 × `clientHeight` for Space and Page Down, ±40 for the arrow keys.
The fresh-press-at-edge rule uses `event.repeat`, so a held key never pages through the edge.

### Pitfall 9: Focus into an inert section fails silently
Calling `focus()` on an element inside `[inert]` does nothing. The `inert` removal and the `h1` swap must therefore be **committed** (`flushSync`) before `focus()` runs. The reverse also applies: never set the focused page `inert` before focus has moved off it (WR-06), or focus drops to `body`.
**Test:** after each change, `document.activeElement.id === "title-{slug}"` and `!activeElement.closest("[inert]")`.

### Pitfall 10: `:focus-visible` carries over to a later wheel change
Under the HTML spec's heuristic, a script focus matches `:focus-visible` if the previously focused element did. So after one keyboard change, the ring would still show after a later wheel change. Passing `focusVisible: source === "key"` explicitly fixes this in current browsers (Chrome 145+, Firefox 104+, Safari 18.4+) [CITED: caniuse]. In older browsers the ring may persist, which is an acceptable degradation.

### Pitfall 11: Horizontal programmatic scroll on the viewport
`overflow-x: clip` on `html` propagates to the viewport, where it behaves like `hidden`. A `hidden` viewport can still be scrolled programmatically: `scrollIntoView`, `focus` without `preventScroll`, or find-in-page on the current page. One stray scroll leaves the track off by N px.
**Mitigation:** every `focus()` call uses `preventScroll`, and a passive `scroll` listener resets `scrollX` to 0 if it is ever non-zero. This is cheap insurance; the e2e suite asserts `scrollX === 0` after paging.

### Pitfall 12: jsdom cannot run the animator
jsdom has no `Element.animate`, no layout and no real `matchMedia`. Inject the animator (`slideTo(index, easing): Promise<void>`, `currentOffset()`) and the clock into the controller. Unit tests pass a stub that resolves on demand. Real motion is verified only in Playwright.

### Pitfall 13: Lazy images on offscreen pages pop in during the slide
Photos on pages other than the first one loaded use `loading="lazy"` (from `eager={isCurrent}`). The slide brings them into view within 600ms, possibly before they are decoded.
**Mitigation:** at slide start, call `img.decode()` (or set `loading="eager"`) on the images inside the target page. Risk is LOW; check it visually on the phone.

### Pitfall 14: Label letter gaps (folded todo; cause not confirmed)
A crop of the `index-1440x900` baseline shows "HALL ANI" and "RESU ME" at 12px. Hypotheses, most likely first [ASSUMED]:
- (a) Headless Chromium on Linux rounds glyph advances to whole pixels (hinting without subpixel positioning), so the 0.24px tracking accumulates into visible jumps.
- (b) Kerning or `text-rendering` is turned off at small sizes.
- (c) The font subset dropped GPOS kerning.

**Diagnostic plan:**
1. Yahya checks the same labels in his own Chrome. If they look fine there, it is (a):
   - first try `text-rendering: geometricPrecision` on `.t-label` (forces subpixel positioning in Chromium);
   - if that fails, add `launchOptions.args: ["--font-render-hinting=none"]` to the Playwright Chromium visual project.
2. If the gaps also show in his Chrome, add `font-kerning: normal; font-feature-settings: "kern" 1` to `.t-label`, then inspect the font with fontTools (not installed; run it with `pipx run fonttools`).

Keep every change scoped to `.t-label` so the YAHYA `--adv-*` geometry is untouched.

## Code Examples

### WAAPI retarget from the current position
```ts
// Source: MDN Element.animate / DOMMatrixReadOnly; pattern for this project
function slide(el: HTMLElement, toPx: number, easing: string, ms: number): Animation {
  const fromPx = new DOMMatrixReadOnly(getComputedStyle(el).transform).m41; // live, mid-animation
  el.getAnimations().forEach((a) => a.cancel());
  return el.animate(
    [{ transform: `translate3d(${fromPx}px,0,0)` }, { transform: `translate3d(${toPx}px,0,0)` }],
    { duration: ms, easing, fill: "forwards" },
  );
}
// easing string: read once from the tokens, e.g. getComputedStyle(document.documentElement).getPropertyValue("--ease-page").trim()
```
- Read `fromPx` **before** cancelling; during a running animation `getComputedStyle` returns the animated value.
- Start all three elements (track, bar, hero row) in the same task so they share a start time.
- The bar moves in units of its own width, so compute its target as `toPx = index * bar.offsetWidth`.

### Wheel listener wiring
```ts
useEffect(() => {
  const onWheel = (e: WheelEvent) => {
    const mode = e.deltaMode as 0 | 1 | 2;              // read first (Firefox)
    const r = controller.wheel({ dx: e.deltaX, dy: e.deltaY, mode, t: e.timeStamp, ctrl: e.ctrlKey, vh: innerHeight });
    if (r.preventDefault) e.preventDefault();
  };
  window.addEventListener("wheel", onWheel, { passive: false });
  return () => window.removeEventListener("wheel", onWheel);
}, [controller]);
```

### Reduced motion, live
```ts
const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
const apply = () => controller.setReducedMotion(mq.matches);
apply(); mq.addEventListener("change", apply);
```
In Playwright, calling `await page.emulateMedia({ reducedMotion: "reduce" })` mid-test fires `change`, which is what the WR-08 test needs.

### `html[data-js]` before paint
In `app/layout.tsx`: `<html ... suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.js=''" }} /></head>`.
- The CSP already allows inline scripts.
- `suppressHydrationWarning` covers the extra attribute. It is belt-and-braces [ASSUMED: React does not warn about DOM attributes it did not render].
- The string is code, not copy, so the content rule does not apply. Keep it in a constant in `lib/`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `experimental.windowHistorySupport` flag | The App Router patches native `pushState`/`replaceState` unconditionally | Next 14.1 | No config needed (verified in the 16.4.5 source) |
| JS polyfills that track mouse vs keyboard modality for the focus ring | `focus({ focusVisible })` | Chrome 145 / Safari 18.4 | Explicit control |
| Legacy `wheelDelta` | `deltaX/Y` + `deltaMode` | Long ago | Use the legacy value only as the discrete-notch hint (Pitfall 4) |
| fullPage.js-style debounce | Gesture FSM with an idle gap and rising-delta detection (the Lethargy idea) | — | PITFALLS P1 |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The label gaps come from headless Chromium hinting (hypothesis a) | Pitfall 14 | The order of fix attempts changes; small |
| A2 | `suppressHydrationWarning` is not strictly required for `data-js` | Code Examples | A dev-only warning; nothing in production |
| A3 | The `wheelDeltaY % 120 === 0` notch heuristic does not misfire on Mac trackpads | Pitfall 4 | A trackpad could page on a tiny first event; validate with the Mac trace |
| A4 | Chromium's at-target listener order (a bubble listener registered earlier runs before a capture listener registered later) also holds in Firefox and WebKit | Alternatives | Matters only for the unpatched-history alternative, which is not recommended |
| A5 | Chrome on Windows sends about 100px per notch, and Windows precision touchpads produce Mac-like momentum streams | Validation (synthetic traces) | The synthetic traces may not match reality; D-13 records the gap |
| A6 | Playwright's WebKit does not run on the Fedora host (Playwright supports WebKit on Ubuntu/Debian) | Environment | Use the container either way |

## Open Questions

1. **Should the wheel page at the document edge on a narrow desktop window (≤820px, including 200% zoom)?**
   - What we know: NAV-07 criterion 4 requires paging at the edge at 200% zoom, and D-07 says phones never page by vertical scroll.
   - What's unclear: D-07 says "phones", which reads as touch. The recommendation applies the D-05 rule to wheel input against the document scroller.
   - Recommendation: implement it that way and mark it in the plan as an interpretation.
2. **Does a swipe without finger-follow feel unresponsive?** The UI-SPEC already lists this as a revisit-on-device item. Keep the recogniser's API able to expose `dx` so a follow can be added later.
3. **On a pinch-zoomed phone with `touch-action: pan-y pinch-zoom`, can the visitor still pan sideways?** Check on the iPhone. Fallback: switch to `touch-action: auto` while `visualViewport.scale > 1`.
4. **Where do the recorded traces come from?** I searched and found no reliable public dataset.
   - Record traces on Yahya's devices through `?debug`: keep a ring buffer of the last ~600 samples on `window.__pagerTrace` (debug only) and copy it from DevTools.
   - Synthesise the Windows notch traces from documented values.
   - iPhone and Android need no wheel traces.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build/tests | ✓ | 22.22.2 | — |
| pnpm | all | ✓ | 12.11.2 | — |
| Playwright Chromium (host) | e2e | ✓ | builds 1208-1254 in cache | — |
| Playwright Firefox / WebKit (host) | Cross-browser wheel and key e2e | ✗ | — | Run those projects in `mcr.microsoft.com/playwright:v1.65.0-noble` (already pulled in podman, 2.58 GB) and in CI's e2e container |
| podman / docker | Baselines, Firefox/WebKit runs | ✓ | — | — |
| fontTools | Label-gap diagnosis | ✗ | — | `pipx run --spec fonttools ttx`, or skip and diagnose by rendering |
| Real devices (D-12) | NAV-01/03 human checks | Yahya's own | — | Traces (D-13) |

**Missing dependencies with no fallback:** none.
**Missing dependencies with a fallback:** Firefox and WebKit on the host (use the container); fontTools.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.1.0 (jsdom 31) + Playwright 1.65.0 + @axe-core/playwright 4.14.0 |
| Config file | `vitest.config.*` (exists) and `playwright.config.ts` (exists). Add `firefox` and `webkit` projects for `e2e/pager-*.spec.ts`, gated so host runs stay Chromium-only unless `ALL_BROWSERS=1` is set or the run is inside the container |
| Quick run command | `pnpm test` (Vitest, under 10s) |
| Full suite command | `pnpm build && pnpm measure:js -- --max-gzip-kb 150 && pnpm test && pnpm test:e2e`. Cross-browser and visual runs happen in the container with `VISUAL=1` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | Trace replays: Mac flick with a long tail = 1 page; two flicks = 2; Windows notch (100px) = 1 per notch; Firefox 3-line notch = 1; Safari 12px notch = 1 (discrete rule); Linux touchpad = 1; ctrl pinch = 0; an idle gap over 160ms resets (IN-01); overflowing page mid-scroll = 0 pages, then a fresh gesture at the edge = 1 | unit | `pnpm vitest run tests/pager-wheel.test.ts` | ❌ Wave 0 |
| NAV-01 | One `mouse.wheel` = 1 page in Chromium, Firefox and WebKit; a horizontal wheel pages; a wheel at the ends is `defaultPrevented` and does not page | e2e | `pnpm exec playwright test e2e/pager-wheel.spec.ts` | ❌ |
| NAV-01 | Mac trackpad and Magic Mouse (Safari and Chrome, no history swipe), Linux touchpad | manual (D-12 checklist on the PR preview) | — | checklist in VERIFICATION |
| NAV-02 | `keyIntent` table, including WR-04 (Space on a link or button = null), modifiers, text targets, and the 600ms repeat gate | unit | `pnpm vitest run tests/pager-keys.test.ts` | ❌ |
| NAV-02 | Each key pages once; Home/End; → → fast = +2 with one history entry; a held → under reduced motion moves at most 1 page per 600ms; Space and Page Down scroll an overflowing page when focus is on body | e2e | `pnpm exec playwright test e2e/pager-keys.spec.ts` | ❌ |
| NAV-03 | Swipe FSM: 20px edge exclusion, 12px axis lock, 1.5 ratio, 48px or 24px + 0.3px/ms commit, `pointercancel` aborts | unit | `pnpm vitest run tests/pager-swipe.test.ts` | ❌ |
| NAV-03 | A touch swipe at 390x844 (`hasTouch`, CDP `Input.dispatchTouchEvent`) pages; a vertical swipe never pages; a swipe starting at x=10 does nothing | e2e (chromium) | `pnpm exec playwright test e2e/pager-swipe.spec.ts` | ❌ |
| NAV-03 | iPhone Safari, LinkedIn in-app browser, Android Chrome | manual (D-12) | — | checklist |
| NAV-04 | Reducer: one push per landing, retargets coalesce, a history-sourced change never pushes | unit | `pnpm vitest run tests/pager-state.test.ts` | ❌ |
| NAV-04 | A deep link to each route paints that page with no animation running (`document.getAnimations().length === 0`); the URL updates; Back/Forward slide without a reload (window marker); `document.title` is correct after Back; `?debug` is preserved; no `next-route-announcer` after the first change; `scrollRestoration === "manual"` | e2e | `pnpm exec playwright test e2e/pager-history.spec.ts` | ❌ |
| NAV-07 | 1366x768 fits (existing `layout.spec.ts`). At 683x384@2x (200% zoom) on Projects and Experience: the wheel scrolls, momentum at the bottom does not page, a fresh gesture at the bottom pages; `scrollX === 0` after paging | e2e | `pnpm exec playwright test e2e/pager-overflow.spec.ts` | ❌ (layout.spec ✅) |
| A11Y-01 | Projection: exactly one non-inert section and one h1 per snapshot; `aria-current` moves; live-region text comes from the template | unit (RTL, stub animator) | `pnpm vitest run tests/pager-shell.test.tsx` | ❌ (update `shell.test.tsx`) |
| A11Y-01 | After each change: `activeElement` is `#title-{slug}` and not inside `[inert]`; live-region text is correct; the ring shows only after key changes; Tab never reaches the hidden rail or the riding row; axe reports zero violations after paging into each page at 1440x900 and 390x844, in both motion modes | e2e | `pnpm exec playwright test e2e/pager-a11y.spec.ts e2e/a11y.spec.ts` | ❌ / ✅ (extend) |
| Motion | Retarget continuity: sampling the track's m41 every rAF across a mid-slide retarget shows no jump over 4px and no reversal; the bar and track share timing; switching reduced motion mid-session takes effect (WR-08) | e2e (chromium) | `pnpm exec playwright test e2e/pager-motion.spec.ts` | ❌ |
| Budget | JS under 150 kB gzip; the debug chunk is not in the initial set | script | `pnpm build && pnpm measure:js -- --max-gzip-kb 150` | ✅ |
| Label fix | Baselines regenerated in the container | visual | `podman run ... VISUAL=1 pnpm test:e2e --update-snapshots` (exact command in 03-10-SUMMARY) | ✅ (regenerate) |

### Sampling Rate
- **Per task commit:** `pnpm test`, plus the touched `e2e/pager-*.spec.ts` on Chromium.
- **Per wave merge:** `pnpm build && pnpm test && pnpm test:e2e` (Chromium and nojs), then the Firefox and WebKit projects in the container.
- **Phase gate:** before `/gsd-verify-work`, the full suite is green in CI (container, all browsers, `VISUAL=1`), the JS gate passes, and Yahya has ticked the D-12 device checklist on the PR preview.

### Wave 0 Gaps
- [ ] `tests/traces/*.json` and a loader for recorded and synthetic wheel traces. Format: `{ device, browser, os, samples: [{t, dx, dy, mode, wheelDeltaY?}], expectPages }`
- [ ] `tests/pager-state.test.ts`, `pager-wheel.test.ts`, `pager-keys.test.ts`, `pager-swipe.test.ts`, `pager-shell.test.tsx`
- [ ] A stub animator and a `matchMedia` stub in `tests/setup.ts`
- [ ] Update `tests/source-guard.test.ts` to use a client-component allowlist instead of "none"
- [ ] Update `tests/shell.test.tsx` for the client projections
- [ ] `e2e/pager-*.spec.ts` and shared helpers. `waitForLanded()` waits for a `data-phase="idle"` attribute on `main`; no fixed sleeps except the >160ms gap between gestures
- [ ] `playwright.config.ts`: Firefox and WebKit projects for the pager specs, and a touch-enabled phone project
- [ ] A debug trace recorder (`window.__pagerTrace`, only under `?debug`)

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (URL path, `?debug`, history state) | Map `location.pathname` only through the fixed `sections` route table and ignore unknown paths (no navigation). Never put URL text into the DOM. The debug flag only toggles a dynamic import |
| V6 Cryptography | no | — |
| V14 Config | yes | CSP unchanged: the existing `'unsafe-inline'` allows the inline `data-js` script; no new origins; the debug chunk is same-origin |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect or injection through the pushed URL | Tampering | Push only the constant `Route` values from `content/site.ts`, plus the existing `location.search` re-appended verbatim (same origin, never parsed into the DOM) |
| Link interception hijacking external links | Tampering | Intercept only same-origin hrefs that exactly match a section route. Leave modifier clicks, middle-clicks, `target`, `download` and external links to the browser |
| Debug overlay leaking data or changing behaviour | Information disclosure | Read-only, `aria-hidden`, shows only local input data; absent without the flag |

## Sources

### Primary (HIGH confidence)
- Codebase (Next 16.4.5): `node_modules/next/dist/client/components/app-router.js` (pushState patch, popstate handler), `app-router-announcer.js`, `router-reducer/reducers/restore-reducer.js`
- Live Playwright probes against `out/` (Chromium, 2026-11-09): patched push, Back/Forward without reload, announcer behaviour, announcer removal, capture listener ordering, `scrollRestoration`
- Repo files: `components/shell/*`, `components/frame/*`, `components/letters/*`, `components/pages/*`, `lib/sections.ts`, `tests/source-guard.test.ts`, `playwright.config.ts`, 04-UI-SPEC.md, 04-CONTEXT.md, `.planning/research/*`
- caniuse: [focus() focusVisible option](https://caniuse.com/mdn-api_htmlelement_focus_options_focusvisible_parameter) (Chrome 145, Firefox 104, Safari 18.4)
- [CSS Transitions Level 2](https://www.w3.org/TR/css-transitions-2): reversing of interrupted transitions

### Secondary (MEDIUM confidence)
- [WebKit bug 240183](https://bugs.webkit.org/show_bug.cgi?id=240183): Safari ignores `overscroll-behavior-x` for history navigation; `preventDefault` on wheel works
- [mozilla.dev.platform: deltaMode lines change](https://groups.google.com/g/mozilla.dev.platform/c/fUXLgaSoeLI): Firefox read-order quirk
- [MDN touch-action](https://developer.mozilla.org/docs/Web/CSS/touch-action), [MDN Element.animate](https://developer.mozilla.org/docs/Web/API/Element/animate) (stable platform docs, not re-fetched)
- [dev.to: prevent history navigation on horizontally scrolling elements](https://dev.to/danburzo/css-micro-tip-prevent-history-navigation-on-horizontally-scrolling-elements-3iil)

### Tertiary (LOW confidence)
- [Mozilla bug 1708829](https://bugzilla.mozilla.org/show_bug.cgi?id=1708829): per-notch values of 48 / 120 / 12 (Gecko / Chrome / Safari), measured on a single mouse
- The label-gap cause hypotheses (no font inspection was done)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH (no new dependencies; platform APIs)
- Architecture: HIGH (history behaviour probed on the real build; the structure follows the existing research)
- Pitfalls: MEDIUM (the wheel and swipe numbers need real devices; the Safari behaviour comes from bug trackers)

**Research date:** 2026-11-09
**Valid until:** 2026-12-09. Re-probe Pitfall 1 after any `next` upgrade.
