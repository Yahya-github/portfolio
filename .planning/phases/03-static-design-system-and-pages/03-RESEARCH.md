# Phase 3: Static Design System and Pages - Research

**Researched:** 2026-11-08
**Domain:** Next.js 16 App Router static export: server-rendered multi-route shell, CSS Modules design tokens, self-hosted variable font without layout shift, accessibility testing (Vitest + Playwright + axe)
**Confidence:** HIGH (most claims verified by a scratch prototype build in this session)

## Summary

The UI-SPEC (`03-UI-SPEC.md`, approved) already fixes nearly every visual value, the DOM order and the data-file split. So this research answers the *mechanical* questions the planner needs: where the shell lives in the App Router tree, how per-route state (current page, h1/h2, `inert`, `aria-current`, canonical) gets into static HTML, how to keep the giant letters from shifting while the font loads, how to enforce "no text literals in components", and how to test all of it against the built `out/`.

A scratch prototype (a copy of the repo, built with the real toolchain) confirmed several things. `trailingSlash: true` plus `metadataBase` plus `alternates.canonical` emits `https://yahya-hallani.dev/achievements/` exactly. React 19 serialises `inert={true}` as `inert=""` in server HTML. Per-route `h1`/`h2` and `aria-current` render correctly when a server `Shell` gets a `current` prop from each `page.tsx`. `display: "block"` in `next/font/local` still emits the preload link and a size-adjusted fallback face. JS stays at 132.2 kB gzip (no client components needed). Next.js docs confirm that **layouts cannot read the pathname**, so the per-route "current" value must come from each `page.tsx`, not from `layout.tsx`.

The research also found four problems the UI-SPEC does not cover, which the plan must handle:
1. During the `font-display: block` period the browser lays out invisible text with **fallback metrics**. The hero letters therefore change width when Instrument Sans arrives unless each letter box has a fixed em width.
2. The portrait `sizes="33vw"` under-selects the source, because `object-fit: cover` draws the image about 941px wide.
3. At 320px wide, "Achievements", "Resume (PDF)" and "Involvement" at the 64px phone Display size overflow the 252px content width.
4. An internally scrolling page box with no focusable content fails axe `scrollable-region-focusable` (tagged `wcag2a`).

**Primary recommendation:** Keep `app/layout.tsx` as html/body/font/base metadata only. Have every route's `page.tsx` export its metadata and render one server `<Shell current="{slug}" />` that outputs all six sections. Use plain `<a>` with data-sourced hrefs (no `next/link`) and give the hero letters fixed measured em widths. Ship zero client components in this phase.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Six route HTML files with all six pages, current one visible | Frontend Server (build-time SSG via `output: 'export'`) | CDN / Static (Vercel serves `out/`) | Must work with JS off (A11Y-05); only the build knows which route is being rendered |
| Per-route current state (h1, `inert`, `aria-current`, counter, progress index, header section name) | Build-time Server Components (`page.tsx` passes `current`) | — | Layouts cannot see the pathname [CITED: nextjs.org layout docs] |
| Hiding non-current pages | Browser CSS (`.page[inert] { display: none }`) | — | Phase 4 overrides one rule under `html[data-js]` |
| Design tokens, grid, type roles | Browser CSS (`styles/tokens.css` + CSS Modules) | — | Project constraint (CLAUDE.md) |
| Font self-hosting and preload | Build (next/font/local) | CDN (immutable `/_next/static/media`) | Already wired in Phase 2 |
| Canonical / title / description / robots | Build (Metadata API) | CDN headers (`X-Robots-Tag` in vercel.json) | D-07; noindex stays |
| Trailing-slash redirects (`/about` to `/about/`) | CDN / Vercel routing | — | Must be checked on a preview deploy (see Open Questions) |
| All copy | Typed data files `content/*.ts` | — | CONT-09, D-12 |
| Contrast guarantee | Unit test (token math) | E2E (axe on rendered pages) | D-14 |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Composition depth
- **D-01:** Build each page's **final desktop static layout now**: the column spans and type roles from design doc §7 (Index YAHYA bottom-anchored with captions, role line cols 1-4 and meta labels cols 7-12; Achievements AC/HI/EV/EM/EN/TS stack cols 1-2 with the five lines on a subgrid in cols 3-10; Projects Facturo cols 1-8 with five compact ruled rows in cols 9-12, including the below-880px-height rule; Experience ruled Work/Involvement table cols 1-6 / 7-12 with the head-size rule; About portrait cols 1-4, TWO/HAB/ITS cols 5-8, text cols 8-12 bottom-aligned; Say hi four Display lines cols 1-6 with the address line). Phase 6 adds behaviour, not layout.
- **D-02:** Decorative devices wait for **Phase 6**: Index grid lines, About quarter rings, Experience cropped "03", margin section names, Say hi spiral. Leave their columns empty (the compositions already reserve them).
- **D-03:** Photos now: **About portrait and one Facturo still**, greyscale pre-converted files, hard-cropped, explicit dimensions so nothing shifts (portrait `object-position: 52% 10%`). Achievements previews, colour twins, the Facturo walkthrough, the MAME preview and Experience org marks are Phase 6.
- **D-04:** Phones are **readable, not designed**: single-column stack, no horizontal overflow at 320-390px, YAHYA fitted to the width. The design doc's phone portrait intents are Phase 6.

#### Route markup model
- **D-05:** Every route renders **all six pages in one shared track** (shared layout), with its own page active and the other five present but hidden and `inert`. Phase 4 slides this track; nothing remounts, so the Phase 5 letter FLIP has stable elements.
- **D-06:** With JS off, a route shows **only its own page** (others hidden by CSS); letter links, the rail, header and the Next link navigate between routes like a normal site.
- **D-07:** **Self-canonical per route**, each with its own title and description (resolves the STATE.md canonical blocker). Full SEO metadata, OG card and JSON-LD stay Phase 7. The site stays noindex until launch (Phase 2 D-12).

#### Chrome without JS
- **D-08:** **Fixed header now**, server-rendered per route: cols 1-3 "Yahya Hallani", cols 4-6 current section name, cols 10-12 "Resume (PDF)" and "Say hi" as plain links (Label role, hairline bottom rule).
- **D-09:** **Footer now, static**: `00 / 05` counter with tabular figures reflecting the route, "Next, {Section}" as a real `<a>` to the next route ("Back to the start" on Say hi), progress bar at the static width for the route. The Pause motion button waits for Phase 6 (nothing moves yet).
- **D-10:** **Static rail now** on pages 01-05: the five letters as a vertical rail of links in the left margin, current one in the accent with its numbered name and `aria-current="page"`; hover/focus never colour rail letters (focus = ink ring). Index has no rail. Phase 5 replaces the route jump with the FLIP glide.

#### Data files & copy
- **D-11:** Copy = **design doc §7 facts verbatim** (ranks, roles, dates, project lines, About draft line, contact). Yahya rewrites in Phase 7 by editing data files only. Only verified facts; no CCC "top 1", no Atlantis line counts, no phone number, no CRC contest platform.
- **D-12:** Data shape: **`content/site.ts`** (name, role line, sections/letters/routes/captions, contact, resume path) plus **one typed file per page** (`content/achievements.ts`, `projects.ts`, `experience.ts`, `about.ts`, `say-hi.ts`, and an index file if needed), typed with TS interfaces and `as const satisfies`. No text literals in components. French later = parallel files.
- **D-13:** `/projects/facturo/` deep dive is **Phase 6**; the "Read the deep dive" link waits with it (no dead link in Phase 3).
- **D-14:** Contrast: a **Vitest unit test** computes the WCAG ratio of every text token against the ground and fails below AA or if any text grey is darker than `#8a8a8a`; plus the existing `@axe-core/playwright` run extended to all six routes.

### Claude's Discretion
- Component and folder structure (shared track layout, Page components, CSS Module split), within CSS Modules + `tokens.css`.
- How hidden pages are hidden without JS (CSS by route attribute vs `hidden`), as long as D-05/D-06 hold and Phase 4 can take over.
- Font loading strategy that keeps the giant letters from shifting (next/font/local with the committed variable file, size-adjusted fallback, preload).
- Visual regression baselines (Playwright screenshots at 1440x900, 1366x768, 390x844) now or later.
- Exact Facturo still frame and image sizes/formats.
- Header current-section text on Index.

### Folded Todos
- **Update portfolio-design and portfolio-voice-and-facts skills to design doc rev 5** (`.planning/todos/pending/2026-11-07-update-portfolio-skills-to-design-rev-5.md`): the skills still describe the retired light design and would mislead Phase 3 builders. Do it first in this phase: rewrite `~/.claude/skills/portfolio-design/SKILL.md` from the approved doc and 01-UI-SPEC tokens; update `~/.claude/skills/portfolio-voice-and-facts/SKILL.md` with the round 6-7 facts (MAME Tool Rental project and Experience row "Developer, since Nov 2026", Facturo "Jun 2026 to Oct 2026", Showdown AI lines).
- **Carry v7 review warnings into the build** (already referenced from Phase 2): in Phase 3 only the `--yahya-fit` 2.188 + manual YA kerning rule applies; WR-04..08 and IN-01 stay for Phases 4-5.

### Deferred Ideas (OUT OF SCOPE)
- Decorative devices (grid lines, quarter rings, cropped 03, margin names, spiral) — Phase 6 (D-02).
- Designed phone portrait layouts — Phase 6 (D-04).
- `/projects/facturo/` deep dive — Phase 6 (D-13).
- Pause motion control — Phase 6.

**Binding design contract:** `03-UI-SPEC.md` (approved 2026-11-08) decides the discretion items above: shell DOM order, `.page[inert] { display: none }`, `display: "block"` font loading, header "Index" on `/`, visual baselines now (Chromium, 3 viewports), image formats, data-file contents, all copy. This research does not reopen them. Where it finds a technical gap in the UI-SPEC, it says so explicitly (Pitfalls 1-4).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSGN-01 | Dark ground, white type, one green accent for emphasis and current section | Token values verified (contrast table); raw-hex guard test; accent-use e2e check (Validation) |
| DSGN-02 | One sans family on a modular scale and a 12-column grid | `next/font/local` already wired; `display: block` verified; grid primitive + subgrid (Pattern 3) |
| DSGN-06 | No ornament | No icon/illustration deps; decorative columns left empty; guard by review + screenshot baselines |
| CONT-01 | Role line readable with no interaction | Server-rendered text in the Index section; JS-off e2e |
| CONT-09 | All text in typed data files; only verified facts | `as const satisfies` pattern; `react/jsx-no-literals` (verified config); content fact-guard test |
| LTR-01 | YAHYA giant letters, each a link to its section | Plain `<a>` with data hrefs (lint-safe, verified); fixed-width letter boxes (Pitfall 1) |
| LTR-02 | Numbered caption under each letter | Caption inside the link (accessible name "01 Achievements"); absolute under the fixed-width box |
| A11Y-02 | Skip link + visible focus on every control | Skip link first in DOM; `main tabindex=-1`; Tab-walk outline e2e |
| A11Y-03 | WCAG AA contrast on dark ground | Ratios verified: ink 17.27, dim 6.01, accent 7.38; `#8a8a8a` = 5.70; unit test + axe |
| A11Y-05 | JS off: all text present; every letter reaches its page | `javaScriptEnabled: false` Playwright project; plain anchors; `serve` handles `/x/` (verified) |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Next.js 16.4 App Router, React 19.3, TypeScript ~6.0.3 (not 7), `output: 'export'`, deployed by the Vercel Git integration. No basePath. Headers live in `vercel.json`.
- Styling: CSS Modules + one global `tokens.css`; CSS Grid 12 columns + `subgrid`. **No Tailwind**, no component kit.
- Font via `next/font` (here `next/font/local`, self-hosted). No Google Fonts `<link>`, no runtime CDN.
- **No `next/image`** on the landing page (+5.7 kB gzip); `images.unoptimized: true`; use `<img>` with static imports.
- Not supported by static export: `headers`/`redirects`/`rewrites`, middleware, route handlers reading `Request`, Server Actions.
- No gesture or smooth-scroll libraries (Phase 4 concern; nothing to add now).
- Testing: Vitest 5 (jsdom + Testing Library) in `tests/`; Playwright 1.65 against built `out/` in `e2e/`; `@axe-core/playwright`; Lighthouse CI optional.
- Lint: ESLint 10 flat config with eslint-config-next 16.4; Prettier 3; `pnpm lint` uses `--max-warnings 0`.
- Content: only verified real facts; no invented numbers. Assets self-hosted.
- Accessibility: WCAG contrast, keyboard, reduced motion.
- CI job names `lint`, `typecheck`, `unit`, `e2e` are required checks: never rename them, never add path filters.
- Process: work through GSD commands. Commits use conventional format; **no Claude co-author trailer** (user memory: "No Claude co-author").
- User rules: files under 800 lines, functions under 50 lines, immutability, no `console.log`, 80% coverage target, no hardcoded secrets.

## Current Repo State (verified by reading files)

| Item | State | Phase 3 impact |
|------|-------|----------------|
| `next.config.ts` | `output: "export"`, `images.unoptimized: true` | Add `trailingSlash: true` |
| `app/fonts.ts` | `localFont`, `display: "swap"`, `weight: "400 700"`, `font-stretch 75% 100%`, `variable: "--font-sans"` | Change to `display: "block"` (UI-SPEC) |
| `app/layout.tsx` | `<html lang="en" className={font.variable}>`, metadata title + robots noindex | Add `metadataBase`, keep robots; import `styles/tokens.css` + globals |
| `app/page.tsx` | Phase 2 placeholder (h1, portrait, resume link, build SHA) | Replace |
| `app/globals.css` | `body { margin: 2rem }` placeholder | Replace with reset + base |
| `assets/portrait-800.webp` | 800x656, 37.8 kB | Keep as small srcset candidate |
| `e2e/a11y.spec.ts` | axe on `/` only | Loop 6 routes x 2 viewports |
| `e2e/assets.spec.ts` | Expects a visible portrait `img` **on `/`** | **Will break**: the portrait moves to the hidden About section. Point that assertion at `/about/` |
| `e2e/csp.spec.ts` | CSP on `/` only | Loop 6 routes |
| `playwright.config.ts` | One `chromium` project, `serve out -l 4173` | Add `chromium-nojs` (`javaScriptEnabled: false`); add visual project |
| `scripts/measure-js.mjs` | Measures `out/index.html` only | Fine; optionally loop routes |
| `eslint.config.mjs` | next vitals + ts | Add `react/jsx-no-literals`; decide `no-img-element` |
| CI | 4 jobs; e2e installs chromium only | Visual baselines need a pinned container (Pitfall 6) |
| `lib/build-info.ts` | `shortSha()` used by the placeholder only | Becomes unused when `app/page.tsx` is replaced (Open Question 3) |

## Standard Stack

Nothing new to install. Everything needed is already in `package.json` [VERIFIED: package.json, node_modules].

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.4.5 | SSG, Metadata API, next/font/local | Installed; prototype build verified |
| react / react-dom | 19.3.1 | Server Components; boolean `inert` | `@types/react` 19.3 declares `inert?: boolean` [VERIFIED: node_modules/@types/react/index.d.ts:2948] |
| typescript | ~6.0.3 | `as const satisfies` for data files | Installed |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest + jsdom + @testing-library/react | 5.1.0 / 31.0.0 / 16.3.3 | Token contrast test, content guards, Shell render tests | Unit tier |
| @playwright/test | 1.65.0 | JS-off routing, focus, overflow, font-shift, screenshots | E2E tier |
| @axe-core/playwright (axe-core 4.14.0) | 4.14.0 | WCAG A/AA scan on 6 routes x 2 viewports | E2E tier |
| eslint-plugin-react | 7.37.5 (bundled by eslint-config-next) | `react/jsx-no-literals` | Lint gate for CONT-09 [VERIFIED: node_modules/.pnpm] |
| ImageMagick | 7.1.2-34 (system) | Greyscale WebP conversion, `-strip` metadata | One-time asset step (Phase 2 recipe) |
| exiftool | system | Verify no GPS/camera metadata | Asset verification |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shell rendered by each `page.tsx` | Shell in `layout.tsx` + `'use client'` `usePathname()` | Puts every component and all copy into client JS, and needs JS for per-route state at hydration. Rejected |
| Plain `<a>` for internal links | `next/link` | `<Link>` prefetches every static route in the viewport (each route's RSC payload holds all six pages). Its soft navigation replaces the page segment, which remounts the track Phase 4 wants stable. Plain `<a>` is identical with JS on or off. Phase 4 intercepts clicks and uses `history.pushState`, which Next integrates without refetching [CITED: nextjs.org/docs/app/getting-started/linking-and-navigating] |
| Optional catch-all `app/[[...section]]/page.tsx` | Six static folders | A catch-all also remounts per param and needs `generateStaticParams` plus a slug check. Six explicit folders are clearer and type-check via `next typegen` |
| `lib/tokens.ts` as colour source + equality test | Parse `styles/tokens.css` in the test | Parsing the CSS keeps one source of truth with no generation step. Recommended |
| Stylelint for "no raw hex outside tokens.css" | Vitest grep test over `**/*.module.css` | Stylelint is not installed; a 15-line test is enough |

## Architecture Patterns

### System Architecture Diagram

```
 content/*.ts (typed copy, as const satisfies)
        │
        ▼
 app/<route>/page.tsx  ──exports metadata (title, description, canonical)──► <head>
        │ current = "achievements"
        ▼
 components/Shell (Server Component, no 'use client')
   ├─ SkipLink  → href="#content"
   ├─ Header    → current section name, Resume, Say hi (aria-current on /say-hi/)
   ├─ LetterNav → 5 <a> (data-mode="hero" on "/", "rail" elsewhere; aria-current on current)
   ├─ Track <main id="content" tabindex=-1 data-current=slug>
   │    └─ 6 × <section id="page-{slug}" inert={!current} aria-labelledby>
   │          └─ IndexPage | AchievementsPage | ... (h1 if current else h2)
   └─ Footer    → "0N / 05", Next link, progress bar (--page-index)
        │
        ▼  next build (output: 'export', trailingSlash: true)
 out/index.html, out/achievements/index.html, ... (6 HTML files, all six sections each)
        │
        ▼  Vercel static (vercel.json headers: CSP, HSTS, noindex)
 Browser: CSS `.page[inert]{display:none}` → only the current page is visible, JS on or off
        │ click on letter/rail/header/footer <a>
        └──► full document load of the target route (Phase 4 replaces this with pushState + slide)
```

### Recommended Project Structure
```
app/
├── layout.tsx            # html/body, font variable, metadataBase, robots noindex, imports styles/
├── page.tsx              # export metadata = pageMetadata("index"); <Shell current="index" />
├── achievements/page.tsx # same 3-line pattern
├── projects/page.tsx
├── experience/page.tsx
├── about/page.tsx
└── say-hi/page.tsx
components/
├── shell/      Shell.tsx, Track.tsx, Page.tsx, shell.module.css
├── frame/      SkipLink.tsx, Header.tsx, Footer.tsx, *.module.css
├── letters/    LetterNav.tsx, letters.module.css   # one set of 5 links, hero + rail modes
└── pages/      IndexPage.tsx, AchievementsPage.tsx, ... + one .module.css each
content/        site.ts, index.ts, achievements.ts, projects.ts, experience.ts, about.ts, say-hi.ts, types.ts
lib/            metadata.ts (pageMetadata(slug)), sections.ts (next/prev/index helpers)
styles/         tokens.css, base.css (reset, body, focus ring, .visually-hidden, .grid)
assets/         portrait-1512.webp, portrait-800.webp, facturo-01-1440.webp, facturo-01-960.webp
tests/          contrast.test.ts, content.test.ts, css-guard.test.ts, sections.test.ts, shell.test.tsx
e2e/            routes.spec.ts, focus.spec.ts, layout.spec.ts, font-shift.spec.ts, visual.spec.ts, a11y/assets/csp (extended)
```

### Pattern 1: Per-route Shell from page.tsx (verified in prototype)
**What:** The root layout stays generic. Each route passes its slug to one server `Shell`.
**Why:** "Layouts do not re-render on navigation, so they do not access pathname which would otherwise become stale." [CITED: nextjs.org/docs/app/api-reference/file-conventions/layout]. The D-05 "shared layout" intent (identical markup and element identity on every route) is met by one shared `Shell` component. Phase 4 then pages with `history.pushState`, so React never remounts the track.
```tsx
// app/achievements/page.tsx   (verified output: canonical https://yahya-hallani.dev/achievements/)
import type { Metadata } from "next";
import { Shell } from "@/components/shell/Shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("achievements");
export default function Page() {
  return <Shell current="achievements" />;
}

// lib/metadata.ts
import type { Metadata } from "next";
import { sectionBySlug, type Slug } from "@/content/site";
export function pageMetadata(slug: Slug): Metadata {
  const s = sectionBySlug(slug);
  return { title: s.title, description: s.description, alternates: { canonical: s.route } };
}

// app/layout.tsx additions
export const metadata: Metadata = {
  metadataBase: new URL(site.origin),          // "https://yahya-hallani.dev" from content/site.ts
  title: site.name,
  robots: { index: false, follow: false },
};
```

### Pattern 2: Track with inert sections (verified: `inert=""`, h1/h2 switch)
```tsx
// components/shell/Track.tsx (server)
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
/* shell.module.css: Phase 3 rule; Phase 4 overrides it under html[data-js] */
.page[inert] { display: none; }
.track:focus { outline: none; }     /* programmatic skip-link target, not a control */
```
`isCurrent` also drives `loading="eager"` vs `"lazy"` on the two photos. Verified in Chromium: a `loading="lazy"` image inside an inert `display:none` section is **not** requested, but an eager one **is** [VERIFIED: Playwright prototype].

### Pattern 3: Grid primitive and subgrid
```css
/* styles/base.css */
.grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--grid-gutter); }
/* nested block that must stay on master columns */
.lines { grid-column: 3 / 11; display: grid; grid-template-columns: subgrid; row-gap: var(--space-lg); align-items: baseline; }
```
Note: CSS Modules hashes class names, so a global `.grid` must sit in a global stylesheet (`styles/base.css` imported in the layout) or be composed with `composes: grid from global;`. Pick one convention and keep to it.

### Pattern 4: Fixed-width hero letters (prevents font-load shift, see Pitfall 1)
```css
/* tokens.css: measured in Chromium, Instrument Sans wdth 75 / wght 700 / letter-spacing -0.045em */
--adv-y: 0.461em;  --adv-a: 0.445em;  --adv-h: 0.469em;
/* letters.module.css */
.hero .letter { position: relative; display: block; flex: none; width: var(--adv); height: 0.76em; pointer-events: none; }
.hero .letter[data-glyph="Y"] { --adv: var(--adv-y); margin-right: var(--yahya-kern); }
.hero .letter::before { content: ""; position: absolute; inset: 0; pointer-events: auto; } /* hit box = advance x 0.76em */
.hero .caption { position: absolute; left: 0; top: calc(100% + var(--space-md)); pointer-events: auto; white-space: nowrap; }
```
The v7 sketch measured the same boxes: Y .461, A .445, H .469; word 2.156em; right edge 1395.7px at 1440x900 with a 636.2px Poster [VERIFIED: Playwright on swiss-horizontal-v7.html]. `data-glyph` is a literal attribute; keep the glyph itself (`"Y"`) in `content/site.ts`.

### Pattern 5: Typed data files
```ts
// content/types.ts
export type Slug = "index" | "achievements" | "projects" | "experience" | "about" | "say-hi";
export interface Section { slug: Slug; route: `/${string}`; letter: string | null; number: string; name: string; title: string; description: string; }
// content/site.ts
export const sections = [
  { slug: "index", route: "/", letter: null, number: "00", name: "Index", title: "Yahya Hallani", description: "…" },
  { slug: "achievements", route: "/achievements/", letter: "Y", number: "01", name: "Achievements", title: "Achievements, Yahya Hallani", description: "…" },
  // …
] as const satisfies readonly Section[];
```
`satisfies` keeps the literal types (exhaustive `Slug` checks) while validating the shape. Do the next/previous route and counter maths in `lib/sections.ts` as pure functions, and unit-test them.

### Pattern 6: No text literals (verified ESLint config)
```js
// eslint.config.mjs (add)
{ files: ["app/**/*.tsx", "components/**/*.tsx"],
  rules: { "react/jsx-no-literals": ["error", { noStrings: true, ignoreProps: true }] } },
```
Verified behaviour: it flags JSX text such as `<a>hello</a>` and allows `{" "}` and all attribute strings [VERIFIED: prototype lint run]. `noAttributeStrings: true` is unusable: it flags template-literal ids (`` `page-${slug}` ``), `href`, `id` and `loading`. Since `ignoreProps` lets `aria-label="Sections"` and `alt="…"` through, add a Vitest test that scans `components/**/*.tsx` for `(aria-label|alt|title)="[^"]` and fails on a match.

### Anti-Patterns to Avoid
- **`'use client'` anywhere in Phase 3:** nothing is interactive beyond links and CSS. Any client component adds JS and moves copy into bundles.
- **The `hidden` attribute on pages:** the UI-SPEC chose CSS on `[inert]` so Phase 4 can override one rule.
- **Measuring text in JS for the Poster size or letter positions:** the size is CSS only (UI-SPEC), and v7's `.fonts-ready` visibility gate is banned (it breaks JS-off).
- **Literal internal hrefs in JSX** (`<a href="/projects/">`): lint is clean today only because hrefs come from data. `@next/next/no-html-link-for-pages` (error in core-web-vitals) checks only `Literal` href values [VERIFIED: rule source].
- **A colour token used for hover on rail letters**: rail accent comes from `aria-current` alone (v7 bug).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font self-hosting, preload, fallback metrics | Hand `@font-face` + `<link rel=preload>` | `next/font/local` (already wired) | Emits preload + `size-adjust`/ascent overrides for the fallback [VERIFIED: built CSS] |
| `<title>`, description, canonical | Manual `<head>` tags | Metadata API + `metadataBase` | Resolves absolute canonical with the trailing slash [VERIFIED: built HTML] |
| Accessibility scanning | Custom checks | `@axe-core/playwright` | Covers contrast on rendered pixels, names, landmarks |
| Contrast maths | Ad-hoc ratio guesses | 10-line WCAG relative luminance function in the test (formula below) | Matches WCAG 2.x exactly; verified values |
| Image optimisation at runtime | `next/image` loader | One-time `magick` conversion to WebP + static import | Export has no optimizer; `next/image` costs JS |
| Hiding inactive pages from AT and focus | `aria-hidden` + `tabindex=-1` sweeps | `inert` (+ `display:none` in Phase 3) | Native, one attribute |

**Key insight:** Phase 3 is almost pure HTML and CSS. Every piece of custom logic should be a pure function in `lib/` or `content/`, with a unit test.

## Common Pitfalls

### Pitfall 1: Hero letters change width when the font arrives (UI-SPEC gap)
**What goes wrong:** With `font-display: block`, text is invisible during the block period but **laid out with the fallback face**. Each hero letter is a flex item sized by its glyph. Under the fallback (size-adjusted Arial, which is tuned to Instrument Sans wdth 100, not wdth 75), Y/A/H measure 0.566/0.643/0.700em instead of about 0.40/0.445/0.469em [VERIFIED: Chromium measurement]. When the font loads, the row narrows by about 1em (over 600px at 1440) and the captions jump. If the font times out or fails, the fallback renders visibly at the wrong width.
**How to avoid:** Pattern 4. Give each letter box a fixed `width` in em from measured advances, and `height: 0.76em`. Geometry then no longer depends on which face is active.
**Warning signs:** The font-shift e2e (abort the `.woff2` request, compare letter rects with a normal load) differs by more than 1px.

### Pitfall 2: Split letters lose the YA kern; inline spans do not
**What goes wrong:** Adjacent *inline* spans are shaped as one run, so Chromium kerns YA across span boundaries (Y measured 0.398em inline vs 0.461em as a separate box). Flex items and inline-blocks are separate shaping contexts and lose the kern.
**How to avoid:** Use blockified letters (flex items) plus `margin-right: var(--yahya-kern)` (-0.063em) on both Y's, exactly as v7 does. Do not "fix" this by switching to inline spans, which would double-apply the kern.

### Pitfall 3: Portrait `sizes="33vw"` picks a source that is too small (UI-SPEC gap)
**What goes wrong:** The portrait (1512x1240, ratio 1.219) is drawn with `object-fit: cover` into a tall cols 1-4 box (about 455x772 at 1440x900), so it is drawn about 941px wide. The browser chooses from `sizes` (slot width, 33vw = 475px) and at DPR 1 picks the 800w file. That file is 656px tall, so it is upscaled 1.18x and soft.
**How to avoid:** Describe the drawn width: `sizes="(max-width: 820px) 100vw, calc((100vh - 128px) * 1.22)"`. Viewport units and `calc()` are valid in `sizes` [ASSUMED: standard `sizes` syntax; verify the chosen candidate with `currentSrc` in e2e].
**Sizes measured this session [VERIFIED: magick runs]:** 1512px q72 `-define webp:method=6` = 149.3 kB (at the limit); **q66 = 130.9 kB**; 1200px q72 = 62.9 kB. Recommend `portrait-1512.webp` at q66 + `portrait-1200.webp` at q72 + the existing 800. Facturo 1440x900 q78 = 42.3 kB and 960x600 = 21.7 kB, comfortably under 150 kB. The Facturo `sizes="(max-width: 820px) 100vw, 60vw"` is fine (cover width-bound at about 882px).

### Pitfall 4: Display words overflow at 320px (UI-SPEC gap)
**What goes wrong:** Phone content width at 320 is `320 - 16 - 36 - 16 = 252px`. Measured at wdth 75 / 700 / -0.05em [VERIFIED: Chromium]: "Achievements" 4.530em = 290px, "Resume (PDF)" 4.490em = 287px, "Involvement" 3.980em = 255px at 64px. `overflow-x: clip` hides the overflow but clips the words, which breaks D-04 "readable, no horizontal overflow at 320-390px". At 390 they fit (322px available).
**How to avoid:** On phones, size each Display word to its own fit: `font-size: min(64px, calc((100vw - 68px) / var(--word-em)))`, with `--word-em` set per element (4.53 for "Achievements", 4.49 for "Resume (PDF)", 3.98 for "Involvement"). Or apply one cap of `/ 4.6` to all phone Display text. This changes only widths below about 375px; at 390 they stay at 64px as the UI-SPEC says. Flag it in the plan as a UI-SPEC refinement, not a redesign. Other measured widths: Facturo 2.36, LinkedIn 2.69, GitHub 2.19, Email 1.72, Work 1.67, TWO 1.49em; the address at Label 12px is 224px.

### Pitfall 5: Nested scroll containers fail axe on phones
**What goes wrong:** The UI-SPEC page box is `height: 100svh; overflow-y: auto`. On a phone, About (portrait + text, **no links**) overflows, which creates a scrollable region with no focusable content. axe `scrollable-region-focusable` is tagged `wcag2a`/`wcag211`, so it is included in the existing `withTags` run and would fail [VERIFIED: axe-core 4.14.0 source].
**How to avoid:** At `max-width: 820px` use document flow: `.page { height: auto; min-height: 100svh; overflow: visible }`, so the document scrolls and keyboard scrolling works natively. Keep the fixed-height scroll box only on desktop, where every page fits 1440x900/1366x768/1280x720 (UI-SPEC). Then run axe at 390x844 on all routes.

### Pitfall 6: Visual baselines differ between Fedora and Ubuntu CI
**What goes wrong:** Playwright names snapshots `-chromium-linux.png` on both the local Fedora machine and the `ubuntu-latest` runner. Text antialiasing and hinting differ, so baselines generated locally fail in CI.
**How to avoid:** Generate and compare baselines in one image: `mcr.microsoft.com/playwright:v1.65.0-noble` (tag verified on MCR; podman and docker are installed locally). Either run the CI `e2e` job with `container: mcr.microsoft.com/playwright:v1.65.0-noble` (keep the job name `e2e`), or put screenshots in a separate Playwright project that CI runs only inside that container. Update baselines with `podman run --rm -v $PWD:/work -w /work mcr.microsoft.com/playwright:v1.65.0-noble pnpm exec playwright test --project=visual --update-snapshots` (the image needs pnpm via corepack and a prior `pnpm build`).
**Warning signs:** The first CI run fails on every screenshot with diffs of a few hundred pixels.

### Pitfall 7: The existing `assets.spec.ts` breaks
`getByRole("img", { name: /Yahya Hallani/ })` on `/` will find no visible image once the portrait lives in the hidden About section. Its `.toBeVisible()` fails, and with lazy loading the image is never fetched on `/`. Move the image assertion to `/about/`. Keep the font, PDF and noindex checks on `/`. On `/say-hi/` there are two "Resume (PDF)" links (header and page), so use `.first()` or scope to the header to avoid a strict-mode violation.

### Pitfall 8: Trailing slash on Vercel
`trailingSlash: true` makes the export emit `{route}/index.html`, and every canonical ends in `/` [VERIFIED]. Locally, `serve` answers both `/achievements/` and `/achievements` with 200 [VERIFIED]. On Vercel, `vercel.json` `trailingSlash: true` gives a 308 from `/about` to `/about/` [CITED: vercel.com/docs/project-configuration/vercel-json]. Whether the Next builder derives this from next.config alone is not verified. Check it on the preview: `curl -sI https://<preview>/about` should return 308 to `/about/`. If it does not, add `"trailingSlash": true` to vercel.json, plus a unit-test assertion in `tests/vercel-config.test.ts`.

### Pitfall 9: `--max-warnings 0` and `<img>`
`@next/next/no-img-element` is a **warning**, and `pnpm lint` fails on warnings. Either keep the one-line `eslint-disable-next-line` used in Phase 2 inside a single `Photo` component (recommended: one place, one reason), or turn the rule off with a comment in `eslint.config.mjs`.

### Pitfall 10: Skip-link target focus ring
After the skip link moves focus to `<main tabindex="-1">`, `:focus-visible` can match `main` and draw the accent ring around the whole viewport. Add `.track:focus { outline: none }` (main is a target, not a control), and keep the outline on every real control.

## Code Examples

### Contrast test (D-14)
```ts
// tests/contrast.test.ts   (formula reproduces UI-SPEC ratios: 17.27 / 6.01 / 7.38; #8a8a8a = 5.70) [VERIFIED: node]
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "styles/tokens.css"), "utf8"); // process.cwd(): jsdom breaks import.meta.url (see tests/vercel-config.test.ts)
const token = (name: string): string => {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!m) throw new Error(`token --color-${name} missing`);
  return m[1].toLowerCase();
};
const lum = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string): number => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const TEXT_TOKENS = ["ink", "dim", "accent"] as const;
const AA_NORMAL = 4.5;
const MIN_GREY = 0x8a;

describe("text tokens on the ground", () => {
  it.each(TEXT_TOKENS)("%s meets WCAG AA", (t) => {
    expect(ratio(token(t), token("ground"))).toBeGreaterThanOrEqual(AA_NORMAL);
  });
  it.each(TEXT_TOKENS)("%s, if grey, is not darker than #8a8a8a", (t) => {
    const hex = token(t);
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    if (r === g && g === b) expect(r).toBeGreaterThanOrEqual(MIN_GREY);
  });
});
```

### Font-shift e2e (deterministic: abort the font, compare geometry)
```ts
// e2e/font-shift.spec.ts
const boxes = (page: Page) => page.locator('nav[aria-label] a[data-glyph]').evaluateAll(
  (els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }));
test("hero letters keep their geometry without the web font", async ({ page, browser }) => {
  await page.goto("/"); await page.evaluate(() => document.fonts.ready);
  const loaded = await boxes(page);
  const ctx = await browser.newContext(); const p2 = await ctx.newPage();
  await p2.route("**/*.woff2", (r) => r.abort());
  await p2.goto("/"); const fallback = await boxes(p2);
  expect(fallback).toEqual(loaded);
});
```
(Use the selector the Shell actually emits, ideally with the `aria-label` value read from `content/site.ts`.)

### JS-off routing (A11Y-05)
```ts
// playwright.config.ts projects
projects: [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "chromium-nojs", use: { ...devices["Desktop Chrome"], javaScriptEnabled: false }, testMatch: /routes\.spec\.ts/ },
],
// e2e/routes.spec.ts: import sections from "@/content/site"? Playwright does not resolve the "@/..." alias: use a relative import ../content/site
for (const s of sections) test(`${s.route} shows only its page`, async ({ page }) => {
  await page.goto(s.route);
  await expect(page.locator("main > section:visible")).toHaveCount(1);
  await expect(page.locator(`#page-${s.slug}`)).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
});
```

### Tab-walk focus check (A11Y-02)
```ts
await page.goto(route);
await page.keyboard.press("Tab");
await expect(page.locator(":focus")).toHaveText(skipLabel);   // first Tab = skip link
for (let i = 0; i < 40; i++) {
  const st = await page.evaluate(() => { const e = document.activeElement as HTMLElement; const c = getComputedStyle(e);
    return { tag: e.tagName, style: c.outlineStyle, w: parseFloat(c.outlineWidth) }; });
  if (st.tag === "BODY") break;
  expect(st.style).not.toBe("none"); expect(st.w).toBeGreaterThanOrEqual(2);
  await page.keyboard.press("Tab");
}
```

### Image conversion (one-time, Phase 2 recipe extended)
```bash
magick docs/material/portrait-devfest-2026-grey.jpg -strip -define webp:method=6 -quality 66 assets/portrait-1512.webp   # 130.9 kB
magick docs/material/portrait-devfest-2026-grey.jpg -resize 1200x -strip -define webp:method=6 -quality 72 assets/portrait-1200.webp  # 62.9 kB
magick docs/material/screenshots/facturo-01-accueil-grey.png -strip -quality 78 assets/facturo-01-1440.webp   # 42.3 kB
magick docs/material/screenshots/facturo-01-accueil-grey.png -resize 960x600 -strip -quality 78 assets/facturo-01-960.webp  # 21.7 kB
exiftool assets/*.webp | grep -iE "GPS|Camera Model"   # must print nothing
```
Static-import each file (`import p1512 from "@/assets/portrait-1512.webp"`) and build `srcSet` from `.src`/`.width`, so URLs are hashed and immutable-cached.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next lint`, `.eslintrc` | `eslint .` flat config | Next 16 | Already done in Phase 2 |
| Pathname in layout via hacks | Shell per `page.tsx`, or `usePathname` in a client component | Long-standing App Router rule | Use the per-page Shell |
| `aria-hidden` + `tabindex` sweeps for hidden panels | `inert` (React 19 boolean prop) | React 19 | `inert={!isCurrent}` |
| JS font-ready visibility gates | `font-display: block` + font-independent geometry | — | Works with JS off |

## Runtime State Inventory

Not a rename/migration phase. The one out-of-repo item is the folded skills todo: `~/.claude/skills/portfolio-design/SKILL.md` (88 lines, still the retired light design: paper palette, Sofia Sans, Lenis, stickers) and `~/.claude/skills/portfolio-voice-and-facts/SKILL.md` (52 lines). These files are **outside the git repo**, so their edits are not committed. The plan should edit them, then move `.planning/todos/pending/2026-11-07-update-portfolio-skills-to-design-rev-5.md` to the done folder (that move is committed). Edits outside the working directory may need user permission at execution time.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `sizes` accepts `calc((100vh - 128px) * 1.22)` and browsers then pick the 1200/1512 source at 1440x900 | Pitfall 3 | Soft portrait; detect with an e2e `currentSrc` check |
| A2 | The Vercel Next builder may not 308 `/about` to `/about/` from next.config `trailingSlash` alone | Pitfall 8 | Duplicate URLs; fix by adding vercel.json `trailingSlash: true` |
| A3 | Glyph advances measured in Chromium (Y .461, A .445, H .469em) match Firefox and WebKit within 1px | Pattern 4 | Small hero misfit in other engines; Phase 4 adds those projects |
| A4 | Running visual tests in the `v1.65.0-noble` container gives stable baselines across local and CI | Pitfall 6 | Flaky screenshots; fall back to a manual-only visual project |

## Open Questions

1. **Phone Display fit below 375px (Pitfall 4).** The UI-SPEC says "64px on phones" and also "no horizontal overflow from 320px", and both cannot hold. Recommendation: per-word fit with `min(64px, …)`. Record it in the plan as a refinement and tell Yahya in the summary.
2. **Portrait `sizes` (Pitfall 3).** This is a technical correction to the UI-SPEC value. Recommendation: use the drawn-width `sizes` and add the 1200px file.
3. **`lib/build-info.ts` and the "build {sha}" line.** Phase 2 showed the build SHA on the placeholder page, and the UI-SPEC has no slot for it. Recommendation: drop it from the UI and keep the lib and its test, or delete both. Either is fine; decide in the plan.
4. **Vercel trailing-slash redirect (A2).** Verify on the first preview deploy of this phase.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build/test | ✓ | 22.22.2 | — |
| pnpm | install/scripts | ✓ | 12.11.2 | — |
| Playwright Chromium | e2e | ✓ | 1.65.0 (chromium-1254 cached) | — |
| Playwright Firefox/WebKit | not needed until Phase 4 | ✗ | — | Chromium only (current config) |
| ImageMagick `magick` | WebP conversion | ✓ | 7.1.2-34 | ffmpeg 7.1.5 |
| exiftool | metadata check | ✓ | system | — |
| podman / docker | visual baselines in the Playwright image | ✓ | system | Manual-only visual project |
| Network (CI `next/font`) | not needed: `next/font/local` | n/a | — | — |

**Missing dependencies with no fallback:** none.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.1.0 (jsdom 31) + Playwright 1.65.0 + @axe-core/playwright 4.14.0 |
| Config file | `vitest.config.mts` (include `tests/**/*.test.{ts,tsx}`), `playwright.config.ts` |
| Quick run command | `pnpm lint && pnpm typecheck && pnpm test` |
| Full suite command | `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm measure:js -- --max-gzip-kb 150 && pnpm test:e2e` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-01 | Token values; accent only on rail current + interactive states + 75/75; no raw hex outside tokens.css | unit + e2e | `pnpm test tests/contrast.test.ts tests/css-guard.test.ts`; `pnpm test:e2e e2e/layout.spec.ts` (exactly one rail letter computes `rgb(95, 174, 132)` on 01-05) | ❌ Wave 0 |
| DSGN-02 | One family (`--font-sans`), 12-col grid, type roles | unit + e2e | css-guard (no `font-family` other than `var(--font-sans)`); e2e computed `grid-template-columns` has 12 tracks | ❌ Wave 0 |
| DSGN-06 | No ornament (no svg/icon/img besides the 2 photos) | e2e + visual | `e2e/layout.spec.ts` counts `img, svg` per route; `e2e/visual.spec.ts` | ❌ Wave 0 |
| CONT-01 | Role line visible on `/` with JS off | e2e | `pnpm test:e2e --project=chromium-nojs e2e/routes.spec.ts` | ❌ Wave 0 |
| CONT-09 | Data files typed; no JSX literals; fact guards (no "top 1", no phone pattern, no em dash, ended roles not "since") | lint + unit | `pnpm lint`; `pnpm test tests/content.test.ts` | ❌ Wave 0 |
| LTR-01 | 5 hero links with correct hrefs reach their routes | e2e (JS off + on) | `e2e/routes.spec.ts` clicks each letter and expects the URL + visible section | ❌ Wave 0 |
| LTR-02 | Each letter's accessible name = "0N Section"; captions visible at 1440 | e2e + unit | `getByRole('link', { name: '01 Achievements' })`; `tests/shell.test.tsx` renders Shell and checks names | ❌ Wave 0 |
| A11Y-02 | First Tab = skip link; every focus shows ≥2px outline | e2e | `pnpm test:e2e e2e/focus.spec.ts` | ❌ Wave 0 |
| A11Y-03 | AA on all text tokens; axe zero violations 6 routes x 2 viewports | unit + e2e | `tests/contrast.test.ts`; `e2e/a11y.spec.ts` (extend) | ⚠ a11y.spec exists (only `/`) |
| A11Y-05 | JS off: only own page visible, all text present, letters navigate | e2e | `chromium-nojs` project | ❌ Wave 0 |
| (SC 2) | YAHYA geometry identical with and without the web font | e2e | `e2e/font-shift.spec.ts` | ❌ Wave 0 |
| (D-04) | No horizontal overflow at 320/390/1366/1440 | e2e | `layout.spec.ts`: `document.documentElement.scrollWidth <= innerWidth` per route | ❌ Wave 0 |
| (D-07) | Per-route title, description, canonical with trailing slash, noindex | unit/e2e | grep in built `out/**/index.html` or Playwright `link[rel=canonical]` | ❌ Wave 0 |
| (budget) | JS ≤150 kB gzip | script | `pnpm measure:js -- --max-gzip-kb 150` | ✅ |

### Sampling Rate
- **Per task commit:** `pnpm lint && pnpm typecheck && pnpm test`
- **Per wave merge:** full suite (includes build + e2e)
- **Phase gate:** full suite green locally and in CI before `/gsd-verify-work`; visual baselines committed from the container

### Wave 0 Gaps
- [ ] `tests/contrast.test.ts`, `tests/css-guard.test.ts`, `tests/content.test.ts`, `tests/sections.test.ts`, `tests/shell.test.tsx`
- [ ] `e2e/routes.spec.ts`, `e2e/focus.spec.ts`, `e2e/layout.spec.ts`, `e2e/font-shift.spec.ts`, `e2e/visual.spec.ts`
- [ ] Extend `e2e/a11y.spec.ts` and `e2e/csp.spec.ts` to six routes; fix `e2e/assets.spec.ts` (Pitfall 7)
- [ ] `playwright.config.ts`: `chromium-nojs` project + visual project; `eslint.config.mjs`: `react/jsx-no-literals`
- [ ] Shell render test: render `<Shell current="about" />` with Testing Library (synchronous server component, so it works in jsdom), assert one `h1`, five `inert` sections, and `aria-current` on the About rail link only

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no user input | Static content only; content is typed at build time |
| V6 Cryptography | no | — |
| V14 Config | yes | Existing vercel.json CSP/HSTS/nosniff/frame headers; csp.spec extended to six routes |

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Reverse tabnabbing on external links | Tampering | `rel="noopener"` on every `target="_blank"` (UI-SPEC); add an e2e assertion |
| Third-party requests / hotlinking | Information disclosure | assets.spec first-party check, run on all six routes |
| Image metadata leak (GPS/camera) | Information disclosure | `magick -strip` + exiftool check |
| Inline style under CSP | — | `style-src 'unsafe-inline'` already allowed; the progress `--page-index` inline style is fine |

## Sources

### Primary (HIGH confidence)
- Scratch prototype build in this session (copy of the repo, real toolchain): canonical/trailing slash, `inert=""`, h1/h2, font CSS (`font-display:block`, fallback overrides), JS 132.2 kB, ESLint rule behaviour, `serve` routing, lazy-image fetching in Chromium, glyph and word measurements, v7 geometry.
- https://nextjs.org/docs/app/api-reference/file-conventions/layout (updated 2026-05-27): layouts do not access the pathname.
- https://nextjs.org/docs/app/getting-started/linking-and-navigating (updated 2026-11-06): `<Link>` prefetch vs `<a>`; native `pushState` integration.
- https://vercel.com/docs/project-configuration/vercel-json (updated 2026-08-14): `trailingSlash` semantics.
- node_modules sources: `@next/eslint-plugin-next` `no-html-link-for-pages` (Literal-only check, error in core-web-vitals); `eslint-plugin-react` `jsx-no-literals` options; axe-core 4.14.0 `scrollable-region-focusable` tags; `@types/react` `inert`.
- MCR tag list: `mcr.microsoft.com/playwright:v1.65.0-noble` exists.
- Repo docs: 03-CONTEXT.md, 03-UI-SPEC.md, design doc rev 5 §2/§4/§4.1/§6, font-metrics.md, v7 sketch, Phase 2 plan (image recipe).

### Secondary (MEDIUM)
- Cross-engine equality of glyph advances (font data is engine-independent; only Chromium measured).

### Tertiary (LOW)
- None relied on.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. Nothing new to install; all versions read from the installed tree.
- Architecture: HIGH. Shell-per-page verified in a prototype build; the layout constraint comes from official docs.
- Pitfalls: HIGH for 1, 2, 4, 5, 7, 9 (measured or read from source); MEDIUM for 3, 6, 8 (partly assumed).

**Research date:** 2026-11-08
**Valid until:** 2026-12-08 (stable stack; re-check if Next/Playwright versions change)
