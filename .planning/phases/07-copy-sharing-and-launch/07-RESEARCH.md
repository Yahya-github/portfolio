# Phase 7: Copy, Sharing and Launch - Research

**Researched:** 2026-11-12
**Domain:** Next.js 16.4 static export metadata (Open Graph, icons, JSON-LD, robots/sitemap), dev-only image rendering with Playwright, Lighthouse CI, fact verification, launch gating on Vercel
**Confidence:** HIGH for the Next.js build behaviour (checked with a throwaway build of this repo in this session); MEDIUM for Lighthouse CI scores (no baseline run was possible) and for live Vercel behaviour of the current config (production is still the Phase 2 deploy)

## Summary

Almost every technical piece of this phase was checked against the installed Next.js 16.4.5 with a scratch copy of the repo. `app/icon.svg`, `app/apple-icon.png`, `app/robots.ts`, `app/sitemap.ts` and `app/not-found.tsx` all export cleanly to `out/` as `icon.svg`, `apple-icon.png`, `robots.txt`, `sitemap.xml` and `404.html`. `robots.ts` and `sitemap.ts` **must** declare `export const dynamic = "force-static"`; without it `next build` fails with `output: export`. Metadata merging is shallow. A page that sets `openGraph` without repeating `images`, `type` and `siteName` loses them, so the card disappears on that route. A page that sets no `openGraph` keeps the root image and auto-fills `og:title`/`og:description` from its own title and description, but gets **no `og:url`**. So every page must spread one shared Open Graph base. [VERIFIED: scratch build]

The share card and favicon need no new dependency. Playwright Chromium loads the self-hosted woff2 over `file://`, including from `../../app/fonts/`, and renders a 600x315 page at DPR 2 to a 1200x630 PNG (about 18 KB for plain text on black). fontTools run through `uvx` turns the variable woff2 into an instance at wdth 75 / wght 700 and emits the `Y` outline as one SVG path: `M182 0V306L8 720H164L298 344H229L362 720H498L324 306V0Z` (font units, y up, bounds 8,0 to 498,720, UPM 1000). That path can be committed directly. [VERIFIED: ran in this session]

The launch gate has one structural trap. Lighthouse's SEO category weights `is-crawlable` at about 4 of about 14 total points. Every route is `noindex` until the last plan, so an SEO 100 assertion on the category **cannot pass before launch**. The 404 can never pass it, because it is `noindex` and served with status 404. The Lighthouse CI config must assert SEO per audit before launch and on the 404. The launch plan then flips the page routes to `categories:seo` minScore 1. Two more planning facts surfaced. First, `origin/main` is 366 commits behind local `main`, so production still runs the Phase 2 deploy, and Phases 3 to 6 have never been served by Vercel with `trailingSlash: true`. Second, the public resume does **not** contradict "since 2025": it reads `May 2025 - Present`. It does contradict the site on Facturo: the resume says `Jun 2026 - Present`, the site says `Jun 2026 to Oct 2026`.

**Primary recommendation:** Build metadata from one shared `OG_BASE` constant in `lib/metadata.ts`, render the card and favicon with dev-only scripts (Playwright plus fontTools via `uvx`), and run Lighthouse CI as a new `lighthouse` job against `serve out`, with per-audit SEO assertions. Before the final noindex flip, ship Phases 3 to 7 to a Vercel preview (still noindex) and verify trailing slashes, the 404 status and the card URL there.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Copy handoff (CONT-06)
- **D-01:** **Yahya edits, Claude verifies.** Yahya rewrites About and any other lines directly in `content/*.ts` (or pastes them for Claude to place). Claude does not draft replacement voice. A fact-check file lists every claim on the site with its source (resume, `docs/material/links.md`, `portfolio-voice-and-facts`) and flags mismatches.
- **D-02:** **Freelance date mismatch: fix the resume too.** The site says "since 2025"; Yahya re-exports the public resume so the PDF tells the same story. The plan adds a blocking check that the shipped `public/yahya-hallani-resume.pdf` agrees with the site facts (month of the 2025 start is still unknown and is Yahya's to supply).
- **D-03:** **Numbers (700+ tests, 12 projects for 9 clients, etc.): Yahya confirms, Claude records.** Each number is listed with its source and Yahya confirms or corrects it; the confirmation date is stored in the fact-check file. No automated counting of private repos.
- Never-on-the-site list from `portfolio-voice-and-facts` still binds all copy (no top-1 wording, no phone number, no CRC platform, no Atlantis line counts, no "since" on an ended role, Showdown AI never shown as built).

#### LinkedIn share card (SEO-02)
- **D-04:** **Look:** dark ground, giant white YAHYA in Instrument Sans flush left, the role line "Software Engineering at McGill" below, `yahya-hallani.dev` in Label. Matches the Index poster. No accent, no photo, no proof line.
- **D-05:** **One card for all routes**, a single static 1200x630 PNG referenced from root metadata (`openGraph` and `twitter` summary_large_image), with absolute URL via `metadataBase`.
- **D-06:** **Produced by a dev-only script, committed PNG.** An HTML template in the repo is rendered with Playwright to the PNG using the self-hosted font (same pattern as the WebP script). No runtime code, no new dependency, no CSP change.

#### Favicon and 404 (SEO-02)
- **D-07:** **Favicon: a white letter Y on the dark ground**, SVG favicon plus a 180px apple-touch PNG. No accent colour (accent is reserved for its four approved uses).
- **D-08:** **404: giant "404" Display, one plain line ("That page doesn't exist"), then the five hero letter links (Y A H Y A) with their numbered captions plus "Back to the start".** Static page outside the pager (like the Facturo deep dive: no counter, progress bar or pager input), keeps the header and skip link. Text in `content/`.

#### Per-page SEO (SEO-01)
- **D-09:** Each page keeps its own title, description and relative canonical (already in `lib/metadata.ts` / `content/site.ts`); Yahya's final copy updates the descriptions where the wording changes. Person JSON-LD (name, role, McGill, sameAs for LinkedIn and GitHub, url) is added in root layout. Exact fields are Claude's discretion; only verified facts, no phone or home details.

#### Launch gate
- **D-10:** **Indexable only in the last plan, after all checks pass.** That plan removes `noindex` from `vercel.json` (`X-Robots-Tag`) and `rootMetadata.robots`, adds `robots.txt` and `sitemap.xml` (seven routes: six pages plus Facturo; 404 excluded), and runs only once the gates below are green. Yahya pushes it deliberately.
- **D-11:** **Lighthouse CI against built `out/`, on every route** (six pages, Facturo, 404): performance 95, accessibility 100, SEO 100, best practices 95 on mobile; failure blocks the PR. Existing 150 kB initial JS and 12 kB per-chunk gates stay.
- **D-12:** **Human launch checks are optional and non-blocking** (Yahya's call, amending ROADMAP success criterion 4): the plan still writes a short checklist and a `07-HUMAN-UAT.md` (five-second test with someone new: who is he, one proof point, how to contact; VoiceOver or NVDA walk-through), but launch does not wait on it. Blocking gates are automated: axe on every route, Lighthouse CI, Playwright keyboard and reduced-motion runs, and the PDF-vs-site fact check.

### Claude's Discretion
- Card template layout details, font-size fitting, the exact favicon construction, sitemap/robots format, JSON-LD field set, and the 404 copy line wording (within D-04..D-09).
- Lighthouse CI configuration and how routes are served from `out/`.

### Deferred Ideas (OUT OF SCOPE)
None. Discussion stayed within phase scope. (Per-page share cards and a coloured favicon were considered and rejected for v1.)
Not in this phase: playable Atlantis and the rotatable robot model (Phase 8), French version and any new pages (v2).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-06 | About is written in Yahya's own voice (personality lives here) | Fact inventory and mismatches below (Facturo end date vs resume, freelance month already "May 2025" on the PDF, achievements description 184 chars > 160); PDF hash + extracted-text check pattern; existing `tests/content.test.ts` FORBIDDEN guards extended to new content files; human checkpoint pattern for Yahya's edits |
| SEO-01 | Each page has its own title and description; canonical URLs; Person structured data | Verified shallow-merge behaviour and `OG_BASE` pattern; canonical already relative and resolved by `metadataBase` (verified output `https://yahya-hallani.dev/about/`); JSON-LD pattern from Next docs with `<` escaping; e2e head checks on built HTML |
| SEO-02 | Sharing the link on LinkedIn shows a branded preview card; site has a favicon and an on-brand 404 page | LinkedIn requires og:title/og:image/og:description/og:url, image at least 1200x627, under 5 MB; Playwright `file://` font render verified; fontTools Y path verified; `app/icon.svg` + `app/apple-icon.png` emit `<link rel="icon" ... type="image/svg+xml" sizes="any">` and `apple-touch-icon sizes="180x180"`; `app/not-found.tsx` exports `404.html`, served with status 404 by `serve` locally and by Vercel live |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Next.js 16.4 App Router, React 19.3, TypeScript 6.0, `output: 'export'`, deployed by Vercel Git integration; headers (CSP, HSTS, X-Robots-Tag) live in `vercel.json`. No basePath.
- Domain `yahya-hallani.dev`, apex canonical; www 308s to the apex (verified live: `www` returns 308 to `https://yahya-hallani.dev/`).
- Styling: CSS Modules plus `styles/tokens.css`; 12-column grid; **no Tailwind**, no component kit.
- Font via `next/font/local` (Instrument Sans variable, self-hosted).
- Content: only verified, real facts; no invented numbers.
- Assets: self-host fonts and media; no hotlinked assets (CSP `img-src 'self' data:`).
- Accessibility: WCAG contrast, keyboard, reduced motion.
- Testing: Vitest 5 (jsdom + Testing Library), Playwright 1.65 against built `out/`, `@axe-core/playwright`, Lighthouse CI for performance budgets.
- Lint/format: ESLint 10 flat config + `eslint-config-next`, Prettier 3 (`pnpm format:check` runs in CI on every file Prettier knows, including new `.json`, `.html`, `.mjs`).
- GSD workflow enforcement: edits through GSD commands.
- Global rules: immutability, files under 800 lines, functions under 50 lines, no hardcoded secrets, conventional commits. Project memory: **no Co-Authored-By trailer or "Generated with Claude Code" footer** in commits/PRs (user memory overrides the default attribution).
- Repo guard tests that bind new code: `tests/css-guard.test.ts` (raw hex only in `styles/tokens.css`, only `var(--font-sans)`, no `font:` shorthand, no `filter`), `tests/source-guard.test.ts` (no literal `aria-label`/`alt`/`title` strings in `app/` and `components/` `.tsx`; exact `"use client"` allowlist; no value imports from `next/link`/`next/image`), `tests/content.test.ts` (FORBIDDEN patterns: top 1, em dash, "platform", line counts, phone numbers).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Per-page title/description/canonical/OG | Frontend Server (SSR at build time) | — | Next metadata API resolves at `next build` into static `<head>` tags |
| Person JSON-LD | Frontend Server (build-time render in root layout) | — | Inline `<script type="application/ld+json">` in static HTML; no runtime JS |
| Share card PNG | CDN / Static | Dev tooling (local script) | Rendered once on a dev machine, committed to `public/`, served as a static file |
| Favicon / apple icon | CDN / Static | Dev tooling | `app/icon.svg` + `app/apple-icon.png` file conventions copied to `out/` with hashed query strings |
| 404 page | Frontend Server (build-time) | CDN / Static (Vercel serves `404.html` with status 404) | Server component, no client JS beyond the existing cursor island |
| robots.txt / sitemap.xml | Frontend Server (build-time route handlers, `force-static`) | CDN / Static | Generated from `content/site.ts` so routes never drift |
| Indexing control (noindex) | CDN / Static (`vercel.json` X-Robots-Tag) | Frontend Server (`<meta name="robots">`) | Two layers, both flipped in the launch plan |
| Fact verification | Dev tooling / tests | — | Fact-check file plus Vitest guards; PDF compared by hash and committed extract |
| Lighthouse budgets | CI | — | New CI job against `out/` served locally |

## Standard Stack

### Core (already installed; nothing new at runtime)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.4.5 | Metadata API, icon/robots/sitemap file conventions, `not-found.tsx` | Installed; its bundled docs at `node_modules/next/dist/docs/` were the version-matched source [VERIFIED: package.json, local docs] |
| @playwright/test | 1.65.0 | Card render script (Chromium screenshot), e2e head/404/keyboard specs | Installed; Chromium builds present in `~/.cache/ms-playwright` [VERIFIED] |
| sharp | 0.35.5 | Rasterise the favicon SVG to the 180px apple-touch PNG; verify card dimensions and size | Installed and used by `scripts/build-media.mjs` [VERIFIED] |
| @axe-core/playwright | 4.14.0 | axe on the 404 route | Installed; `e2e/a11y.spec.ts` ROUTES just needs the 404 added [VERIFIED] |
| serve | 14.2.7 | Static server for Playwright and Lighthouse CI | Installed; returns status 404 with `out/404.html` body for unknown paths [VERIFIED: curl in this session] |

### Supporting (new dev dependency)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @lhci/cli | 0.16.1 (published 2026-11-11; 0.16.0 published 2026-11-02) | Lighthouse CI collect + assert | The `lighthouse` CI job and a local `pnpm lhci` script. Bundles lighthouse 13.6.0; engines `node >=22.19.0` (local node 22.22.2, `.nvmrc` "22") [VERIFIED: npm registry] |

D-06's "no new dependency" covers the card. Lighthouse CI is named in CLAUDE.md and `.planning/research/STACK.md` (`@lhci/cli@^0.16`), so adding it as a pinned devDependency follows the stack. It has no install scripts that `allowBuilds` would need to approve. [VERIFIED: npm view dependencies: lighthouse, chrome-launcher, express, etc.]

### Dev-time tools (not in package.json)
| Tool | Version | Purpose |
|------|---------|---------|
| fontTools via `uvx --from 'fonttools[woff]'` | latest at run time | Instance the variable font at wdth 75 / wght 700 and extract the `Y` path once [VERIFIED: ran; uvx at `~/.local/bin/uvx`] |
| pdftotext (poppler) | system `/usr/bin/pdftotext` | Extract resume text once for the fact-check snapshot [VERIFIED: present locally] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Committed `public/share-card.png` | `app/opengraph-image.tsx` with `ImageResponse` | Rejected by D-06 (runtime-style code, Satori font handling); static export would prerender it anyway, but the dev script is the locked choice |
| `app/robots.ts` / `app/sitemap.ts` | Static `public/robots.txt` / `public/sitemap.xml` | Static files can drift from `sections`; `.ts` versions read `content/site.ts` (verified output below) |
| `serve out` + `startServerCommand` | LHCI `staticDistDir: "out"` | LHCI's own static server does not serve `404.html` with status 404 for unknown paths (only `isSinglePageApplication` changes its fallback), so the 404 route would not be realistic; `serve` matches Playwright and Vercel [CITED: github.com/GoogleChrome/lighthouse-ci docs/configuration.md] |
| LHCI upload `filesystem` | `temporary-public-storage` | Public storage puts reports on a public GCP link and requires accepting its ToS; `filesystem` + `actions/upload-artifact` keeps it in-repo [CITED: LHCI configuration.md] |

**Installation:**
```bash
pnpm add -D @lhci/cli@0.16.1
```

## Architecture Patterns

### System Architecture Diagram

```
 Yahya's edits ──► content/*.ts ──► fact-check file (07-FACT-CHECK.md) ◄── resume PDF (hash + pdftotext extract)
                        │                         │
                        │                         └──► Vitest guards (forbidden patterns, PDF hash, fact strings)
                        ▼
              lib/metadata.ts (OG_BASE, pageMetadata, deepDiveMetadata, notFoundMetadata)
              lib/structured-data.ts (personJsonLd)
                        │
   dev machine only:    │
   scripts/build-share-card.mjs ──► Playwright Chromium (file:// card.html + woff2) ──► public/share-card.png
   scripts/build-favicon.mjs ──► committed Y path ──► app/icon.svg ; sharp ──► app/apple-icon.png
                        │
                        ▼
                    next build (output: export)
                        │
        ┌───────────────┼──────────────────────────────┬───────────────────────┐
        ▼               ▼                              ▼                       ▼
  out/<route>/index.html   out/404.html          out/icon.svg, apple-icon.png   out/robots.txt, sitemap.xml
  (title, desc, canonical, (noindex,follow,       out/share-card.png            (launch plan only)
   og:*, twitter:*, JSON-LD) letter links)
        │
        ├──► CI: measure-js gates ──► Playwright (e2e, axe, keyboard, reduced motion, visual) ──► lighthouse job (serve out → LHCI assert)
        │
        ▼
  Vercel (vercel.json headers: X-Robots-Tag noindex until the launch plan) ──► LinkedInBot reads og:* ──► card
```

### Recommended Project Structure (new and changed files)
```
app/
├── layout.tsx            # + <script type="application/ld+json"> (Person)
├── not-found.tsx         # 404 composition (server component)
├── icon.svg              # Y on #0b0b0b, path only
├── apple-icon.png        # 180x180 from the same path
├── robots.ts             # LAUNCH PLAN ONLY, force-static
└── sitemap.ts            # LAUNCH PLAN ONLY, force-static
components/not-found/
├── NotFoundPage.tsx      # composition
├── NotFoundLetters.tsx   # five letter links from letterSections()
└── not-found.module.css
content/
└── not-found.ts          # all 404 strings
lib/
├── metadata.ts           # SHARE_IMAGE, OG_BASE, notFoundMetadata
└── structured-data.ts    # personJsonLd + serialiseJsonLd
public/
└── share-card.png        # committed, < 300 KB
scripts/
├── share-card/card.html  # template (own @font-face; links ../../styles/tokens.css)
├── build-share-card.mjs  # pnpm card:build (local only)
├── build-favicon.mjs     # pnpm favicon:build (local only)
└── favicon/y-path.json   # committed glyph path + bounds from fontTools
lighthouserc.json         # LHCI collect/assert
.planning/phases/07-.../07-FACT-CHECK.md, 07-HUMAN-UAT.md
```

### Pattern 1: Shared Open Graph base (shallow merge)
**What:** Next merges metadata shallowly. A segment that sets `openGraph` replaces the whole parent `openGraph` object. [CITED: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md "Merging"] [VERIFIED: scratch build: `/about/` with page-level `openGraph` lacking `images` emitted no `og:image`, `og:type` or `og:site_name`; `/projects/facturo/` with no page `openGraph` inherited the image and auto-filled `og:title`/`og:description` from its title/description but emitted no `og:url`; `twitter:*` was inherited from root and auto-filled `twitter:title`/`twitter:description` per page]
**When to use:** Every `pageMetadata`, `deepDiveMetadata` and the 404 metadata.
```ts
// lib/metadata.ts (shape; verified output in scratch build)
const SHARE_IMAGE = {
  url: "/share-card.png",
  width: 1200,
  height: 630,
  alt: site.shareCardAlt, // "Yahya Hallani, Software Engineering at McGill" in content/site.ts
} as const;

const OG_BASE = {
  type: "website",
  siteName: site.name,
  locale: "en_CA", // optional; discretion
  images: [SHARE_IMAGE],
} as const;

export const rootMetadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: site.name,
  robots: { index: false, follow: false }, // removed in the launch plan
  openGraph: { ...OG_BASE, url: "/" },
  twitter: { card: "summary_large_image", images: [SHARE_IMAGE] },
};

export function pageMetadata(slug: Slug): Metadata {
  const s = sectionBySlug(slug);
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: s.route },
    openGraph: { ...OG_BASE, title: s.title, description: s.description, url: s.route },
  };
}
```
Note that `tests/metadata.test.ts` currently uses `toEqual` on the whole `pageMetadata` object, so it must be updated with the new keys.

### Pattern 2: JSON-LD in the root layout
**What:** Next's recommendation is a native `<script type="application/ld+json">` in a layout or page, serialised with `<` replaced by `<`. Use a native script, not `next/script`. [CITED: node_modules/next/dist/docs/01-app/02-guides/json-ld.md]
```tsx
// lib/structured-data.ts
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: `${site.origin}/`,
  jobTitle: "Software Engineering student",
  affiliation: { "@type": "CollegeOrUniversity", name: "McGill University" },
  sameAs: [site.contact.linkedin, site.contact.github],
} as const;
export const serialiseJsonLd = (v: unknown): string =>
  JSON.stringify(v).replace(/</g, "\\u003c");

// app/layout.tsx, inside <head> after the two existing scripts
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(personJsonLd) }} />
```
CSP: a JSON data block is not executed. The current CSP already allows inline scripts (`script-src 'self' 'unsafe-inline'`), so the CSP doesn't change either way. `e2e/csp.spec.ts` should stay green. [ASSUMED: browsers do not apply script-src to non-JS script types; moot here because of 'unsafe-inline']
Use `affiliation`, not `alumniOf`, for a current student. [ASSUMED: schema.org semantics; alumniOf denotes past or present attendance per schema.org but `affiliation` is unambiguous]. Keep the field set to verified facts only: no email, phone, address or image (UI-SPEC).

### Pattern 3: Static robots and sitemap (launch plan)
`force-static` is **required** with `output: export`. Without it the build fails: `Error: export const dynamic = "force-static"/export const revalidate not configured on route "/sitemap.xml" with "output: export"`. [VERIFIED: scratch build]
```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { facturo } from "@/content/facturo";
import { sections, site } from "@/content/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [...sections.map((s) => s.route), facturo.route].map((route) => ({
    url: `${site.origin}${route}`,
  }));
}
// app/robots.ts
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${site.origin}/sitemap.xml` };
}
```
Verified output: `out/robots.txt` = `User-Agent: *\nAllow: /\n\nSitemap: https://yahya-hallani.dev/sitemap.xml`, and `out/sitemap.xml` lists exactly the seven trailing-slash URLs. Omit `lastModified`. Build-time `new Date()` changes on every build and is not a real modification date.

### Pattern 4: 404 outside the pager
`app/not-found.tsx` exports `out/404.html` (and `out/404/`, `out/_not-found/`). Its own `metadata` export works. Next **also** injects `<meta name="robots" content="noindex"/>` on the not-found page, so `404.html` carries two robots metas: Next's `noindex` and ours, `noindex, follow`. They agree. [VERIFIED: scratch build] Reuse the Facturo standalone pattern (`SkipLink`, `Header`, `<main id="content" tabIndex={-1}>`, lean footer, `StandaloneClient`). Do **not** render `LetterNav`, and do not put `data-pager="letters"` on the 404 nav, because `styles/base.css` hides `nav[data-pager="letters"] > a` during a pending opening. The `OPENING_SCRIPT` only runs when `location.pathname === "/"`, so it never touches the 404. [VERIFIED: lib/first-visit/script.ts]
`app/not-found.tsx` sits in `app/`, which is scanned by `source-guard`: no literal `aria-label`/`alt`/`title` strings, and the strings come from `content/not-found.ts`. Keep it a server component; the `"use client"` allowlist must not grow.

### Pattern 5: Dev-only card render
```js
// scripts/build-share-card.mjs (pnpm card:build; never CI)
import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 600, height: 315 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL("scripts/share-card/card.html").href + `?role=...&host=...`);
await page.evaluate(() => document.fonts.ready);
// assert the face is loaded, e.g. document.fonts.check('700 252px "Instrument Sans"') and every FontFace status === "loaded"
// assert YAHYA span width <= 552
await page.screenshot({ path: "public/share-card.png" });
// verify with sharp: 1200x630, size < 300 KB
```
**`tokens.css` does not define `--font-sans`.** `next/font` injects it through the `instrumentSans.variable` class. The template needs its own `@font-face` (`src: url("../../app/fonts/InstrumentSans-wdth-wght.woff2")`, `font-weight: 400 700`, `font-stretch: 75% 100%`) and must set `--font-sans` on `:root` before the token-based rules apply. [VERIFIED: styles/tokens.css has `--yahya-*`, `--adv-*` but no `--font-sans`; app/fonts.ts declares `variable: "--font-sans"`] Loading the woff2 from `../../app/fonts/` over `file://` worked in Playwright Chromium with no console errors. [VERIFIED]
Pass text in by query string or `page.evaluate` from `content/site.ts`. The script is `.mjs` and can't import `.ts` directly, so either duplicate-check it against `site.ts` in a Vitest test or have a tiny `tsx`-free approach (read and regex `roleLine` from `content/site.ts`). Simplest: a Vitest test asserts that the template's default strings equal `site.roleLine` and the origin host.

### Pattern 6: Favicon from the real glyph
```python
# run once: uvx --from 'fonttools[woff]' python -I scripts/favicon/extract_y.py app/fonts/InstrumentSans-wdth-wght.woff2
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
inst = instantiateVariableFont(TTFont(path), {"wdth": 75, "wght": 700})
gs = inst.getGlyphSet(); name = inst.getBestCmap()[ord("Y")]
# bounds (8, 0, 498, 720), UPM 1000, path M182 0V306L8 720H164L298 344H229L362 720H498L324 306V0Z
```
[VERIFIED: output above, this session] Font units are y-up. In the 32x32 SVG, scale s = 24/720 and flip: `transform="translate(tx 28) scale(s -s)"` with `tx = (32 - 490*s)/2 - 8*s`. Pre-transforming the coordinates in the script and committing a plain path is cleaner, since a transform-free path rasterises predictably in sharp. The axes are `wdth 75..100`, `wght 400..700`, which confirms the instance coordinates are in range. Committing the extracted path (for example `scripts/favicon/y-path.json`) means CI never needs Python.
`app/icon.svg` produces `<link rel="icon" href="/icon.svg?icon.<hash>.svg" sizes="any" type="image/svg+xml"/>`, and `app/apple-icon.png` (180x180) produces `<link rel="apple-touch-icon" ... sizes="180x180" type="image/png"/>`. [VERIFIED: scratch build] No `favicon.ico` is needed. A browser that ignores SVG icons will request `/favicon.ico` and get a 404, which is acceptable. [ASSUMED]

### Pattern 7: Lighthouse CI against `serve out`
```json
{
  "ci": {
    "collect": {
      "startServerCommand": "pnpm exec serve out -l 4174 --no-clipboard",
      "startServerReadyPattern": "Accepting connections",
      "url": [
        "http://localhost:4174/",
        "http://localhost:4174/achievements/",
        "http://localhost:4174/projects/",
        "http://localhost:4174/experience/",
        "http://localhost:4174/about/",
        "http://localhost:4174/say-hi/",
        "http://localhost:4174/projects/facturo/",
        "http://localhost:4174/this-page-does-not-exist/"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertMatrix": [
        {
          "matchingUrlPattern": "^(?!.*this-page-does-not-exist).*$",
          "assertions": {
            "categories:performance": ["error", { "minScore": 0.95 }],
            "categories:accessibility": ["error", { "minScore": 1 }],
            "categories:best-practices": ["error", { "minScore": 0.95 }],
            "document-title": "error", "meta-description": "error", "http-status-code": "error",
            "link-text": "error", "crawlable-anchors": "error", "robots-txt": "error",
            "image-alt": "error", "hreflang": "error", "canonical": "error",
            "is-crawlable": "off"
          }
        },
        {
          "matchingUrlPattern": "this-page-does-not-exist",
          "assertions": {
            "categories:performance": ["error", { "minScore": 0.95 }],
            "categories:accessibility": ["error", { "minScore": 1 }],
            "categories:best-practices": ["error", { "minScore": 0.95 }],
            "document-title": "error", "meta-description": "off", "link-text": "error",
            "crawlable-anchors": "error", "image-alt": "error", "hreflang": "error", "canonical": "error",
            "is-crawlable": "off", "http-status-code": "off"
          }
        }
      ]
    },
    "upload": { "target": "filesystem", "outputDir": ".lighthouseci" }
  }
}
```
- `serve` prints ` INFO  Accepting connections at http://localhost:4174`. LHCI's default ready pattern `listen|ready` does **not** match it, so `startServerReadyPattern` is required. [VERIFIED: serve output; CITED: LHCI configuration.md default pattern]
- In the **launch plan**, the page-route block switches `is-crawlable` to `"error"` and adds `"categories:seo": ["error", { "minScore": 1 }]`. The 404 block keeps per-audit SEO forever.
- Lighthouse 13 SEO audits (main branch default-config): `is-crawlable` (weight about 4.05), `document-title`, `meta-description`, `http-status-code`, `link-text`, `crawlable-anchors`, `robots-txt`, `image-alt`, `hreflang`, `canonical` (weight 1 each), plus manual `structured-data` (0). [CITED: raw.githubusercontent.com/GoogleChrome/lighthouse/main/core/config/default-config.js]
- `canonical` passes when the page is served on localhost and the canonical points to `https://yahya-hallani.dev/...`. The audit has no different-domain check; its root-URL check needs the same origin. [CITED: lighthouse core/audits/seo/canonical.js]
- `robots-txt` before launch: `serve` returns 404 for `/robots.txt`, and a 4xx is `notApplicable` with score 1. After launch the file exists and is validated. [CITED: lighthouse core/audits/seo/robots-txt.js]
- Default assertion aggregation is `optimistic` (best of the runs) with `minScore: 1`. Keep `numberOfRuns: 3` for stability. [CITED: LHCI configuration.md]
- Mobile emulation is Lighthouse's default (no `preset: desktop`), which matches D-11.
- The meta-description audit only checks that one exists and isn't empty. The UI-SPEC's 50 to 160 character rule needs its own Vitest test.

CI job sketch (new job named `lighthouse` on `ubuntu-latest`, which ships Google Chrome [ASSUMED: GitHub runner image includes Chrome; otherwise set `CHROME_PATH` to Playwright's Chromium]):
```yaml
  lighthouse:
    name: lighthouse
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
        with: { cache: true }
      - uses: actions/setup-node@v7
        with: { node-version-file: .nvmrc }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm exec lhci autorun
      - if: always()
        uses: actions/upload-artifact@v7
        with: { name: lighthouse, path: .lighthouseci, retention-days: 7 }
```
"Failure blocks the PR" also needs `lighthouse` added to main's required status checks (classic protection today requires lint, typecheck, unit, e2e per STATE). That is a `gh api` call, or Yahya does it in the UI. Add `.lighthouseci/` to `.gitignore` and `.prettierignore`.

### Anti-Patterns to Avoid
- **Setting `openGraph` per page without spreading the base:** the card silently disappears on that route (verified).
- **Relying on inheritance for Open Graph:** it works for the image, but `og:url` is missing, and LinkedIn lists `og:url` as required. [CITED: linkedin.com/help/linkedin/answer/46687]
- **`<text>` in the favicon SVG:** it depends on fonts the browser doesn't have. Use the path.
- **Asserting `categories:seo` 100 before launch or on the 404:** it fails by construction (`is-crawlable`).
- **Running the card script in CI:** fonts and antialiasing differ, and the PNG would churn. It runs locally, and the PNG is committed.
- **`lastModified: new Date()` in the sitemap:** fake freshness that changes every build.
- **Removing `noindex` in any plan but the last.**

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| `<head>` tags for OG/Twitter/canonical/robots | Manual `<meta>` in layout | Next `metadata` API | Handles absolute URLs via `metadataBase`, dedupes, emits width/height/alt |
| Icon `<link>` tags | Manual `<link rel=icon>` | `app/icon.svg`, `app/apple-icon.png` conventions | Hashed cache-busting query, correct `type`/`sizes` (verified) |
| robots.txt / sitemap.xml strings | Template strings | `MetadataRoute.Robots` / `MetadataRoute.Sitemap` | Typed, valid XML escaping |
| Glyph outline | Hand-traced polygon | fontTools instancer + SVGPathPen | Exact stems and arm angles (UI-SPEC allows tracing only as a fallback) |
| Lighthouse orchestration | Custom puppeteer loop | `@lhci/cli` | Multiple runs, aggregation, assertion matrix, server lifecycle |
| Accessibility checks on 404 | Custom DOM checks | `@axe-core/playwright` (existing spec) | Already the project's gate |
| PDF text parsing in CI | A PDF parser dependency | Hash the PDF + a committed `pdftotext` extract | No new dependency, deterministic, and any PDF change forces a re-check |

**Key insight:** every surface here has a framework convention or an installed tool. The only custom code is two small dev scripts and the 404 composition.

## Runtime State Inventory

This phase includes a state migration (noindex to indexable) and a first deploy of Phases 3 to 7, so the five categories are covered here.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None. Static site with no datastore. LinkedIn caches the scraped preview per URL. | After the card ships, run LinkedIn Post Inspector on `https://yahya-hallani.dev/` to refresh LinkedIn's cache (manual) |
| Live service config | Vercel project: production is still the Phase 2 deploy (`origin/main` = `7861a39`, local `main` is 366 commits ahead). Live `/about/` returns 308 to `/about`, which returns 404. That is the Phase 2 config (`trailingSlash` false); the repo now has `trailingSlash: true`. GitHub branch protection on `main` requires lint/typecheck/unit/e2e. | Ship Phases 3 to 7 through a PR (preview first), verify the trailing-slash behaviour on the preview, and add `lighthouse` to the required checks (`gh api` or UI) |
| OS-registered state | None. Verified: no cron, launchd or systemd involvement; Vercel builds on push. | None |
| Secrets/env vars | None needed. LHCI with the `filesystem` target needs no `LHCI_GITHUB_APP_TOKEN`. | None |
| Build artifacts | Local `out/` is stale (built before this phase; it contains Next's default `404.html`, titled "404: This page could not be found."). Search engines: the site has been `noindex, nofollow` since Phase 2, so nothing is indexed yet. | Rebuild before e2e and LHCI; after launch, optionally submit the sitemap in Google Search Console (Yahya, manual, non-blocking) |

## Fact Inventory and Mismatches (input for the fact-check file)

Sources compared: `public/yahya-hallani-resume.pdf` (byte-identical to `docs/material/resume-public.pdf`; Typst 0.14.2, created 2026-11-07), `docs/material/links.md`, `portfolio-voice-and-facts`, and `content/*.ts`. [VERIFIED: cmp, pdftotext, grep]

| Claim on site | Where | Resume says | Status |
|---------------|-------|-------------|--------|
| Freelance "Since 2025", "12 projects for 9 clients" | `experience.ts`, Experience description | `Self-Employed May 2025 - Present`; "Delivered 12 projects for 9 clients" | **Consistent.** The skill's "resume still reads May 2023" note is stale. The start month is May per the PDF; Yahya confirms. D-02's PDF re-export may already be done; the check should still record it |
| Facturo "Jun 2026 to Oct 2026" (ended) | `experience.ts`, `facturo.ts` | Projects: `Facturo ... Jun 2026 - Present` | **MISMATCH.** Yahya decides: re-export the resume (likely) or correct the site |
| MAME Tool Rental "Developer, since Nov 2026" | `experience.ts`, `projects.ts` | Not on the resume | Omission, not a contradiction. Flag for Yahya (resume predates the role) |
| Mercor "since Sep 2026, contractor" | `experience.ts` | `Sep 2026 - Present`, Coding Agent Evaluator (Contractor) | Consistent |
| CRC 2027 problem author "since Feb 2026", 12 problems, 20+ edge-case tests | `experience.ts`, `projects.ts` | `Feb 2026 - Present`; 12 problems; 20+ edge-case tests | Consistent |
| 700+ tests (Facturo) | `projects.ts`, `facturo.ts`, Projects description | "backed by 700+ tests" | Consistent. Yahya re-confirms it is current (D-03) |
| CCC 75/75, 2026 | `achievements.ts` | "Perfect Score - 75/75 ... 2026" | Consistent; no rank wording |
| DIRO 1st of 18 teams from 9 CEGEPs, $2,500 | `achievements.ts` | Same | Consistent |
| Game competition 1st, Atlantis | `achievements.ts`, `projects.ts` | Same | Consistent |
| CRC programming 1st 2025, 2nd Senior Programming 2026 | `achievements.ts` | "1st Place - CRC, Programming; 2nd Place the next year, 2025, 2026" | Consistent ("Senior" is Yahya-confirmed, not on the resume) |
| CRC robot 1st 2026 | `achievements.ts`, `projects.ts` | "CRC 2026 ... Control Firmware 1st Place, Sep 2025 - Feb 2026" | Consistent |
| Atlantis "6 gameplay systems" | `projects.ts` | "Architected 6 gameplay systems" | Consistent. The resume's line counts must never reach the site (guarded) |
| Achievements meta description | `site.ts` | — | **184 characters, over the UI-SPEC's 160 limit.** Shorten it with Yahya's copy |
| Other descriptions: index 92, projects 141, experience 137, about 81, say-hi 56 | `site.ts` | — | Within 50 to 160 |

**PDF agreement check (D-02, blocking).** No new dependency: commit `docs/material/resume-public.txt` (`pdftotext -layout` output) and the PDF's SHA-256. A Vitest test (1) hashes `public/yahya-hallani-resume.pdf` with `node:crypto` and compares it to the recorded hash, so any re-export fails until the extract and fact-check are refreshed; (2) asserts the public PDF equals `docs/material/resume-public.pdf` byte for byte; and (3) asserts the extract contains each site fact string from a small table (for example `May 2025 - Present`, `12 projects for 9 clients`, `700+ tests`, `Sep 2026 - Present`, and the Facturo range once fixed). After a re-export, the developer reruns `pdftotext` locally.

## Common Pitfalls

### Pitfall 1: The card vanishes on pages that set openGraph
**What goes wrong:** LinkedIn shows no image for `/about/`.
**Why it happens:** Shallow merge replaces the root `openGraph`. [VERIFIED]
**How to avoid:** Spread `OG_BASE` in every metadata builder. An e2e check asserts that `og:image` is `https://yahya-hallani.dev/share-card.png` on all eight HTML files.
**Warning signs:** `grep og:image out/about/index.html` is empty.

### Pitfall 2: SEO 100 is impossible before launch and on the 404
**What goes wrong:** The LHCI job is red from day one, or someone "fixes" it by removing noindex early.
**Why it happens:** `is-crawlable` is about 30% of the SEO score, and the 404 also fails `http-status-code` by design.
**How to avoid:** Use per-audit assertions (Pattern 7); the launch plan flips the page routes to the category assertion.

### Pitfall 3: Trailing-slash behaviour on Vercel was never verified for the current config
**What goes wrong:** Canonicals say `/about/`, but Vercel 308s `/about/` to `/about` (today's live behaviour from the Phase 2 deploy), so every canonical points at a redirect, or `/about` 404s.
**Why it happens:** Production is still Phase 2; `trailingSlash: true` was added later.
**How to avoid:** Before the launch plan, deploy a preview (PR) and `curl` it: `/about/` should return 200, `/about` should 308 to `/about/`, `/nope/` should return 404 with the on-brand body, `/share-card.png` should return 200 `image/png`, and `/icon.svg` should return 200. Record the results in the verification file. Vercel previews may sit behind Vercel Authentication. If so, use `vercel curl` or a bypass token, or verify right after the production merge while noindex is still on.

### Pitfall 4: The card template renders in a fallback font
**What goes wrong:** The PNG shows Arial or monospace.
**Why it happens:** `tokens.css` uses `var(--font-sans)`, which only `next/font` defines.
**How to avoid:** Use an own `@font-face` and `--font-sans` in `card.html`, and have the script assert that `document.fonts.check(...)` is true and every FontFace is `loaded` before the screenshot. [VERIFIED: file:// font load works]

### Pitfall 5: Lighthouse CI never becomes a blocking gate
**What goes wrong:** The job fails, but PRs still merge.
**Why it happens:** Branch protection lists only lint/typecheck/unit/e2e, and the CI comment warns against renaming them.
**How to avoid:** Name the job `lighthouse`, and add it to the required checks in the same plan (human or `gh api` step).

### Pitfall 6: The performance 95 budget is unmeasured
**What goes wrong:** Mobile performance (simulated slow 4G, 4x CPU) on a page with about 132 to 150 kB gzip JS and a display-blocking font (`display: "block"`) comes in under 95.
**Why it happens:** No Lighthouse baseline exists yet (it could not be run in this research session).
**How to avoid:** Wave 0 runs LHCI locally once (`pnpm build && pnpm exec lhci collect ... && lhci assert`) and records the scores before writing the threshold into a blocking job. If any route is under 95, raise it as a design and budget decision; never lower the threshold silently.

### Pitfall 7: The 404 hits other guards
**What goes wrong:** `source-guard` fails on literal strings, `css-guard` fails on a hex value, or a new `"use client"` breaks the allowlist; `measure-js` ignores `404.html` (it only counts `index.html` route files).
**How to avoid:** Strings come from `content/not-found.ts`, colours from tokens, and the component is a server component. Optionally extend `measure-js` to include `404.html` so the 150 kB gate covers it.

### Pitfall 8: Visual baselines are platform-bound
**What goes wrong:** Copy changes break `visual.spec.ts` snapshots, and baselines regenerated on the host differ from CI.
**Why it happens:** Baselines come from the `mcr.microsoft.com/playwright:v1.65.0-noble` container (Phase 2 Pitfall 6).
**How to avoid:** Regenerate with docker or podman (both present locally) in that image (`VISUAL=1 pnpm exec playwright test --project visual --update-snapshots`), and add the 404 to the visual ROUTES.

### Pitfall 9: Stale LinkedIn cache
**What goes wrong:** LinkedIn keeps showing an old or empty preview after deploy.
**How to avoid:** After the production deploy that ships the card, paste the URL into LinkedIn Post Inspector (manual, listed in `07-HUMAN-UAT.md`). LinkedIn requires the image to be at least 1200x627, under 5 MB, ratio 1.91:1; 1200x630 qualifies. [CITED: linkedin.com/help/linkedin/answer/46687]

## Code Examples

### e2e head check (built HTML)
```ts
// e2e/seo.spec.ts
const PAGES = [...sections.map((s) => s.route), facturo.route];
for (const route of PAGES) {
  test(`head metadata ${route}`, async ({ page }) => {
    await page.goto(route);
    const meta = (sel: string) => page.locator(sel).getAttribute("content");
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(`${site.origin}${route}`);
    expect(await meta('meta[property="og:image"]')).toBe(`${site.origin}/share-card.png`);
    expect(await meta('meta[property="og:url"]')).toBe(`${site.origin}${route}`);
    expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "");
    expect(ld["@type"]).toBe("Person");
    expect(JSON.stringify(ld)).not.toMatch(/telephone|address|email/);
  });
}
test("unknown path serves the on-brand 404", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("404 Page not found");
  await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link")).toHaveCount(5);
});
```

### Static asset check
```ts
test("share card is a 1200x630 PNG", async ({ request }) => {
  const r = await request.get("/share-card.png");
  expect(r.status()).toBe(200);
  expect(r.headers()["content-type"]).toContain("image/png");
  // dimensions: Vitest with sharp on public/share-card.png (width 1200, height 630, size < 300 KB)
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next-seo` / manual `<Head>` | App Router `metadata` export | Next 13.2+ | No extra package |
| `favicon.ico` + many PNG sizes | `icon.svg` (`sizes="any"`) + `apple-icon.png` 180 | widely adopted 2021+ (Evil Martians handbook, cited by Next docs) | Two files suffice |
| Lighthouse SEO had `tap-targets`, `font-size`, `plugins` | Lighthouse 13 SEO: 10 automated audits listed above | LH 12/13 | Fewer mobile-only SEO failures; `is-crawlable` dominates |
| LHCI `staticDistDir` only | `startServerCommand` with any server | long-standing | Lets the 404 return a real 404 |

**Deprecated/outdated:**
- The skill note "resume still reads May 2023": the current PDF reads May 2025.
- `.planning/research/STACK.md` pins `@lhci/cli@0.16.0`; 0.16.1 is current (published 2026-11-11). Either works. If pnpm's `minimumReleaseAge` policy rejects a one-day-old release, use 0.16.0. [ASSUMED: whether pnpm 12 enforces a release-age default here]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Browsers don't apply CSP `script-src` to `application/ld+json` blocks | Pattern 2 | None in practice: CSP already has `'unsafe-inline'` |
| A2 | `affiliation` is the better schema.org property than `alumniOf` for a current student | Pattern 2 | Minor; the Schema Markup Validator accepts either |
| A3 | GitHub `ubuntu-latest` ships Google Chrome for LHCI | Pattern 7 | Job fails to launch Chrome; fix with `CHROME_PATH` or `npx playwright install chromium` |
| A4 | Lighthouse `errors-in-console` may log the 404 document load as a console error on the 404 route, costing about 1/27 of best practices (still at least 95) | Pattern 7 | If more is lost, the 404 best-practices assertion needs a per-audit form |
| A5 | Vercel previews may require Vercel Authentication | Pitfall 3 | Live checks happen after the production merge (still noindex) instead |
| A6 | Mobile performance at least 95 is reachable with the current JS and font strategy | Pitfall 6 | A design or budget decision is needed before the gate goes blocking |
| A7 | pnpm 12 may enforce a minimum release age on new installs | Deprecated note | Install 0.16.0 instead |
| A8 | Browsers without SVG favicon support fall back to requesting `/favicon.ico` | Pattern 6 | A 404 on that request in old browsers only |

## Open Questions

1. **Facturo end date: site or resume?**
   - What we know: the site says Jun to Oct 2026 (ended); the resume says Jun 2026 - Present.
   - Recommendation: a blocking checkpoint for Yahya in the fact-check plan; most likely he re-exports the resume (D-02 already plans a re-export).
2. **Freelance month.**
   - What we know: the PDF already says May 2025, so D-02's premise (that the resume says 2023) is stale.
   - Recommendation: Yahya confirms "May 2025". The site keeps "Since 2025" or adopts "Since May 2025", his call.
3. **How Phases 3 to 7 reach production.**
   - What we know: `origin/main` is at Phase 2, `main` is protected (PR + 4 checks, `enforce_admins` false), and `branching_strategy: none`.
   - Recommendation: the plan before launch opens a PR from a branch at local `main` (noindex still on), lets the four checks plus `lighthouse` pass, and verifies the preview or production. The launch plan is a second, small PR that Yahya merges deliberately.
4. **Lighthouse baseline.**
   - Recommendation: a Wave 0 measurement task; escalate if under budget.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, scripts, LHCI (needs >= 22.19) | ✓ | 22.22.2 | — |
| pnpm | everything | ✓ | 12.11.2 | — |
| Playwright Chromium | card script, e2e | ✓ | builds 1208 to 1254 cached | — |
| Google Chrome | LHCI locally | ✓ | `/usr/bin/google-chrome` | Playwright Chromium via `CHROME_PATH` |
| uv / uvx | glyph extraction (one-off) | ✓ | `~/.local/bin/uvx`; fonttools + brotli downloaded fine | Traced polygon checked against a 512px render (UI-SPEC fallback) |
| pdftotext | resume extract (one-off) | ✓ | `/usr/bin/pdftotext` | Manual copy of the PDF text |
| docker / podman | regenerating visual baselines in the Playwright image | ✓ | both present | CI-generated snapshot artifact |
| @lhci/cli | Lighthouse gate | ✗ (not installed) | 0.16.1 on npm | — (install as devDependency) |
| gh CLI | required-check update, PR | ✓ (authenticated; `gh pr list` worked) | — | GitHub UI |

**Missing dependencies with no fallback:** none (only `@lhci/cli` needs installing).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.1.0 (jsdom 31) + Playwright 1.65.0 + @axe-core/playwright 4.14.0; LHCI 0.16.1 (new) |
| Config file | `vitest.config.mts`, `playwright.config.ts`, `lighthouserc.json` (new, Wave 0) |
| Quick run command | `pnpm test` (Vitest, under 30 s) |
| Full suite command | `pnpm build && pnpm measure:js -- --max-gzip-kb 150 --max-chunk-kb 12 && pnpm test:e2e && pnpm exec lhci autorun` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-06 | No forbidden wording in any content file, including `not-found.ts` | unit | `pnpm test tests/content.test.ts` | ✅ (add `notFound` to ALL_CONTENT) |
| CONT-06 | Resume PDF hash matches the recorded hash; public equals docs copy; the extract contains each site fact string | unit | `pnpm test tests/resume-facts.test.ts` | ❌ Wave 0 |
| CONT-06 | Meta descriptions are 50 to 160 chars | unit | `pnpm test tests/metadata.test.ts` | ✅ (extend) |
| CONT-06 | Final copy fits 1366x768 / 1440x900 / 390x844 without scroll | e2e visual | `VISUAL=1 pnpm exec playwright test --project visual` (container) | ✅ (update baselines) |
| SEO-01 | Title, description, canonical, og:url, og:image, twitter card per route | unit + e2e | `pnpm test tests/metadata.test.ts`; `pnpm exec playwright test e2e/seo.spec.ts` | ❌ Wave 0 (seo.spec) |
| SEO-01 | Person JSON-LD present, parseable, no PII fields, `<` escaped | unit + e2e | `pnpm test tests/structured-data.test.ts`; seo.spec | ❌ Wave 0 |
| SEO-01 | Launch: no noindex meta or header; robots.txt and sitemap.xml with 7 URLs | unit + e2e | `pnpm test tests/vercel-config.test.ts tests/metadata.test.ts`; seo.spec | ✅ (flip assertions in the launch plan) |
| SEO-02 | share-card.png is 1200x630, under 300 KB, referenced absolutely | unit + e2e | `pnpm test tests/share-card.test.ts`; seo.spec | ❌ Wave 0 |
| SEO-02 | icon.svg / apple-icon links present; apple icon 180x180 | unit + e2e | `pnpm test tests/favicon.test.ts`; seo.spec | ❌ Wave 0 |
| SEO-02 | 404 status, heading name, five letter links, Back to the start, robots noindex follow | e2e | `pnpm exec playwright test e2e/not-found.spec.ts` | ❌ Wave 0 |
| SEO-02 | 404 axe clean (desktop and phone) | e2e | `pnpm exec playwright test e2e/a11y.spec.ts` | ✅ (add the 404 route) |
| SEO-02 | 404 keyboard order and focus ring; reduced motion | e2e | `e2e/not-found.spec.ts`, `e2e/reduced-motion.spec.ts` | ❌ / ✅ extend |
| D-11 | Lighthouse budgets on all 8 routes | CI | `pnpm exec lhci autorun` | ❌ Wave 0 (`lighthouserc.json`) |
| Criterion 4 (human) | Five-second test, screen reader | manual-only | `07-HUMAN-UAT.md` (non-blocking per D-12) | ❌ |
| SEO-02 (live) | LinkedIn Post Inspector shows the card | manual-only | LinkedIn's crawler only reaches the live site | ❌ (HUMAN-UAT) |

### Sampling Rate
- **Per task commit:** `pnpm test` plus `pnpm lint` and `pnpm typecheck`
- **Per wave merge:** `pnpm build && pnpm test:e2e` (Chromium projects) and `pnpm exec lhci autorun`
- **Phase gate:** full suite green in CI, including the new `lighthouse` required check, before `/gsd-verify-work` and before the launch plan

### Wave 0 Gaps
- [ ] `lighthouserc.json` + `pnpm add -D @lhci/cli@0.16.1` + baseline run recorded
- [ ] `e2e/seo.spec.ts`: head metadata, JSON-LD, assets
- [ ] `e2e/not-found.spec.ts`: status, structure, keyboard
- [ ] `tests/structured-data.test.ts`, `tests/share-card.test.ts`, `tests/favicon.test.ts`, `tests/resume-facts.test.ts`
- [ ] `e2e/a11y.spec.ts` and `e2e/visual.spec.ts` ROUTES extended with the 404 (navigate to an unknown path)
- [ ] `.gitignore` / `.prettierignore`: `.lighthouseci/`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth on a static site |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | Public content only |
| V5 Input Validation / Output Encoding | yes (limited) | JSON-LD serialised with `<` replaced by `<` (Next docs); all strings are build-time constants from `content/` |
| V6 Cryptography | no | SHA-256 used only for the resume integrity check (`node:crypto`) |
| V14 Configuration | yes | `vercel.json` headers: CSP, HSTS, X-Frame-Options and nosniff stay unchanged when X-Robots-Tag is removed; `tests/vercel-config.test.ts` keeps guarding them |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Script breakout through JSON-LD (`</script>` in a string) | Tampering | `<` escaping; unit test with a `</script>` probe |
| PII leakage in structured data, OG or resume | Information disclosure | No email, phone or address in JSON-LD (test); never-on-the-site guards; the resume extract test also asserts no phone pattern |
| Accidental early indexing | Information disclosure (reputation) | noindex removed only in the last plan; `vercel-config` test flips only there |
| Lighthouse reports uploaded to public storage | Information disclosure (minor) | `upload.target: filesystem` + CI artifact |
| Hotlinked or third-party card or icon breaking the CSP | Tampering | All assets are self-hosted in `public/` or `app/`; CSP `img-src 'self' data:` unchanged |
| Accidentally removing other headers in the noindex flip | Tampering | Edit only the X-Robots-Tag entry; existing tests assert CSP, HSTS and XFO |

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`: merging, inheritance (Next 16.4.5 bundled docs)
- `node_modules/next/dist/docs/01-app/02-guides/json-ld.md`: JSON-LD pattern and escaping
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`, `robots.md`; `02-guides/static-exports.md` (force-static for route handlers)
- Scratch build of this repo with Next 16.4.5 (this session): icons, robots, sitemap, not-found, OG merge output, force-static failure
- Local probes: `serve` 404 behaviour, Playwright `file://` font render, fontTools Y extraction, `pdftotext` resume, live `curl` of yahya-hallani.dev
- npm registry: `@lhci/cli` 0.16.1 (2026-11-11), lighthouse 13.6.0, engines

### Secondary (MEDIUM confidence)
- https://raw.githubusercontent.com/GoogleChrome/lighthouse/main/core/config/default-config.js: SEO and best-practices audit lists and weights
- https://raw.githubusercontent.com/GoogleChrome/lighthouse/main/core/audits/seo/canonical.js and `robots-txt.js`: pass and fail logic
- https://raw.githubusercontent.com/GoogleChrome/lighthouse-ci/main/docs/configuration.md: collect, assert, upload options
- https://www.linkedin.com/help/linkedin/answer/46687: required og tags, image minimum 1200x627, 5 MB

### Tertiary (LOW confidence)
- Third-party 2026 guides on LinkedIn card sizes (taplio.com, wildandfreetools.com), consistent with LinkedIn's own page; not relied on

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH (everything is installed except LHCI, whose version and engines were checked)
- Architecture: HIGH (each Next behaviour reproduced in a scratch build)
- Pitfalls: HIGH for the merge, force-static, font and SEO-weight pitfalls; MEDIUM for live Vercel trailing slashes and the performance budget (not measurable this session)

**Research date:** 2026-11-12
**Valid until:** 2026-12-12 (stable stack; recheck the LHCI and Lighthouse versions if planning slips)
