# Architecture Research

**Domain:** Single-experience personal portfolio. Six full-screen horizontal pages, a fixed letter-navigation layer, a Next.js App Router static export on GitHub Pages
**Researched:** 2026-11-06
**Confidence:** MEDIUM-HIGH. The Next.js routing and export facts are HIGH (checked against the Next.js source and docs via Context7). The gesture and FLIP patterns are MEDIUM (well-established patterns, not tied to any library). Safari trackpad back-swipe behaviour is LOW.

Versions current at research time: `next` 16.4.5, `react` 19.3.1 (`npm view`).

---

## Standard Architecture

### The core decision: one persistent shell, six real URLs

**Recommendation:** use **one route per page for URLs and metadata, plus one persistent client shell that never remounts.** All six pages are server-rendered into every exported HTML file. After hydration, page changes call `history.pushState` directly instead of going through the Next router.

| Option | Deep links | Back button | Horizontal transition kept | No-JS works | Verdict |
|---|---|---|---|---|---|
| Single route `/` with `#hash` or no URL | Weak (`/#projects`) | Only with extra work | Yes | Partly | Reject: links don't look shareable, and metadata can't differ per page |
| One route per page using `<Link>`/`router.push` | Yes | Yes | **No.** The page segment swaps, so the strip has to be faked | Yes | Reject |
| **Six exported routes + persistent shell in a layout + native `pushState`** | Yes (`/projects/`) | Yes (via `popstate`) | Yes | **Yes. Each URL is a full HTML page showing that section** | **Use** |

Verified facts behind this (HIGH):
- Next.js App Router patches `window.history.pushState`/`replaceState` so that `usePathname()` stays in sync with URLs you push yourself. It copies Next's internal tree state into the new history entry, which means Back/Forward restores the same tree instead of triggering a fetch (source: `packages/next/src/client/components/app-router.tsx`; documented as "Using the native History API").
- `output: 'export'` supports dynamic routes only with `generateStaticParams()` and without `dynamicParams: true`. Set `dynamicParams = false` and generate the five section slugs from the content registry.
- `trailingSlash: true` emits `projects/index.html`, which GitHub Pages serves at `/projects/` with no server rewrites. (Rewrites, redirects and headers are all unsupported in export.)
- `next/image` needs `images.unoptimized = true` under export.

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│  BUILD TIME (Server Components only, zero client JS)                     │
│  content/*.ts (typed data) ──► sections registry ──► generateStaticParams │
│                                     │                  └─► 6 HTML files   │
│                                     ▼                                     │
│  app/(site)/layout.tsx  renders <Shell> with all six <Page> bodies inside │
├──────────────────────────────────────────────────────────────────────────┤
│  RUNTIME: client islands (the only JS beyond the Next/React runtime)      │
│                                                                           │
│   ┌─────────────────── PagerProvider (state + URL sync) ───────────────┐  │
│   │  state: { index, from, source, phase }   actions: goTo/step         │  │
│   └──▲──────────────▲──────────────────────────┬───────────┬──────────┘  │
│      │ intents      │ intents                  │ index     │ index       │
│   ┌──┴───────────┐ ┌┴────────────┐   ┌─────────▼──┐  ┌─────▼──────────┐   │
│   │ InputLayer   │ │ LetterNav   │   │ Track      │  │ FooterPager    │   │
│   │ wheel/key/   │ │ (fixed layer│   │ transform, │  │ 00/05, Next,   │   │
│   │ touch, pure  │ │ FLIP hero ↔ │   │ inert,     │  │ progress bar   │   │
│   │ gesture FSM  │ │ rail, links)│   │ focus      │  └────────────────┘   │
│   └──────────────┘ └─────────────┘   └─────┬──────┘                       │
│                                            │ isActive per page            │
│                          ┌─────────────────┼───────────────────┐          │
│                          ▼                 ▼                   ▼          │
│                   ┌────────────┐   ┌──────────────┐   ┌────────────────┐  │
│                   │ JudgeDots  │   │ static page  │   │ DepthMap       │  │
│                   │ island     │   │ content (RSC)│   │ lazy WebGL,    │  │
│                   │ (75 dots)  │   │              │   │ img fallback   │  │
│                   └────────────┘   └──────────────┘   └────────────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│  STYLE LAYER: tokens.css (colour, type, grid, motion), read by CSS and    │
│  by JS (getComputedStyle), so reduced motion has a single switch          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Kind | Owns | Talks to |
|---|---|---|---|
| `content/sections.ts` (registry) | data | Order, slug, letter, caption number, title for the 6 sections. **The single source of truth** for routes, nav, pager, Home/End, titles | Imported by everything; nothing writes to it |
| `content/{achievements,projects,experience,about,contact}.ts` | data | All copy as typed objects (`satisfies` schema types) | Read by page Server Components only |
| `app/(site)/layout.tsx` | RSC | Renders `<Shell>` with the six page bodies | Shell |
| `app/(site)/page.tsx`, `app/(site)/[section]/page.tsx` | RSC | **Only** `generateMetadata` (title, description, canonical, OG); render `null` | none |
| `Shell` / `PagerProvider` | client | Paging state machine, URL ↔ index sync, `popstate`, `document.title`, live region | Track, LetterNav, InputLayer, FooterPager, islands (via context) |
| `InputLayer` (`useInputs` + pure `wheelGesture`, `swipeGesture`, `keymap`) | client | Turns raw events into `step()/goTo()` intents; inertia filtering | PagerProvider (writes intents only) |
| `Track` | client (thin) | `transform` on the strip, `inert` on inactive pages, focus hand-off after settle | PagerProvider (reads index, reports `settled`) |
| `Page` wrapper (×6) | RSC body in a client frame | `<section aria-labelledby>`, heading with `tabIndex={-1}` | Track (receives `inert`) |
| `LetterNav` | client | The five letter `<a href>`s, two CSS layout modes (hero/rail), FLIP between them, `aria-current` | PagerProvider (reads index, dispatches `goTo` on click) |
| `FooterPager` | client (tiny) | `00 / 05` counter, Next button, progress bar (`scaleX`) | PagerProvider |
| `JudgeDots` | client island | Time-based 75-dot run, plays on first activation, final state for reduced motion and no JS | PagerProvider (`isActive(achievements)`) |
| `DepthMap` | client island, dynamically imported | WebGL canvas over a static greyscale `<img>` fallback | PagerProvider (`isNear` to load, `isActive` to run) |
| `styles/tokens.css` | CSS | Colours, type scale, 12-col grid, motion durations and easings, reduced-motion overrides | All CSS; JS reads motion tokens |

---

## Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # <html>, next/font/local, tokens import, skip link
│   ├── not-found.tsx              # exported as 404.html; deliberately outside the shell
│   └── (site)/
│       ├── layout.tsx             # renders <Shell> with all six pages (persists across URLs)
│       ├── page.tsx               # "/" metadata only, returns null
│       └── [section]/page.tsx     # generateStaticParams from registry, dynamicParams=false, metadata only
├── content/
│   ├── schema.ts                  # Section, Achievement, Project, Role, ContactLink types
│   ├── sections.ts                # registry: index(''), achievements(Y,01), projects(A,02), experience(H,03), about(Y,04), contact(A,05)
│   ├── achievements.ts            # facts only (CCC 75/75, four first places)
│   ├── projects.ts                # Facturo, Atlantis, CRC problems, robot firmware, Showdown AI
│   ├── experience.ts              # work[], involvement[]
│   ├── about.ts                   # "Two habits"
│   └── contact.ts                 # email, LinkedIn, GitHub
├── features/
│   ├── pager/
│   │   ├── PagerProvider.tsx      # context + reducer + URL sync
│   │   ├── pagerReducer.ts        # PURE (state, action) => state, unit-tested
│   │   ├── Track.tsx              # strip transform, inert, focus hand-off
│   │   ├── FooterPager.tsx
│   │   └── input/
│   │       ├── wheelGesture.ts    # PURE FSM (fsm, {dx,dy,mode,t}) => {fsm, intent?}, trace-tested
│   │       ├── swipeGesture.ts    # PURE (start, end) => intent?
│   │       ├── keymap.ts          # PURE key event => intent? (ignores editable/modifiers)
│   │       └── useInputs.ts       # attaches listeners, feeds the pure functions
│   ├── letter-nav/
│   │   ├── LetterNav.tsx          # five <a>, data-mode="hero"|"rail"
│   │   ├── flip.ts                # measure First/Last, WAAPI invert-and-play
│   │   └── letter-nav.module.css  # both resting layouts are pure CSS
│   ├── pages/                     # Server Components unless noted
│   │   ├── index/HeroPage.tsx
│   │   ├── achievements/AchievementsPage.tsx, JudgeDots.tsx (client)
│   │   ├── projects/ProjectsPage.tsx
│   │   ├── experience/ExperiencePage.tsx
│   │   ├── about/AboutPage.tsx, DepthMap.tsx (client, lazy)
│   │   └── contact/ContactPage.tsx
│   └── motion/
│       ├── useReducedMotion.ts    # useSyncExternalStore(matchMedia)
│       └── motionTokens.ts        # reads --dur-* / --ease-* from computed style
├── styles/
│   ├── tokens.css                 # the design system as custom properties
│   ├── grid.css                   # 12-col grid (or a Tailwind v4 @theme mapping these vars)
│   └── global.css                 # html/body lockdown: overflow: clip, overscroll-behavior: none
public/
├── CNAME                          # not used: Vercel hosts the site (no CNAME file)
├── .nojekyll                      # otherwise GitHub Pages' Jekyll drops _next/
├── fonts/                         # self-hosted variable font
└── media/                         # portrait, depth map (fallback image and texture)
```

### Structure Rationale

- **`content/` is separate from `features/`** so Yahya can rewrite copy by editing `.ts` data files. The TypeScript compiler catches any missing field, and no component ever needs to be opened. Components get typed props and never hardcode copy.
- **`features/pager/input/*.ts` are pure functions.** Gesture filtering is where sites like this break (trackpad inertia, notched wheels, Magic Mouse). Pure FSMs with timestamped inputs can be unit-tested against recorded event traces without a browser.
- **The `(site)` route group** keeps the shell around all six URLs while letting the 404 page render without it.
- **Page bodies are Server Components.** Only the pager, the nav and the two islands ship component JS.

---

## Architectural Patterns

### Pattern 1: URL as a projection of pager state (pushState, not the router)

**What:** The reducer holds `index`. A post-commit effect writes the URL, and `popstate` dispatches `goTo(i, 'history')` without pushing again. The initial index comes from `usePathname()`. That value is correct during prerender for every exported route, so the server HTML already has the right transform and `inert` and nothing flashes.
**History policy (to confirm with Yahya):** call `pushState` for every committed page change, so Back goes to the previous page. That matches "these are pages", and six pages keep the history bounded. Call `replaceState` instead when a change lands within ~400 ms of the previous one (key mashing) so the history isn't flooded.
**Trade-offs:** `generateMetadata` only applies on full loads, so set `document.title` from the registry on each change. Never move between sections with `<Link>`/`router.push`. It would work because the layout persists, but it does an RSC round-trip for nothing.

```ts
// PagerProvider.tsx (sketch)
const pathname = usePathname();                      // '/projects/'
const initial = indexFromPath(pathname, SECTIONS);   // pure, from registry
const [state, dispatch] = useReducer(pagerReducer, initialState(initial));

useEffect(() => {                                    // URL follows state
  if (state.source === 'history' || state.source === 'init') return;
  const url = pathFor(state.index, SECTIONS);        // '/' or '/projects/'
  window.history[state.coalesce ? 'replaceState' : 'pushState']({ i: state.index }, '', url);
  document.title = titleFor(state.index, SECTIONS);
}, [state.index]);

useEffect(() => {                                    // Back / Forward
  const onPop = () => dispatch({ type: 'goTo', index: indexFromPath(location.pathname, SECTIONS), source: 'history', now: performance.now() });
  addEventListener('popstate', onPop);
  return () => removeEventListener('popstate', onPop);
}, []);
```

### Pattern 2: Paging controller as a small explicit state machine

```ts
type Source = 'init' | 'wheel' | 'key' | 'swipe' | 'link' | 'history';
type PagerState = { index: number; from: number; source: Source; phase: 'idle' | 'animating'; coalesce: boolean; changedAt: number };
type Action =
  | { type: 'goTo'; index: number; source: Source; now: number }
  | { type: 'step'; dir: 1 | -1; source: Source; now: number }
  | { type: 'settled' };
// clamp to [0, SECTIONS.length - 1]; same index => no-op; coalesce = now - changedAt < COALESCE_MS
```

- Intents that arrive while `animating` are dropped. Keyboard is the exception: one queued step is allowed, which feels responsive.
- `source` travels with every change, because focus and history behaviour depend on it.
- React context is enough. Six consumers, one change per ~500 ms. No Zustand or any other store. **Per-frame work never goes through React state.**

### Pattern 3: Wheel inertia filter, "one gesture = one page"

A pure FSM fed by `{dx, dy, deltaMode, t}`:
1. **Normalise:** `deltaMode 1` (lines) ×16, `deltaMode 2` (pages) ×viewport height. Use the dominant axis, so a vertical wheel and a horizontal trackpad swipe both page.
2. **Armed:** accumulate. When `|acc| ≥ TRIGGER` (~40 px), emit `step(sign)` and go to **Locked**.
3. **Locked:** ignore events. Unlock when (a) no wheel event for `QUIET_MS` (~180 ms; inertia tails fire every ~16 ms, so a gap means the gesture ended) **or** (b) a new gesture shows up as |delta| rising sharply after decaying (for example `|d| > lastAbs × 1.6` and `|d| > 8` after ≥3 decaying samples). Rule (b) is the Lethargy.js idea and lets a deliberate second flick register during the inertia tail.
4. Also stay locked while `phase === 'animating'`.

**Trade-offs:** the constants have to be tuned on hardware (Mac trackpad, Magic Mouse, Windows notched wheel, free-spin wheel). Keep them as named constants with recorded-trace unit tests.

### Pattern 4: Classic FLIP for the letters (resting states are pure CSS)

`LetterNav` has `data-mode="hero" | "rail"` (hero when `index === 0`). **Both resting layouts are plain CSS**: hero is giant and spans the 12-column grid; rail is a vertical stack in the left margin. On a mode change:
1. **First:** `getBoundingClientRect()` each letter.
2. Flip `data-mode` synchronously in `useLayoutEffect`.
3. **Last:** measure again.
4. **Invert and play:** `el.animate([{ transform: 'translate(dx,dy) scale(s)' }, { transform: 'none' }], { duration, easing })`, staggered 20–40 ms per letter. Captions fade out going to the rail and back in going to the hero.

Why this shape:
- **Resize needs no JS.** Both resting states are CSS, so a resize, rotation or font swap just reflows. Measurement happens only in flight (~600 ms). If `resize` fires mid-flight, call `animation.finish()` on every running animation. No `ResizeObserver`, no stored coordinates to go stale.
- **Resting text is real `font-size`, never a scaled bitmap**, so it stays crisp in both modes. Use `transform-origin: 0 0` and drop `will-change` after the animation.
- **WAAPI** is native (0 kB), interruptible (`reverse()`/`cancel()`), and awaitable through `.finished`. GSAP or Motion aren't needed.

**Hero fit:** use `font-size: calc(var(--grid-width) / var(--yahya-fit))`, where `--yahya-fit` is the advance width of "YAHYA" in ems for the chosen font, measured once and stored in `tokens.css`. When the font changes (it is still open), only that one token changes. Avoid JS fit-text.
**Font timing:** a FLIP measured before the webfont arrives uses fallback metrics. Use `next/font/local` (preload plus `adjustFontFallback`) and wait for `document.fonts.ready` before the first FLIP.

### Pattern 5: Inactive pages are `inert`; focus moves after settle

- Non-active pages get `inert` (a boolean prop in React 19). That removes them from the tab order, the accessibility tree and hit-testing at once. The server-rendered HTML already has it on the five pages that aren't initial.
- **After** the track settles, call `heading.focus({ preventScroll: true })` on the new page's `h2[tabIndex=-1]` when `source ∈ {link, key, history}`. For `wheel`/`swipe`, move focus only if `document.activeElement` is inside the page that just went inert (otherwise focus silently falls to `<body>`). Style only `:focus-visible`, so pointer users don't see rings from programmatic focus.
- **`preventScroll: true` plus `overflow: clip` are mandatory.** `overflow: hidden` still allows programmatic scrolling, so `focus()` on an off-screen page scrolls the container and offsets the transform layout. `overflow: clip` forbids programmatic scrolling (MDN).
- One polite live region, owned by the shell, outside the pages ("Projects, 2 of 5").
- Landmarks: skip link → `<nav aria-label="Sections">` (LetterNav) → `<main>` (Track) with six `<section aria-labelledby>` → `<footer>` (pager). Letter links carry `aria-label` with the section name ("Y" alone means nothing) and `aria-current="page"`.

### Pattern 6: Inputs never fight native behaviour

- **Keyboard:** ignore events that are `defaultPrevented`, have modifiers (Alt+Left is browser Back), or target editable elements. `ArrowLeft/Right`, `PageUp/Down`, `Home/End` page. `ArrowUp/Down` and `Space`/`Shift+Space` page **only when** the active page can't scroll further in that direction.
- **Inner overflow (phones especially):** each page is its own `overflow-y: auto` container with `overscroll-behavior: contain`. Wheel and keys scroll it to the edge first. Only a *new* gesture at the edge pages.
- **Touch:** `touch-action: pan-y` on pages, so vertical scrolling stays native and horizontal swipes are ours. Commit on `touchend` when `|dx| > 1.2·|dy|` and (`|dx| > 60px` or velocity `> 0.35 px/ms`). A finger-following drag is a later enhancement.
- **Browser back-swipe:** `overscroll-behavior-x: none` on `html, body` stops Chrome's macOS history swipe. Safari's behaviour is uncertain (LOW), so test it on hardware.

### Pattern 7: Time-based, activation-gated animation with one motion switch

- `JudgeDots`: the server renders 75 `<span>`s in their **final** 75/75 state, which is the no-JS and reduced-motion version for free. On the first activation of Achievements, the island resets them and runs a rAF loop on `elapsed = now - start` (not frame counts, so 60 Hz and 120 Hz match). It writes `data-state` and the counter `textContent` through refs, with no React re-renders. It pauses on `visibilitychange` and while the page is inactive.
- **One switch:** `tokens.css` defines `--dur-page`, `--dur-letters`, `--dur-judge`. `@media (prefers-reduced-motion: reduce)` sets them to `0ms`, and the track's slide becomes a short crossfade. `motionTokens.ts` reads them through `getComputedStyle`, so CSS transitions, WAAPI and rAF loops all obey the same query. Every animation has a `duration === 0` jump-to-end path.

### Pattern 8: Lazy WebGL as progressive enhancement

- Always render the static depth-map `<img>` (explicit size, alt text). That is the design without WebGL.
- Load the shader module with `import()` only when the host page is `isNear` (index ±1) **and** there is no reduced motion, no `saveData`, and `getContext('webgl2')` succeeds. Then fade the canvas over the image. Stop the loop when the page is inactive or the tab is hidden.
- Use raw WebGL2 (one full-screen triangle plus a depth texture) or `ogl`. **Not three.js** for a single quad.

---

## Data Flow

### Intent flow (strictly one direction)

```
wheel / key / touch / letter click / Next button / popstate
        │
        ▼
InputLayer, LetterNav, FooterPager ──(intent: step|goTo + source + now)──► pagerReducer (pure)
                                                                               │
                                                          state {index, from, source, phase}
                                                                               │
   ┌─────────────────┬──────────────────┬──────────────────┬───────────────────┴────┐
   ▼                 ▼                  ▼                  ▼                        ▼
URL effect        Track              LetterNav          FooterPager             Islands
push/replace      transform +        hero/rail mode     00/05, progress         isActive → judge run
+ title           inert              → FLIP             scaleX                  isNear → WebGL load
                    │
                    └─ transitionend (or duration+100ms timeout) → dispatch(settled)
                         → focus hand-off + live-region text
```

Rules: inputs only emit intents. Only the reducer changes `index`. Views only read it. The single upward event from a view is `settled`. Nothing reads the DOM to work out the current page.

### Build-time content flow

```
content/schema.ts (types) ◄── satisfies ── content/*.ts (copy, facts)
                                                │
     sections.ts ──► generateStaticParams ──► 6 routes ──► 6 HTML files (each holds all 6 pages)
          │                                                        │
          └──► LetterNav, FooterPager, keymap (Home/End), titles   └──► GitHub Pages
```

### State inventory (keep it this small)

| State | Lives in | Why |
|---|---|---|
| `index`, `from`, `source`, `phase` | `PagerProvider` reducer | The only app state |
| URL | browser history (projection of `index`) | Shareable, Back button |
| reduced motion | `useSyncExternalStore(matchMedia)` | Live toggling |
| wheel FSM | ref in `useInputs` | Per event; must not re-render |
| judge progress, WebGL clock | refs in islands | Per frame |
| "judge already played" | module variable / `sessionStorage` | Not worth context |

---

## Keeping JavaScript small

- **The baseline you can't avoid** is the App Router client runtime plus React 19. It's the largest single cost (on the order of 100 kB gzipped, LOW confidence on the exact figure; measure it in the scaffold phase). Everything else is about keeping first-party code a small fraction of that.
- **Content stays in Server Components.** No hydration logic, though the text also travels once in the inline RSC payload (the App Router price; fine for six pages of text).
- **No animation libraries.** CSS transitions handle the track, WAAPI handles the FLIP, rAF handles the judge. Target: under ~15 kB gzipped of first-party client code, excluding WebGL.
- **WebGL is behind `import()`** and out of the first-load bundle.
- **No client data fetching, no state library, no router navigation.**
- **One self-hosted variable font** through `next/font/local`, Latin subset.
- **A bundle budget check in CI** (`size-limit` or a script over the build output), so a stray import gets caught.

---

## Scaling Considerations

Traffic is irrelevant (static files on a CDN). The pressures that do grow:

| Pressure | What breaks first | Adjustment |
|---|---|---|
| More projects than fit one screen | The Projects page overflows | Inner vertical scroll (Pattern 6), or later a list → detail panel |
| Wanting a 7th section | YAHYA has five letters, so the nav metaphor caps at Index plus five | Treat this as a hard design constraint; new material goes inside existing pages |
| French version | Copy is already data | `content/en`, `content/fr`, a statically generated `[lang]` segment, localized registry titles |
| Per-project deep pages | They don't fit the six-page strip | Real nested routes (`/projects/facturo/`) outside the shell, or a panel within Projects |

---

## Anti-Patterns

### Anti-Pattern 1: Page changes through `<Link>`/`router.push`
**What people do:** navigate between section routes, then animate segment swaps (View Transitions, AnimatePresence).
**Why it's wrong:** the outgoing page unmounts, so the continuous strip becomes a fake one. It also adds RSC fetches and experimental APIs.
**Do this instead:** keep all pages mounted in a persistent shell and use `pushState` (Pattern 1).

### Anti-Pattern 2: Native horizontal scroll-snap as the paging engine
**What people do:** `overflow-x: scroll; scroll-snap-type: x mandatory`.
**Why it's wrong here:** a vertical wheel doesn't scroll horizontally, trackpad inertia can skip pages, keyboard and URL sync have to be rebuilt anyway, and the letter FLIP can't be tied to a precise transition.
**Do this instead:** a transform track with an explicit controller.

### Anti-Pattern 3: JS-positioned letters recomputed on resize
**Why it's wrong:** stale rects, jank on rotation, drift after font swaps, and a lot of code.
**Do this instead:** CSS resting layouts with FLIP only in flight (Pattern 4).

### Anti-Pattern 4: Per-frame React state
**What people do:** `setProgress(n)` from rAF for the dots, or WebGL uniforms in state.
**Why it's wrong:** re-renders through context, at frame rate, reaching the nav and pager.
**Do this instead:** refs and direct DOM writes inside the island.

### Anti-Pattern 5: Copy inside JSX "for now"
**Why it's wrong:** the copy rewrite is a planned later phase, and it would turn into a component refactor.
**Do this instead:** typed `content/*.ts` from day one, with placeholders marked `TODO(copy)`.

### Anti-Pattern 6: `overflow: hidden` + `focus()` without `preventScroll`
**Why it's wrong:** the browser scrolls the clipped container to the focused element, so the strip ends up offset by a page and stops matching the transform.
**Do this instead:** `overflow: clip` plus `focus({ preventScroll: true })`.

### Anti-Pattern 7: Gesture logic inside event listeners
**Why it's wrong:** it can't be tested, and it's where real-device bugs live.
**Do this instead:** pure FSMs in `input/*.ts` with trace tests.

---

## Integration Points

### External Services

| Service | Integration | Notes |
|---|---|---|
| GitHub Pages | Actions: `next build` → upload `out/` → `actions/deploy-pages` | `public/.nojekyll` is required (Jekyll ignores `_next/`). With the custom domain at the root, no `basePath`. **Until the domain exists**, a `user.github.io/portfolio` project page needs `basePath`/`assetPrefix`. Decide before Phase 1 ends, because it affects every asset URL. |
| Custom domain | Vercel Domains (yahya-hallani.dev, apex primary, www 308 to apex) | Domain bought on Vercel; Vercel hosts, no CNAME |
| Fonts | `next/font/local` | Self-hosted per constraint |
| Analytics | None by default | At most a tiny privacy-friendly beacon; anything more breaks the small-JS goal |

### Internal Boundaries

| Boundary | Communication | Notes |
|---|---|---|
| content → pages | typed imports at build time | Pages import only their own content file plus the registry |
| inputs → pager | `dispatch(intent)` only | Inputs never touch layout |
| pager → views | context `{index, from, source, phase, isActive(i), isNear(i)}` | Read-only for views |
| Track → pager | `dispatch({type:'settled'})` on `transitionend`, plus a `duration + 100 ms` timeout fallback | `transitionend` doesn't fire at 0 ms duration or in hidden tabs |
| tokens → JS | `getComputedStyle(document.documentElement)` | One source for durations and easings |

---

## Suggested Build Order

Dependencies run downward. Items marked parallel can overlap.

0. **Gate:** design doc updated to the dark Swiss horizontal direction and approved; `swiss-horizontal-v6.html` copied into `docs/reference/` as the visual spec. (Project constraint: no product code before approval.)
1. **Scaffold + deploy pipeline.** Next 16, strict TypeScript, `output: 'export'`, `trailingSlash: true`, `images.unoptimized`, `.nojekyll`, an Actions deploy, a measured baseline bundle, and the **basePath vs custom domain** decision. *First because:* static-export limits and the Pages URL shape constrain everything, and they are cheap to prove now and expensive to retrofit.
2. **Tokens, type, grid, content schema and registry.** `tokens.css`, the font, the 12-col grid, `schema.ts`, `sections.ts`, placeholder data. *Needs 1.*
3. **Static shell, no JS behaviour.** `(site)` layout, six routes with metadata, all pages server-rendered, the strip positioned from the initial index, inactive pages `inert`, letters as real `href`s in both CSS modes. *Exit test:* with JS disabled, every URL shows the right page and the letters navigate by full page load. *Needs 2.*
4. **Pager core.** Reducer (unit-tested), the track transition, `pushState`/`popstate` sync, `document.title`, settle → focus hand-off, live region, the `overflow: clip` lockdown. First inputs: letter clicks and the Next button. *Needs 3.*
5. **Inputs.** `keymap`, the wheel FSM, swipe, inner-scroll edge rules, trace unit tests, then a hardware tuning pass. *Needs 4. In parallel with 6.*
6. **LetterNav FLIP + FooterPager.** WAAPI FLIP hero↔rail, captions, `aria-current`, accent colour, `00 / 05`, progress bar. *Needs 4.*
7. **Page content.** Hero, Achievements (+ `JudgeDots`), Projects, Experience, About, Say hi, from data files. *Needs 2–3. Can start in parallel with 4–6 because pages are server components that don't depend on the pager; only `JudgeDots` activation needs 4.*
8. **Motion and responsive hardening.** Reduced-motion audit (every animation has a 0 ms path), the phone layout (scaled-down rail, swipe, inner scroll, `dvh`), and Playwright: keyboard paging, Back/Forward, deep-link load, inert/focus assertions, axe, visual snapshots at 320/768/1024/1440. *Needs 5–7.*
9. **Depth map (optional, placement open).** Static image first, then the lazy WebGL island. *Needs 7 and Yahya's placement decision. Last on purpose, so it can't block launch.*
10. **Copy rewrite.** Data files only. *Needs 2; can happen any time after.*

**Research flags:**
- Phase 5 needs **real-device tuning time** (trackpad, Magic Mouse, notched wheel). The thresholds can't be settled by research.
- Phase 1 needs the **domain/basePath decision** made early.
- Phase 9 needs **its own spike**: how to produce the depth map (offline monocular depth estimation of the portrait) and how the shader should look.
- Phases 3, 4, 6 and 7 use standard patterns covered here.

---

## Sources

- Next.js source, `packages/next/src/client/components/app-router.tsx`: pushState/replaceState patching that syncs `usePathname`/`useSearchParams` (via Context7 `/vercel/next.js`). HIGH
- Next.js docs, Static Exports, "Unsupported Features": https://nextjs.org/docs/app/guides/static-exports. HIGH
- Next.js docs, `trailingSlash`: https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash. HIGH
- Next.js docs, `generateStaticParams` / `dynamicParams`: https://nextjs.org/docs/app/api-reference/functions/generate-static-params. HIGH
- npm registry: `next@16.4.5`, `react@19.3.1`, queried 2026-11-06. HIGH
- MDN: `overflow: clip`, `focus({ preventScroll })`, `inert`, `overscroll-behavior`, `Element.animate()`, `WheelEvent.deltaMode`. HIGH (stable platform APIs; from training knowledge, not re-fetched)
- Paul Lewis, "FLIP Your Animations" (aerotwist.com). MEDIUM
- Lethargy.js (github.com/d4nyll/lethargy): detecting new gestures within trackpad inertia. MEDIUM
- Safari trackpad history swipe vs `overscroll-behavior`: unverified. LOW
- App Router baseline bundle size (~100 kB gz): unverified, measure it. LOW

---
*Architecture research for: horizontal-paging single-experience portfolio (Next.js static export)*
*Researched: 2026-11-06*
