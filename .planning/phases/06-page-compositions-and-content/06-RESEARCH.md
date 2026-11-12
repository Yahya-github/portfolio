# Phase 6: Page Compositions and Content - Research

**Researched:** 2026-11-12
**Domain:** Behaviour, real media, decorative devices, a standalone route and phone layouts on an existing Next.js 16 static export (no new runtime libraries)
**Confidence:** HIGH for codebase integration (read from source), MEDIUM for browser-behaviour details marked below

## Summary

Phase 6 adds no runtime dependency. All the work is behaviour, media and layout on top of Phases 3-5. The design is already fixed by 06-UI-SPEC.md (approved) and design doc rev 5, so this research covers **how to build it inside this codebase without breaking its guards, budget and pager contract**. Those constraints are strict and partly enforced by tests: the `tests/source-guard.test.ts` client allowlist, the `tests/motion-guard.test.ts` "no literal durations" rule, the `tests/css-guard.test.ts` "hex only in tokens.css" rule, the 150 kB gzip gate (143.4 kB used on `/` today, measured this session), and the rule that page bodies are server children that never re-render.

The established pattern for lazy behaviour is the cursor's: a **React-free `mount(...)` module, loaded by `import()` from a hook that `PagerProvider` calls, that receives the pager controller and signals and attaches to server-rendered markup through `data-*` attributes**. The walkthrough, spiral controller, margin-name sizer, copy-email and motion toggle should all follow it. Each one becomes its own Turbopack chunk (proven: the cursor chunk is 1.5 kB gzip and is not referenced by any route HTML). State the CSS needs goes on `<html>` data attributes (the `data-js`, `data-cursor` and `data-opening` precedent) or on server-rendered nodes React never re-renders. React-owned props are never mutated.

Three integration traps will break the phase if the planner misses them. (1) `PagerProvider.decodeImages()` sets `loading="eager"` on **every** `<img>` of the target page at slide start, so the 10 walkthrough frames and all colour twins would download on every visit to Projects/Achievements/About unless they are exempted. (2) `/projects/facturo/` sits outside `Shell`, so it has no `PagerProvider`. That means no cursor mount and no pager controller, and `Header` shows "02 Projects" instead of "02.1 Facturo". It needs a small standalone client wrapper and a Header label override. (3) `scripts/measure-js.mjs` only measures `out/index.html`. It has to become per-route plus per-lazy-chunk before the new budget gate (D-08) means anything.

**Primary recommendation:** Run one Wave-1 infrastructure plan first: the media script and manifest, the per-route and per-chunk budget, content types and `content/facturo.ts`, the feature loader hook, the `decodeImages` exemption, the hint/motion html flags and the new tokens. Then one plan per page behaviour. Then the deep-dive route and phone layouts. The five decorative devices come last, in D-05 order, one plan each, and each can be dropped.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Facturo deep-dive page (CONT-04)
- **D-01:** **Standalone page outside the pager.** `/projects/facturo/` is its own route, not a seventh page in the shared track. It keeps the fixed header (and Resume / Say hi links) and the footer style, scrolls vertically, and has a "Back to Projects" link. No `00 / 05` counter, no progress bar, no pager input. The six-page pager, its live region ("page n of 6") and the shared track stay untouched. The Projects "Read the deep dive" link targets it.
- **D-02:** **Editorial scroll layout.** A giant "Facturo" Display title at the top, then four ruled sections on the 12-column grid: Problem, What I built, Result, Links, each with its matching screenshots hard-cropped beside the text. Screenshots are **static** here (greyscale, the walkthrough stays on Projects). Dark Swiss rules still apply: flush left, one dominant element, one Display group, only verified facts, no ornament.
- **D-03:** **Copy is drafted from the verified facts only** (`portfolio-voice-and-facts`: tax-correct invoices, TPS/TVQ, Excel/PDF, supplier payment reconciliation, local vision model with edit-distance snapping and blank uncertain fields, GitHub Actions and PyInstaller release pipeline, SHA-256-verified in-app updates with rollback, 700+ tests, public demo repo). Nothing invented. Yahya rewrites in Phase 7 by editing the data file (same rule as Phase 3 D-11). The page needs its own typed content file under `content/`.

#### Decorative devices scope
- **D-04:** **All five devices are built in Phase 6, as the last plans.** Index grid lines, About quarter rings (22% ink), Experience edge-cropped "03", scrolling margin section names, and the Say hi spiral. Each is decorative and `aria-hidden`, so any can be cut at the end without breaking a success criterion.
- **D-05:** **Build order (last built = first cut):** Index grid lines, Experience "03", About rings, margin section names, Say hi spiral. The static CSS/SVG devices come first; the spiral is heaviest (motion, Pause control, phone band) and is planned last. Each device is its own independently droppable plan.
- **D-06:** The Pause motion control (footer, doc section 5 and round 6) ships with the first motion device and covers the spiral and margin names, under the existing one-motion-rule and reduced-motion handling.

#### JS budget and loading (performance)
- **D-07:** **Lazy per feature.** Initial JS on every route stays under the existing 150 kB gzip gate (143.3 kB on `/` after Phase 5, about 6.7 kB left). The Facturo walkthrough, the spiral, the margin names and copy-email load by dynamic import only when their page is first visited or near. Previews and hover colour are CSS-first with a small hook; the cursor stays lazy as in Phase 5.
- **D-08:** **Gate shape: initial JS 150 kB plus a per-chunk cap.** Keep 150 kB gzip for initial scripts on every route and add a cap on each lazy chunk of about 12 kB gzip (walkthrough, spiral, margin names, copy-email), checked by `pnpm measure:js` in CI so no single feature creeps. The exact cap value is Claude's call within that intent.
- **D-09:** **Images are pre-built WebP, committed.** A one-time, dev-only script (sharp) converts every grey and colour file in `docs/material/` to sized WebP in `public/`. Pages use plain `<img>` / `<picture>` with explicit `width` and `height`, lazy below the fold. No `next/image` optimiser (+5.7 kB JS), no runtime image code. Originals stay in `docs/material/`. The colour twins (Achievements preview, Facturo walkthrough colour state, About portrait, MAME preview) load on demand.

#### Phone layouts and landscape hint (EXP-02)
- **D-10:** **The landscape hint is a static Label line on the Index only**, shown by CSS media query for portrait plus coarse pointer (`orientation: portrait` and `pointer: coarse`), reading along the lines of "Landscape shows the full posters". No JavaScript, no storage, no flash; it hides itself in landscape, never covers content and never blocks. It does not compete with the Phase 5 footer "Swipe sideways" hint, which keeps working unchanged. The string lives in `content/`.
- **D-11:** Phone portrait layouts follow the intents in design doc section 7 for each page. Touch behaviour follows the doc: Achievements thumbnails inline under each line in greyscale, MAME preview as an inline greyscale thumbnail, a tap on the Facturo frame holds and shows colour (a second tap releases), a tap toggles the About portrait and Experience marks to colour.

### Claude's Discretion
- Exact per-chunk byte cap, chunk boundaries and how pages request their lazy modules, within D-07/D-08.
- WebP sizes and quality per image, and the script's location and naming, within D-09.
- Whether the Facturo deep-dive page reuses the existing header/footer components with variants or gets lean siblings.
- Visual regression baselines for the new states and routes (1440x900, 1366x768, 390x844, plus 320 for phones).
- Atlantis and robot rows stay text-only; missing Atlantis screenshots and a physical robot photo are not blockers (Phase 8 and Yahya's material).
- Resume and contact reachability from every page (CONT-08): the fixed header already carries "Resume (PDF)" and "Say hi" on every route; plans verify it on the new Facturo page too.

### Deferred Ideas (OUT OF SCOPE)
None. Discussion stayed within phase scope. (Atlantis screenshots and the physical robot photo remain open material items for Yahya; Phase 8 covers the playable game and the 3D model.)

Also out of scope (CONTEXT domain): final copy in Yahya's voice, About text rewrite, per-page SEO, share card, favicon, 404 (Phase 7); playable Atlantis and the rotatable robot model (Phase 8).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSGN-03 | Six distinct compositions | Base layouts exist (Phase 3). Add an e2e layout-signature test (see Validation) next to the visual baselines |
| DSGN-05 | Greyscale media, colour twins on hover/tap | Pre-converted WebP files (Pattern 5). Twin loading rules (Pitfall 1, 2). No CSS `filter` |
| CONT-02 | 75/75 CCC in the one list | Content already in `content/achievements.ts`. The CCC line becomes `<div tabindex="0" data-cursor-snap>` with a text-only preview |
| CONT-03 | Facturo flagship, five rows, MAME preview | `ProjectsPage.tsx` rows exist. Add the MAME mark and preview figure, plus the "Read the deep dive" link |
| CONT-04 | Facturo deep dive | New route `app/projects/facturo/page.tsx` outside `Shell` (Pattern 3) |
| CONT-05 | Work and Involvement | Exists. Add marks (CONT-12) and phone layout |
| CONT-07 | Email, LinkedIn, GitHub, Resume | Exists in `content/say-hi.ts`. Add the lazy copy-email module (Pattern 6) |
| CONT-08 | Resume and contact from every page | `Header` carries both. Verify on `/projects/facturo/` with an e2e test |
| CONT-10 | Achievements previews | CSS-first reveal, `<picture>` colour source, nudge plus quiet-after-blur (Pattern 4) |
| CONT-11 | Facturo walkthrough | Lazy React-free mount with a pure `hold` derivation (Pattern 2), ported from v7 lines 791-889 with its documented bug fixes |
| CONT-12 | Organisation marks | Stacked mono and colour `<img alt="">`. Tap toggle through a delegated listener. Sources in `docs/material/logos/*-mark{,-mono}.*` |
| EXP-02 | Phone portrait layouts and landscape hint | CSS-only hint (D-10). Per-page `@media (max-width: 820px)` blocks. 320x568 baselines |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Next.js 16.4 App Router, React 19.3, TS 6.0, `output: 'export'`, `trailingSlash: true`, Vercel. Headers (CSP) live in `vercel.json`. [VERIFIED: next.config.ts, vercel.json]
- CSS Modules plus `styles/tokens.css`. **No Tailwind.** 12-column grid. [VERIFIED: CLAUDE.md]
- **No gesture or smooth-scroll library, no animation library.** Motion uses transform and opacity only.
- Self-host fonts and media; no hotlinked assets (DEP-02). The CSP is `img-src 'self' data:`, so any external image breaks. [VERIFIED: vercel.json]
- Only verified facts (the `portfolio-voice-and-facts` skill). No em dashes, no sales words.
- WCAG contrast, keyboard access, reduced motion.
- Testing: Vitest (jsdom) for logic; Playwright on built `out/`; axe; visual baselines only inside `mcr.microsoft.com/playwright:v1.65.0-noble`.
- Lint/format: ESLint 10 flat config (`eslint-config-next` 16.4), Prettier 3. CI job names `lint`, `typecheck`, `unit`, `e2e` must never be renamed.
- GSD workflow: work goes through `/gsd-execute-phase`. Commits carry no Claude co-author trailer (user memory).
- Global rules: files under 800 lines, functions under 50 lines, immutable data, no `console.log`, 80% coverage target for new logic.

**Guards enforced by tests (a plan that ignores them fails `unit`):** [VERIFIED: tests/*.test.ts]
| Guard | Rule | Phase 6 consequence |
|-------|------|---------------------|
| `source-guard` CLIENT_ALLOWLIST | Exact list of `"use client"` files | Every new client component (e.g. `PortraitToggle`, the deep-dive client wrapper) must be added to the list in the same plan. Hooks or `.ts` modules imported by client files do **not** need the directive (precedent: `usePagerInput.ts`, `useHint.ts`) |
| `source-guard` literal a11y | No `alt="x"`, `aria-label="x"`, `title="x"` literals in `app/` or `components/` | `alt=""` passes (the regex needs a non-quote character). Every other alt comes from `content/` |
| `source-guard` next imports | No value import from `next/image` or `next/link` | Keep plain `<img>` / `<a>` |
| `motion-guard` | Every `transition`/`animation` duration and delay comes from a `var()`; `cubic-bezier` only in tokens.css | Spiral: `animation: sp calc(var(--spiral-step) * 22) linear infinite paused; animation-delay: calc(var(--i) * var(--spiral-step) * -1)`. Keyframe percentages are fine |
| `css-guard` | Raw hex only in tokens.css; one font-family; no `font` shorthand | SVG devices use `currentColor` / `fill: currentColor`. The spiral `textPath` sets `font-family: var(--font-sans)` |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page compositions, copy, static markup of every device | Server Components (static HTML at build) | CDN (Vercel static) | Content is static. JS-off must show everything (A11Y-05) |
| Image derivatives (WebP sizes, manifest) | Dev-time script (`scripts/build-media.mjs`) | CDN `public/media/` | D-09: never at runtime or in CI |
| Hover/focus previews, colour crossfades, grid-line brighten, landscape hint | Browser CSS | Tiny delegated JS (nudge, quiet, tap toggles) | CSS-first keeps initial JS flat and works with JS off |
| Walkthrough, spiral run state, margin-name sizing, copy-email, motion toggle | Browser, lazy React-free modules | Pager controller signals | D-07. Same shape as `lib/cursor/mount.ts` |
| "Which page is current" | Pager controller (`getSnapshot().target`, `signals`) | `section:not([inert])` in CSS | Single source of truth already exists |
| Deep-dive route | Static route outside `Shell` | Small client wrapper (cursor) | D-01: no pager |
| Budget enforcement | CI (`pnpm measure:js`) | | D-08 |

## Standard Stack

No new runtime dependencies. One dev dependency.

### Core (existing, verified in package.json)
| Library | Version | Purpose |
|---------|---------|---------|
| next | 16.4.5 | Static export, routing, Turbopack chunking of `import()` |
| react / react-dom | 19.3.1 | Server components plus a few client islands |
| @playwright/test | 1.65.0 | E2E, visual baselines, clipboard tests |
| @axe-core/playwright | 4.14.0 | a11y on all seven routes |
| vitest + jsdom | 5.1.0 / 31.0.0 | Pure logic (hold derivation, nudge maths, copy-email, manifest/types) |

### Supporting (new)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sharp | 0.35.5 (devDependency, pin exact) | `scripts/build-media.mjs` WebP conversion | Run locally with `pnpm media:build`. Output committed. [VERIFIED: npm view sharp version = 0.35.5, modified 2026-09-27; already in the lockfile as an optional dependency of next 16.4.5] |

**Installation:** `pnpm add -D -E sharp@0.35.5`
Note: `pnpm-workspace.yaml` has `allowBuilds: sharp: false`. That is fine. sharp 0.3x installs prebuilt `@img/sharp-linux-x64` binaries through optionalDependencies, with no install script, and they are already present in `node_modules/.pnpm` [VERIFIED: ls node_modules/.pnpm]. If the import fails on another machine, the fix is `pnpm rebuild sharp` locally, never in CI.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sharp script | `next/image` | +5.7 kB initial JS (perf-baseline.md). Forbidden by D-09 |
| React-free mount modules | `"use client"` components with `next/dynamic` | Each adds allowlist churn and React reconciliation over server markup. The cursor precedent is React-free |
| CSS `@keyframes` spiral | JS rAF | Locked by design doc: compositor-only, no per-frame script |
| WAAPI push-in (`element.animate`) | CSS animations | v7 uses one WAAPI animation as the single clock: `pause()`/`play()` resumes the same frame. Keep it. `lib/motion/waapi.ts` already has `canAnimate`/`readEase` |

## Architecture Patterns

### System Architecture Diagram

```
 build time (local, once)                       request time (static CDN)
 docs/material/*.{png,jpg,svg}                  out/<route>/index.html  (server-rendered:
   -> scripts/build-media.mjs (sharp)             all copy, grey frame 1, mono marks, previews,
   -> public/media/<group>/<name>-<w>.webp        still spiral, margin names, devices)
   -> lib/media/manifest.ts (src,w,h)                    |
                                                         v
                                             initial JS (<150 kB gzip per route)
                                             PagerProvider
                                               |- usePagerInput / Navigation (existing)
                                               |- cursor import() (existing)
                                               |- useFeatures(controller)  [NEW]
                                               |     on mount + every onSlideStart(to):
                                               |     for slug in {target-1, target, target+1}:
                                               |        import(FEATURES[slug]) once
                                               |        -> mount(rootEl, {controller, signals})
                                               v
     lazy chunks (<12 kB gzip each)    projects -> walkthrough/mount  (hold logic, WAAPI clock,
                                                     data-src twins, controls reveal)
                                       achievements/projects -> previews (nudge --pv-y, quiet)
                                       say-hi  -> copy-email, spiral controller
                                       01-05   -> margin-names sizer + motion toggle
                                                     |
                                                     v
                                       state out -> <html data-motion="off" data-quiet ...>
                                                    server nodes' data-* (React never re-renders)
                                                    CSS reacts (play-state, opacity)

 /projects/facturo/ (outside Shell): Header(label override) + LetterNav(rail, A current)
   + DeepDive server body + DeepDiveFooter + StandaloneClient (cursor mount, no pager)
```

### Recommended Project Structure (additions)
```
app/projects/facturo/page.tsx        # deep-dive route (no Shell)
components/pages/                    # existing page bodies gain previews, marks, toggles
components/deep-dive/                # FacturoDeepDive.tsx, DeepDiveFooter.tsx, *.module.css
components/media/                    # Photo.tsx (extend: manifest entries), Twin.tsx (grey+colour stack)
components/devices/                  # GridLines, EdgeNumber, QuarterRings, MarginNames, SayHiSpiral (server markup + CSS)
components/shell/useFeatures.ts      # lazy feature loader hook (no "use client" needed)
lib/features/registry.ts             # slug -> () => import(...) map, pure neighbour maths
lib/walkthrough/{hold.ts,mount.ts}   # pure derivation + DOM wiring
lib/previews/{nudge.ts,mount.ts}     # pure --pv-y maths + quiet-after-blur
lib/copy-email/mount.ts
lib/motion/{toggle.ts,names.ts,spiral.ts}
lib/media/manifest.ts                # GENERATED, committed
scripts/build-media.mjs
public/media/{achievements,mame,facturo,marks,portrait}/
content/facturo.ts                   # + types in content/types.ts
```

### Pattern 1: Lazy feature loader (one hook, per-slug chunks)
**What:** `PagerProvider` calls `useFeatures(controller)`. It keeps a `Set` of loaded slugs. On mount, and on each `signals.onSlideStart(({to}) => ...)`, it imports the feature modules for `to-1..to+1` that are not loaded yet. Each module exports `mount(root: HTMLElement, ctx: FeatureContext): () => void`. Failures are swallowed (WR-07 precedent): the server state stays.
**Why:** It matches UI-SPEC "trigger: target or a neighbour (±1), or direct load". It reuses the cursor's `alive`/`catch` shape. Turbopack emits each `import()` target as its own chunk.
```ts
// Source: components/shell/PagerProvider.tsx (cursor effect), adapted
const FEATURES: Partial<Record<Slug, ReadonlyArray<() => Promise<FeatureModule>>>> = {
  achievements: [() => import("@/lib/previews/mount")],
  projects: [() => import("@/lib/walkthrough/mount"), () => import("@/lib/previews/mount")],
  "say-hi": [() => import("@/lib/copy-email/mount"), () => import("@/lib/motion/spiral")],
};
// Keep string-literal import() calls: the bundler must see each specifier statically.
```
`FeatureContext = { controller: PagerController; slug: Slug; isCurrent(): boolean }`. A module reads `controller.getSnapshot().target`, `controller.isReducedMotion()` and `controller.signals.onLanded`/`onSlideStart`. Cross-page modules (margin names, motion toggle) mount once, keyed by a pseudo-slug.

### Pattern 2: Walkthrough = pure hold derivation + one WAAPI clock (CONT-11)
**What:** Port v7 lines 791-889. Keep its three documented bug fixes:
1. Hover and keyboard focus are **separate flags**. A mouse-focused button does not hold (only `:focus-visible` holds).
2. The hover hit area is **the visible frame box only** (for the portrait frame, the centred picture at its current scale), plus the three buttons. It is not the `.lead` block.
3. `engaged()` drives both colour and pause, so they cannot disagree.
Put the decision in `lib/walkthrough/hold.ts` as a pure function so Vitest covers it exhaustively:
```ts
export interface HoldInputs { onFrame: boolean; onControl: boolean; touchHold: boolean;
  keyFocus: boolean; userPaused: boolean; isCurrentPage: boolean; inView: boolean;
  tabHidden: boolean; reduced: boolean }
export const engaged = (i: HoldInputs): boolean => i.onFrame || i.onControl || i.touchHold || i.keyFocus;
export const running = (i: HoldInputs): boolean =>
  !i.reduced && !i.userPaused && !engaged(i) && i.inView && i.isCurrentPage && !i.tabHidden;
export const showColour = (i: HoldInputs): boolean => engaged(i) && i.isCurrentPage;
```
The DOM module only updates one flag per event and calls `sync()`. The clock is `next.animate([{transform:'none'},{transform:push}], {duration: walkHold, easing:'linear', fill:'forwards'})`. `onfinish` advances. Pause is `anim.pause()`, resume is `anim.play()`. A `seq` counter discards stale decodes. `--walk-hold` is read from CSS with `getComputedStyle` (the `snapDurationMs` pattern in `lib/cursor/mount.ts`). "Is Projects current" is `controller.getSnapshot().target === indexOfSlug("projects")`, re-synced on `onSlideStart` and `onLanded`.
**Markup (server):** a `role="group" aria-roledescription tabindex="0"` box with 10 frame wrappers. Frame 1 grey has a real `src`. Frames 2-10 grey and all colour twins carry `data-src` (no `src`) and `alt` / `alt=""`. Non-current frames get `aria-hidden="true"`. The controls row is rendered server-side but hidden until the module sets `data-walk="ready"` on the group. CSS: `[data-walk-controls] { display: none } [data-walk="ready"] + [data-walk-controls] { display: flex }`. JS-off and a failed chunk both leave frame 1 grey with no dead controls.

### Pattern 3: Standalone deep-dive route (CONT-04, D-01)
- `app/projects/facturo/page.tsx` renders `<SkipLink/> <Header current="projects" label={facturo.headerLabel}/> <LetterNav current="projects" currentMarker="true"/> <main id="content">…</main> <DeepDiveFooter/>` plus a tiny `StandaloneClient` that mounts the cursor.
- It **works without a provider**: `usePagerState` falls back to `initialState(index)` and `useGlide` returns early when `controller` is null [VERIFIED: PagerContext.tsx, useGlide.ts]. LetterNav renders `data-mode="rail"` because `indexOfSlug("projects") !== 0`.
- Changes needed: `Header` gets an optional `label` prop (today it always shows `headerLabel(slug)` = "02 Projects"). `LetterNav` gets an optional `currentMarker: "page" | "true"` (UI-SPEC: `aria-current="true"` on the deep dive). Use a lean `DeepDiveFooter` server component instead of a Footer variant, because Footer pulls `useHint`, the counter and the bar, which D-01 forbids.
- Cursor: `mountCursor(signals)` needs `PagerSignals`. Pass `createSignals()` from `lib/pager/signals.ts`, which never emits. Copy the fine/forced-colours media logic from PagerProvider into a shared helper (`lib/cursor/autoload.ts`) so both callers use it. The `StandaloneClient` file needs `"use client"` and goes on the allowlist.
- Metadata: `lib/metadata.ts#pageMetadata` only takes a `Slug`. Add `deepDiveMetadata()` returning title/description from `content/facturo.ts` and `alternates.canonical: "/projects/facturo/"`. Full SEO is Phase 7.
- The opening script only runs on `pathname === "/"`, so the deep dive never gets `data-opening="pending"` [VERIFIED: lib/first-visit/script.ts].
- Scroll: the document scrolls. Do not reuse `.page` from shell.module.css (fixed 100svh, inner scroll). `html[data-js] body { overflow-x: clip }` stays and is harmless.

### Pattern 4: CSS-first previews with a tiny nudge/quiet module (CONT-10, MAME)
- Reveal: `li:hover .pv, li:has(.row:focus-visible) .pv { opacity: 1 }` inside `@media (hover: hover) and (min-width: 821px)`. **Never `:focus-within`**, which would keep a preview held after a mouse click (CONT-10 "never held by a mouse click").
- Quiet after blur (v7 lines 695-702): `window blur` and `visibilitychange` set `data-quiet` on the page root. Real `pointermove` (with `movementX || movementY`) or `pointerleave` clears it. CSS: `[data-quiet] li:hover:not(:has(.row:focus-visible)) .pv { opacity: 0 }`.
- Nudge: on `pointerenter`/`focusin` of an `li`, measure the figure and the footer top, then set `--pv-y` = `min(0, footerTop - 8 - figBottom)`, clamped so the figure never rises above its line top. Put the maths in pure `lib/previews/nudge.ts`. Use `translate` only.
- CCC line: `<div tabindex="0" data-cursor-snap>` with no `data-cursor-tag` (UI-SPEC: no tag). The Phase 5 cursor snaps to `[data-cursor-snap]` already [VERIFIED: lib/cursor/targets.ts SNAP_SELECTOR].
- Colour: `<picture><source media="(hover: hover) and (min-width: 821px)" srcset=colour.webp><img src=grey.webp …></picture>`. The browser picks one source, so only one file loads [CITED: HTML picture element source selection, ASSUMED detail for re-evaluation on resize].

### Pattern 5: Media pipeline (D-09)
```js
// scripts/build-media.mjs  (Source: sharp.pixelplumbing.com/api-output, /api-resize)
await sharp(input)
  .rotate()                                   // apply EXIF orientation BEFORE metadata is stripped
  .resize({ width, withoutEnlargement: true })
  .webp({ quality, effort: 6 })               // marks: { lossless: true }
  .toFile(out);                               // resolves { width, height, size }
```
- Output metadata is stripped by default, **including EXIF orientation**, so call `.rotate()` first [CITED: sharp.pixelplumbing.com/api-output]. `withoutEnlargement` never upscales [CITED: sharp api-resize].
- Write `lib/media/manifest.ts` from the `toFile` info as an `as const` object keyed by `group/name`, with `{ src, width, height }[]` per variant. Run Prettier on it so `format:check` passes.
- Make the script deterministic: sorted inputs, fixed options, skip outputs that are already up to date. Fail loudly if an expected source is missing.
- SVG marks (crc, facturo) stay SVG. Copy them to `public/media/marks/`. Their inner `role="img" aria-label` is ignored when used as `<img alt="">` [VERIFIED: crc-mark-mono.svg head]. Source PNG marks are 52-96 px tall [VERIFIED: measured this session], so `--mark-h: 28px` always downsizes. Ship native size, lossless.
- Source dimensions measured: Facturo frames 1440x900 (phone frame 390x844), MAME admin 1378x868, DIRO 800x450, CRC trophies 1440x753, club award 2324x1574, game team 1920x1246, portrait 1512x1240 [VERIFIED].
- Existing `assets/facturo-01-*.webp` and `assets/portrait-*.webp` use static imports with `StaticImageData`, and the Vitest plugin stubs them. Recommendation: migrate both to the manifest in the media plan, delete `assets/`, and change `Photo` to take manifest entries. One image path then serves `vitest.config.mts` (the stub stays harmless) and `tests/photo.test.tsx` (update it).

### Pattern 6: Copy email (CONT-07)
```ts
link.addEventListener("click", async (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // native mailto
  e.preventDefault();
  try { await navigator.clipboard.writeText(address); status(copied); setTimeout(reset, 4000) }
  catch { status(failed) }  // NotAllowedError when blocked or insecure
});
```
`writeText` needs a secure context (https, or localhost in tests) and rejects with `NotAllowedError` otherwise [CITED: developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText]. Also handle `navigator.clipboard` being undefined (old in-app browsers) by going straight to the failure copy. Status text is set with `textContent` from `content/say-hi.ts` (T-05-13 precedent). The address line is `aria-live="polite"`.

### Pattern 7: Motion devices gated by CSS, controlled by html flags
- Current page: `section:not([inert])` is already the live page (PageSection sets `inert={!isLive}`). Gate with `:global(section:not([inert])) .spiral .w { animation-play-state: running }`, combined with `html:not([data-motion="off"]):not([data-hint])`. The lazy spiral controller only has to stop running while the tab is hidden (`html[data-tab-hidden]`) and set the html flags.
- Reduced motion: `@media (prefers-reduced-motion: reduce) { … animation-play-state: paused !important }`. **Do not zero `--spiral-step`** (unlike `--dur-*`). A 0s duration jumps every word to its final keyframe, opacity 0, and the still spiral disappears.
- Footer/hint collision (UI-SPEC discretion rule): `useHint` must publish its state. Add `document.documentElement.dataset.hint = "pending"` on `load` when the hint will run, delete it when the phase reaches `done` (or when it never shows), and add `HINT_DONE_EVENT` to `lib/motion/events.ts`. The motion toggle stays `visibility: hidden` under `html[data-hint]`. This edits Phase 5 code (`useHint.ts`), so `tests/first-visit-hint.test.ts` and `e2e/first-visit-hint.spec.ts` need updating.
- Margin names: duration per strip = `halfHeight / --names-speed` px/s, measured once per layout (resize, `document.fonts.ready`). Set as `--names-d` on the strip node. Never per frame.

### Anti-Patterns to Avoid
- **Mutating React-owned props from lazy modules** (e.g. toggling `hidden` on a Footer-rendered button). Footer re-renders on every pager change. Use html flags or server-only nodes.
- **`:focus-within` for previews.** It holds after a mouse click.
- **Hover listeners on the whole `.lead` block** (v7 bug, round 2).
- **CSS `filter: grayscale()`**, which DSGN-05 forbids. Greyscale comes from the files.
- **Inline SVG with hex fills in components.** css-guard does not scan TSX, but it breaks the one-source-of-colour rule. Use `currentColor` plus a token.
- **A seventh entry in `sections`** for the deep dive. That breaks the pager's six-route model, the live region "of 6" and `--page-count`.
- **Dynamic `import(variable)`.** Turbopack cannot split it. Keep string literals.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image resizing/encoding | canvas or ffmpeg scripts | sharp 0.35.5 | Orientation, colour profiles, WebP tuning |
| Per-frame spiral animation | rAF loop | CSS `@keyframes` (v7 table) | Compositor-only, zero JS per frame |
| Frame clock and timers | `setTimeout` chains | One WAAPI `Animation` (pause/play/onfinish) | Resumes mid-frame exactly. v7 proven |
| Offscreen detection | scroll listeners | `IntersectionObserver` | Already the v7 approach |
| "Current page" tracking | a new store | `controller.getSnapshot()` / `signals` / `section:not([inert])` | Single source of truth |
| Image dimensions in JSX | hard-coded numbers | generated `lib/media/manifest.ts` | CLS-safe, regenerated with the files |

## Runtime State Inventory

Not a rename/migration phase. One related item: **visual baselines** in `e2e/visual.spec.ts-snapshots/` (18 PNGs) will be invalidated by every page change. They are regenerated in the Playwright container (the commit `2d96890` precedent). Docker and podman are both present on this host [VERIFIED: command -v].

## Common Pitfalls

### Pitfall 1: `decodeImages` makes every deferred image eager
**What goes wrong:** At slide start, `PagerProvider.decodeImages(page)` sets `img.loading = "eager"` and calls `decode()` on **all** `<img>` in the target page [VERIFIED: PagerProvider.tsx lines 53-59]. Ten walkthrough frames and every colour twin would download at once.
**How to avoid:** Change the selector to `img:not([data-defer])`, and mark twins and walkthrough frames 2-10 with `data-defer` and `data-src` (no `src`). Unit-test the selector. The deep dive is unaffected (no provider).
**Warning signs:** The Network panel shows `*-color-*.webp` requests on slide to Projects without hover.

### Pitfall 2: Native lazy loading does not mean "on hover"
**What goes wrong:** `loading="lazy"` loads when the image is near the viewport, not on interaction. Absolutely placed preview figures with `opacity: 0` are laid out and count as visible. Horizontally offscreen track pages may be inside the browser's lazy-load distance threshold [ASSUMED: Chromium's threshold applies in both axes].
**How to avoid:** Achievements/MAME previews may stay `<picture>` + `loading="lazy"` (UI-SPEC accepts one colour fetch per preview). Add `data-defer` so Pitfall 1 does not make them eager. For **"load on demand" twins** (About portrait, walkthrough colour, mark colour), use `data-src` and swap it on first `pointerenter`/`focus`/tap. Trade-off: with JS off those twins never show colour. That is acceptable because greyscale is the rest state, but the planner should note it (Open Question 1).

### Pitfall 3: The budget script measures only `/`
**What goes wrong:** `scripts/measure-js.mjs` reads `out/index.html` only [VERIFIED]. A heavy import on `/projects/facturo/` or a growing lazy chunk passes CI.
**How to avoid:** Glob `out/**/index.html` (skip `404.html` or include it). Report the initial total per route (union of non-`noModule` `<script src>` plus JS preloads, as today). **Lazy chunks = `out/_next/static/chunks/*.js` referenced by no HTML file**: on the current build that rule finds exactly two lazy files (1.5 kB and 0.8 kB gzip: cursor and debug overlay) [VERIFIED: measured this session]. Gate `--max-gzip-kb 150` per route and `--max-chunk-kb 12` per lazy file. Keep the JSON output. Update the CI line. Add a unit test for the HTML parsing on a fixture. Hashed names are unreadable, so print the first module path found in each chunk (Turbopack keeps module ids as comments/strings) or accept hashes.
**Current numbers [VERIFIED: `node scripts/measure-js.mjs out` on the 2026-11-10 build]:** `/` = 7 files, 143.4 kB gzip, 122.5 kB brotli. Every shell route loads the same 8 script tags.

### Pitfall 4: Spiral vanishes under reduced motion or with zeroed tokens
See Pattern 7. Under reduced motion the paused negative delays **are** the static spiral. Also, `will-change: transform, opacity` on 22 words is fine. Do not add it to more layers.

### Pitfall 5: Walkthrough freezes after a mouse click (v7 bug)
A mouse-clicked Previous/Next/Pause keeps focus. If focus counts as "held", the reel never resumes. Count **only** `:focus-visible` (`el.matches(":focus-visible")`), and re-sync on `keydown` (`setTimeout(sync, 0)`), because a key press can turn mouse focus into focus-visible. The frame gets `mousedown` `preventDefault()` so it only takes keyboard focus. Covered by an e2e test: click Next with the mouse, move away, and assert that the frame advances within `--walk-hold` plus margin. Under reduced motion there is no auto-advance, so test that in a separate project or with `page.emulateMedia({ reducedMotion: "reduce" })`.

### Pitfall 6: The deep dive loses chrome behaviours silently
Without `PagerProvider` there is no cursor, no reduced-motion listener and no title switching. Make sure: the cursor mounts (StandaloneClient), Header shows "02.1 Facturo", `document.title` is the static metadata title, the skip link targets `#content`, and axe passes. The `a11y.spec.ts`, `routes.spec.ts` and `visual.spec.ts` specs iterate `sections` only [VERIFIED], so add the deep dive explicitly to each.

### Pitfall 7: The hint and Pause motion share footer cols 4-9
Returning visitors (storage "seen") never get the hint, so motion must start immediately for them. First-time visitors must see no motion until the hint is done. If blocked storage makes it `unavailable`, `shownThisLoad` caps the hint to one show. Test all three states. `playwright.config.ts` seeds `HINT_KEY` as seen for every spec, so the collision spec must opt out like `first-visit-hint.spec.ts` does.

### Pitfall 8: Clipboard tests are flaky across browsers
Grant `["clipboard-read", "clipboard-write"]` on the **Chromium** context only, and read back with `navigator.clipboard.readText()` [CITED: community Playwright guides, MEDIUM]. For the failure path, do not rely on a denied permission (behaviour varies). Stub with `page.addInitScript(() => { navigator.clipboard.writeText = () => Promise.reject(new DOMException("x","NotAllowedError")) })`. `serve` runs with `--no-clipboard` already (that flag is unrelated to the browser).

### Pitfall 9: Phone thumbnails duplicate content for screen readers
On touch/phone the preview figure becomes an inline thumbnail with its caption. The grey `<img>` alt plus caption is fine, but the CCC text preview must be `display: none` on phones and `aria-hidden` everywhere (UI-SPEC). On desktop, opacity-0 figures are still in the accessibility tree. That is intended: they carry the alt and caption. Captions must not repeat the line text verbatim.

### Pitfall 10: `next build` type generation and new routes
`pnpm typecheck` runs `next typegen` first. `LayoutProps<"/">`/`PageProps` typings include the new route automatically. Nothing to configure, but the route file must default-export a component and `metadata`/`generateMetadata` only (static export) [VERIFIED: existing app/*/page.tsx shape].

## Code Examples

### Hold-aware sync (DOM side)
```ts
// Source: docs/reference/swiss-horizontal-v7.html lines 834-842, refactored onto lib/walkthrough/hold.ts
function sync(): void {
  const inputs = readInputs();               // flags + controller.getSnapshot().target + document.hidden
  group.toggleAttribute("data-colour", showColour(inputs));
  if (showColour(inputs)) loadColour(index - 1, index, index + 1);
  if (!anim) return;
  if (running(inputs)) { if (anim.playState === "paused") anim.play(); }
  else if (anim.playState === "running") anim.pause();
}
```

### Spiral word (server markup, CSS-driven)
```tsx
// Source: v7 lines 304-330; keyframes copied verbatim into say-hi-spiral.module.css with a "design doc §4.2" comment
<div className={styles.layer} aria-hidden="true">
  <div className={styles.centre}>
    {Array.from({ length: SPIRAL_WORDS }, (_, i) => (
      <svg key={i} className={styles.w} style={{ "--i": i } as CSSProperties} viewBox="…">
        <use href="#say-hi-word" />
      </svg>
    ))}
  </div>
</div>
```
The word text "say hi" comes from `content/say-hi.ts`. Phones hide `:nth-child(n+15)` and switch to the `sp14` keyframes with a `calc(var(--spiral-step) * 14)` duration.

### Per-route + per-chunk measurement (sketch)
```js
// Source: scripts/measure-js.mjs (existing logic) generalised
const htmlFiles = globSync("out/**/index.html");          // node:fs globSync (Node 22)
const initialByRoute = Object.fromEntries(htmlFiles.map(f => [routeOf(f), scriptsOf(read(f))]));
const referenced = new Set(Object.values(initialByRoute).flat());
const lazy = readdirSync("out/_next/static/chunks").filter(n => n.endsWith(".js"))
  .map(n => `/_next/static/chunks/${n}`).filter(src => !referenced.has(src));
```
`fs.globSync` exists in Node 22 [ASSUMED: experimental in 22.0, stable later; fall back to a recursive `readdirSync` filter, as css-guard already does].

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| v7 single inline script with global flags | Per-feature lazy modules with a pure decision core | Unit-testable hold logic; no initial-JS cost |
| v7 `.quiet` class on page roots | `data-quiet` attribute on server node | Same behaviour, no React className conflicts |
| Static `assets/` imports (`StaticImageData`) | Generated manifest + `public/media/` | One pipeline for ~60 derivatives |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Chromium's native lazy-load distance applies horizontally, so offscreen track pages may load lazy images | Pitfall 2 | Low. The `data-src` approach is correct either way |
| A2 | `<picture>` fetches only the matching source and does not re-fetch on resize across the 821px boundary in a way that matters | Pattern 4 | Low. Worst case one extra file |
| A3 | `fs.globSync` is usable in Node 22.22 without a flag | Code Examples | Low. Use the readdirSync fallback |
| A4 | Mutating `dataset` on server-component DOM nodes is never overwritten, because page bodies do not re-render | Patterns 2, 4 | Medium. Verified by design (PageSection comment "never re-renders"), but an e2e test after paging away and back should assert the state survives |
| A5 | Headless Chromium in the Playwright container allows `clipboard.writeText` once permissions are granted | Pitfall 8 | Medium. Fall back to stubbing `writeText` for the success path too and asserting the call argument |

## Open Questions (RESOLVED)

1. **(RESOLVED: plans 06-01, 06-04, 06-06 build the recommendation; Yahya reviews it at the 06-17 checkpoint) JS-off colour for "on demand" twins.** UI-SPEC says "JS off: CSS hover previews/crossfades still work". With `data-src` twins (D-09 "load on demand"), JS-off visitors get no colour on the About portrait or the marks. Recommendation: honour D-09 (data-src) for the portrait and walkthrough. For marks (1-13 kB, lossless, tiny), use a real `src` with `loading="lazy"` + `data-defer` so CSS hover works without JS. Flag this in the plan for Yahya's review.
2. **(RESOLVED: plan 06-02 names each chunk by its first module id) Lazy-chunk naming in measure output.** Hashed names make failures hard to read. Recommendation: map each lazy chunk to its module by searching the chunk text for a known marker string per feature (e.g. an exported constant name), or print hashes plus sizes. This is the planner's call and is not blocking.
3. **(RESOLVED: plans 06-13 and 06-15 via the `--names-end` variable) Margin names on Experience stop above the "03".** If the "03" device is cut, the names must extend to `--space-lg` above the footer. Make the stop a CSS variable that the "03" plan sets, so cutting either plan needs no edit to the other.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, scripts | yes | 22.22.2 | — |
| pnpm | all | yes | 12.11.2 | — |
| sharp (+ @img/sharp-linux-x64) | media script | yes (transitive; add as devDep) | 0.35.5 | — |
| docker / podman | visual baselines in the pinned container | yes | — | CI regenerates (slower loop) |
| Chromium (Playwright) | e2e | yes (host runs the Chromium projects) | 1.65.0 | Firefox/WebKit only in CI |
| Real phones (iPhone Safari, LinkedIn in-app, Android) | EXP-02 touch checks | no | — | Emulated touch projects plus a manual checklist for Yahya |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.1.0 (jsdom) + Playwright 1.65.0 + axe 4.14.0 |
| Config file | `vitest.config.mts`, `playwright.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm build && pnpm measure:js -- --max-gzip-kb 150 --max-chunk-kb 12 && pnpm test:e2e` (visual: `VISUAL=1` inside the container) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-03 | Six distinct layouts | e2e (signature of child grid placements per page, 6 unique) + visual | `pnpm test:e2e e2e/layouts-distinct.spec.ts` | No, Wave 0 |
| DSGN-05 | Grey at rest, colour on hold/hover/tap; no CSS filter | unit (css-guard: no `filter:` in CSS modules) + e2e (src of the visible img) | `pnpm test tests/css-guard.test.ts` | extend |
| CONT-02 | 75/75 line in the list, CCC focusable not a link | e2e | `e2e/achievements.spec.ts` | No, Wave 0 |
| CONT-10 | Preview on hover/focus-visible, not after click+move; inside viewport at 1366x768; links new tab; inline grey on touch | unit (`nudge.ts`) + e2e | `pnpm test tests/previews-nudge.test.ts` | No, Wave 0 |
| CONT-03 | MAME mark + preview; deep-dive link | e2e | `e2e/projects.spec.ts` | No, Wave 0 |
| CONT-11 | Hold matrix; resumes after mouse click; stepper under reduced motion; colour = paused | unit (`hold.ts` exhaustive) + e2e | `pnpm test tests/walkthrough-hold.test.ts` | No, Wave 0 |
| CONT-04 | Deep dive renders sections, no counter/bar/live region | e2e + axe | `e2e/deep-dive.spec.ts` | No, Wave 0 |
| CONT-08 | Resume + Say hi on all 7 routes | e2e | extend `e2e/routes.spec.ts` | extend |
| CONT-12 | Marks on the 7 rows only; tap toggle; mono at rest | e2e + content test | extend `tests/content.test.ts` | extend |
| CONT-07 | Copy success/failure/modifier pass-through | unit (jsdom, stub clipboard) + e2e (Chromium) | `pnpm test tests/copy-email.test.ts` | No, Wave 0 |
| CONT-05 | Work + Involvement present | existing | `tests/pages-experience-sayhi.test.tsx` | yes |
| EXP-02 | Phone layouts at 320/390, no horizontal overflow, landscape hint only portrait+coarse | e2e (`chromium-touch` project) + visual 320x568 | extend `e2e/no-scrollbar.spec.ts` | extend |
| Budget | 150 kB per route, 12 kB per lazy chunk | script unit test + CI | `pnpm test tests/measure-js.test.ts` | No, Wave 0 |
| Guards | client allowlist, literal alts, durations | existing | `pnpm test` | yes (update allowlist) |

### Sampling Rate
- **Per task commit:** `pnpm test` plus `pnpm lint` / `pnpm typecheck`
- **Per wave merge:** build + measure + Chromium e2e
- **Phase gate:** full suite incl. `VISUAL=1` baselines regenerated in the container and reviewed, before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/walkthrough-hold.test.ts`, `tests/previews-nudge.test.ts`, `tests/copy-email.test.ts`, `tests/measure-js.test.ts`, `tests/media-manifest.test.ts` (every manifest file exists in `public/`, dims > 0)
- [ ] `e2e/achievements.spec.ts`, `e2e/projects.spec.ts`, `e2e/walkthrough.spec.ts`, `e2e/deep-dive.spec.ts`, `e2e/say-hi.spec.ts`, `e2e/motion-control.spec.ts`, `e2e/layouts-distinct.spec.ts`
- [ ] `a11y.spec.ts` / `visual.spec.ts` / `routes.spec.ts`: add `/projects/facturo/` and the 320x568 viewport. Add states (previews shown, portrait pressed, walkthrough held)
- [ ] Visual specs must neutralise motion (reduced motion forced) so spiral, names and walkthrough frames are deterministic

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | minimal | No user input. Clipboard writes a constant. Status text via `textContent` only |
| V6 Cryptography | no | — |
| V14 Config | yes | CSP `img-src 'self' data:` must keep passing. All media from `public/`. `e2e/csp.spec.ts` covers the new route if added to its list |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Reverse tabnabbing on new-tab proof links | Tampering | `rel="noopener noreferrer"` (existing convention; UI-SPEC writes `noopener`, keep the stricter existing value) |
| DOM XSS through status/counter text | Tampering | `textContent` from typed constants, never `innerHTML` |
| Hotlinked media / third-party requests | Information disclosure | Self-hosted WebP; CSP blocks others |
| EXIF/GPS leakage in published photos | Information disclosure | sharp strips metadata by default [CITED]; add a manifest test that WebP files carry no EXIF chunk (optional) |

## Sources

### Primary (HIGH confidence)
- Codebase, read this session: `components/shell/*`, `components/frame/*`, `components/pages/*`, `content/*`, `lib/cursor/*`, `lib/first-visit/*`, `lib/pager/signals.ts`, `scripts/measure-js.mjs`, `tests/*-guard.test.ts`, `playwright.config.ts`, `vercel.json`, `.github/workflows/ci.yml`, `styles/*.css`
- `docs/reference/swiss-horizontal-v7.html` lines 300-387 (spiral CSS, phone band), 695-702 (quiet), 791-905 (walkthrough, motion toggle, names)
- Measurements: `node scripts/measure-js.mjs out` (143.4 kB gzip on `/`), lazy-chunk scan, source image dimensions, `npm view sharp`
- https://sharp.pixelplumbing.com/api-output and /api-resize (metadata stripping, webp options, withoutEnlargement)
- https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText (secure context, NotAllowedError)

### Secondary (MEDIUM confidence)
- [Autify: Verifying clipboard content](https://helpcenter.autify.com/docs/verifying-clipboard-content), [qaskills: Playwright clipboard permissions](https://qaskills.sh/blog/playwright-clipboard-read-write-permissions), [Lightrun: WebKit clipboard-read permission bug](https://lightrun.com/answers/microsoft-playwright-bug-browsernewcontext-unknown-permission-clipboard-read-for-webkit): grant clipboard permissions on Chromium only

### Tertiary (LOW confidence)
- Lazy-loading distance behaviour on horizontally offscreen content (A1)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. No new runtime deps; sharp version verified
- Architecture: HIGH. Grounded in existing cursor/pager patterns and source reads
- Pitfalls: HIGH for codebase traps (decodeImages, measure script, deep-dive provider, guards); MEDIUM for browser lazy-load and clipboard details

**Research date:** 2026-11-12
**Valid until:** 2026-12-12 (stable stack; re-check if Next or Playwright is upgraded)
