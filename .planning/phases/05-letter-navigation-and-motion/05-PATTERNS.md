# Phase 5: Letter Navigation and Motion - Pattern Map

**Mapped:** 2026-11-09
**Files analyzed:** 44 (19 new source/style, 13 modified source/style, 12 test files new or modified)
**Analogs found:** 41 / 44 (3 have only partial analogs; see "No Analog Found")

All analogs are in-repo Phase 3/4 code. The reference sketch `docs/reference/swiss-horizontal-v7.html` is cited for the cursor logic only (feel reference, not code to copy; its bugs are WR-05/07).

---

## File Classification

### New files

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `lib/letters/geometry.ts` | utility (pure) | transform | `lib/pager/animator.ts` (`translateXOf`, `restingOffsetPx`, lines 17-36) | role-match |
| `lib/letters/glide.ts` | service (DOM runner) | event-driven | `lib/pager/animator.ts` (`createWaapiAnimator`, lines 38-130) | exact |
| `components/letters/useGlide.ts` | hook | event-driven | `components/shell/usePagerInput.ts` (lines 197-210) + `PagerProvider.tsx` signal effect (lines 100-106) | exact |
| `lib/first-visit/storage.ts` | utility | storage I/O | none in repo (RESEARCH "Safe storage") | no analog |
| `lib/first-visit/script.ts` | config (inline script string) | before-paint | `lib/js-flag.ts` | exact |
| `lib/first-visit/opening.ts` | service | event-driven | `lib/pager/animator.ts` (WAAPI) + `usePagerInput.ts` `bindKeys` (lines 124-152) + `lib/pager/input/keys.ts` modifier filter (line 67) | role-match |
| `lib/first-visit/hint.ts` | utility (pure state machine) | transform | `lib/pager/state.ts` (pure reducer) | role-match |
| `lib/cursor/mount.ts` | service (lazy, React-free) | event-driven | `usePagerInput.ts` `bindSwipe` (lines 163-195); v7 `release/resnap` (lines 750-763) | role-match |
| `lib/cursor/targets.ts` | utility (pure) | transform | `lib/pager/input/keys.ts` `targetKindOf` (lines 82-101) | role-match |
| `lib/cursor/place-tag.ts` | utility (pure) | transform | v7 `tagPos` (`docs/reference/swiss-horizontal-v7.html` lines 711-717) | exact (logic) |
| `lib/cursor/cursor.module.css` | style | n/a | `components/frame/frame.module.css` (`.skip` z-index 30, `.bar` transform-only) | role-match |
| Opening/hint mount point (effect in `PagerProvider.tsx` or a small client component) | provider wiring | event-driven | `PagerProvider.tsx` lazy DebugOverlay import (lines 108-123) | exact |
| `tests/letters-glide.test.ts` | test (unit) | n/a | `tests/pager-wheel.test.ts` | exact |
| `tests/first-visit-opening.test.ts` | test (unit) | n/a | `tests/pager-keys.test.ts` / `tests/pager-wheel.test.ts` | exact |
| `tests/first-visit-hint.test.ts` | test (unit, fake timers) | n/a | `tests/pager-state.test.ts` | role-match |
| `tests/cursor.test.ts` | test (unit) | n/a | `tests/pager-wheel.test.ts` | exact |
| `tests/motion-guard.test.ts` | test (source guard) | file-I/O | `tests/css-guard.test.ts` | exact |
| `e2e/helpers/letters.ts` | test helper | n/a | `e2e/helpers/pager.ts` + `startSampler` in `e2e/pager-motion.spec.ts` (lines 57-70) | exact |
| `e2e/letters-glide.spec.ts`, `e2e/letters-labels.spec.ts`, `e2e/first-visit.spec.ts`, `e2e/cursor.spec.ts`, `e2e/reduced-motion.spec.ts` | test (e2e) | n/a | `e2e/pager-motion.spec.ts` | exact |

### Modified files

| Modified File | Role | Change | Analog / Pattern Source |
|---------------|------|--------|-------------------------|
| `components/letters/LetterNav.tsx` | component | Drop `lettersMode`/`railEnter`/`inert`; `data-mode` from server prop only; `data-cursor-tag`; `.now` when `target !== 0`; call `useGlide` | `Footer.tsx` lines 19-21 ("React keeps the initial value") |
| `components/letters/letters.module.css` | style | `[data-flight]` rules, caption fade, focus/hover tag, accent under `data-flight="out"`, hero-mode `.now` hidden, delete `rail-in` (lines 147-158) | same file, existing selectors |
| `lib/pager/animator.ts` | service | Delete `letters` target (lines 14, 78, 95, 120-122); update `restingOffsetPx` / `isCssDriven` comments | itself |
| `lib/pager/types.ts` | model | Remove `lettersMode`, `railEnter` (lines 12, 21-22); optional `heldScrollY` on `SlideStartEvent` (lines 51-55); keep `PAGER_SELECTORS.letters` for the glide | itself |
| `lib/pager/state.ts` | model (reducer) | Remove `lettersMode`/`railEnter` from `initialState`, `reduce`, `land`; delete `lettersInert` (lines 86-88) | itself |
| `lib/pager/scroll.ts` + `lib/pager/controller.ts` | service | (Pitfall 6 option) expose held `origin.y`, pass it into `emitSlideStart` (controller lines 98-102) | itself |
| `components/shell/PagerProvider.tsx` | provider | Remove `letters:` from `createDomDeps` (line 43); lazy `import("@/lib/cursor/mount")`; opening + hint wiring | own lines 91-123 |
| `components/frame/Footer.tsx` + `frame.module.css` | component | Hint `<span>` (empty on server), Next nudge | own `barStyle` ownership pattern |
| `components/frame/Header.tsx` | component | `data-cursor-tag={site.resume.label}` on Resume link (line 29) | LetterNav `data-glyph` attribute pattern |
| `app/layout.tsx` | config | Second inline `<script>` beside `JS_FLAG_SCRIPT` (line 17) | itself |
| `styles/tokens.css` | config | Add `--ease-settle`, `--glide-y-lag` (motion block lines 50-57) | itself |
| `styles/base.css` | style (global) | `html[data-opening]` hide rules, `html[data-cursor]` cursor rule, shared tag style | `html[data-js]` rules lines 117-128 |
| `content/site.ts` + `content/types.ts` | content | `hint: { fine, coarse }` (plus typing in `Site`) | `site.footer` (site.ts 12-16, types.ts 32-36) |
| `playwright.config.ts` | config | Default `storageState` seeding both flags; opt-out for first-visit specs | `use:` block lines 14-17, project overrides lines 26-46 |
| `tests/source-guard.test.ts` | test | `CLIENT_ALLOWLIST` (lines 15-26) only if a new `.tsx` `"use client"` file is added | itself |
| `tests/pager-state.test.ts`, `tests/letters.test.tsx`, `e2e/pager-a11y.spec.ts` (lines 134-153), `e2e/pager-motion.spec.ts` (line 256 `rail-in` test) | test | Remove/replace stand-in assertions | themselves |

---

## Pattern Assignments

### `lib/letters/glide.ts` (service, event-driven DOM runner)

**Analog:** `lib/pager/animator.ts`

**Imports / constants pattern** (lines 1-9). Export a numeric ms constant and a fallback-ease table, read tokens at call time:
```ts
import type { Animator, SlideOptions } from "@/lib/pager/types";

/** One slide, shared by track, progress bar and riding hero row (D-03, D-09, D-11). */
export const SLIDE_MS = 600;

const FALLBACK_EASE = {
  page: "cubic-bezier(0.77, 0, 0.18, 1)",
  retarget: "cubic-bezier(0.3, 0.6, 0.18, 1)",
} as const;
```
Glide should import `SLIDE_MS` (D-13 "shares the track's 600ms") and add its own `STAGGER_MS = 30`, `Y_LAG_MS = 100`, plus a `settle` fallback `cubic-bezier(0.5, 0, 0.2, 1)`.

**Token easing read** (lines 42-47). Reuse verbatim, extended for `--ease-settle`:
```ts
function easing(retarget: boolean): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(retarget ? "--ease-retarget" : "--ease-page")
    .trim();
  return value || (retarget ? FALLBACK_EASE.retarget : FALLBACK_EASE.page);
}
```

**Cancel only our WAAPI animations, never CSS ones** (lines 49-67). Copy this; the caption fade is a CSS transition the glide must not cancel:
```ts
function isCssDriven(animation: Animation): boolean {
  return (
    (typeof CSSAnimation !== "undefined" && animation instanceof CSSAnimation) ||
    (typeof CSSTransition !== "undefined" && animation instanceof CSSTransition)
  );
}
function cancelOn(el: HTMLElement | null): void {
  el?.getAnimations?.().filter((a) => !isCssDriven(a)).forEach((a) => a.cancel());
}
function canAnimate(el: HTMLElement | null): el is HTMLElement {
  return el !== null && typeof el.animate === "function";
}
```
Hoisting `isCssDriven`/`cancelOn`/`canAnimate` into a shared `lib/motion/waapi.ts` (exported, used by animator, glide, opening, hint nudge) is the DRY option. It is the planner's call.

**Core "read before cancel" + reduced-motion short-circuit** (lines 87-99):
```ts
if (options.reduced || !canAnimate(track)) {
  settle(index);
  return Promise.resolve(true);
}
// Read every "from" before cancelling: cancel drops the fill and would snap to rest.
const trackFrom = renderedX(track);
const barFrom = renderedX(bar);
cancelAll();
```
Glide maps this one-to-one: reduced → write dest `data-mode`, no animations (Pitfall 2). Rendered rects via `getBoundingClientRect()` → `cancelOn` each letter → measure rail/hero rests → animate. The RESEARCH "Read rendered rects before cancel" snippet is the body.

**Finish handling** (lines 123-126). `.finished.then(() => true, () => false)` never rejects. Use `Promise.all(letters' finished)` with the same shape before writing the final `data-mode`, removing `data-flight` and emitting "settled".

**Settled channel:** reuse `channel<T>()` from `lib/pager/signals.ts` lines 9-28 (export it, or copy it) for the glide's own `onSettled` event that the cursor waits on:
```ts
function channel<T>(): Channel<T> {
  const listeners = new Set<(value: T) => void>();
  return {
    on(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    emit(value) { for (const listener of [...listeners]) listener(value); },
  };
}
```

**Timing difference:** the animator uses `fill: "forwards"` (line 104). The glide and opening must use `fill: "both"` (Pitfall 1, staggered delays).

---

### `lib/letters/geometry.ts` (utility, pure transform)

**Analog:** `lib/pager/animator.ts` lines 17-36 (pure, exported, defensive numeric helpers with doc comments)
```ts
/** Horizontal translation (px) of a computed transform; 0 for none or anything unparseable. */
export function translateXOf(transform: string): number {
  const match = MATRIX.exec(transform.trim());
  if (!match) return 0;
  ...
  return Number.isFinite(x) ? x : 0;
}
```
Pattern: no DOM, readonly input interfaces, explicit return types, finite-number guards. Content: `deltaOnto(hero, to)` (RESEARCH Code Examples), the plan function (`dest = to === 0 ? "hero" : "rail"`, no-op when `dest === heading`), and stagger/delay per index. Unit-tested in `tests/letters-glide.test.ts`.

---

### `components/letters/useGlide.ts` (hook, event-driven)

**Analog:** `components/shell/usePagerInput.ts` lines 197-210 (bind functions return cleanups; one effect keyed on controller):
```ts
export function usePagerInput(controller: PagerController): void {
  useEffect(() => {
    const cleanups = [bindWheel(controller), bindKeys(controller), bindSwipe(controller)];
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [controller]);
}
```
And the signal subscription shape in `PagerProvider.tsx` lines 100-106 (the unsubscribe is returned directly as the effect cleanup):
```ts
useEffect(
  () => controller.signals.onSlideStart(({ to }) => decodeImages(pageElement(to))),
  [controller],
);
```
Get the controller with `usePagerController()` (`PagerContext.tsx` line 21). It returns `null` outside a provider, so return early and keep unit tests rendering. File is `.ts` with no `"use client"` (like `usePagerInput.ts`), so `source-guard` (which scans `.tsx` only) needs no allowlist change. Also bind `resize`/`orientationchange` (cancel + write dest mode) inside the same cleanup list.

---

### `components/letters/LetterNav.tsx` (component, modified)

**Ownership pattern to copy:** `components/frame/Footer.tsx` lines 19-21:
```ts
// The animator owns --page-index after hydration (D-11); React keeps the
// initial value so it never overwrites the animator's inline write.
const barStyle = { "--page-index": indexOfSlug(current) } as CSSProperties;
```
Apply it as `data-mode={indexOfSlug(current) === 0 ? "hero" : "rail"}`, a constant from the server prop. Remove lines 6, 31, 38-39 (`lettersInert`, `state.lettersMode`, `data-enter`, `inert`). Keep `aria-current` from `state.target` (line 48). Change line 32 to `const now = state.target !== 0 ? sectionBySlug(targetSlug) : null;`.

**Attribute-from-content pattern** (line 46: `data-glyph={s.letter ?? undefined}`). Add `data-cursor-tag={`${s.number} ${s.name}`}`. No literal strings (jsx-no-literals, `source-guard` LITERAL_A11Y_ATTR).

Header comment (lines 20-27) must be rewritten: it currently describes the D-09 stand-in.

---

### `components/letters/letters.module.css` (style, modified)

**Existing selectors to extend:**
- Hero caption (lines 58-64): add `.nav[data-flight] .caption { pointer-events: none; }` (Pitfall 15), `data-flight="out"` opacity 1→0 over `var(--dur-ui) var(--ease-ui)`, `data-flight="in"` `opacity: 0; transition: none` (Pitfall 5).
- Accent rule (lines 126-131): duplicate the selector list for `.nav[data-flight="out"] .letter[aria-current="page"]` (UI-SPEC accent timing).
- `.now` (lines 135-139): add `.nav[data-mode="hero"] .now { display: none; }`.
- Rail visually-hidden caption (lines 101-108): the focus tag un-hides it under `.nav[data-mode="rail"] .letter:focus-visible .caption` and the hover fallback `:global(html:not([data-cursor])) .nav[data-mode="rail"] .letter:hover .caption` (Pattern 6). Hover must sit inside `@media (hover: hover) and (pointer: fine)` like lines 69-73.
- Delete lines 147-158 (`rail-in` keyframe and `[data-enter]`).
- Global-attribute-in-module syntax: copy `:global(html[data-js]) .track` from `components/shell/shell.module.css` line 43. Use it for `:global(html[data-opening]) .letter`.
- Keep `--yahya-fit` (line 50) and the YA kern (lines 55-57) untouched (folded todo).

---

### `lib/first-visit/script.ts` (config, before-paint inline script)

**Analog:** `lib/js-flag.ts` (entire file):
```ts
/** Set before first paint so JS-on layout rules apply without a flash (UI-SPEC Track Contract). Code, not copy. */
export const JS_FLAG_SCRIPT = "document.documentElement.dataset.js=''";
```
Pattern: an exported `const` string, a doc comment saying "Code, not copy" (it is exempt from `content/`), and build-time constants interpolated with template literals from `storage.ts` keys (`OPENING_KEY`, `FAILSAFE_MS = 3000`). No runtime data (Security V14). Body: RESEARCH Pattern 4 step 1.

**Wiring:** `app/layout.tsx` line 17:
```tsx
<head>
  <script dangerouslySetInnerHTML={{ __html: JS_FLAG_SCRIPT }} />
</head>
```
Add a second `<script dangerouslySetInnerHTML={{ __html: OPENING_SCRIPT }} />` after it. `<html>` already has `suppressHydrationWarning` (line 14), which covers the `data-opening` / `data-cursor` attributes (Pitfall 10). CSP already allows inline (`vercel.json`).

---

### `lib/first-visit/opening.ts` (service, event-driven)

**Analogs:**
1. WAAPI + cancel/finish: `lib/pager/animator.ts` (see glide above).
2. Window listener with cleanup: `usePagerInput.ts` `bindKeys` lines 124-152:
```ts
function bindKeys(controller: PagerController): Cleanup {
  const onKey = (e: KeyboardEvent) => { ... };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
```
The opening's skip uses the same shape with `{ capture: true }`, so it runs before this bubble-phase pager listener. `stopPropagation()` in capture keeps the key from paging (D-06).
3. Modifier filter: `lib/pager/input/keys.ts` line 67:
```ts
if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return null;
```
Make the skip filter a pure exported function on a `KeyEventLike`-style object (keys.ts lines 10-19) so it can be unit-tested in jsdom: `isSkipKey({ key, altKey, ctrlKey, metaKey })` returns false for `Tab`, `Shift`, `Control`, `Alt`, `Meta` and for any Ctrl/Meta/Alt chord.

Reduced-motion: read `controller.isReducedMotion()` (the provider keeps it live, `PagerProvider.tsx` lines 91-98). Subscribe to `controller.signals.onSlideStart` for the D-03 paging path and the "page change finishes the opening" rule.

---

### `lib/first-visit/hint.ts` (utility, pure state machine)

**Analog:** `lib/pager/state.ts` header and shape (lines 1-34):
```ts
/**
 * Pure pager reducer (Phase 4). One function decides every page change.
 * - D-01: ...
 * No React, no DOM, no clock. The key-repeat gate lives in the controller.
 */
export function initialState(index: number): PagerState { return { ... }; }
export function reduce(state: PagerState, intent: Intent): PagerState { ... return state; /* unchanged = same object */ }
```
Pattern: a doc block listing the D-IDs it implements, readonly state interface, pure functions returning new objects (immutability), "no clock" (times are inputs). Exports: `HINT_DELAY_AFTER_OPENING_MS = 1000`, `HINT_DELAY_NO_OPENING_MS = 1500`, `HINT_VISIBLE_MS = 8000`, `showAt(...)`, `hideAt(...)`, `dismiss(...)`.

**Footer rendering (modified `Footer.tsx`):** the server renders an empty `<span className={`c-dim ${styles.hint}`} />` (`.t-label` is inherited from the `<footer>` class on line 23). Text is written after mount from `site.hint.fine`/`site.hint.coarse` via `matchMedia("(pointer: coarse)")`, the same effect shape as `DebugOverlay.tsx` `useReducedMotionTick` lines 53-63:
```ts
useEffect(() => {
  const mq = window.matchMedia(REDUCED_QUERY);
  const apply = () => setMatches(mq.matches);
  apply();
  mq.addEventListener("change", apply);
  return () => mq.removeEventListener("change", apply);
}, []);
```
Place the CSS in `frame.module.css` next to `.counter` / `.next` (lines 53-60, grid columns 6-9 desktop). The phone override goes in the existing `@media (max-width: 820px)` block (lines 80-99).

---

### `lib/first-visit/storage.ts` (utility, storage)

No repo analog (first `localStorage` use). Use the RESEARCH "Safe storage" snippet verbatim (`safeGet` returns `undefined` when storage is unusable; `safeSet` returns a boolean). Export key constants here (`OPENING_KEY`, `HINT_KEY`), and compare values against an exact constant, never parse them (Security V5). Follow the house style: doc comment, explicit return types, no logging (controller.ts line 19 "No timers, no DOM, no logging").

---

### `lib/cursor/mount.ts` (service, lazy and React-free, event-driven)

**Lazy-load analog:** `PagerProvider.tsx` lines 108-123:
```ts
const [Debug, setDebug] = useState<ComponentType | null>(null);
useEffect(() => {
  if (!new URLSearchParams(window.location.search).has("debug")) return;
  let alive = true;
  import("./DebugOverlay")
    .then((m) => { if (alive) setDebug(() => m.DebugOverlay); })
    .catch(() => {
      // WR-03: the overlay is optional; a failed chunk load is not an error.
    });
  return () => { alive = false; };
}, []);
```
For the cursor, gate on `matchMedia("(hover: hover) and (pointer: fine)")` and `!(forced-colors: active)`. Use `import("@/lib/cursor/mount").then((m) => { if (alive) cleanup = m.mountCursor(controller.signals, glideSettled); })`. In the effect cleanup, call `cleanup?.()`. Re-run on media `change`. A swallowed failure keeps the native cursor (WR-07).

**Listener-table analog:** `usePagerInput.ts` `bindSwipe` lines 156-195 (a map of event types to handlers registered `passive: true`, one cleanup that removes all). Use it for `pointermove`, `pointerover`, `pointerdown` (touch → drop `data-cursor`) and `pointerleave` on `document.documentElement`.

**Release/resnap logic (port, fixing WR-05):** v7 lines 750-763:
```js
function release(railStays) {
  paging = true;
  if (target && !(railStays && fly.contains(target))) setTarget(null);
}
function resnap() {
  paging = false;
  var el = px >= 0 && py >= 0 ? document.elementFromPoint(px, py) : null;
  var t = el && el.closest ? el.closest('a, button') : null;
  if (t === target) layoutBox(); else setTarget(t);
}
```
Required changes: `pos: {x,y} | null` instead of `px = -100` sentinels (WR-05). The selector becomes `a, button, [data-cursor-snap]`. Resnap waits for both `onLanded` and glide settled. Tag text uses `textContent` only. No `aria-label`/`textContent` fallback for the tag (D-17: tag only when `data-cursor-tag` exists).

Test-mock analog for the lazy chunk failing: `tests/pager-debug-import.test.tsx` (the `vi.mock` throw plus the `unhandledRejection` spy).

---

### `lib/cursor/targets.ts` and `lib/cursor/place-tag.ts` (utility, pure)

**targets.ts analog:** `lib/pager/input/keys.ts` lines 82-101 (pure DOM-element classifiers with `ReadonlySet` tables, tolerant of `null`):
```ts
export function targetKindOf(el: Element | null): TargetKind {
  if (!el) return "none";
  const tag = el.tagName.toUpperCase();
  ...
}
```
Exports: `SNAP_SELECTOR = "a, button, [data-cursor-snap]"`, `snapTargetOf(el: Element | null): HTMLElement | null`, `tagTextOf(el: Element): string | null`. Unit-test both in jsdom.

**place-tag.ts analog:** v7 `tagPos` lines 711-717. The RESEARCH Code Examples `placeTag(box, w, h, vw, vh, pad = 8, gap = 12)` is the typed rewrite. Copy it, with named constants `TAG_EDGE_PAD = 8` and `TAG_GAP = 12`.

---

### `lib/cursor/cursor.module.css` (style)

**Analog:** `components/frame/frame.module.css`:
- Layering above chrome: `.skip { position: fixed; z-index: 30; ... }` (lines 1-11). Header/footer are `z-index: 5` (lines 21, 46). Cursor roots go at 30+, as the UI-SPEC says.
- Transform-only moving piece: `.bar { transform: translateX(calc(var(--page-index) * 100%)); }` (lines 61-69).
- Coarse-pointer media block (lines 71-79) shows the media-query style.
Colours only through `var(--color-ink)` / `var(--color-ground)` (enforced by `tests/css-guard.test.ts`: no raw hex outside tokens, no `font` shorthand). Hairlines use `transform: translate() scaleX()/scaleY()` only. Transitions are `var(--dur-ui) var(--ease-ui)` under a snap attribute only (Pitfall 14).

---

### `styles/tokens.css` (config, modified)

Insert into the motion block (lines 50-57). The reduced-motion block (lines 81-88) needs `--glide-y-lag: 0ms` added if JS reads it as a duration:
```css
  --dur-page: 600ms;
  --dur-letters: 600ms;
  --dur-ui: 150ms;
  --stagger: 30ms;
  --ease-page: cubic-bezier(0.77, 0, 0.18, 1);
  --ease-retarget: cubic-bezier(0.3, 0.6, 0.18, 1);
  --page-count: 6;
  --ease-ui: cubic-bezier(0.16, 1, 0.3, 1);
  /* NEW */
  --ease-settle: cubic-bezier(0.5, 0, 0.2, 1);
  --glide-y-lag: 100ms;
```

---

### `styles/base.css` (global style, modified)

**Analog:** the `html[data-js]` block, lines 117-128:
```css
/* D-04 / Pitfall 11: no horizontal document scroll and no horizontal history swipe once the track is live. */
html[data-js],
html[data-js] body {
  overflow-x: clip;
  overscroll-behavior-x: none;
}
@media (max-width: 820px), (pointer: coarse) {
  html[data-js] {
    touch-action: pan-y pinch-zoom;
  }
}
```
Add, in the same "comment cites the decision ID" style:
- `@media (hover: hover) and (pointer: fine) and (forced-colors: none) { html[data-cursor], html[data-cursor] * { cursor: none; } }` (WR-07).
- `html[data-opening]` hides header/footer/page-00 chrome (`opacity: 0`). The letter offset lives in `letters.module.css` via `:global(html[data-opening])`.
- The shared tag visual (`.t-tag`: ink fill, ground text, `padding: var(--space-xs) var(--space-sm)`), next to the existing `.visually-hidden` utility (line 60). It is global so both the CSS-module focus tag and the lazily mounted cursor tag can use it.

---

### `content/site.ts` + `content/types.ts` (content, modified)

**Analog:** `site.footer` (site.ts lines 12-16) and its type (types.ts lines 32-36):
```ts
footer: {
  nextPrefix: "Next, ",
  backToStart: "Back to the start",
  counterSeparator: " / ",
},
```
Add `hint: { fine: "Scroll or use the arrow keys", coarse: "Swipe sideways" }` and `readonly hint: { readonly fine: string; readonly coarse: string };` to `Site`. `site` is `as const satisfies Site`, so the type must be updated or the build fails. The Resume tag reuses `site.resume.label` (no new string).

---

### `components/shell/PagerProvider.tsx` (provider, modified)

- Line 43: delete `letters: query(PAGER_SELECTORS.letters),` once `AnimatorTargets.letters` is removed.
- The reduced-motion live listener (lines 91-98) stays the single source. Opening, glide and hint read `controller.isReducedMotion()`, not their own `matchMedia`.
- Add the cursor lazy-import effect (copy lines 108-123) and the opening claim effect. If the opening needs a React mount point, prefer an effect here over a new `.tsx` client file (avoids a `CLIENT_ALLOWLIST` change).

---

### `lib/pager/state.ts` / `types.ts` / `animator.ts` (stand-in removal)

Exact lines to remove:
- `types.ts` 12 (`LettersMode`; move the type to `lib/letters/` if the glide still needs it), 21-22.
- `state.ts` 8-9 (doc bullet), 29-30, 53-54, 66-67, 86-88.
- `animator.ts` 14, 78, 95, 120-122; comment line 3 ("riding hero row"); comment line 49 (`rail-in` example); comment line 30 (`restingOffsetPx`: say D-15 holds because the hero row is outside the track).
- Pitfall 6 option: `scroll.ts` lines 25-36 already hold `origin.y`. Expose it (for example `heldScrollY(): number` on `ScrollPort`) and pass it in `controller.ts` lines 98-102 as `heldScrollY` on `SlideStartEvent`. If `ScrollPort` changes, update `tests/helpers/stub-ports.ts`.

---

### Tests

**Unit test analog:** `tests/pager-wheel.test.ts` lines 1-45 (vitest imports, `@/` alias imports of constants and pure fns, small fixture factories with `Partial<>` overrides, a "constants match the spec" block):
```ts
import { describe, expect, it } from "vitest";
import { ..., stepWheel, WHEEL_THRESHOLD_PX, type WheelSample } from "@/lib/pager/input/wheel";
const wheel = (over: Partial<WheelSample> = {}): WheelSample => ({ dx: 0, dy: 0, mode: 0, t: 1000, ctrl: false, vh: 900, ...over });
describe("constants (UI-SPEC Input Contract)", () => {
  it("match the spec", () => { expect(WHEEL_THRESHOLD_PX).toBe(48); ... });
});
```
Apply to `tests/letters-glide.test.ts` (`STAGGER_MS`, `Y_LAG_MS`, `deltaOnto`, plan no-ops), `tests/cursor.test.ts` (`placeTag` four fallbacks + clamp), `tests/first-visit-opening.test.ts` (`isSkipKey`, storage wrappers with `vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw ... })`), and `tests/first-visit-hint.test.ts`.

**Source guard analog:** `tests/css-guard.test.ts` (entire file: `listCss` via `process.cwd()` because jsdom breaks `import.meta.url` (line 14), comment stripping, the `offenders()` helper). `tests/motion-guard.test.ts` copies it: parse every `cubic-bezier(...)` in `tokens.css` and assert y1, y2 ∈ [0,1]; assert that every `transition`/`animation` duration in guarded CSS is `var(--dur-*)`.

**Component test analog:** `tests/letters.test.tsx` lines 1-60 (Testing Library render, `PagerContext` + `createStubDeps()` for controller-driven cases). Update the tests that assert `data-mode` switching on landing: after this phase `data-mode` is server-prop-constant in React.

**E2E analog:** `e2e/pager-motion.spec.ts` lines 1-70:
- `open`, `landId`, `waitForLanded` from `e2e/helpers/pager.ts` (no fixed sleeps, line 23 comment).
- `declare global { interface Window { __samples?: number[]; __sampling?: boolean } }` plus an rAF sampler in `page.evaluate` (lines 57-70). Copy this into `e2e/helpers/letters.ts` to sample per-letter `translate` and `transform`.
- `getAnimations()[0].effect.getTiming()` reads (lines 31-42) and the `bezier()` token-compare helper (lines 44-55). Reuse them for the X/Y easing assertions.
- `const DESKTOP = { width: 1440, height: 900 }` viewport constant (line 5); add `PHONE = { width: 390, height: 844 }` for LTR-06.

**Playwright config (Pitfall 9):** add `storageState` under `use:` (lines 14-17) seeding both keys for `baseURL`. First-visit specs opt out with a project override in the style of `chromium-touch` (lines 38-46, `testMatch`) or `test.use({ storageState: { cookies: [], origins: [] } })` at the spec level. The touch project (`hasTouch: true`) gives `pointer: coarse` for the hint and cursor-off tests.

**Stand-in tests to rewrite:** `e2e/pager-a11y.spec.ts` lines 134-153 (asserts `inert` on the riding row; Phase 5 letters are never inert, so invert it to "focus on a clicked letter survives the glide"), `e2e/pager-motion.spec.ts` line 256 (`rail-in` WR-01 test; delete it or replace it with "glide finishes, no animations left"), and `tests/pager-state.test.ts` lines 9, 44-45, 52, 66, 126-138, 165-172, 213-225.

---

## Shared Patterns

### Read-before-cancel WAAPI retarget
**Source:** `lib/pager/animator.ts` lines 96-99 and 49-63
**Apply to:** glide, opening, hint nudge
Read the rendered value first, then `cancel()` only non-CSS animations (`isCssDriven` filter), then start from the read value. Never queue.

### Reduced motion is checked by every WAAPI caller
**Source:** `PagerProvider.tsx` lines 91-98 (live listener → `controller.setReducedMotion`), `animator.ts` line 90 (`if (options.reduced ...) settle(...)`)
**Apply to:** glide, opening, hint nudge. Not the cursor (it stays 1:1; its CSS shape transitions use `--dur-ui`, which is already 0ms).
The `--dur-*` tokens only reach CSS (tokens.css lines 81-88). The instant path still writes the final state (mode, flags).

### Signals, not router state
**Source:** `lib/pager/signals.ts`, `controller.ts` lines 68, 98-102
**Apply to:** glide, opening (D-03 path), hint dismiss, cursor release/resnap
Subscribe with `controller.signals.onSlideStart` / `onLanded`; the returned unsubscribe is the cleanup. `slideStart` fires after commit, scroll and animator start (controller line 5 order), which is relevant to Pitfall 6.

### Server-prop-initial, script-owned attributes after hydration
**Source:** `Footer.tsx` lines 19-21; `app/layout.tsx` line 14 `suppressHydrationWarning`
**Apply to:** `LetterNav` `data-mode`, the hint `<span>` text, `html[data-opening]`, `html[data-cursor]`
React renders the server value once and never re-derives it from pager state.

### Optional chunk failure is silent
**Source:** `PagerProvider.tsx` lines 113-119 (`.catch(() => { /* WR-03 */ })`, `alive` flag)
**Apply to:** cursor lazy import, any lazily loaded opening code; the inline failsafe timer covers the opening hide (Pitfall 7)

### No literals in components; content is typed
**Source:** `content/site.ts` + `content/types.ts` (`as const satisfies Site`), `tests/source-guard.test.ts` lines 8, 56-58
**Apply to:** hint strings, tag text (`data-cursor-tag` built from `sections` / `site.resume.label`). Data-notation constants that are not copy follow `DebugOverlay.tsx` lines 20-31 ("Data notation, not copy").

### Window listeners return cleanups
**Source:** `usePagerInput.ts` `bindKeys` / `bindSwipe` (lines 124-195), aggregated at lines 197-210
**Apply to:** opening skip listeners (capture), cursor pointer listeners (passive), glide resize listener

### Comment style
Every module opens with a doc block naming the decision and requirement IDs it implements (see `controller.ts` lines 1-20, `state.ts` lines 1-14, `scroll.ts` lines 14-19). CSS comments cite the ID too (`letters.module.css` lines 1, 54, 119; `base.css` line 117).

### CSS guardrails
**Source:** `tests/css-guard.test.ts`
**Apply to:** all new and modified CSS: colours only via `var(--color-*)`, `font-family: var(--font-sans)` only, no `font` shorthand. Animate only `transform`/`translate`/`opacity`.

---

## No Analog Found

| File | Role | Data Flow | Reason / Use Instead |
|------|------|-----------|----------------------|
| `lib/first-visit/storage.ts` | utility | storage I/O | First `localStorage` use in the repo. Use the RESEARCH "Safe storage" snippet |
| `lib/cursor/mount.ts` (DOM creation part) | service | event-driven | No imperative DOM-building module exists; listener and lazy-load patterns are in-repo (above). Logic comes from v7 lines 705-763 with the WR-05/07 fixes |
| Opening skip click-suppressor (inside `opening.ts`) | service | event-driven | No capture-phase or one-shot listener exists yet. Use RESEARCH Pattern 4 step 4 |

---

## Metadata

**Analog search scope:** `app/`, `components/` (letters, frame, shell), `lib/` (pager, pager/input, js-flag), `content/`, `styles/`, `tests/`, `e2e/`, `playwright.config.ts`, `docs/reference/swiss-horizontal-v7.html` (cursor section only)
**Files scanned:** ~35
**Pattern extraction date:** 2026-11-09
