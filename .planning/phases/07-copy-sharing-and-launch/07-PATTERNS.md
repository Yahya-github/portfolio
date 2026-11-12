# Phase 7: Copy, Sharing and Launch - Pattern Map

**Mapped:** 2026-11-12
**Files analyzed:** 34 (new and modified)
**Analogs found:** 31 / 34

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `lib/metadata.ts` (modify: SHARE_IMAGE, OG_BASE, twitter, notFoundMetadata; launch: drop robots) | utility | transform (build-time) | itself (`pageMetadata`, `deepDiveMetadata`) | exact |
| `lib/structured-data.ts` (new) | utility | transform | `lib/js-flag.ts` (const injected into `<head>`) + `lib/metadata.ts` (reads `content/site.ts`) | role-match |
| `app/layout.tsx` (modify: JSON-LD script) | config / layout | request-response (static) | itself, lines 17-20 | exact |
| `content/site.ts` + `content/types.ts` `Site` (modify: `shareCardAlt`, final descriptions) | model (content) | static data | itself | exact |
| `content/not-found.ts` (new) + `NotFoundContent` in `content/types.ts` | model (content) | static data | `content/facturo.ts` + `FacturoDeepDiveContent` | exact |
| `content/*.ts` copy edits (about, experience, facturo, ...) | model (content) | static data | themselves | exact |
| `app/not-found.tsx` (new) | route / page | request-response (static) | `app/projects/facturo/page.tsx` | exact |
| `components/not-found/NotFoundPage.tsx` (new) | component (server) | static render | `components/deep-dive/FacturoDeepDive.tsx` | exact |
| `components/not-found/NotFoundLetters.tsx` (new) | component (server) | static render | `components/letters/LetterNav.tsx` (markup only, NOT client hooks) | role-match |
| `components/not-found/not-found.module.css` (new) | style | n/a | `components/deep-dive/deep-dive.module.css` | exact |
| `app/icon.svg` (new) | static asset | file-I/O | `public/media/marks/*-mono.svg` | partial |
| `app/apple-icon.png` (new) | static asset | file-I/O | `scripts/build-media.mjs` sharp output | partial |
| `public/share-card.png` (new) | static asset | file-I/O | `public/media/**` webp outputs | partial |
| `scripts/build-share-card.mjs` (new) | utility (dev script) | file-I/O / batch | `scripts/build-media.mjs` | role-match |
| `scripts/build-favicon.mjs` (new) | utility (dev script) | file-I/O | `scripts/build-media.mjs` | exact (sharp) |
| `scripts/share-card/card.html` (new) | template | n/a | none | no analog |
| `scripts/favicon/y-path.json` (+ optional `extract_y.py`) | config / data | n/a | none | no analog |
| `app/robots.ts` (new, launch plan) | route handler | static generation | none in repo; RESEARCH Pattern 3 | no analog |
| `app/sitemap.ts` (new, launch plan) | route handler | static generation | `lib/sections.ts` (reads `sections`) | partial |
| `vercel.json` (modify, launch plan) | config | n/a | itself line 7 | exact |
| `lighthouserc.json` (new) | config | n/a | `playwright.config.ts` / RESEARCH Pattern 7 | partial |
| `.github/workflows/ci.yml` (modify: `lighthouse` job) | config (CI) | batch | its own `e2e` job (lines 48-74) | exact |
| `package.json` (modify: `card:build`, `favicon:build`, `lhci`, devDep `@lhci/cli`) | config | n/a | `media:build` script entry | exact |
| `.gitignore`, `.prettierignore` (add `.lighthouseci/`) | config | n/a | existing `playwright-report/` lines | exact |
| `scripts/measure-js.mjs` (optional: include `404.html`) | utility | batch | itself line 55 | exact |
| `tests/metadata.test.ts` (modify) | test (unit) | n/a | itself | exact |
| `tests/structured-data.test.ts` (new) | test (unit) | n/a | `tests/metadata.test.ts` | exact |
| `tests/share-card.test.ts`, `tests/favicon.test.ts` (new) | test (unit, fs + sharp) | file-I/O | `tests/media-manifest.test.ts` | exact |
| `tests/resume-facts.test.ts` (new) | test (unit, fs + crypto) | file-I/O | `tests/vercel-config.test.ts` (fs read via `process.cwd()`) | role-match |
| `tests/content.test.ts` (modify: add `notFound`) | test | n/a | itself lines 12-22 | exact |
| `tests/not-found.test.tsx` (optional new) | test (component) | n/a | `tests/deep-dive.test.tsx` | exact |
| `tests/vercel-config.test.ts` (modify, launch plan) | test | n/a | itself lines 28-30 | exact |
| `e2e/seo.spec.ts`, `e2e/not-found.spec.ts` (new) | test (e2e) | request-response | `e2e/deep-dive.spec.ts` | exact |
| `e2e/a11y.spec.ts`, `e2e/visual.spec.ts` (modify: add 404 route) | test (e2e) | n/a | themselves (ROUTES arrays) | exact |

---

## Pattern Assignments

### `lib/metadata.ts` (utility, build-time transform)

**Analog:** itself (whole file, 30 lines).

**Current imports + root metadata** (lines 1-12):
```ts
import type { Metadata } from "next";
import { facturo } from "@/content/facturo";
import { site } from "@/content/site";
import type { Slug } from "@/content/types";
import { sectionBySlug } from "@/lib/sections";

// Phase 2 D-12: stay out of search indexes until launch.
export const rootMetadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: site.name,
  robots: { index: false, follow: false },
};
```

**Builder pattern to extend** (lines 14-30): every builder returns a fresh object with `title`, `description`, `alternates.canonical` (relative route). Add `openGraph: { ...OG_BASE, title, description, url: <route> }` to `pageMetadata`, `deepDiveMetadata`, and the new `notFoundMetadata()` (404: `robots: { index: false, follow: true }`, no canonical). Strings come from `content/` only (`site.shareCardAlt`, `notFound.metaTitle`...). Shape of `SHARE_IMAGE` / `OG_BASE` is in RESEARCH Pattern 1 (shallow-merge trap: never set `openGraph` without spreading `OG_BASE`).

```ts
export function deepDiveMetadata(): Metadata {
  return {
    title: facturo.metaTitle,
    description: facturo.metaDescription,
    alternates: { canonical: facturo.route },
  };
}
```

Launch plan: delete only the `robots` line in `rootMetadata` (and its comment).

---

### `lib/structured-data.ts` (utility, transform)

**Analog:** `lib/js-flag.ts` (an exported constant string rendered into `<head>` via `dangerouslySetInnerHTML`), plus `lib/metadata.ts` import style (`@/content/site`).

```ts
/** Set before first paint so JS-on layout rules apply without a flash (UI-SPEC Track Contract). Code, not copy. */
export const JS_FLAG_SCRIPT = "document.documentElement.dataset.js=''";
```
Follow: one-line doc comment with requirement ID (`SEO-01`), `as const` object, explicit return type on `serialiseJsonLd(v: unknown): string` replacing `<` with `<`. Data from `site.name`, `site.origin`, `site.contact.linkedin`, `site.contact.github`; never `site.contact.email`.

---

### `app/layout.tsx` (layout)

**Analog:** itself, lines 1-24. Insert the third script after the existing two (lines 18-19):
```tsx
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: OPENING_SCRIPT }} />
      </head>
```
New line: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(personJsonLd) }} />`. Import with `@/lib/structured-data`, alphabetical like the existing imports. `metadata = rootMetadata` stays.

---

### `content/not-found.ts` + `NotFoundContent` type (model, static data)

**Analog:** `content/facturo.ts` lines 16-24 and `FacturoDeepDiveContent` in `content/types.ts` lines 231-247.

```ts
export const facturo = {
  route: "/projects/facturo/",
  title: "Facturo",
  headerLabel: "02.1 Facturo",
  metaTitle: "Facturo, Yahya Hallani",
  metaDescription:
    "Facturo, a local-first invoicing app ...",
  lead: "A local-first invoicing app ...",
  ...
```
Conventions: `export const notFound = { ... } as const satisfies NotFoundContent;` (see `site` in `content/site.ts` line 36: `} as const satisfies Site;`). Interface uses `readonly` on every field. Fields to hold: `display: "404"`, heading accessible name (`"404 Page not found"`), `line` ("That page doesn't exist" or Claude's wording; no em dash), `headerLabel`, `metaTitle`, `navLabel` reuse `site.navLabel`, back link reuse `site.footer.backToStart`. Must pass `tests/content.test.ts` FORBIDDEN list (no em dash: use plain apostrophe text).

### `content/site.ts` + `Site` type (modify)

Add `shareCardAlt` to `site` (line 3-36) and to `interface Site` (`content/types.ts` lines 56-89) as `readonly shareCardAlt: string;`. Achievements `description` (line 56-57) is 184 chars and must be shortened to <= 160 with Yahya's copy.

---

### `app/not-found.tsx` (route, static)

**Analog:** `app/projects/facturo/page.tsx` (whole file, 28 lines):
```tsx
import type { Metadata } from "next";
import { DeepDiveFooter } from "@/components/deep-dive/DeepDiveFooter";
import { FacturoDeepDive } from "@/components/deep-dive/FacturoDeepDive";
import { StandaloneClient } from "@/components/deep-dive/StandaloneClient";
import styles from "@/components/deep-dive/deep-dive.module.css";
import { Header } from "@/components/frame/Header";
import { SkipLink } from "@/components/frame/SkipLink";
import { LetterNav } from "@/components/letters/LetterNav";
import { facturo } from "@/content/facturo";
import { deepDiveMetadata } from "@/lib/metadata";

export const metadata: Metadata = deepDiveMetadata();

/** Standalone vertical page outside the pager shell (D-01). The document scrolls. */
export default function Page() {
  return (
    <>
      <SkipLink />
      <Header current="projects" label={facturo.headerLabel} />
      <LetterNav current="projects" currentMarker="true" />
      <main id="content" tabIndex={-1} className={styles.main}>
        <FacturoDeepDive />
      </main>
      <DeepDiveFooter />
      <StandaloneClient />
    </>
  );
}
```
Differences for the 404: `export const metadata: Metadata = notFoundMetadata();`; **drop `<LetterNav>`** (it sets `data-pager="letters"`, hidden by `styles/base.css` line ~174 during the opening, and pulls pager glide); render `<NotFoundPage />` inside `<main>`; `Header` needs a `current: Slug` (use `"index"` with `label={notFound.headerLabel}`; Header is client and works without a provider as on Facturo). Keep `StandaloneClient` for the cursor. No new `"use client"` file.

---

### `components/not-found/NotFoundPage.tsx` (server component)

**Analog:** `components/deep-dive/FacturoDeepDive.tsx` lines 1-45 (server component, `t-display` h1, CSS Module, strings from `content/`).
```tsx
/** Facturo deep dive body (CONT-04): title, lead, meta and ruled sections (D-02). */
export function FacturoDeepDive() {
  return (
    <article className={`grid ${styles.body}`}>
      <h1 className={`t-display ${styles.title}`}>
        <span
          style={displayFitStyle(facturo.title) as CSSProperties}
          className={styles.titleWord}
        >
          {facturo.title}
        </span>
      </h1>
      <p className={`t-body measure ${styles.lead}`}>{facturo.lead}</p>
```
For the accessible name "404 Page not found" while showing "404", copy the visually-hidden pattern from `components/pages/Heading.tsx` `PageTitle` (lines 52-58) but as a plain `<h1>` (Heading/PageTitle are client and rely on PageLevel context; do not import them):
```tsx
      <span className="visually-hidden">{text}</span>
      {children ? <span aria-hidden="true">{children}</span> : null}
```
Add `"404": <em-width>` to `DISPLAY_WORD_EM` in `lib/display-fit.ts` if the phone fit matters (else the 4.6 default applies).

### `components/not-found/NotFoundLetters.tsx` (server component)

**Analog:** `components/letters/LetterNav.tsx` lines 37-60, markup only. Copy the link structure, drop `"use client"`, `useRef`, `useGlide`, `usePagerState`, `aria-current`, `data-mode`, and **never** `data-pager="letters"`:
```tsx
    <nav aria-label={site.navLabel} className={styles.nav}>
      {letterSections().map((s) => (
        <a
          key={s.slug}
          href={s.route}
          data-glyph={s.letter ?? undefined}
          data-cursor-tag={`${s.number} ${s.name}`}
          className={styles.letter}
        >
          <span aria-hidden="true" className={styles.glyph}>{s.letter}</span>
          <span data-tag="" className={`t-label ${styles.caption}`}>
            <span className={`c-dim ${styles.num}`}>{s.number}</span> {s.name}
          </span>
        </a>
      ))}
    </nav>
```
`letterSections()` from `lib/sections.ts` (lines 62-64). "Back to the start" link: copy `DeepDiveFooter.tsx` lines 6-15 (`href="/"`, label `site.footer.backToStart`, `styles.next` from `frame.module.css`). Accessible names come from content variables (`aria-label={site.navLabel}`) to satisfy source-guard.

### `components/not-found/not-found.module.css`

**Analog:** `components/deep-dive/deep-dive.module.css` lines 1-15 (`.main` padding uses `--frame-top`, `--grid-margin`, `--frame-bottom`; `.title { grid-column: 1 / -1 }`, `.titleWord { display:block; width:max-content }`). Only `var(--color-*)`/`var(--space-*)` tokens (`styles/tokens.css` lines 3-20); no hex, no `font:` shorthand, no `filter` (css-guard). Letter sizing may reuse `--yahya-fit`, `--yahya-track`, `--yahya-kern` tokens.

---

### `scripts/build-share-card.mjs` and `scripts/build-favicon.mjs` (dev scripts)

**Analog:** `scripts/build-media.mjs` lines 1-23:
```js
// scripts/build-media.mjs: converts docs/material sources into sized WebP under public/media and writes lib/media/manifest.ts (D-09).
// Usage: pnpm media:build (local only, never CI)
import {
  copyFileSync,
  existsSync,
  ...
} from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import sharp from "sharp";

const SRC = "docs/material";
const OUT = "public/media";
const MANIFEST = "lib/media/manifest.ts";
const MARK_SVG_HEIGHT = 96;
const MAX_FILE_KB = 150;
const BYTES_PER_KB = 1024;
```
Conventions: header comment `// scripts/<name>.mjs: <what> (D-0x).` + `// Usage: pnpm <script> (local only, never CI)`; `node:` prefixed imports; UPPER_SNAKE constants for paths and limits; JSDoc `@type` for structures; paths relative to repo root. Share card adds `import { chromium } from "@playwright/test"` and `pathToFileURL` from `node:url` (RESEARCH Pattern 5); verify output with `sharp(...).metadata()` (1200x630, < 300 KB) and throw on failure. Favicon reads `scripts/favicon/y-path.json`, writes `app/icon.svg` (fill colours: literal `#0b0b0b`/`#f0f0f0` are fine here since css-guard scans only `.css` in styles/components/app/lib, but read them from `styles/tokens.css` to stay single-sourced), and rasterises with sharp to 180x180 `app/apple-icon.png`.

**package.json script pattern** (current line 17): `"media:build": "node scripts/build-media.mjs"` -> add `"card:build": "node scripts/build-share-card.mjs"`, `"favicon:build": "node scripts/build-favicon.mjs"`, `"lhci": "lhci autorun"`. DevDeps are pinned exact (e.g. `"sharp": "0.35.5"`): use `"@lhci/cli": "0.16.1"` (or 0.16.0 if release age blocks).

---

### `.github/workflows/ci.yml` (add `lighthouse` job)

**Analog:** its `e2e` job (lines 48-74) and job prologue (lines 14-23):
```yaml
  lint:
    name: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
        with: { cache: true }
      - uses: actions/setup-node@v7
        with: { node-version-file: .nvmrc }
      - run: pnpm install --frozen-lockfile
```
```yaml
      - run: pnpm build
      - run: pnpm measure:js -- --max-gzip-kb 150 --max-chunk-kb 12
      - run: pnpm test:e2e
      - if: failure()
        uses: actions/upload-artifact@v7
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 7
```
Job `name: lighthouse`, no container (needs Chrome on the runner), `run: pnpm exec lhci autorun`, artifact `.lighthouseci` with `if: always()`. Update the header comment (line 1) to list `lighthouse` among required checks; no `paths` filters.

### `lighthouserc.json`

No analog in repo; use RESEARCH Pattern 7 verbatim (serve on 4174, `startServerReadyPattern: "Accepting connections"`, two `assertMatrix` blocks, `upload.target: "filesystem"`). Note `playwright.config.ts` already serves `out/` with `serve`; keep a different port to avoid collisions.

### `vercel.json` (launch plan)

Remove only line 7: `{ "key": "X-Robots-Tag", "value": "noindex, nofollow" },`. Every other header stays (guarded by `tests/vercel-config.test.ts` lines 32-50).

### `app/robots.ts`, `app/sitemap.ts` (launch plan)

No analog; RESEARCH Pattern 3 verbatim. Both need `export const dynamic = "force-static";`. Route list reuse: `[...sections.map((s) => s.route), facturo.route]`, same expression as `e2e/a11y.spec.ts` line 13 (`[...sections.map((s) => s.route), "/projects/facturo/"]`).

### `scripts/measure-js.mjs` (optional)

Line 55: `const routeRows = listFiles(outDir, "index.html").map(...)` only counts `index.html`; to gate the 404, also include `"404.html"` (and teach `routeOf` in `scripts/lib/measure.mjs` line 27 to map it, with a test in `tests/measure-js.test.ts`).

---

## Test Patterns

### `tests/metadata.test.ts` (modify) and `tests/structured-data.test.ts` (new)

**Analog:** `tests/metadata.test.ts` lines 1-38:
```ts
import { describe, expect, it } from "vitest";
import { deepDiveMetadata, pageMetadata, rootMetadata } from "@/lib/metadata";

describe("rootMetadata", () => {
  it("keeps the site out of search indexes until launch", () => {
    expect(rootMetadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("pageMetadata", () => {
  it("builds title, description and trailing-slash canonical", () => {
    expect(pageMetadata("achievements")).toEqual({ title: ..., description: ..., alternates: { canonical: "/achievements/" } });
  });
```
The `toEqual` at line 19 must gain the `openGraph` key. Add: description length 50-160 for every `sections[i].description` and `facturo.metaDescription`; `openGraph.images` present in every builder. Structured-data test: parse `serialiseJsonLd(personJsonLd)`, assert no `telephone|address|email`, and a `</script>` probe is escaped.

### `tests/share-card.test.ts`, `tests/favicon.test.ts`, `tests/resume-facts.test.ts`

**Analog:** `tests/media-manifest.test.ts` lines 1-9 (fs + `process.cwd()` paths) and `tests/vercel-config.test.ts` lines 14-19:
```ts
// D-09: manifest <-> public/media consistency, size cap, metadata stripped.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const MAX_FILE_BYTES = 150 * 1024;
const PUBLIC_DIR = join(process.cwd(), "public");
```
```ts
// jsdom gives import.meta.url a non-file scheme, so resolve from the Vitest root.
function loadConfig(): VercelConfig {
  return JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as VercelConfig;
}
```
First line is a `// <REQ-ID> / <D-xx>: <what>` comment. Use `sharp(path).metadata()` for dimensions (sharp is already a devDependency). Resume test uses `createHash("sha256")` from `node:crypto`. Share-card test also asserts `card.html` default strings equal `site.roleLine` and the origin host.

### `tests/content.test.ts` (modify)

Add `import { notFound } from "@/content/not-found";` and `notFound` to `ALL_CONTENT` (lines 12-22). Experience date test (lines 61-67) changes if the Facturo/freelance dates change per the fact check.

### `tests/not-found.test.tsx` (optional)

**Analog:** `tests/deep-dive.test.tsx` lines 1-20 (`render`, `screen.getAllByRole("heading", { level: 1 })`, `afterEach(cleanup)`).

### `e2e/seo.spec.ts`, `e2e/not-found.spec.ts` (new)

**Analog:** `e2e/deep-dive.spec.ts` lines 1-43:
```ts
// CONT-04 / CONT-08 / D-01 / D-02: the standalone Facturo deep dive.
import { test, expect, type Page } from "@playwright/test";
import { facturo } from "../content/facturo";
import { site } from "../content/site";

const ROUTE = "/projects/facturo/";
const DESKTOP = { width: 1440, height: 900 };
...
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", site.origin + ROUTE);
    await expect(page.locator('[data-pager="bar"]')).toHaveCount(0);
    await expect(page.locator("[data-hint]")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.dataset.opening)).toBeUndefined();
    await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", /noindex/);
```
e2e imports content with relative paths (`../content/site`), not `@/`. The 404 spec copies these "no pager chrome" assertions. Note the 404 has two `meta[name=robots]` (Next's and ours); use `.first()`/`.all()` accordingly. Body of the SEO spec: RESEARCH "Code Examples".

### `e2e/a11y.spec.ts`, `e2e/visual.spec.ts` (modify)

`a11y.spec.ts` line 13: `const ROUTES = [...sections.map((s) => s.route), "/projects/facturo/"];` -> append `"/this-page-does-not-exist/"`. `visual.spec.ts` lines 15-18: append `{ name: "not-found", route: "/this-page-does-not-exist/" }`; regenerate baselines in the `mcr.microsoft.com/playwright:v1.65.0-noble` container.

### `tests/vercel-config.test.ts` (launch plan)

Lines 28-30 flip to `expect(headerValue("X-Robots-Tag")).toBeUndefined()`; the CSP/HSTS/XFO tests stay unchanged.

---

## Shared Patterns

### Copy lives in `content/`, never in `.tsx`
**Source:** `tests/source-guard.test.ts` lines 8 and 15-27.
**Apply to:** `app/not-found.tsx`, `components/not-found/*`.
```ts
const LITERAL_A11Y_ATTR = /\b(aria-label|alt|title)="[^"]/;
const CLIENT_ALLOWLIST: readonly string[] = [ ... join("components", "deep-dive", "StandaloneClient.tsx") ];
```
No literal `aria-label="..."`, `alt="..."`, `title="..."`; the `"use client"` allowlist must not grow (new 404 files are server components).

### Fact guards
**Source:** `tests/content.test.ts` lines 24-30 (FORBIDDEN: top 1, em dash, "platform", line counts, phone numbers).
**Apply to:** every `content/*.ts` edit, `content/not-found.ts`, the share-card template strings, JSON-LD.

### Styling
**Source:** `styles/tokens.css` (lines 3-20), `tests/css-guard.test.ts` lines 6-12.
**Apply to:** all new `.module.css`. Utility classes in use: `grid`, `t-display`, `t-label`, `t-body`, `c-dim`, `measure`, `visually-hidden`.

### Standalone (outside-pager) page shell
**Source:** `app/projects/facturo/page.tsx` lines 17-26 (SkipLink, Header with label override, `<main id="content" tabIndex={-1}>`, lean footer, `StandaloneClient`).
**Apply to:** `app/not-found.tsx`.

### Route list source of truth
**Source:** `content/site.ts` `sections` + `facturo.route`; used as `[...sections.map((s) => s.route), "/projects/facturo/"]` in `e2e/a11y.spec.ts` line 13.
**Apply to:** `app/sitemap.ts`, `e2e/seo.spec.ts`, `lighthouserc.json` URLs (static JSON, so add a unit test that its URL list matches this expression plus the 404).

### Dev-only generators commit their output
**Source:** `scripts/build-media.mjs` lines 1-2 ("local only, never CI"), with a Vitest check of the committed output (`tests/media-manifest.test.ts`).
**Apply to:** share card and favicon scripts and their tests.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `scripts/share-card/card.html` | template | n/a | No HTML templates in repo; needs own `@font-face` for `../../app/fonts/InstrumentSans-wdth-wght.woff2` and `--font-sans` (tokens.css lacks it). RESEARCH Pattern 5 |
| `scripts/favicon/y-path.json` (+ `extract_y.py`) | data | n/a | One-off fontTools output; RESEARCH Pattern 6 |
| `app/robots.ts` | route handler | static | No metadata route handlers yet; RESEARCH Pattern 3 (`force-static` mandatory) |
| `lighthouserc.json` | config | n/a | LHCI not installed yet; RESEARCH Pattern 7 |

Non-code deliverables (`07-FACT-CHECK.md`, `07-HUMAN-UAT.md`, `docs/material/resume-public.txt` + SHA-256) have no code analog; follow RESEARCH "Fact Inventory and Mismatches".

## Metadata

**Analog search scope:** `app/`, `components/`, `content/`, `lib/`, `scripts/`, `styles/`, `tests/`, `e2e/`, `.github/workflows/`, root configs
**Files scanned:** ~25 read, ~230 listed
**Pattern extraction date:** 2026-11-12
