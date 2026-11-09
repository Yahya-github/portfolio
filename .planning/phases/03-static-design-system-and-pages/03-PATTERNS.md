# Phase 3: Static Design System and Pages - Pattern Map

**Mapped:** 2026-11-08
**Files analyzed:** 62 (new, modified, deleted and out-of-repo, listed below)
**Analogs found:** 27 / 62 with an in-repo analog. Most of the rest are bespoke components or CSS that use the approved v7 sketch as their reference (measured values only, not code to copy) plus RESEARCH.md Patterns 1-6.

**Repo reality check:** the product codebase is the Phase 2 deploy spike: `app/{layout,page,fonts}.tsx|ts`, `app/globals.css`, `lib/build-info.ts`, `tests/{build-info,vercel-config}.test.ts`, `tests/setup.ts`, `e2e/{a11y,assets,csp}.spec.ts`, `scripts/measure-js.mjs`, plus config files. `components/`, `content/` and `styles/` do not exist yet, and the repo has no React component with props. The analogs are therefore conventions (imports, `@/` alias, test style, constants, comments) more than finished components. For CSS values the reference is `docs/reference/swiss-horizontal-v7.html` (924 lines). The UI-SPEC says to use it for "measured CSS values and verified copy, not code to copy".

## Conventions observed (apply everywhere)

| Convention | Evidence |
|------------|----------|
| Path alias `@/` for root imports (`@/assets/...`, `@/lib/...`) | `app/page.tsx:1-2`, `tests/build-info.test.ts:2`, `tsconfig.json:17`, `vitest.config.mts:7` |
| Double quotes, semicolons, trailing commas, 2-space indent (Prettier 3 defaults) | every TS file |
| Named exports for libs (`export function shortSha`), `export default function` only for Next route/layout files | `lib/build-info.ts:4`, `app/page.tsx:4`, `app/layout.tsx:10` |
| Magic numbers become `UPPER_SNAKE` module constants | `lib/build-info.ts:1-2`, `tests/vercel-config.test.ts:11-12`, `scripts/measure-js.mjs:7-9` |
| Comments cite the decision or pitfall ID (`// DEP-02 / D-13: ...`, `// Pitfall 7: ...`) | `e2e/assets.spec.ts:3`, `e2e/csp.spec.ts:4` |
| Unit tests read repo files with `readFileSync(join(process.cwd(), ...))`, never `import.meta.url` (jsdom breaks it) | `tests/vercel-config.test.ts:14-19` |
| Vitest imports `describe, expect, it` explicitly from `"vitest"` (no globals) | `tests/build-info.test.ts:1` |
| Playwright imports `test, expect` (+ `type Page`) from `"@playwright/test"`; specs use relative paths for repo files | `e2e/csp.spec.ts:1-2,9` |
| `<img>` needs an `eslint-disable-next-line @next/next/no-img-element -- reason` (lint is `--max-warnings 0`) | `app/page.tsx:9`, `package.json:11` |
| Route props typed with the generated global `LayoutProps<"/">` (from `next typegen`) | `app/layout.tsx:10`, `package.json:14` |

## File Classification

| New/Modified/Deleted File | Role | Data Flow | Closest Analog | Match Quality |
|---------------------------|------|-----------|----------------|---------------|
| `app/layout.tsx` (modify) | config/layout | build-time render | itself (`app/layout.tsx`) | exact |
| `app/fonts.ts` (modify: `display: "block"`) | config | build-time | itself | exact |
| `app/page.tsx` (replace) | route | build-time render | `app/page.tsx` (structure) + RESEARCH Pattern 1 | role-match |
| `app/achievements/page.tsx`, `app/projects/page.tsx`, `app/experience/page.tsx`, `app/about/page.tsx`, `app/say-hi/page.tsx` (new) | route | build-time render | `app/page.tsx` + RESEARCH Pattern 1 | role-match |
| `app/globals.css` (replace or delete) | style (global) | n/a | itself | exact |
| `styles/tokens.css` (new) | style tokens | n/a | v7 sketch lines 19-31 (reference) | reference-only |
| `styles/base.css` (new: reset, body, links, focus, `.visually-hidden`, `.grid`) | style (global) | n/a | `app/globals.css` + v7 lines 33-51, 76 | partial |
| `components/shell/Shell.tsx` | component (server) | transform (slug -> markup) | none in repo; RESEARCH arch diagram + UI-SPEC "Shell and Markup Contract" | no analog |
| `components/shell/Track.tsx`, `components/shell/Page.tsx`, `shell.module.css` | component (server) + CSS Module | transform | RESEARCH Pattern 2; v7 lines 68-71 | no analog |
| `components/frame/SkipLink.tsx` + css | component | static | v7 lines 74-75 | no analog |
| `components/frame/Header.tsx` + css | component | transform (current -> label) | v7 lines 54-56 | no analog |
| `components/frame/Footer.tsx` + css | component | transform (current -> counter/next) | v7 lines 57-59, 66 | no analog |
| `components/letters/LetterNav.tsx` + `letters.module.css` | component | transform (mode + current) | RESEARCH Pattern 4; v7 lines 82-93, 104-134 | no analog |
| `components/pages/IndexPage.tsx`, `AchievementsPage.tsx`, `ProjectsPage.tsx`, `ExperiencePage.tsx`, `AboutPage.tsx`, `SayHiPage.tsx` + one `.module.css` each | component | transform (content -> markup) | `app/page.tsx` (JSX + img) ; v7 page CSS | partial |
| `components/media/Photo.tsx` (recommended, Pitfall 9) | component | static asset | `app/page.tsx:1,9-15` | exact (img pattern) |
| `content/types.ts` | model (types) | n/a | none; RESEARCH Pattern 5 | no analog |
| `content/site.ts`, `content/index.ts`, `content/achievements.ts`, `content/projects.ts`, `content/experience.ts`, `content/about.ts`, `content/say-hi.ts` | model (data) | static data | `lib/build-info.ts` (const style) + RESEARCH Pattern 5 | partial |
| `lib/sections.ts` | utility (pure) | transform | `lib/build-info.ts` | exact (pure fn + constants) |
| `lib/metadata.ts` | utility (pure) | transform | `lib/build-info.ts` + `app/layout.tsx:5-8` | role-match |
| `lib/build-info.ts` | **DELETE** (user decision 2026-11-08) | — | — | — |
| `tests/build-info.test.ts` | **DELETE** with it | — | — | — |
| `tests/sections.test.ts` | test (unit) | pure fn | `tests/build-info.test.ts` | exact |
| `tests/contrast.test.ts` | test (unit, file read) | file-I/O | `tests/vercel-config.test.ts` | exact |
| `tests/css-guard.test.ts` (no raw hex outside tokens.css, single font-family, no literal `aria-label`/`alt`/`title` strings in components) | test (unit, file scan) | file-I/O | `tests/vercel-config.test.ts` | role-match |
| `tests/content.test.ts` (fact guards, shape) | test (unit) | static data | `tests/build-info.test.ts` | role-match |
| `tests/shell.test.tsx` | test (component, jsdom) | render | `tests/setup.ts` (jest-dom loaded); no component test exists | partial |
| `tests/vercel-config.test.ts` (modify only if `trailingSlash` goes into vercel.json, Pitfall 8) | test | file-I/O | itself | exact |
| `next.config.ts` (add `trailingSlash: true`) | config | n/a | itself | exact |
| `eslint.config.mjs` (add `react/jsx-no-literals`) | config | n/a | itself | exact |
| `playwright.config.ts` (add `chromium-nojs`, `visual` projects) | config | n/a | itself | exact |
| `vercel.json` (conditional `trailingSlash`) | config | n/a | itself | exact |
| `.github/workflows/ci.yml` (visual baseline container, keep job name `e2e`) | config (CI) | n/a | itself | exact |
| `scripts/measure-js.mjs` (optional: loop routes) | utility (script) | file-I/O | itself | exact |
| `e2e/a11y.spec.ts` (extend: 6 routes x 2 viewports) | test (e2e) | request-response | itself | exact |
| `e2e/csp.spec.ts` (extend: 6 routes) | test (e2e) | request-response | itself | exact |
| `e2e/assets.spec.ts` (fix: portrait on `/about/`, Pitfall 7) | test (e2e) | request-response | itself | exact |
| `e2e/routes.spec.ts` (JS on + off) | test (e2e) | request-response | `e2e/a11y.spec.ts` + RESEARCH "JS-off routing" | role-match |
| `e2e/focus.spec.ts` | test (e2e) | event-driven (keyboard) | `e2e/assets.spec.ts` (`page.evaluate` style) | role-match |
| `e2e/layout.spec.ts` (overflow, rail accent, 12 tracks, img/svg count) | test (e2e) | request-response | `e2e/assets.spec.ts` | role-match |
| `e2e/font-shift.spec.ts` | test (e2e) | request interception | `e2e/csp.spec.ts:33-43` (`page.route`) | role-match |
| `e2e/visual.spec.ts` | test (visual) | screenshot | none | no analog |
| `assets/portrait-1512.webp`, `assets/portrait-1200.webp`, `assets/facturo-01-1440.webp`, `assets/facturo-01-960.webp` | asset | build-time import | `assets/portrait-800.webp` (Phase 2 recipe) | exact |
| `~/.claude/skills/portfolio-design/SKILL.md`, `~/.claude/skills/portfolio-voice-and-facts/SKILL.md` (out of repo, not committed) + move todo to done | docs | n/a | n/a | n/a |

---

## Pattern Assignments

### `app/layout.tsx` (layout, build-time render), modify

**Analog:** itself (16 lines, full file):
```tsx
import type { Metadata } from "next";
import { instrumentSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yahya Hallani",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>{children}</body>
    </html>
  );
}
```
**Changes:** import `@/styles/tokens.css` then `@/styles/base.css` (in that order, replacing or alongside `./globals.css`); add `metadataBase: new URL(site.origin)` and `title: site.name` from `@/content/site` (no string literal; `title` is not JSX, but keep it data-sourced per CONT-09). Keep `robots` exactly as is (Phase 2 D-12 noindex). Keep `LayoutProps<"/">`. Layout must **not** try to read the pathname (RESEARCH Pattern 1). No `'use client'`.

### `app/fonts.ts` (config), modify

**Analog:** itself, lines 3-11. The only change is line 7, `display: "swap"` to `display: "block"`. Keep `weight`, `declarations` (font-stretch 75%-100%), `variable: "--font-sans"`, `fallback`. Do not set `adjustFontFallback: false`. Note: `e2e/assets.spec.ts:21` matches the family by the exported const name `instrumentSans`, so do not rename the export.

### `app/page.tsx` + five `app/<route>/page.tsx` (route, build-time render), replace and new

**Analog:** `app/page.tsx` for file shape (default export function, `@/` imports). Its body is replaced. The `shortSha` import (line 2) and the build line (lines 19-21) go away, which leaves `lib/build-info.ts` dead and it is deleted.

**Pattern to copy (RESEARCH Pattern 1, verified in prototype):**
```tsx
import type { Metadata } from "next";
import { Shell } from "@/components/shell/Shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("achievements");
export default function Page() {
  return <Shell current="achievements" />;
}
```
Every route file is the same three lines with only the slug changing (`"index"` for `app/page.tsx`). Folders are `achievements/`, `projects/`, `experience/`, `about/`, `say-hi/` (explicit folders, not a catch-all).

### `styles/tokens.css` (global tokens), new

**Reference:** v7 sketch lines 19-31 (values match UI-SPEC "Tokens"):
```css
:root {
  --color-ground: #0b0b0b; --color-ink: #f0f0f0; --color-dim: #8e8e8e; --color-hair: #2e2e2e; --color-accent: #5fae84;
  --wdth-display: 75%; --wdth-body: 100%;
  --space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px; --space-xl: 32px; --space-2xl: 48px; --space-3xl: 64px;
  --grid-margin: 24px; --grid-gutter: 24px; --rail-col: 56px;
  --frame-top: 72px; --frame-bottom: 56px; --hero-bottom-gap: 96px;
  --yahya-fit: 2.188; --yahya-track: -0.045em; --display-track: -0.05em;
  --dur-page: 600ms; --dur-letters: 600ms; --dur-ui: 150ms;
  --ease-page: cubic-bezier(0.77, 0, 0.18, 1); --ease-ui: cubic-bezier(0.16, 1, 0.3, 1);
}
@media (max-width: 820px) { :root { --grid-margin: 16px; --grid-gutter: 16px; --rail-col: 36px; } }
@media (prefers-reduced-motion: reduce) { :root { --dur-page: 0ms; --dur-letters: 0ms; --dur-ui: 0ms; } }
```
**Differences from v7 (must apply):**
- **Drop** v7 line 21 `--font-sans: "Instrument Sans", ...`. `--font-sans` comes from next/font (`app/fonts.ts:8`) on `<html>`. Redefining it on `:root` would override the self-hosted family.
- **Add** the UI-SPEC tokens v7 lacks: `--weight-regular/bold`, `--text-label/body/heading/display`, `--yahya-kern: -0.063em`, `--rail-size: 30px` (22px at <=820), `--row-pad: 12px` (8px at `(min-width: 821px) and (max-height: 879px)`), `--stagger: 30ms` (0ms reduced), and the measured advances `--adv-y: 0.461em; --adv-a: 0.445em; --adv-h: 0.469em` (RESEARCH Pattern 4).
- One property per line (Prettier and the contrast test regex `--color-${name}:\s*(#[0-9a-fA-F]{6})` both expect plain `name: #hex` pairs).

### `styles/base.css` (global), new; `app/globals.css`, replace or delete

**Analog:** `app/globals.css` (8 lines: `body { font-family: var(--font-sans) }`, `img { max-width: 100%; height: auto }`).
**Reference:** v7 lines 33-51 and 76:
```css
* { box-sizing: border-box; margin: 0; }
body { font: 400 16px/1.5 var(--font-sans); font-stretch: var(--wdth-body); -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: none; }
a { transition: color var(--dur-ui) var(--ease-ui); }
a:focus-visible { color: var(--color-accent); }
a:active { color: var(--color-accent); transition: none; }
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; border-radius: 0; }
.grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--grid-gutter); }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
```
**Differences from v7 (must apply):**
- **Do not copy** v7 line 34 `html, body { height: 100%; overflow: hidden }`. It breaks phone document scrolling (Pitfall 5) and JS-off use.
- Hover accent goes inside `@media (hover: hover) and (pointer: fine)` only (UI-SPEC "Hover"); v7 line 39 applies it unconditionally.
- Name the hidden-text class `.visually-hidden` (RESEARCH structure) instead of `.sr`.
- Raw px font sizes in v7 (`16px`, `12px`) become `var(--text-*)` tokens; `css-guard` forbids raw hex outside tokens.css.
- `.grid` is global, so module files use it via `composes: grid from global;` or a plain `className="grid"`. Pick one (RESEARCH Pattern 3 note).

### `components/shell/Shell.tsx`, `Track.tsx`, `Page.tsx`, `shell.module.css` (server components, transform)

**No in-repo analog.** Copy RESEARCH Pattern 2 (verified: React 19 renders `inert=""`):
```tsx
<main id="content" tabIndex={-1} data-current={current} className={styles.track}>
  {sections.map((s) => {
    const isCurrent = s.slug === current;
    return (
      <section key={s.slug} id={`page-${s.slug}`} data-page={s.slug}
        inert={!isCurrent} aria-labelledby={`title-${s.slug}`} className={styles.page}>
        <PageBody slug={s.slug} headingLevel={isCurrent ? 1 : 2} isCurrent={isCurrent} />
      </section>
    );
  })}
</main>
```
```css
.page[inert] { display: none; }   /* Phase 4 overrides under html[data-js] */
.track:focus { outline: none; }   /* skip-link target, not a control (Pitfall 10) */
```
**Shell DOM order (UI-SPEC, binding):** `SkipLink` -> `Header` -> `LetterNav` -> `Track` -> `Footer`. `Shell` props: `{ current: Slug }` only.
**Page box reference (v7 lines 69-71, adapted):** `width: 100vw; height: 100svh; padding: var(--frame-top) var(--grid-margin) var(--frame-bottom);` and `:not([data-page="index"])` adds `--rail-col` to the left padding. Use the UI-SPEC `overflow-x: clip; overflow-y: auto`, not v7's `overflow: hidden`. **Do not copy** v7 line 68 `.track { display:flex; width:600vw }`: that is the Phase 4 slide. At `max-width: 820px` use `height: auto; min-height: 100svh; overflow: visible` (Pitfall 5).
**Headings:** a `Page`/heading helper renders `h1` when current and `h2` otherwise, with `id={`title-${slug}`}`. Tag choice `const H = level === 1 ? "h1" : "h2"`.

### `components/frame/SkipLink.tsx`, `Header.tsx`, `Footer.tsx` (+ css modules)

**No in-repo analog.** CSS reference:
- SkipLink, v7 lines 74-75: `position: fixed; left: var(--grid-margin); top: var(--space-md); z-index: 30; padding: var(--space-xs) var(--space-sm); background: var(--color-ground); opacity: 0; pointer-events: none;` and `:focus` sets `opacity: 1; pointer-events: auto`. Label from `site.skipLabel`.
- Header, v7 lines 54-56: fixed, `height: var(--frame-top)`, `padding: 0 var(--grid-margin) var(--space-md)`, `align-content: end; align-items: end`, 1px hair bottom border, ground bg; `.who` cols 1/4, current section cols 4/7 (dim), `.links` cols 10/13 flex end gap `--space-lg`. `aria-current="page"` on "Say hi" when `current === "say-hi"`. Phone: current section hidden.
- Footer, v7 lines 57-59 and 66: fixed bottom, `height: var(--frame-bottom)`; counter cols 1/4 (tabular, ink); Next cols 10/13 `justify-self: end`. Progress bar `position:absolute; bottom:0; height:2px; width: calc(100% / 6); background: var(--color-ink); transform: translateX(calc(var(--page-index) * 100%))` with `style={{ "--page-index": index } as React.CSSProperties}` and `aria-hidden`. **Skip** v7 lines 60-65 (Pause motion is Phase 6) and the bar `transition`.
- All copy (counter separator, "Next, ", "Back to the start") comes from `content/site.ts`; hrefs and index come from `lib/sections.ts`.

### `components/letters/LetterNav.tsx` + `letters.module.css` (component, transform)

**No in-repo analog.** One `<nav aria-label={site.navLabel}>` with five `<a>` (plain anchors, hrefs from data; **no `next/link`**, RESEARCH alternatives table). `data-mode="hero"` on index, `"rail"` elsewhere; `aria-current="page"` on the current section's link only.

**Hero CSS (RESEARCH Pattern 4, replaces v7 `.word`/`.fly`):**
```css
.hero .letter { position: relative; display: block; flex: none; width: var(--adv); height: 0.76em; pointer-events: none; }
.hero .letter[data-glyph="Y"] { --adv: var(--adv-y); margin-right: var(--yahya-kern); }
.hero .letter::before { content: ""; position: absolute; inset: 0; pointer-events: auto; }
.hero .caption { position: absolute; left: 0; top: calc(100% + var(--space-md)); pointer-events: auto; white-space: nowrap; }
```
Row placement and Poster size from v7 lines 82-86:
```css
position: absolute; left: var(--grid-margin); bottom: calc(var(--frame-bottom) + var(--hero-bottom-gap));
display: flex; white-space: nowrap;
font-weight: 700; line-height: 0.76; font-stretch: var(--wdth-display); letter-spacing: var(--yahya-track);
font-size: min(calc((100vw - 2 * var(--grid-margin)) / var(--yahya-fit)), calc((100svh - 320px) / 0.76));
```
**Do not copy:** v7 line 88 / 99 `.fonts-ready` visibility gate (banned, breaks JS-off), v7 `.fly`/`.slot` placeholder duplication (one set of five links only), the `transition: transform` lines (Phase 5). Caption: number span dim, name ink (v7 line 93); in rail mode the caption is visually hidden but stays in the accessible name.

**Rail CSS (v7 lines 115, 118, 123, 132, 134, adapted to `data-mode`):**
```css
[data-mode="rail"] { position: fixed; left: var(--grid-margin); top: calc(var(--frame-top) + var(--space-lg)); display: flex; flex-direction: column; gap: var(--space-sm); }
[data-mode="rail"] a[aria-current="page"] { color: var(--color-accent); }
[data-mode="rail"] a:focus-visible { outline-color: var(--color-ink); }
/* rail never takes accent on hover/focus/active: override base.css for rail links */
.now { margin-top: var(--space-md); writing-mode: vertical-rl; white-space: nowrap; }
@media (pointer: coarse) { [data-mode="rail"] { gap: 28px; } }
```
Accent comes from `aria-current` alone (v7 bug note, lines 110-114). The glyph is `aria-hidden`; `data-glyph` is the only literal attribute. The glyph itself comes from `content/site.ts`.

### `components/pages/*Page.tsx` + `*.module.css` (components, content -> markup)

**Analog:** `app/page.tsx` for JSX and image shape; v7 for CSS spans.
- **IndexPage**, v7 lines 79-81: `.intro { grid-column: 1 / 5; padding-top: var(--space-lg); max-width: 60ch; }`, `.meta { grid-column: 7 / 13; padding-top: var(--space-lg); display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: var(--grid-gutter); }`. Phone section list reference: v7 lines 400-401 (`display:flex; gap: var(--space-sm); min-height: 44px; width: max-content`), and v7 line 416 hides `.meta` on phones.
- **AchievementsPage / AboutPage**: letter-pair rows `aria-hidden` and a `.visually-hidden` heading; lines on subgrid (RESEARCH Pattern 3): `.lines { grid-column: 3 / 11; display: grid; grid-template-columns: subgrid; row-gap: var(--space-lg); align-items: baseline; }`.
- **ProjectsPage / ExperiencePage**: `<ol>` rows with `border-top: 1px solid var(--color-hair); padding: var(--row-pad) 0;` and the `(min-width: 821px) and (max-height: 879px)` rule hiding the middle line.
- **SayHiPage**: Display links `display: block; width: max-content`; Pitfall 4 phone fit `font-size: min(64px, calc((100vw - 68px) / var(--word-em)))`.
- External links: `target="_blank" rel="noopener"`, labels and hrefs from data.
- Each page takes `{ headingLevel: 1 | 2; isCurrent: boolean }`. No text literals (lint rule below).

### `components/media/Photo.tsx` (component, static asset)

**Analog:** `app/page.tsx` lines 1 and 9-15:
```tsx
import portrait from "@/assets/portrait-800.webp";
...
{/* eslint-disable-next-line @next/next/no-img-element -- export has no optimizer; asset is pre-sized */}
<img
  src={portrait.src}
  width={portrait.width}
  height={portrait.height}
  alt="Yahya Hallani, greyscale portrait"
/>
```
**Extend to:** props `{ sources: StaticImageData[]; sizes: string; alt: string; eager: boolean; className?: string }`; `srcSet={sources.map((s) => `${s.src} ${s.width}w`).join(", ")}`, `src`/`width`/`height` from the largest, `loading={eager ? "eager" : "lazy"}`, `decoding="async"`. Keep the single `eslint-disable-next-line` here only (Pitfall 9). `alt` comes from content (css-guard bans literal `alt="..."` in components). Portrait `sizes="(max-width: 820px) 100vw, calc((100vh - 128px) * 1.22)"` (Pitfall 3), `object-position: 52% 10%`.

### `content/types.ts` + `content/*.ts` (model, static data)

**Partial analog:** `lib/build-info.ts` (module constants, named exports). **Pattern (RESEARCH Pattern 5):**
```ts
// content/types.ts
export type Slug = "index" | "achievements" | "projects" | "experience" | "about" | "say-hi";
export interface Section { slug: Slug; route: `/${string}`; letter: string | null; number: string; name: string; title: string; description: string; }
// content/site.ts
export const sections = [
  { slug: "index", route: "/", letter: null, number: "00", name: "Index", title: "Yahya Hallani", description: "…" },
  { slug: "achievements", route: "/achievements/", letter: "Y", number: "01", name: "Achievements", title: "Achievements, Yahya Hallani", description: "…" },
] as const satisfies readonly Section[];
```
Copy is the UI-SPEC "Copywriting Contract" verbatim (titles, descriptions, rows). `site.ts` also holds `origin: "https://yahya-hallani.dev"`, name, role line, nav/skip/header/footer labels, contact, resume path. Each page file exports one `as const satisfies <PageInterface>` object. Playwright imports these with a relative path (`../content/site`), not `@/` (RESEARCH JS-off note).

### `lib/sections.ts` and `lib/metadata.ts` (utility, pure transform)

**Analog:** `lib/build-info.ts` (full file, 7 lines):
```ts
const SHA_PATTERN = /^[0-9a-f]{7,40}$/i;
const SHORT_SHA_LENGTH = 7;

export function shortSha(sha: string | undefined): string {
  if (!sha || !SHA_PATTERN.test(sha)) return "local";
  return sha.slice(0, SHORT_SHA_LENGTH).toLowerCase();
}
```
Copy the shape: module constants on top, small named pure functions, early returns, no mutation. `lib/sections.ts`: `sectionBySlug`, `indexOf(slug)`, `nextSection(slug)` (wraps to index for say-hi), `counterLabel(slug)` ("0N / 05"), letter sections (`letter !== null`). Throw on an unknown slug rather than returning undefined. `lib/metadata.ts`:
```ts
export function pageMetadata(slug: Slug): Metadata {
  const s = sectionBySlug(slug);
  return { title: s.title, description: s.description, alternates: { canonical: s.route } };
}
```
(canonical becomes absolute through `metadataBase` in the layout, verified to emit the trailing slash).

### `lib/build-info.ts` + `tests/build-info.test.ts`, DELETE

User decision 2026-11-08 (resolves RESEARCH Open Question 3): drop the build SHA. Delete both files in the same task that replaces `app/page.tsx`, so `pnpm typecheck`/`pnpm test` never see a dangling import. Check for other references with `grep -rn build-info --exclude-dir=node_modules --exclude-dir=.planning .` (today: only `app/page.tsx:2` and `tests/build-info.test.ts:2`). `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` is used nowhere else.

---

### `tests/sections.test.ts`, `tests/content.test.ts` (unit, pure)

**Analog:** `tests/build-info.test.ts` (lines 1-26): one `describe` per function, `it("returns ... when ...")` behaviour names, direct `expect(fn(x)).toBe(y)`.
```ts
import { describe, expect, it } from "vitest";
import { shortSha } from "@/lib/build-info";

describe("shortSha", () => {
  it("returns 'local' when the SHA is undefined", () => {
    expect(shortSha(undefined)).toBe("local");
  });
```
Content fact guards (UI-SPEC "Fact guards"): serialise all content exports with `JSON.stringify` and assert `not.toMatch(/top 1/i)`, no phone pattern, no em dash `—`, ended roles contain "to" and not "Since".

### `tests/contrast.test.ts`, `tests/css-guard.test.ts` (unit, file-I/O)

**Analog:** `tests/vercel-config.test.ts` lines 1-25 (file loading + helper + constants):
```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ALL_PATHS = "/(.*)";
const ONE_YEAR_SECONDS = 31536000;

// jsdom gives import.meta.url a non-file scheme, so resolve from the Vitest root.
function loadConfig(): VercelConfig {
  return JSON.parse(
    readFileSync(join(process.cwd(), "vercel.json"), "utf8"),
  ) as VercelConfig;
}
```
The contrast test body is RESEARCH "Contrast test (D-14)" verbatim (WCAG luminance; `TEXT_TOKENS = ["ink","dim","accent"]`, `AA_NORMAL = 4.5`, `MIN_GREY = 0x8a`). css-guard: list `components/**/*.module.css` + `styles/base.css` with `readdirSync(..., { recursive: true })` (Node 22), then assert no `#[0-9a-f]{3,8}\b`, no `font-family` other than `var(--font-sans)`; scan `components/**/*.tsx` for `(aria-label|alt|title)="[^"]` (the gap `jsx-no-literals` `ignoreProps` leaves, RESEARCH Pattern 6).

### `tests/shell.test.tsx` (component render, jsdom)

**Partial analog:** `tests/setup.ts` already loads `@testing-library/jest-dom/vitest`; `vitest.config.mts` already has `@vitejs/plugin-react` and `include: ["tests/**/*.test.{ts,tsx}"]`. No component test exists. Use `render(<Shell current="about" />)` from `@testing-library/react`, then assert `getAllByRole("heading", { level: 1 })` length 1, `container.querySelectorAll("section[inert]")` length 5, exactly one `[aria-current="page"]` in the nav with name "04 About". Shell must stay synchronous (Vitest cannot render async server components). CSS module imports work in Vitest by default.

### `e2e/a11y.spec.ts`, `e2e/csp.spec.ts` (extend to all routes)

**Analog:** themselves. a11y (lines 4-10) wraps in a loop:
```ts
test("axe finds no violations on /", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
```
becomes `for (const s of sections) for (const vp of VIEWPORTS) test(`axe ${s.route} ${vp.name}`, ...)` with `page.setViewportSize(vp)`; `VIEWPORTS = [{1440x900},{390x844}]`; `sections` from `../content/site`. csp: change `runUnderCsp(page, csp)` to take a `route` and replace the hard-coded `page.goto("/")` at line 46; loop the positive test over the six routes, keep the negative control on `/`.

### `e2e/assets.spec.ts` (fix, Pitfall 7)

**Analog:** itself. Keep lines 4-24 (first-party check, font loaded) and 34-44 (PDF, noindex) on `/`, and add a loop of the first-party check over all routes. Move the image block (lines 26-32) to `page.goto("/about/")`. The resume link needs `.first()` or header scoping on routes with two "Resume" links (`/say-hi/`).

### `e2e/routes.spec.ts`, `e2e/layout.spec.ts`, `e2e/focus.spec.ts`, `e2e/font-shift.spec.ts`

**Analogs:** `e2e/assets.spec.ts` (`page.evaluate` returning plain data, then `expect`), `e2e/csp.spec.ts:33-43` (`page.route` interception, used by font-shift to `r.abort()` `**/*.woff2`). Bodies: RESEARCH "JS-off routing", "Tab-walk focus check", "Font-shift e2e". `routes.spec.ts` runs under both projects; layout checks `document.documentElement.scrollWidth <= innerWidth` at 320/390/1366/1440, exactly one rail link computing `rgb(95, 174, 132)` on 01-05, and 12 tracks in the computed `grid-template-columns`.

### `e2e/visual.spec.ts` (no analog)

`await expect(page).toHaveScreenshot(`${slug}-${vp}.png`)` for 6 routes x {1440x900, 1366x768, 390x844}, after `document.fonts.ready`. Runs only in the `visual` project, in `mcr.microsoft.com/playwright:v1.65.0-noble` (Pitfall 6).

### `playwright.config.ts` (config), modify

**Analog:** itself, line 23:
```ts
projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
```
Extend to `chromium` (`testIgnore: /visual\.spec\.ts/`), `chromium-nojs` (`javaScriptEnabled: false`, `testMatch: /routes\.spec\.ts/`), `visual` (`testMatch: /visual\.spec\.ts/`). Keep the `webServer`/`BASE_URL` block (lines 3-21) unchanged. `serve` already answers `/x/` (verified).

### `next.config.ts`, `eslint.config.mjs`, `vercel.json`, `.github/workflows/ci.yml`, `scripts/measure-js.mjs` (config), modify

- `next.config.ts` lines 3-6: add `trailingSlash: true` beside `output`/`images`.
- `eslint.config.mjs` lines 5-18: insert after `...nextTs`:
  ```js
  { files: ["app/**/*.tsx", "components/**/*.tsx"],
    rules: { "react/jsx-no-literals": ["error", { noStrings: true, ignoreProps: true }] } },
  ```
  Do not use `noAttributeStrings` (RESEARCH Pattern 6).
- `vercel.json`: add `"trailingSlash": true` only if the preview curl shows no 308 (Pitfall 8). If you add it, add a matching `it(...)` to `tests/vercel-config.test.ts` in the style of lines 52-54.
- `.github/workflows/ci.yml` e2e job (lines 48-67 of the file): keep `name: e2e`, never add `paths`. Either add `container: mcr.microsoft.com/playwright:v1.65.0-noble` to the job or add a separate step running `--project=visual` inside it. The header comment (lines 1-2) states the job-name rule; keep it.
- `scripts/measure-js.mjs` line 24 reads only `out/index.html`. Optionally loop the six `out/<route>/index.html`, keeping the constants/exit-code style (lines 7-9, 64-69).

### Assets (`assets/*.webp`)

**Analog:** `assets/portrait-800.webp` (Phase 2 recipe). Commands: RESEARCH "Image conversion" (`magick ... -strip -define webp:method=6 -quality 66|72|78`, then an `exiftool` GPS/camera check). Static-import in content or Photo with `@/assets/...` as `app/page.tsx:1` does.

---

## Shared Patterns

### No text literals (CONT-09)
**Source:** RESEARCH Pattern 6 + `eslint.config.mjs`. **Apply to:** every `app/**/*.tsx` and `components/**/*.tsx`. All visible strings, `alt`, `aria-label` and internal hrefs come from `content/*.ts`. Separators are `{" "}` only.

### Server-only, zero client JS
**Apply to:** all components. No `'use client'`, no hooks, no `next/link`, no `next/image`. Verified budget is 132.2 kB gzip; the CI gate is `pnpm measure:js -- --max-gzip-kb 150` (`ci.yml` e2e step).

### Per-route state comes from a `current: Slug` prop
**Source:** RESEARCH Pattern 1/2. **Apply to:** Shell, Header, LetterNav, Track, Footer. Only `data-current`, `inert`, heading level, `aria-current`, counter, `--page-index`, `loading` and the header label vary by route; element ids and order never vary.

### Interactive colour and focus
**Source:** v7 lines 38-41, plus the UI-SPEC accent list. **Apply to:** base.css (global) and letters.module.css (rail override). Accent on hover (fine pointer only), `:focus-visible`, `:active`; a 2px accent ring with a 4px offset everywhere; an ink ring and no accent on rail links except `aria-current`.

### Test file conventions
**Source:** `tests/vercel-config.test.ts`, `tests/build-info.test.ts`, `e2e/csp.spec.ts`. **Apply to:** all new tests. Explicit vitest imports, `process.cwd()` paths, `UPPER_SNAKE` thresholds, a decision/pitfall ID in a comment, data-driven loops over `sections` from `../content/site` in e2e.

## No Analog Found

| File | Role | Data Flow | Reason / Use instead |
|------|------|-----------|----------------------|
| `components/shell/*` | server component | transform | No components exist; RESEARCH Pattern 2 + UI-SPEC Shell contract |
| `components/frame/*` | server component | transform | v7 lines 54-59, 66, 74-75 for CSS values only |
| `components/letters/*` | server component | transform | RESEARCH Pattern 4 + v7 lines 82-134 (minus the fonts-ready gate and FLIP duplicates) |
| `components/pages/*` | server component | transform | UI-SPEC Page Compositions + v7 page CSS |
| `content/types.ts`, `content/*.ts` | data model | static | RESEARCH Pattern 5; copy from UI-SPEC Copywriting Contract |
| `styles/tokens.css` | tokens | n/a | v7 lines 19-31 + UI-SPEC token tables |
| `e2e/visual.spec.ts` | visual test | screenshot | Playwright `toHaveScreenshot`; Pitfall 6 container |
| `tests/shell.test.tsx` | component test | render | First Testing Library test; harness already configured |

## Metadata

**Analog search scope:** whole repo via `git ls-files` (excluding `docs/` binaries and `.planning/`); read every product file: `app/*`, `lib/*`, `tests/*`, `e2e/*`, `scripts/*`, `next.config.ts`, `eslint.config.mjs`, `playwright.config.ts`, `vitest.config.mts`, `tsconfig.json`, `package.json`, `vercel.json`, `.github/workflows/ci.yml`; reference CSS from `docs/reference/swiss-horizontal-v7.html` lines 19-135.
**Files scanned:** 21 product/config files + 1 reference sketch.
**Pattern extraction date:** 2026-11-08
