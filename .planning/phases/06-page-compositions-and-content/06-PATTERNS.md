# Phase 6: Page Compositions and Content - Pattern Map

**Mapped:** 2026-11-12
**Files analyzed:** 52 new or modified files (grouped below)
**Analogs found:** 47 / 52

All excerpts come from the current tree on `main` (bbf8c49). Line numbers are real. Every analog here is short (under 210 lines), so the planner can point an executor at the whole file.

## File Classification

### Wave 1 infrastructure

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `scripts/build-media.mjs` (new) | utility (dev script) | file-I/O, batch | `scripts/measure-js.mjs` | role-match |
| `lib/media/manifest.ts` (new, generated) | config/data | static | `content/projects.ts` (`as const`) | partial |
| `public/media/**` (new) | asset | static | `public/yahya-hallani-resume.pdf` | n/a |
| `scripts/measure-js.mjs` (modify) | utility (CI gate) | file-I/O, batch | itself | exact |
| `.github/workflows/ci.yml` (modify, line 67) | config | n/a | itself | exact |
| `package.json` (modify: `media:build`, sharp devDep) | config | n/a | itself | exact |
| `content/types.ts` (modify) | model | static | itself | exact |
| `content/facturo.ts` (new) | model/content | static | `content/projects.ts` | exact |
| `content/projects.ts`, `achievements.ts`, `experience.ts`, `about.ts`, `say-hi.ts`, `index.ts`, `site.ts` (modify) | model/content | static | themselves | exact |
| `components/shell/useFeatures.ts` (new) | hook | event-driven (lazy import) | `PagerProvider.tsx` lines 99-134 (cursor effect) + `components/frame/useHint.ts` | exact |
| `lib/features/registry.ts` (new) | utility (pure) | transform | `lib/sections.ts` | role-match |
| `components/shell/PagerProvider.tsx` (modify: `decodeImages` exemption, call `useFeatures`) | provider | event-driven | itself | exact |
| `lib/motion/events.ts` (modify: `HINT_DONE_EVENT`) | config | event-driven | itself | exact |
| `components/frame/useHint.ts` (modify: `html[data-hint]` flag) | hook | event-driven | itself | exact |
| `styles/tokens.css` (modify: `--walk-hold`, `--spiral-step`, `--names-speed`, `--mark-h`, etc.) | config | static | itself | exact |

### Page behaviour

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `components/media/Photo.tsx` (modify: manifest entries, `data-defer`) | component (server) | static | itself | exact |
| `components/media/Twin.tsx` (new: grey + colour stack / `<picture>`) | component (server) | static | `components/media/Photo.tsx` | exact |
| `components/pages/AchievementsPage.tsx` (modify: previews, CCC `div tabindex=0 data-cursor-snap`) | component (server) | static | itself | exact |
| `components/pages/ProjectsPage.tsx` (modify: walkthrough markup, MAME preview, deep-dive link) | component (server) | static | itself | exact |
| `components/pages/ExperiencePage.tsx` (modify: marks) | component (server) | static | itself | exact |
| `components/pages/AboutPage.tsx` (modify: portrait twin) | component (server) | static | itself | exact |
| `components/pages/SayHiPage.tsx` (modify: copy-email hooks, `aria-live`) | component (server) | static | itself | exact |
| `components/pages/IndexPage.tsx` (modify: landscape hint line) | component (server) | static | itself | exact |
| `components/pages/*-page.module.css` (modify: previews, phone blocks) | style | static | `projects-page.module.css` | exact |
| `lib/walkthrough/hold.ts` (new) | utility (pure) | transform | `lib/first-visit/hint.ts` | exact |
| `lib/walkthrough/mount.ts` (new) | service (React-free DOM) | event-driven | `lib/cursor/mount.ts` | exact |
| `lib/previews/nudge.ts` (new) | utility (pure) | transform | `lib/cursor/place-tag.ts` | exact |
| `lib/previews/mount.ts` (new) | service (React-free DOM) | event-driven | `lib/cursor/mount.ts` | exact |
| `lib/copy-email/mount.ts` (new) | service (React-free DOM) | request-response (clipboard) | `lib/cursor/mount.ts` + `useHint.ts` textContent | role-match |
| `lib/media/toggle.ts` or `lib/marks/mount.ts` (new: tap toggles for portrait/marks) | service (React-free DOM) | event-driven | `lib/cursor/mount.ts` (`onPointerDown`) | role-match |

### Deep-dive route

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `app/projects/facturo/page.tsx` (new) | route | static | `app/projects/page.tsx` + `components/shell/Shell.tsx` | exact |
| `components/deep-dive/FacturoDeepDive.tsx` (new) | component (server) | static | `components/pages/ProjectsPage.tsx` | role-match |
| `components/deep-dive/DeepDiveFooter.tsx` (new, server) | component | static | `components/frame/Footer.tsx` (markup only) + `SkipLink.tsx` (server shape) | role-match |
| `components/deep-dive/StandaloneClient.tsx` (new, `"use client"`) | component (client island) | event-driven | `PagerProvider.tsx` lines 99-134 | exact |
| `components/deep-dive/*.module.css` (new) | style | static | `projects-page.module.css`, `frame.module.css` | role-match |
| `lib/cursor/autoload.ts` (new, extracted helper) | utility | event-driven | `PagerProvider.tsx` lines 99-134 | exact |
| `components/frame/Header.tsx` (modify: optional `label`) | component (client) | request-response (pager state) | itself | exact |
| `components/letters/LetterNav.tsx` (modify: optional `currentMarker`) | component (client) | pager state | itself | exact |
| `lib/metadata.ts` (modify: `deepDiveMetadata()`) | utility | static | `pageMetadata` in same file | exact |

### Decorative devices (last, one plan each, D-05 order)

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `components/devices/GridLines.tsx` + css | component (server, aria-hidden) | static | `PageTitle` aria-hidden children / `Footer` bar span | partial |
| `components/devices/EdgeNumber.tsx` + css | component (server) | static | `ExperiencePage.tsx` display word + `displayFitStyle` | role-match |
| `components/devices/QuarterRings.tsx` + css | component (server, SVG) | static | none (SVG) | no analog |
| `components/devices/MarginNames.tsx` + css, `lib/motion/names.ts` | component + lazy sizer | event-driven | `lib/cursor/mount.ts` `snapDurationMs()` | role-match |
| `components/devices/SayHiSpiral.tsx` + css, `lib/motion/spiral.ts` | component + lazy controller | event-driven / CSS animation | v7 sketch lines 304-330 (reference only) | no codebase analog |
| `lib/motion/toggle.ts` (Pause motion control) | service (React-free DOM) | event-driven | `useHint.ts` + `lib/js-flag.ts` html-flag precedent | role-match |

### Tests

| New/Modified File | Role | Closest Analog | Match Quality |
|---|---|---|---|
| `tests/walkthrough-hold.test.ts`, `tests/previews-nudge.test.ts` | unit (pure) | `tests/first-visit-hint.test.ts`, `tests/cursor.test.ts` (placeTag) | exact |
| `tests/copy-email.test.ts`, `tests/features-registry.test.ts`, `tests/decode-images.test.ts` | unit (jsdom DOM) | `tests/cursor.test.ts` (`make()` helper) | exact |
| `tests/measure-js.test.ts` | unit (script on fixture) | `tests/css-guard.test.ts` (fs + `process.cwd()`) | role-match |
| `tests/media-manifest.test.ts` | unit (fs) | `tests/css-guard.test.ts` | role-match |
| `tests/source-guard.test.ts` (modify allowlist) | guard | itself | exact |
| `tests/photo.test.tsx` (modify for manifest entries) | unit (RTL) | itself | exact |
| `tests/content.test.ts` (add `facturo` to `ALL_CONTENT`) | unit | itself | exact |
| `e2e/deep-dive.spec.ts`, `achievements.spec.ts`, `projects.spec.ts`, `walkthrough.spec.ts`, `say-hi.spec.ts`, `motion-control.spec.ts`, `layouts-distinct.spec.ts` | e2e | `e2e/routes.spec.ts`, `e2e/reduced-motion.spec.ts`, `e2e/first-visit-hint.spec.ts` | role-match |
| `e2e/routes.spec.ts`, `a11y.spec.ts`, `visual.spec.ts`, `csp.spec.ts`, `no-scrollbar.spec.ts` (modify: add `/projects/facturo/`, 320x568) | e2e | themselves | exact |

---

## Pattern Assignments

### `components/shell/useFeatures.ts` (hook, lazy import) and `lib/cursor/autoload.ts`

**Analog:** `components/shell/PagerProvider.tsx` lines 99-134 (the cursor loader). Copy its shape exactly: `alive` flag, `loading` guard, string-literal `import()`, swallowed `.catch` (WR-07), cleanup calls `unmount?.()`.

```tsx
// PagerProvider.tsx lines 99-134
useEffect(() => {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const forced = window.matchMedia("(forced-colors: active)");
  let alive = true;
  let loading = false;
  let unmount: (() => void) | null = null;
  const wanted = () => fine.matches && !forced.matches;
  const sync = () => {
    if (wanted() && !unmount && !loading) {
      loading = true;
      import("@/lib/cursor/mount")
        .then((m) => {
          loading = false;
          if (alive && wanted() && !unmount) {
            unmount = m.mountCursor(controller.signals);
          }
        })
        .catch(() => {
          loading = false;
        });
    } else if (!wanted() && unmount) {
      unmount();
      unmount = null;
    }
  };
  sync();
  fine.addEventListener("change", sync);
  forced.addEventListener("change", sync);
  return () => {
    alive = false;
    fine.removeEventListener("change", sync);
    forced.removeEventListener("change", sync);
    unmount?.();
  };
}, [controller]);
```

- `lib/cursor/autoload.ts`: move this body into `autoloadCursor(signals: PagerSignals): () => void` (no React). PagerProvider then does `useEffect(() => autoloadCursor(controller.signals), [controller])`, and `StandaloneClient` does `useEffect(() => autoloadCursor(createSignals()), [])`.
- `useFeatures.ts` is a `.ts` hook with no `"use client"` directive. Precedent: `useHint.ts` and `usePagerInput.ts` are imported by client files and are not on the allowlist. Subscribe to slide starts with the same one-liner as PagerProvider lines 136-142:

```tsx
useEffect(
  () => controller.signals.onSlideStart(({ to }) => decodeImages(pageElement(to))),
  [controller],
);
```
(`onSlideStart` returns its unsubscribe, so the effect returns it directly.)

- Per-page roots: use `pageElement(index)` from `lib/pager/input/edge.ts` (line 6) or `document.getElementById(\`page-${slug}\`)` (the id comes from `PageSection.tsx` line 31).

### `components/shell/PagerProvider.tsx` (modify `decodeImages`, Pitfall 1)

**Current** (lines 52-59):
```tsx
function decodeImages(page: HTMLElement | null): void {
  if (!page) return;
  for (const img of Array.from(page.querySelectorAll("img"))) {
    img.loading = "eager";
    img.decode?.().catch(() => {});
  }
}
```
Change the selector to `"img:not([data-defer])"` and export the selector constant (or the function) so a jsdom unit test can cover it. Keep the file under the allowlist (it already is).

### `lib/walkthrough/mount.ts`, `lib/previews/mount.ts`, `lib/copy-email/mount.ts`, `lib/motion/{toggle,names,spiral}.ts` (React-free lazy modules)

**Analog:** `lib/cursor/mount.ts`.

**Header doc + imports** (lines 1-24): a JSDoc block naming the requirement ID and decisions, then imports from `@/lib/...` only, a CSS Module if the module creates DOM.

**Read a CSS duration token** (lines 36-43). Use this for `--walk-hold` and `--names-speed`:
```ts
function snapDurationMs(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--dur-ui")
    .trim();
  const ms = parseFloat(raw);
  return Number.isFinite(ms) ? ms : FALLBACK_SNAP_MS;
}
```

**Signature and state** (lines 45, 55-62): `export function mountX(root, ctx): () => void`, with local `let` flags only (no module-level state).

**State goes to data attributes, never classes or React props** (lines 101, 106, 127, 144):
```ts
root.dataset.snapped = "";
delete root.dataset.snapped;
html.dataset.cursor = "";
delete html.dataset.cursor;
```

**Touch detection** (lines 141-148), for the tap toggles (About portrait, Experience marks, Facturo frame touch hold):
```ts
const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType !== "touch") return;
  ...
};
```

**Pager signals** (lines 176-190):
```ts
const offSlide = signals.onSlideStart(({ from, to }) => { ... });
const offLanded = signals.onLanded(() => { ... });
```

**Teardown** (lines 192-206): remove every listener with the same options, call `offSlide()` / `offLanded()`, clear timers, remove created nodes, delete html flags.

**Text writes:** `tag.textContent = text;` (line 79). Copy-email status uses `textContent` from `content/say-hi.ts`, never `innerHTML` (T-05-13 / T-05-15).

**WAAPI helpers for the walkthrough clock:** `lib/motion/waapi.ts`: `canAnimate(el)` (lines 40-42) before `el.animate(...)`, and `readEase(...)` (lines 14-22) if an easing is needed. Usage precedent in `useHint.ts` lines 58-64:
```ts
const next = nextRef.current;
if (!reduced() && canAnimate(next)) {
  nudge = next.animate(
    nudgeKeyframes(readEase("--ease-ui", FALLBACK_EASE.ui)),
    { duration: NUDGE_TOTAL_MS, delay: NUDGE_DELAY_MS, easing: "linear" },
  );
}
```
Reduced motion comes from `controller.isReducedMotion()` (as in `useHint.ts` line 41), not from a new matchMedia.

### `lib/walkthrough/hold.ts`, `lib/previews/nudge.ts`, `lib/features/registry.ts` (pure logic)

**Analog:** `lib/first-visit/hint.ts` (lines 1-40) and `lib/cursor/place-tag.ts`.
- JSDoc header saying "A pure ... no DOM, no clock; times are inputs."
- Exported named `UPPER_SNAKE` constants for every number (hint.ts lines 7-17), so the test can pin them.
- `readonly` interface fields and string-literal unions (hint.ts lines 19-37).
- Exported functions with explicit return types. Unchanged inputs return the same object (immutability rule).

`registry.ts` neighbour maths should reuse `indexOfSlug` / `slugAt` from `lib/sections.ts` (lines 17, 33) rather than re-deriving indices from `sections`.

### `scripts/measure-js.mjs` (modify) and `scripts/build-media.mjs` (new)

**Analog:** `scripts/measure-js.mjs` itself.

**Header + arg parsing** (lines 1-22): a first-line comment with purpose and usage, `node:` imports, `UPPER_SNAKE` constants, hand-parsed `--flag value` args, exit code 2 for bad args:
```js
const args = process.argv.slice(2);
const maxIdx = args.indexOf("--max-gzip-kb");
const maxGzipKb = maxIdx === -1 ? null : Number(args[maxIdx + 1]);
...
if (maxGzipKb !== null && !Number.isFinite(maxGzipKb)) {
  console.error("--max-gzip-kb needs a number");
  process.exit(2);
}
```
**Script extraction** (lines 24-36): generalise `readFileSync(join(outDir, "index.html"))` to every `out/**/index.html`. Keep the `noModule` skip and the preload/modulepreload union. To make it unit-testable, move the HTML-to-scripts function into an exported helper (e.g. `scripts/lib/scripts-of.mjs`) that the test imports on a fixture string.
**Totals reducer** (lines 38-52) and **JSON output plus gate** (lines 54-69): keep `console.log(JSON.stringify(result))` per route and per lazy chunk, and `process.exit(1)` with a readable message on breach. Add `--max-chunk-kb`.
**Recursive listing fallback** (no `fs.globSync`): copy `readdirSync(abs, { recursive: true, encoding: "utf8" })` from `tests/css-guard.test.ts` lines 15-21.

CI line to change: `.github/workflows/ci.yml` line 67, `pnpm measure:js -- --max-gzip-kb 150` becomes `... --max-gzip-kb 150 --max-chunk-kb 12`. The job name `e2e` (line 48-49) must not change.

`build-media.mjs` follows the same header/constant/exit-code style. It is run locally via a new `package.json` script (`"media:build": "node scripts/build-media.mjs"`, next to line 17 `measure:js`), never in CI. Use the sharp chain from RESEARCH Pattern 5. Write `lib/media/manifest.ts` and run Prettier on it.

### `lib/media/manifest.ts` (generated) and `components/media/Photo.tsx` / `Twin.tsx`

**Analog:** `components/media/Photo.tsx` (whole file, 28 lines).

```tsx
export function Photo({ sources, sizes, alt, eager, className }: PhotoProps) {
  const widest = sources.reduce((a, b) => (b.width > a.width ? b : a));
  const srcSet = sources.map((s) => `${s.src} ${s.width}w`).join(", ");
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export has no optimizer; sources are pre-sized WebP (Pitfall 9)
    <img
      className={className}
      src={widest.src}
      srcSet={srcSet}
      sizes={sizes}
      width={widest.width}
      height={widest.height}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
```
- Replace `StaticImageData` (line 1, `import type` from `next/image`, allowed by the source-guard) with a local `MediaVariant { readonly src: string; readonly width: number; readonly height: number }` exported from the manifest. The manifest entries already have the same `{src,width,height}` shape, so the reducer and srcset lines stay unchanged.
- Add optional `defer?: boolean` (renders `data-defer=""`) and optional `lazySrc` mode (renders `data-src`/`data-srcset` instead of `src`/`srcSet`) for the on-demand twins.
- Keep the eslint-disable comment on every `<img>` in `Twin.tsx` too.
- Callers today: `ProjectsPage.tsx` lines 2-3, 27-33 and `AboutPage.tsx` lines 1-3, 10, 20-26 import from `@/assets/*.webp`. Migrate them to manifest entries and delete `assets/`. The `static-image` plugin in `vitest.config.mts` lines 6-19 can stay (harmless) or be removed once no test imports images.
- `alt` always comes from `content/` (source-guard regex `\b(alt)="[^"]` at `tests/source-guard.test.ts` line 8). `alt=""` is allowed for decorative twins and marks.

**Test to update:** `tests/photo.test.tsx`. Keep its `renderImg` helper shape (lines 12-25) and the five cases, swap the `StaticImageData` import (line 2) for the manifest type, and add cases for `data-defer` and `data-src`.

### Content: `content/types.ts` (modify) and `content/facturo.ts` (new)

**Analog:** `content/projects.ts` (whole file) plus `content/types.ts` lines 76-91.

```ts
import type { ProjectsContent } from "./types";

export const projects = {
  title: "Projects",
  flagship: { name: "Facturo", lines: [ ... ], imageAlt: "..." },
  rows: [ ... ],
} as const satisfies ProjectsContent;
```
- Types: `readonly` on every field, fixed-length tuples where the layout needs a fixed count (`readonly lines: readonly [string, string, string]`, types.ts line 80), `LabelledLink` for links (lines 18-21), `string | null` for optional links (line 79).
- `facturo.ts` exports `facturo` with `as const satisfies FacturoDeepDiveContent` (title, headerLabel "02.1 Facturo", metadata title/description, four sections each with a heading, paragraphs and image keys plus alts, links as `LabelledLink[]`, back link label).
- Cross-file values: reuse `site` like `content/say-hi.ts` lines 1, 7-12 (`href: \`mailto:${site.contact.email}\``), so copy-email status strings and the address stay single-sourced.
- New strings (landscape hint, walkthrough controls Pause/Previous/Next, copy-email copied/failed, preview captions, mark alts, motion toggle labels, spiral word) go in the matching `content/*.ts`, never as literals in TSX.
- Register `facturo` in `tests/content.test.ts` `ALL_CONTENT` (lines 10-19) so the fact guards (lines 21-27: no em dash, no "top 1", no "platform", no LOC, no phone number) and the `SAFE_HREF` check (line 29) run on it.

### Page bodies (modify): Achievements, Projects, Experience, About, Say hi, Index

**Analog:** each file itself. Conventions to keep:
- Server components (no directive). They receive `PageProps` (`{ isCurrent }`) from `Track.tsx` lines 42-53 and never re-render, so lazy modules may mutate `dataset` on their nodes.
- Root is `<div className={\`grid ${styles.root}\`}>` with `PageTitle` first (e.g. `AchievementsPage.tsx` lines 13-32).
- Class composition with token utility classes: `t-display`, `t-heading`, `t-body`, `t-label`, `c-dim`, `c-accent`, `tnum`, `ulink`, `measure`. Conditional classes via the array `filter(Boolean).join(" ")` pattern (`AchievementsPage.tsx` lines 35-41).
- External links: `target="_blank" rel="noopener noreferrer"` (`AchievementsPage.tsx` lines 53-58, `ProjectsPage.tsx` lines 59-66, `SayHiPage.tsx` line 7 `EXTERNAL_REL`). `e2e/routes.spec.ts` lines 101-119 enforces this; add `/projects/facturo/` to its route list.
- Sub-headings via `<Heading offset={1}>` (`ProjectsPage.tsx` line 35) so levels follow the pager.
- Display words sized with `displayFitStyle(word) as CSSProperties` (`ProjectsPage.tsx` line 37, `ExperiencePage.tsx` line 15).
- Achievements CCC line: today a non-link line is `<div className={styles.line}>{body}</div>` (line 63). Phase 6 adds `tabIndex={0}` and `data-cursor-snap=""`. The cursor already snaps to `a, button, [data-cursor-snap]` (`tests/cursor.test.ts` line 27).
- Cursor tags: `data-cursor-tag={...}` from content (`Header.tsx` line 29, `LetterNav.tsx` line 47).
- Lazy-module hooks are `data-*` attributes on server markup (`data-walk`, `data-walk-controls`, `data-src`, `data-defer`, `data-copy-email`, `data-mark`), following `data-hint=""` (`Footer.tsx` line 29) and `data-pager="bar"` (line 37).
- `ProjectsPage.tsx` CSS comment at `projects-page.module.css` line 40 already reserves cols 7-8 for the preview. `AchievementsPage.tsx` doc comment line 9 reserves cols 11-12.

**CSS Modules pattern** (`projects-page.module.css`):
- Grid placement by `grid-column: a / b` (lines 11, 50).
- Hard crop with `object-fit: cover; object-position: 0 0` on an absolutely-filled img (lines 26-34). Reuse for walkthrough frames, twins and deep-dive crops.
- Hairlines: `border-top: 1px solid var(--color-hair)` (line 55), only on Projects rows and Experience.
- Short-desktop block `@media (min-width: 821px) and (max-height: 879px)` (lines 72-76) and phone block `@media (max-width: 820px)` (lines 78-104). Phone layouts (EXP-02) extend the existing `max-width: 820px` blocks.
- Phone display-size clamp (lines 88-95): `font-size: min(var(--text-display-phone), calc((100vw - var(--phone-inset)) / var(--word-em)))`.
- Coarse-pointer touch targets: `@media (pointer: coarse)` with `min-height: var(--hit-min)` (`frame.module.css` lines 96-104).
- Opacity fade: `transition: opacity var(--dur-ui) var(--ease-ui)` with a data-state selector (`frame.module.css` lines 80-85). Every duration must be a `var()` (motion-guard); `cubic-bezier` only in tokens.css; raw hex only in tokens.css; no `font` shorthand (css-guard scans `styles`, `components`, `app`, `lib`: `tests/css-guard.test.ts` line 6).
- Doubled class to beat the global `.grid` (`frame.module.css` lines 106-107: `.header.header`).

**Landscape hint** (IndexPage): a `<p className="t-label ...">{indexPage.landscapeHint}</p>` hidden by default, shown by `@media (orientation: portrait) and (pointer: coarse)`. Same markup style as the meta list (`IndexPage.tsx` lines 28-32).

### `app/projects/facturo/page.tsx` (new route)

**Analog:** `app/projects/page.tsx` (9 lines) for shape, `components/shell/Shell.tsx` (lines 15-27) for chrome order.

```tsx
// app/projects/page.tsx
import type { Metadata } from "next";
import { Shell } from "@/components/shell/Shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("projects");

export default function Page() {
  return <Shell current="projects" />;
}
```
```tsx
// Shell.tsx lines 15-27: binding DOM order SkipLink, Header, LetterNav, Track, Footer, LiveRegion
<PagerProvider initial={indexOfSlug(current)}>
  <SkipLink />
  <Header current={current} />
  <LetterNav current={current} />
  <Track current={current} />
  <Footer current={current} />
  <LiveRegion />
</PagerProvider>
```
The deep dive keeps the order without the provider, Track, Footer and LiveRegion: `<SkipLink/> <Header current="projects" label={facturo.headerLabel}/> <LetterNav current="projects" currentMarker="true"/> <main id="content" tabIndex={-1}>…</main> <DeepDiveFooter/> <StandaloneClient/>`. `main#content tabIndex={-1}` copies `Track.tsx` lines 35-38 so `SkipLink` (`href="#content"`, `SkipLink.tsx` line 6) works. Do not use `styles.track` or `.page` from `shell.module.css`; the document scrolls.

Works without a provider because `usePagerState` falls back to `initialState(fallbackIndex)` (`PagerContext.tsx` lines 25-31) and `usePagerController()` returns null (line 21-23).

### `lib/metadata.ts` (add `deepDiveMetadata`)

**Analog:** `pageMetadata` in the same file (lines 13-21):
```ts
export function pageMetadata(slug: Slug): Metadata {
  const s = sectionBySlug(slug);
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: s.route },
  };
}
```
`deepDiveMetadata()` returns the same three keys from `content/facturo.ts` with `canonical: "/projects/facturo/"`. Robots stay inherited from `rootMetadata` (lines 7-11). Extend `tests/metadata.test.ts`.

### `components/frame/Header.tsx` (add `label`) and `components/letters/LetterNav.tsx` (add `currentMarker`)

**Analog:** themselves.
- Header props interface (lines 14-17): add `readonly label?: string;` with a JSDoc line. Render `{label ?? headerLabel(slug)}` at line 27. Resume and Say hi links (lines 28-38) stay, which gives CONT-08 on the new route.
- LetterNav (lines 16-19, 49): add `readonly currentMarker?: "page" | "true";` defaulting to `"page"`, used as `aria-current={s.slug === targetSlug ? currentMarker : undefined}`. Both files are already allowlisted.
- Update `tests/frame.test.tsx` and `tests/letters.test.tsx` for the new props.

### `components/deep-dive/DeepDiveFooter.tsx` (server) and `StandaloneClient.tsx` (client)

- `DeepDiveFooter`: copy the markup classes from `Footer.tsx` lines 27-34 (`grid t-label ${styles.footer}`, `styles.end`, `styles.next`) and import `frame.module.css`, but no `"use client"`, no `usePagerState`, no `useHint`, no counter, no `data-pager="bar"`. It renders the "Back to Projects" link (`href` = `sectionBySlug("projects").route`). Server shape like `SkipLink.tsx` (10 lines).
- `StandaloneClient`: `"use client"`, returns `null`, a single `useEffect` calling `autoloadCursor(createSignals())` (`lib/pager/signals.ts` lines 30-39: `createSignals()` never emits unless told). Add `join("components", "deep-dive", "StandaloneClient.tsx")` to `CLIENT_ALLOWLIST` in `tests/source-guard.test.ts` lines 15-26 in the same plan.

### `components/frame/useHint.ts` and `lib/motion/events.ts` (hint/motion collision, Pattern 7)

**Events analog** (`lib/motion/events.ts`, whole file):
```ts
export const GLIDE_SETTLED_EVENT = "yh:glide-settled";
export const OPENING_DONE_EVENT = "yh:opening-done";
```
Add `export const HINT_DONE_EVENT = "yh:hint-done";`.

**Where to edit `useHint.ts`:** the early return at line 39 (`seen === "seen"` or capped) means "never shows": no flag. After that line, set `document.documentElement.dataset.hint = "pending"`. In `hide()` (lines 67-76) and in the overflow bail-out inside `show()` (lines 53-57) delete the flag and dispatch `HINT_DONE_EVENT` on `document` (same dispatch target the listener at line 99 uses). Also clear it in the cleanup (lines 110-116). Html-flag precedent: `lib/js-flag.ts` (`document.documentElement.dataset.js=''`) and `html.dataset.cursor` in `lib/cursor/mount.ts` line 127.

Tests to update: `tests/first-visit-hint.test.ts`, `e2e/first-visit-hint.spec.ts` (opts out of the seeded storage with `test.use({ storageState: FRESH_VISITOR })`, line 16; seeding lives in `playwright.config.ts` lines 20-27).

### `styles/tokens.css` (new tokens)

**Analog:** lines 50-61 and 84-92. Durations as `ms` custom properties next to `--dur-*`; reduced-motion zeroing in the `@media (prefers-reduced-motion: reduce)` block (lines 84-92). Do not zero `--spiral-step` there (Pitfall 4); pause with `animation-play-state` in the device CSS instead. Phone overrides go in the `max-width: 820px` `:root` block (lines 63-70).

### Decorative devices (`components/devices/*`)

- All are server components rendering `aria-hidden="true"` wrappers, like the `PageTitle` visual children (`Heading.tsx` line 55) and the footer bar span (`Footer.tsx` lines 35-40).
- Per-element CSS variables go through `style={{ "--i": i } as CSSProperties}` (the `--page-index` / `--track-index` precedent: `Footer.tsx` line 25, `Track.tsx` line 40).
- SVG colours use `currentColor` plus a token (`--color-ink`, `--color-hair`); no hex in TSX or CSS.
- Gate live motion with `:global(section:not([inert]))` (the attribute comes from `PageSection.tsx` line 33) and `html:not([data-motion="off"]):not([data-hint])`.
- `EdgeNumber` reuses `displayFitStyle` and `t-display` like `ExperiencePage.tsx` lines 12-19.
- `MarginNames` sizer: `getComputedStyle` read pattern from `lib/cursor/mount.ts` lines 36-43; measure once per layout and on `document.fonts.ready`.

### Unit tests

**Pure logic analog:** `tests/first-visit-hint.test.ts` lines 1-40: import every exported constant and pin it in a "constants" block, freeze inputs with `Object.freeze({ ...s })` to prove immutability, then one `describe` per function.

**DOM analog:** `tests/cursor.test.ts` lines 1-23:
```ts
function make(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  return host;
}
afterEach(() => {
  document.body.replaceChildren();
});
```
Use for `decodeImages` selector, copy-email (stub `navigator.clipboard`), preview quiet flag and tap toggles.

**fs analog:** `tests/css-guard.test.ts` lines 1-31 (use `process.cwd()`, not `import.meta.url`, under jsdom; comment at line 14). Use for `media-manifest.test.ts` (every manifest `src` exists under `public/`, width and height > 0) and `measure-js.test.ts`.

### E2E tests

- Route iteration: `e2e/routes.spec.ts` and `e2e/a11y.spec.ts` loop over `sections` only (routes lines 11-45, a11y lines 12-23). Add an explicit `/projects/facturo/` case to each, plus `csp.spec.ts` and `visual.spec.ts`.
- axe call to copy (a11y lines 17-20):
```ts
const results = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
  .analyze();
expect(results.violations).toEqual([]);
```
- Resume reachability assertion (routes lines 37-44) is the CONT-08 check to repeat on the deep dive.
- Reduced motion: `test.use({ reducedMotion: "reduce", viewport: DESKTOP })` (`e2e/reduced-motion.spec.ts` lines 16-17). Pager helpers `open`, `waitForLanded`, `landId` from `e2e/helpers/pager.ts`.
- Fresh-visitor storage and init-script stubs: `e2e/first-visit-hint.spec.ts` line 16 and `page.addInitScript` at lines 156, 271, 301. Use the same for the clipboard failure stub and the hint/Pause collision spec.

---

## Shared Patterns

### Lazy React-free feature module
**Source:** `lib/cursor/mount.ts` (whole file) loaded by `PagerProvider.tsx` lines 99-134.
**Apply to:** walkthrough, previews, copy-email, tap toggles, motion toggle, margin-name sizer, spiral controller.
`export function mountX(...): () => void`; string-literal `import()`; `.catch` keeps server state; all state in `data-*`; teardown removes everything.

### Client allowlist
**Source:** `tests/source-guard.test.ts` lines 13-26.
**Apply to:** any new `.tsx` with `"use client"` (expected: only `components/deep-dive/StandaloneClient.tsx`). `.ts` hooks and `lib/` modules need no directive.

### No literal a11y strings, no next/image or next/link
**Source:** `tests/source-guard.test.ts` lines 8-11.
**Apply to:** every TSX in `app/` and `components/`. `alt`, `aria-label`, `title` come from `content/`; `alt=""` passes. Plain `<img>` with the eslint-disable comment from `Photo.tsx` line 15; plain `<a>`.

### Content as typed data
**Source:** `content/projects.ts` + `content/types.ts`.
**Apply to:** every new string (deep dive, hint, controls, statuses, captions, alts).
`as const satisfies XContent`, `readonly` everywhere, registered in `tests/content.test.ts` `ALL_CONTENT`.

### Motion and colour guards
**Source:** `tests/motion-guard.test.ts`, `tests/css-guard.test.ts` lines 6-12, `styles/tokens.css` lines 50-61, 84-92.
**Apply to:** every new CSS module. Durations and delays from `var()`, easings from tokens, hex only in tokens.css, one `font-family: var(--font-sans)`, no `font` shorthand, no CSS `filter` for greyscale (DSGN-05).

### Html flags for cross-cutting state
**Source:** `lib/js-flag.ts`, `lib/cursor/mount.ts` line 127 (`html.dataset.cursor`), `lib/first-visit/script.ts` (`data-opening`).
**Apply to:** `data-hint`, `data-motion="off"`, `data-tab-hidden`, `data-quiet`. React-owned nodes (Header, Footer, LetterNav) are never mutated by lazy modules.

### Reduced motion
**Source:** `PagerProvider.tsx` lines 90-97 (live listener into `controller.setReducedMotion`), `useHint.ts` line 41 (`controller?.isReducedMotion()`), tokens.css lines 84-92.
**Apply to:** walkthrough (stepper only, no auto-advance), spiral, margin names, preview fades.

### External links
**Source:** `SayHiPage.tsx` line 7 (`EXTERNAL_REL = "noopener noreferrer"`), enforced by `e2e/routes.spec.ts` lines 101-119.
**Apply to:** Achievements proof links, MAME live site, deep-dive Links section.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `components/devices/SayHiSpiral.tsx` + css | component | CSS keyframe animation | No CSS `@keyframes` device in the codebase. Use v7 sketch lines 304-330 (reference, not code) and RESEARCH Pattern 7 |
| `components/devices/QuarterRings.tsx` | component (inline SVG) | static | No inline SVG components exist yet. Use `currentColor` and a 22% ink token |
| `scripts/build-media.mjs` (sharp part) | dev script | file-I/O | Script style has an analog (`measure-js.mjs`), the sharp chain does not. Use RESEARCH Pattern 5 |
| `lib/copy-email/mount.ts` (clipboard part) | service | request-response | No clipboard code yet. Use RESEARCH Pattern 6; structure from `lib/cursor/mount.ts` |
| `lib/walkthrough/mount.ts` (frame clock part) | service | WAAPI clock | DOM wiring has an analog; the pause/play/onfinish clock is ported from v7 lines 791-889 with the three documented fixes |

## Metadata

**Analog search scope:** `app/`, `components/`, `content/`, `lib/`, `scripts/`, `styles/`, `tests/`, `e2e/`, `.github/workflows/`, `package.json`, `vitest.config.mts`, `playwright.config.ts`
**Files scanned:** about 45 read or grepped
**Pattern extraction date:** 2026-11-12
