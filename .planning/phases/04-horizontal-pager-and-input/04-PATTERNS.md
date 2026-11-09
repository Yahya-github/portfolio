# Phase 4: Horizontal Pager and Input - Pattern Map

**Mapped:** 2026-11-09
**Files analyzed:** 50 (27 new, 23 modified; test-only changes included)
**Analogs found:** 41 / 50 (9 with no analog: follow RESEARCH Patterns 2-6)

Context: the codebase is a Phase 3 static site. Nothing is a client component yet (`tests/source-guard.test.ts:45-47` asserts that), there are no hooks, no `lib/` state, no event listeners. Analogs are therefore strongest for pure modules, content, CSS and tests, and weakest for the controller, animator and provider, which RESEARCH.md specifies directly.

## File Classification

### New files

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `lib/pager/state.ts` (PagerState, `reduce`) | utility (pure reducer) | transform | `lib/sections.ts` | role-match |
| `lib/pager/input/wheel.ts` (`stepWheel`, exported constants) | utility (pure FSM) | event-driven (timestamped samples) | `lib/display-fit.ts` (exported constants + pure fn) | partial |
| `lib/pager/input/keys.ts` (`keyIntent`) | utility (pure) | transform | `lib/sections.ts` | partial |
| `lib/pager/input/swipe.ts` (pointer FSM) | utility (pure FSM) | event-driven | `lib/display-fit.ts` | partial |
| `lib/pager/input/normalize.ts` (deltaMode to px) | utility (pure) | transform | `lib/display-fit.ts` | role-match |
| `lib/pager/input/edge.ts` (`scrollerFor`, `atEdge`) | utility (DOM read) | request-response | none | no analog |
| `lib/pager/controller.ts` (`createPagerController`, subscribe/getSnapshot) | store | event-driven | none | no analog |
| `lib/pager/animator.ts` (WAAPI slideTo; stub for tests) | service | event-driven | none | no analog |
| `lib/pager/history.ts` (`pushRoute`, `silenceNextAnnouncer`, scrollRestoration) | service | request-response | `lib/sections.ts` for route lookup only | partial (DOM side: none) |
| `lib/pager/signals.ts` (slideStart / landed emitter) | utility | pub-sub | none | no analog |
| `lib/js-flag.ts` (inline `data-js` script string constant) | config | n/a | `lib/display-fit.ts` (exported const) | partial |
| `components/shell/PagerProvider.tsx` | provider ("use client") | event-driven | none (first client component) | no analog |
| `components/shell/PageSection.tsx` | component ("use client") | projection | `components/shell/Track.tsx:42-51` | exact (extracted) |
| `components/shell/LiveRegion.tsx` | component ("use client") | projection | `components/frame/SkipLink.tsx` | role-match |
| `components/shell/DebugOverlay.tsx` (+ `debug.module.css`) | component ("use client", dynamic import) | projection | `components/frame/Footer.tsx` + `frame.module.css` | role-match |
| `tests/pager-state.test.ts` | test (unit) | — | `tests/sections.test.ts` | exact |
| `tests/pager-wheel.test.ts` | test (unit, trace replay) | — | `tests/display-fit.test.ts` (`it.each` tables) | role-match |
| `tests/pager-keys.test.ts` | test (unit) | — | `tests/display-fit.test.ts` | role-match |
| `tests/pager-swipe.test.ts` | test (unit) | — | `tests/display-fit.test.ts` | role-match |
| `tests/pager-shell.test.tsx` | test (RTL, stub animator) | — | `tests/shell.test.tsx` | exact |
| `tests/traces/*.json` (+ loader) | test fixture | file-I/O | none | no analog |
| `e2e/helpers/pager.ts` (`open`, `waitForLanded`, `pathname`) | test utility | — | `e2e/layout.spec.ts:47-53`, `e2e/routes.spec.ts:9` | role-match |
| `e2e/pager-wheel.spec.ts` | test (e2e) | — | `e2e/routes.spec.ts` | role-match |
| `e2e/pager-keys.spec.ts` | test (e2e) | — | `e2e/focus.spec.ts` (keyboard loop) | role-match |
| `e2e/pager-history.spec.ts` | test (e2e) | — | `e2e/routes.spec.ts:57-96` | role-match |
| `e2e/pager-overflow.spec.ts` | test (e2e) | — | `e2e/layout.spec.ts:82-99` | role-match |
| `e2e/pager-a11y.spec.ts` | test (e2e) | — | `e2e/a11y.spec.ts` + `e2e/focus.spec.ts` | exact |
| `e2e/pager-swipe.spec.ts` | test (e2e, CDP touch) | — | none | no analog |
| `e2e/pager-motion.spec.ts` | test (e2e, rAF sampling) | — | none | no analog |

### Modified files

| Modified File | Role | Change | Analog / Anchor |
|---------------|------|--------|-----------------|
| `components/shell/Shell.tsx` | component (server) | wrap in `PagerProvider`, add `LiveRegion` after Footer | itself, lines 12-22 |
| `components/shell/Track.tsx` | component (server) | sections become `<PageSection>`; `--track-index` inline on `main` | itself + `Footer.tsx:12` |
| `components/shell/shell.module.css` | config (CSS) | `html[data-js]` track rules, override `.page[inert]` (lines 18-21) | itself |
| `components/frame/Header.tsx` | component, becomes client | read target from pager context | itself |
| `components/frame/Footer.tsx` | component, becomes client | read target; bar `--page-index` → animated | itself |
| `components/frame/frame.module.css` | CSS | `.bar` stays `transform` only (line 68) | itself |
| `components/letters/LetterNav.tsx` | component, becomes client | mode/aria-current from target; `inert` while riding out | itself |
| `components/letters/letters.module.css` | CSS | hidden rail = `visibility: hidden`; rail fade | itself, lines 80-94 |
| `components/pages/Heading.tsx` | component, becomes client | `PageLevel` context + offset; `tabIndex={-1}` on PageTitle | itself |
| `components/pages/types.ts` | model | `headingLevel` removed (or kept as offset); `isCurrent` = initial-route load hint | itself |
| `components/pages/{Index,Achievements,Projects,Experience,About,SayHi}Page.tsx` (6) | component (server) | stop computing `headingLevel + 1`; pass offset | `ProjectsPage.tsx:17-37` |
| `content/site.ts` | content | `liveRegion` template, debug field names | `site.footer` group, lines 12-16 |
| `content/types.ts` | model | matching `Site` fields | `Site.footer`, lines 32-36 |
| `lib/sections.ts` | utility | `indexOfRoute(pathname)`, `liveRegionText(index)` | itself, lines 17-30 |
| `app/layout.tsx` | layout | inline `<head>` script setting `data-js`, `suppressHydrationWarning` | itself, lines 8-13 |
| `styles/tokens.css` | config | `--ease-retarget` next to `--ease-page` (line 54) | itself |
| `styles/base.css` | config | title-heading focus rules; `.t-label` letter-gap fix (lines 68-75); `html` overscroll/touch-action | itself |
| `playwright.config.ts` | config | firefox/webkit + touch phone + reduced-motion projects | lines 36-44 (VISUAL spread) |
| `tests/setup.ts` | test config | `matchMedia` stub, stub animator export | itself (1 line) |
| `tests/source-guard.test.ts` | test | "no client components" → allowlist | lines 45-47 |
| `tests/shell.test.tsx` | test | binding order + `LiveRegion <p>`; wrap/provider | lines 61-77 |
| `tests/frame.test.tsx` | test | bar assertion (`--page-index`) + Header/Footer need provider | lines 76-83 |
| `tests/heading.test.tsx`, `tests/pages-*.test.tsx` (4) | test | `headingLevel` prop → `PageLevel` provider wrapper | `pages-projects.test.tsx:8-12` |
| `e2e/routes.spec.ts`, `e2e/layout.spec.ts`, `e2e/a11y.spec.ts` | test | JS-on track renders all six pages; exclude `[inert]` | see Shared Patterns |
| `e2e/visual.spec.ts-snapshots/*.png` (18) | fixture | regenerate in container after label fix | 03-10-SUMMARY command |

## Pattern Assignments

### `lib/pager/state.ts` (pure reducer) — and the additions to `lib/sections.ts`

**Analog:** `lib/sections.ts`

**Imports pattern** (lines 1-4): content first, `import type` for types, `@/` alias, a module-level typed alias of the `as const` array:
```ts
import { sections, site } from "@/content/site";
import type { Route, Section, Slug } from "@/content/types";

const ALL: readonly Section[] = sections;
```

**Core pattern** (lines 11-30): small exported pure functions, readonly return interfaces, throw on programmer error, templates built from `site.*` fragments (never literals):
```ts
export function sectionBySlug(slug: Slug): Section {
  const found = ALL.find((s) => s.slug === slug);
  if (!found) throw new Error(`unknown section: ${slug}`);
  return found;
}

export function indexOfSlug(slug: Slug): number {
  return ALL.indexOf(sectionBySlug(slug));
}

export function counterLabel(slug: Slug): string {
  const last = ALL[ALL.length - 1];
  return `${sectionBySlug(slug).number}${site.footer.counterSeparator}${last.number}`;
}
```

Apply:
- `indexOfRoute(pathname: string): number | null` goes in `lib/sections.ts` next to `indexOfSlug`. Unlike `sectionBySlug`, it must **return null, not throw**, for unknown paths (RESEARCH Security V5: ignore unknown paths, never navigate). Match against `s.route` exactly (trailing slash).
- `liveRegionText(index)` goes here too, built from `site.liveRegion` the way `counterLabel` uses `site.footer.counterSeparator` (UI-SPEC copy: `"{name}, page {n} of {total}"`, n = index + 1, total = `ALL.length`).
- `lib/pager/state.ts` follows the same style: `readonly` interface for `PagerState`, discriminated `Intent` union (`next | prev | goto` + `source`), `reduce(state, intent): PagerState` returning a new object (immutability rule), no imports from React or the DOM.

---

### `lib/pager/input/wheel.ts`, `swipe.ts`, `normalize.ts`, `keys.ts` (pure FSMs and maps)

**Analog:** `lib/display-fit.ts`

**Header doc + exported constants + pure function** (lines 1-27):
```ts
/**
 * Phone Display fit (user decision 1, 2026-11-08). Each word's width in em,
 * measured at wdth 75 / weight 700 / letter-spacing -0.05em (RESEARCH Pitfall 4).
 * ...
 */
export const DEFAULT_WORD_EM = 4.6;

export const DISPLAY_WORD_EM: Readonly<Record<string, number>> = { ... };

export function displayFitStyle(word: string): {
  readonly "--word-em": number;
} {
  return { "--word-em": DISPLAY_WORD_EM[word] ?? DEFAULT_WORD_EM };
}
```

Apply:
- Top doc comment cites the decision IDs (D-04, D-05, D-08, IN-01, WR-04) and the RESEARCH pitfall numbers, as display-fit cites "user decision 1" and "Pitfall 4".
- Export every threshold as a `UPPER_SNAKE_CASE` const (`WHEEL_THRESHOLD_PX = 48`, `GESTURE_GAP_MS = 160`, `FRESH_FLICK_MIN_PX = 16`, `LINE_PX = 16`, `SWIPE_EDGE_PX = 20`, `AXIS_LOCK_PX = 12`, `AXIS_RATIO = 1.5`, `SWIPE_COMMIT_PX = 48`, `SWIPE_FAST_PX = 24`, `SWIPE_VELOCITY = 0.3`, `REPEAT_GATE_MS = 600`) so tests and `DebugOverlay` import them (UI-SPEC "Accum {n} / 48").
- Signatures follow RESEARCH Pattern 3 (`stepWheel(state, sample, edge) → { state, intent, preventDefault }`) and Pattern 4 (`keyIntent(eventLike, ctx)`); inputs are plain objects (`WheelSample`), never DOM events, so jsdom and trace replay need no events.
- Readonly return types, as `displayFitStyle` declares `readonly "--word-em"`.

---

### `components/shell/PageSection.tsx` (client projection, extracted)

**Analog:** `components/shell/Track.tsx` lines 38-52 (the block being extracted)

```tsx
{sections.map((s) => {
  const isCurrent = s.slug === current;
  const Body = PAGE_COMPONENTS[s.slug];
  return (
    <section
      key={s.slug}
      id={`page-${s.slug}`}
      data-page={s.slug}
      inert={!isCurrent}
      aria-labelledby={`title-${s.slug}`}
      className={styles.page}
    >
      <Body headingLevel={isCurrent ? 1 : 2} isCurrent={isCurrent} />
    </section>
  );
})}
```

Apply:
- Keep `id`, `data-page`, `aria-labelledby` and `className={styles.page}` byte-identical (tests/shell.test.tsx:43-51 and every e2e locator `#page-{slug}` depend on them). Import `styles` from `./shell.module.css`, as Track does (line 11).
- Only `inert` becomes live: `inert={!live}` from the pager snapshot (live = target, or the page holding focus until landing, UI-SPEC Focus hand-off).
- Provide `PageLevel` context (1 when live target, else 2) around `children`; the server `Body` is passed as `children` from Track, so it does not re-render (RESEARCH Pattern 1).
- `isCurrent` stays the **initial route** value passed by Track (Photo `eager` load hint), not live state.
- Props interface pattern: `interface XProps { readonly slug: Slug; readonly children: ReactNode }` (readonly fields, like `TrackProps` lines 22-24).

---

### `components/shell/Track.tsx` (modified, stays server)

**Analog:** itself + inline CSS custom property from `components/frame/Footer.tsx:12`

```tsx
const barStyle = { "--page-index": indexOfSlug(current) } as CSSProperties;
...
<span aria-hidden="true" className={styles.bar} style={barStyle} />
```

Apply: `main` gets `style={{ "--track-index": indexOfSlug(current) } as CSSProperties}` for first paint (UI-SPEC "First paint"). Keep `id="content"`, `tabIndex={-1}`, `data-current={current}`, `className={styles.track}` (shell.test.tsx:53-59). Add `data-phase` only from the client side (e2e `waitForLanded()` reads `main[data-phase="idle"]`), so it belongs on an element the provider controls or is set via a ref, not in this server file.

---

### `components/shell/Shell.tsx` (modified)

**Analog:** itself, lines 12-22

```tsx
/** Binding DOM order (UI-SPEC): SkipLink, Header, LetterNav, Track, Footer. */
export function Shell({ current }: ShellProps) {
  return (
    <>
      <SkipLink />
      <Header current={current} />
      <LetterNav current={current} />
      <Track current={current} />
      <Footer current={current} />
    </>
  );
}
```

Apply: wrap the fragment in `<PagerProvider initial={indexOfSlug(current)}>` (a context provider renders no DOM, so the top-level order in shell.test.tsx:61-77 survives) and append `<LiveRegion />` after `<Footer>`. Update the doc comment to the new order (…, Footer, LiveRegion). The initial index comes from the `current` prop, never `usePathname()` (RESEARCH Pattern 2).

---

### `components/shell/PagerProvider.tsx` (no analog)

No client component, hook, context or listener exists yet. Follow RESEARCH:
- Pattern 2 (history: patched `window.history.pushState`, `popstate` → `indexOfRoute(location.pathname)`, lazy `silenceNextAnnouncer()`, `scrollRestoration = "manual"` on mount).
- Code Examples "Wheel listener wiring" (`window.addEventListener("wheel", h, { passive: false })`, read `deltaMode` first; never React `onWheel`).
- Code Examples "Reduced motion, live" (`matchMedia(...).addEventListener("change", ...)`, WR-08).
- Pattern 6 commit order (`flushSync` publish → scroll reset → `animator.slideTo` → focus → on `finished`: `--track-index`, cancel, push, live region, inert, collapse, `landed`).
- Expose to React with `useSyncExternalStore(controller.subscribe, controller.getSnapshot, getServerSnapshot)`; server snapshot = initial index.
- Load `DebugOverlay` only when `new URLSearchParams(location.search).has("debug")`, via `import()` inside an effect (JS gate: chunk not in initial set).
- Every `focus()` call passes `{ preventScroll: true }` (Pitfall 11).

Conventions to keep from the codebase: `"use client";` as line 1, `@/` imports, named export (no default exports in `components/`), readonly props interface, no text literals (all copy from `content/site.ts`).

---

### `components/frame/Header.tsx`, `Footer.tsx`, `components/letters/LetterNav.tsx` (become client projections)

**Analog:** themselves. Keep the markup; replace the `current` prop read with the pager **target** (D-10: chrome switches at slide start).

Header (lines 10-26) — the two live parts:
```tsx
<span className={`c-dim ${styles.where}`}>{headerLabel(current)}</span>
...
<a href={sayHi.route} aria-current={current === "say-hi" ? "page" : undefined}>
```

Footer (lines 10-21) — counter, next link, bar:
```tsx
const next = nextLink(current);
const barStyle = { "--page-index": indexOfSlug(current) } as CSSProperties;
return (
  <footer className={`grid t-label ${styles.footer}`}>
    <span className={`tnum ${styles.counter}`}>{counterLabel(current)}</span>
    <a className={styles.next} href={next.href}>{next.label}</a>
    <span aria-hidden="true" className={styles.bar} style={barStyle} />
  </footer>
);
```

LetterNav (lines 14-41) — mode and `aria-current`:
```tsx
const mode = current === "index" ? "hero" : "rail";
const now = mode === "rail" ? sectionBySlug(current) : null;
return (
  <nav aria-label={site.navLabel} data-mode={mode} className={styles.nav}>
    {letterSections().map((s) => (
      <a key={s.slug} href={s.route} data-glyph={s.letter ?? undefined}
         className={styles.letter}
         aria-current={s.slug === current ? "page" : undefined}>
```

Apply:
- Keep props `{ current: Slug }` as the **initial** value so first-paint HTML per route stays byte-identical (RESEARCH Pattern 1); derive `const slug = useTargetSlug(current)` (or similar) from context.
- The `lib/sections.ts` helpers (`headerLabel`, `counterLabel`, `nextLink`) stay the single source of strings; components keep calling them with the live slug.
- LetterNav: `data-mode` follows the D-09 stand-in (hero while target is 00 or while riding out; rail only after a landing off 00), plus `inert` while the hero row rides out (UI-SPEC "Hidden means unreachable").
- Footer bar: the inline `--page-index` stays for first paint; the animator drives the bar's transform (same 600ms, same easing). Decide whether to rename to `--track-index`; if renamed, update `frame.module.css:68` and `tests/frame.test.tsx:76-83` in the same task.

---

### `components/pages/Heading.tsx` (becomes client) and page bodies

**Analog:** itself (lines 1-48) and the sub-heading computation in `ProjectsPage.tsx:17-37` / `ExperiencePage.tsx:8-18`:
```tsx
export function ProjectsPage({ headingLevel, isCurrent }: PageProps) {
  const sub = (headingLevel + 1) as 2 | 3;
  ...
  <PageTitle slug="projects" level={headingLevel} text={projects.title} className={styles.title} />
  ...
  <Heading level={sub} className={`t-display ${styles.name}`}>
```

`PageTitle` (lines 35-48) keeps `id={\`title-${slug}\`}`, the `visually-hidden` text span and the `aria-hidden` children span; add `tabIndex={-1}` (focus target, A11Y-01).

Apply (RESEARCH Pattern 1): `Heading` and `PageTitle` read `PageLevel` from context and take an `offset` (0 for titles, 1 for sub-heads) instead of an absolute `level`; the six bodies drop `headingLevel` arithmetic. `TAGS` map (line 5) and `HeadingLevel` type (line 3) stay. Pages that only use `PageTitle` (Index, Achievements, About, SayHi) change one prop; Projects and Experience change the `sub` computation too.

---

### `components/shell/LiveRegion.tsx`

**Analog:** `components/frame/SkipLink.tsx` (lines 1-10), the smallest shell component:
```tsx
import { site } from "@/content/site";
import styles from "./frame.module.css";

export function SkipLink() {
  return (
    <a href="#content" className={`t-label ${styles.skip}`}>
      {site.skipLabel}
    </a>
  );
}
```

Apply: `"use client"`, one `<p aria-live="polite" aria-atomic="true" className="visually-hidden">` (global class from `styles/base.css:60-67`, no module CSS needed). Text comes from the snapshot's landed index through `liveRegionText()` and is empty on first load (UI-SPEC "Initial load: nothing is announced").

---

### `components/shell/DebugOverlay.tsx` (+ `debug.module.css`)

**Analog:** `Footer.tsx` (label row with `tnum`) and `frame.module.css:16-28` (fixed chrome with token values):
```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  height: var(--frame-top);
  padding: 0 var(--grid-margin) var(--space-md);
  ...
  border-bottom: 1px solid var(--color-hair);
  background: var(--color-ground);
}
```

Apply UI-SPEC "Debug Overlay": `position: fixed; top: calc(var(--frame-top) + var(--space-md)); right: var(--space-lg); z-index: 40;` `--color-ground` background, `1px solid var(--color-hair)`, `t-label tnum`, names in `c-dim`, `aria-hidden="true"`, `pointer-events: none`. Field names from `content/site.ts` (`site.debug.*`). Raw hex is forbidden outside tokens (`tests/css-guard.test.ts:35-37`). Default export is acceptable only if `import()` needs it; otherwise named export + `.then((m) => m.DebugOverlay)`.

---

### `content/site.ts` and `content/types.ts`

**Analog:** the `footer` group, `content/site.ts:12-16`, typed by `content/types.ts:32-36`:
```ts
footer: {
  nextPrefix: "Next, ",
  backToStart: "Back to the start",
  counterSeparator: " / ",
},
```
```ts
readonly footer: {
  readonly nextPrefix: string;
  readonly backToStart: string;
  readonly counterSeparator: string;
};
```

Apply: add `liveRegion: { template: "{name}, page {n} of {total}" }` (or fragments like the footer group) and `debug: { index: "Index", phase: "Phase", source: "Source", wheel: "Wheel", accum: "Accum", gesture: "Gesture", edge: "Edge", swipe: "Swipe", motion: "Motion" }`. The object is `as const satisfies Site` (line 22), so `Site` in `content/types.ts` must gain the matching readonly fields in the same task or typecheck fails. `tests/content.test.ts` may assert the shape; check it when editing.

---

### `app/layout.tsx` (inline `data-js` script)

**Analog:** itself, lines 8-13:
```tsx
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>{children}</body>
    </html>
  );
}
```

Apply (RESEARCH Code Examples "html[data-js] before paint"): add `suppressHydrationWarning` on `<html>` and `<head><script dangerouslySetInnerHTML={{ __html: JS_FLAG_SCRIPT }} /></head>`, the string kept as a constant in `lib/js-flag.ts` (code, not copy). CSP already allows `'unsafe-inline'` (`tests/vercel-config.test.ts` covers headers; no change).

---

### `components/shell/shell.module.css` (track rules)

**Analog:** itself. The hook is already documented at lines 18-21:
```css
/* D-06: with or without JS only the current page shows. Phase 4 overrides this one rule under html[data-js]. */
.page[inert] {
  display: none;
}
```
and the phone block at lines 27-40 (`@media (max-width: 820px)`, document scroll).

Apply: add `:global(html[data-js]) .track { display: flex; width: calc(6 * 100vw); transform: translate3d(calc(var(--track-index) * -100vw), 0, 0); }`, `:global(html[data-js]) .page { flex: 0 0 100vw; }`, `:global(html[data-js]) .page[inert] { display: block; }` (keep the JS-off rule untouched), desktop `overscroll-behavior-y: contain`, and the phone collapse class applied only after landing. The `:global(...)` form follows `.page > :global(.grid)` (line 23). Only `transform`/`opacity` animate.

---

### `styles/tokens.css`, `styles/base.css`

**Analog:** tokens motion block, `styles/tokens.css:50-55`, and the reduced-motion override at 79-83:
```css
--dur-page: 600ms;
--dur-letters: 600ms;
--dur-ui: 150ms;
--stagger: 30ms;
--ease-page: cubic-bezier(0.77, 0, 0.18, 1);
--ease-ui: cubic-bezier(0.16, 1, 0.3, 1);
```
Add `--ease-retarget: cubic-bezier(0.3, 0.6, 0.18, 1);` directly after `--ease-page`.

`base.css` anchors: `.t-label` at lines 68-75 (label letter-gap fix: scoped `text-rendering: geometricPrecision` and/or `font-kerning: normal`, never touching `--adv-*`); `:focus-visible` at 47-50 and `main:focus { outline: none; }` at 51-54 (template for the title-heading rule `[id^="title-"]:focus:not(:focus-visible) { outline: none }` plus the visually-hidden-heading exemption); `html` at 8-12 for `overflow-x: clip; overscroll-behavior-x: none` and the `touch-action: pan-y pinch-zoom` under `html[data-js]` at ≤820px / coarse pointer (RESEARCH Pitfall 7; UI-SPEC says "on the track", RESEARCH overrides to `html` because touch-action is read from where the touch starts). Comment style: one-line `/* reason (ID) */` above the rule, as on lines 1 and 51.

---

### `playwright.config.ts`

**Analog:** the conditional spread at lines 36-44 and the per-project `testMatch` at 29-34:
```ts
{
  name: "chromium-nojs",
  use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
  testMatch: /routes\.spec\.ts/,
},
...(process.env.VISUAL === "1"
  ? [{ name: "visual", use: { ...devices["Desktop Chrome"] }, testMatch: /visual\.spec\.ts/ }]
  : []),
```

Apply: `...(process.env.ALL_BROWSERS === "1" ? [firefox, webkit projects with testMatch: /pager-.*\.spec\.ts/] : [])`; a `chromium-touch` project (`hasTouch: true`, 390x844, `testMatch: /pager-swipe\.spec\.ts/`); a `chromium-reduced` project with `reducedMotion: "reduce"` for the pager specs. Remove the comment at line 22 ("Firefox and WebKit projects arrive in Phase 4"). Keep `chromium-nojs` matching `routes.spec.ts` only, and keep `chromium` ignoring visual.

---

### `tests/pager-state.test.ts`

**Analog:** `tests/sections.test.ts` (lines 1-91): one `describe` per exported function, plain `it` names stating the behaviour, `@/` imports, no setup:
```ts
import { describe, expect, it } from "vitest";
import { sections } from "@/content/site";
import { counterLabel, headerLabel, indexOfSlug, ... } from "@/lib/sections";

describe("indexOfSlug", () => {
  it("puts index first and say-hi last", () => {
    expect(indexOfSlug("index")).toBe(0);
    expect(indexOfSlug("say-hi")).toBe(5);
  });
});
...
describe("sectionBySlug", () => {
  it("throws on an unknown slug", () => {
    expect(() => sectionBySlug("x" as Slug)).toThrow("unknown section: x");
  });
});
```
Also add `indexOfRoute` and `liveRegionText` cases to `tests/sections.test.ts` itself (unknown path → null; "Projects, page 3 of 6").

### `tests/pager-wheel.test.ts`, `pager-keys.test.ts`, `pager-swipe.test.ts`

**Analog:** `tests/display-fit.test.ts` (lines 1-34): import the constants alongside the function and assert through them; table-driven `it.each`:
```ts
import { DEFAULT_WORD_EM, DISPLAY_WORD_EM, displayFitStyle } from "@/lib/display-fit";

describe("displayFitStyle", () => {
  it.each([
    ["Achievements", 4.53],
    ["Resume (PDF)", 4.49],
  ])("%s -> %d em", (word, em) => {
    expect(displayFitStyle(word)).toEqual({ "--word-em": em });
  });
```
Apply: `it.each(loadTraces())("%s pages %i times", ...)` for wheel traces; `it.each` key tables for `keyIntent` (WR-04, modifiers, text targets).

**Trace files (`tests/traces/*.json`, no analog):** format from RESEARCH Wave 0: `{ device, browser, os, samples: [{ t, dx, dy, mode, wheelDeltaY? }], expectPages }`. Load with `readFileSync(join(process.cwd(), "tests/traces", f))`, not `import.meta.url` (jsdom breaks it: comment at `tests/css-guard.test.ts:14`).

### `tests/pager-shell.test.tsx` (and edits to `tests/shell.test.tsx`)

**Analog:** `tests/shell.test.tsx` (lines 1-129): `afterEach(cleanup)`, `ALL_SLUGS` constant, `sectionsOf(container)` helper, `describe.each(ALL_SLUGS)`:
```ts
function sectionsOf(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("main > section"));
}
...
describe.each(ALL_SLUGS)("Shell current=%s", (slug) => {
  it("renders the six sections in order with only its own page live", () => {
    const { container } = render(<Shell current={slug} />);
    const sections = sectionsOf(container);
    expect(sections.map((s) => s.id)).toEqual(SECTION_IDS);
    const live = sections.filter((s) => !s.hasAttribute("inert"));
    expect(live.map((s) => s.id)).toEqual([`page-${slug}`]);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
```
Apply: render `Shell` with an injected stub animator (resolves on demand, RESEARCH Pitfall 12), dispatch intents through the controller, assert exactly one non-inert section and one h1 per snapshot, `aria-current` moves, live-region text. Required edit in `tests/shell.test.tsx:61-77`: the binding order list gains the live region `<p>` after `"footer"` (e.g. `"p"`).

---

### `e2e/helpers/pager.ts` and `e2e/pager-*.spec.ts`

**Analogs:** `e2e/routes.spec.ts:9` and `e2e/layout.spec.ts:47-53` (helpers to move into `e2e/helpers/pager.ts`):
```ts
const pathname = (page: Page) => new URL(page.url()).pathname;

async function open(page: Page, route: string, viewport: Viewport) {
  await page.setViewportSize(viewport);
  await page.goto(route);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}
```
Spec structure (`e2e/routes.spec.ts:1-3, 57-68`): header comment with requirement IDs, import data from `../content/site` (relative, no `@/` in e2e), loop over `sections` to generate tests, `expect.poll` for async URL state:
```ts
// A11Y-05 / LTR-01 / CONT-01 / D-07
import { test, expect, type Page } from "@playwright/test";
import { sections, site } from "../content/site";

for (const l of sections.filter((s) => s.letter !== null)) {
  test(`hero letter ${l.number} ${l.name} reaches ${l.route}`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: `${l.number} ${l.name}`, exact: true }).click();
    await expect.poll(() => pathname(page)).toBe(l.route);
    await expect(page.locator(`#page-${l.slug}`)).toBeVisible();
  });
}
```
- `pager-keys.spec.ts`: keyboard loop and `document.activeElement` probes from `e2e/focus.spec.ts:20-29, 37-55` (`page.keyboard.press`, `expect.poll(() => page.evaluate(() => document.activeElement?.id))`).
- `pager-a11y.spec.ts`: AxeBuilder block from `e2e/a11y.spec.ts:11-21` with the same tag list `["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]`, but page into each section first.
- `pager-overflow.spec.ts`: section scroll metrics from `e2e/layout.spec.ts:87-95` (`scrollHeight` vs `clientHeight` via `page.evaluate`); 200% zoom = `viewport { width: 683, height: 384 }, deviceScaleFactor: 2` (RESEARCH Pitfall 3).
- `waitForLanded()` waits for `main[data-phase="idle"]` (no fixed sleeps except the >160ms inter-gesture gap).
- `pager-swipe.spec.ts` and `pager-motion.spec.ts`: no analog; use CDP `Input.dispatchTouchEvent` and an in-page rAF sampler of `new DOMMatrixReadOnly(getComputedStyle(main).transform).m41` (RESEARCH Validation map).

## Shared Patterns

### Client-component allowlist (first task that adds `"use client"`)
**Source:** `tests/source-guard.test.ts:9, 30-34, 45-47`
```ts
const USE_CLIENT = /["']use client["']/;
...
it("has no client components", () => {
  expect(offenders(USE_CLIENT)).toEqual([]);
});
```
**Apply to:** the same task that adds the first client file. Replace with `expect([...offenders(USE_CLIENT)].sort()).toEqual([...CLIENT_ALLOWLIST].sort())` where the list holds exactly the new client files (`components/shell/PagerProvider.tsx`, `PageSection.tsx`, `LiveRegion.tsx`, `DebugOverlay.tsx`, `components/frame/Header.tsx`, `Footer.tsx`, `components/letters/LetterNav.tsx`, `components/pages/Heading.tsx`). Paths are joined with `node:path` `join(dir, f)` (line 19), so compare with the same form. The literal-attribute guard (line 8) still applies: no `aria-label="..."` literals in new components.

### No literals in components
**Source:** `content/site.ts` + `components/frame/SkipLink.tsx:7` (`{site.skipLabel}`), `LetterNav.tsx:18` (`aria-label={site.navLabel}`)
**Apply to:** LiveRegion, DebugOverlay, any new `aria-*` text. Strings live in `content/site.ts`, typed in `content/types.ts`.

### Inline CSS custom property from server state
**Source:** `components/frame/Footer.tsx:1, 12, 19`
```tsx
import type { CSSProperties } from "react";
const barStyle = { "--page-index": indexOfSlug(current) } as CSSProperties;
<span aria-hidden="true" className={styles.bar} style={barStyle} />
```
**Apply to:** `--track-index` on `main` (Track), the bar, and the inline `--track-index` set by the controller on landing.

### CSS conventions
**Source:** `styles/base.css:1` (header comment), `components/frame/frame.module.css:80-99` (media blocks at the end, doubled class for specificity at line 82), `tests/css-guard.test.ts` (no raw hex outside tokens, no `font` shorthand, only `var(--font-sans)`).
**Apply to:** all CSS edits. Only `transform`/`opacity` animate; values from tokens; `:global(html[data-js])` prefix for JS-on rules inside modules.

### Phase 3 tests that assume JS-off single-page visibility
With JS on, all six sections render side by side (offscreen, `inert`). These must change in the task that removes `display: none` under `html[data-js]`:
- `e2e/routes.spec.ts:16` — `main#content > section:visible` count of 1 → assert `main#content > section:not([inert])` count of 1 (the `chromium-nojs` project still runs this file, so the selector must hold for both).
- `e2e/layout.spec.ts:63-70` — overflow offenders: filter out elements inside `[inert]` (`!el.closest("[inert]")`); offscreen pages lie past `innerWidth`.
- `e2e/layout.spec.ts:105-118` — accent-at-rest scan: same `[inert]` exclusion (Achievements' "75/75" would otherwise show on other routes).
- `e2e/layout.spec.ts:130-139` — `img:visible` count: count only images outside `[inert]` or inside `#page-{slug}`.
- `tests/frame.test.tsx:76-83` — bar assertion on `--page-index`; update if the property is renamed, and render Header/Footer inside the provider (or keep them working without one by falling back to the `current` prop).
- `tests/heading.test.tsx`, `tests/pages-*.test.tsx` (`pages-projects.test.tsx:8-12` is the helper pattern) — `headingLevel` prop replaced by a `PageLevel` provider wrapper in the render helper.
- `e2e/a11y.spec.ts` — extend (or add `pager-a11y.spec.ts`) to page into each section before axe.

### Commit/test gate per task
`pnpm test` (Vitest) plus the touched `e2e/pager-*.spec.ts` on Chromium; `pnpm build && pnpm measure:js -- --max-gzip-kb 150` for anything that adds client code (package.json scripts lines 8-18).

## No Analog Found

| File | Role | Data Flow | Reason / Use instead |
|------|------|-----------|----------------------|
| `lib/pager/controller.ts` | store | event-driven | No state store exists. RESEARCH "Primary recommendation", Pattern 6, Pitfall 12 (inject animator/history/focus/clock) |
| `lib/pager/animator.ts` | service | event-driven | No motion code exists. RESEARCH Code Examples "WAAPI retarget from the current position" |
| `lib/pager/signals.ts` | utility | pub-sub | No emitter exists. UI-SPEC "slide started (from, to, source) / landed (index)" |
| `lib/pager/input/edge.ts` | utility | DOM read | RESEARCH Pitfall 3 (current page if `overflow-y: auto` and overflowing, else `document.scrollingElement`) |
| `lib/pager/history.ts` (DOM side) | service | request-response | RESEARCH Pattern 2 + Pitfalls 1-2 (route lookup reuses `lib/sections.ts`) |
| `components/shell/PagerProvider.tsx` | provider | event-driven | First client component; RESEARCH Patterns 1-2, Code Examples (wheel wiring, reduced motion) |
| `tests/traces/*.json` | fixture | file-I/O | RESEARCH Wave 0 format and Open Question 4 (record via `?debug` `window.__pagerTrace`) |
| `e2e/pager-swipe.spec.ts` | e2e | — | No touch tests; CDP `Input.dispatchTouchEvent` at 390x844 with `hasTouch` |
| `e2e/pager-motion.spec.ts` | e2e | — | No motion tests; rAF sampling of track m41, ≤4px jump, no reversal (UI-SPEC Verification Hooks) |

## Metadata

**Analog search scope:** `app/`, `components/`, `content/`, `lib/`, `styles/`, `tests/`, `e2e/`, `playwright.config.ts`, `vitest.config.mts`, `package.json`
**Files scanned:** 45
**Pattern extraction date:** 2026-11-09
