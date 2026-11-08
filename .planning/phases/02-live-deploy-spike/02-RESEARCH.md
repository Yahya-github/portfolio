# Phase 2: Live Deploy Spike - Research

**Researched:** 2026-11-07
**Domain:** Next.js 16 static export on Vercel, GitHub repo plus CI merge gate, self-hosted font/image/PDF, baseline JS measurement
**Confidence:** HIGH for the build, font, export, CI tooling and measurement, which were checked with a throwaway build in this session. MEDIUM for Vercel behaviour that only the first deploy can confirm: whether headers apply, 404 handling, and pnpm 12 via Corepack.

## Summary

A throwaway Next 16.4.5 app was built in the scratchpad during this research. It used the target stack (React 19.3.1, TypeScript 6.0.3, ESLint 10.14, Vitest 5.1, Playwright 1.65, serve 14.2.7) and the real Instrument Sans WOFF2, portrait and resume. Every piece of the pipeline works:

- `output: 'export'` produces `out/` with no third-party URLs.
- `next/font/local` self-hosts and preloads the variable font.
- `font-stretch: 75%` drives the wdth axis in Chromium. This needs a `font-stretch: 75% 100%` declaration. YAHYA at 100px measured 239px against 336px, which matches the HarfBuzz numbers in `docs/reference/font-metrics.md`.
- Lint, `tsc`, Vitest (jsdom plus Testing Library) and Playwright against `serve out` all pass.

Vercel's Next builder source (`vercel/vercel` `packages/next/src/index.ts`) detects a static export. It serves `out`, strips `.html` extensions and adds a 404 route. No `outputDirectory` override is needed, and Vercel's docs say to leave it unset.

**The most important finding is the baseline JS size.** The empty App Router build loads **132.1 kB gzip (112.6 kB brotli, 447 kB raw) in 5 scripts** on `/`. A sixth file, a 112 kB `noModule` polyfill, is skipped by modern browsers. The design doc's landing budget is about 150 kB gzip, so only about 18 kB gzip is left for everything later phases add (GSAP, Flip, pager, cursor). `next/image` adds another 5.7 kB gzip (137.8 kB total), so the placeholder should use a plain `<img>` with a static import. Record the number now and flag it for Phases 4-5. It is a planning risk, not a Phase 2 blocker.

The plan must also handle three toolchain facts:

1. **pnpm version on Vercel.** Vercel reads a lockfile v9.0 as pnpm 9 or 10. pnpm 12 needs `ENABLE_EXPERIMENTAL_COREPACK=1` in the Vercel project plus `packageManager` in `package.json`.
2. **Node version on Vercel.** The default is now 26.x, so pin `"engines": { "node": "22.x" }`.
3. **Type check order.** `tsc --noEmit` fails in a clean checkout (no `LayoutProps`, no image module types) until `next typegen` runs. The type check script must be `next typegen && tsc --noEmit`.

**Primary recommendation:**

- Hand-write a minimal Next 16.4.5 export app. Do not use `create-next-app`, which now enables `cacheComponents` and `partialPrefetching` and pins ESLint 9 and TS 5.
- The app uses `next/font/local`, a static-imported WebP `<img>`, the resume in `public/`, and `vercel.json` for noindex and security headers.
- CI is a 4-job GitHub Actions workflow (`lint`, `typecheck`, `unit`, `e2e`). The job names are the required checks.
- Protect `main` with classic branch protection: `enforce_admins: false` (admin bypass) and 0 required approvals (so Yahya can merge his own PRs).
- Every Vercel dashboard step is a `checkpoint:human-action` for Yahya.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Domain
- **D-01:** The domain is **yahya-hallani.dev**, already bought on Vercel (Vercel Domains). **yahya-h.dev is dropped**: it was never bought and must not appear anywhere.
- **D-02:** Apex `https://yahya-hallani.dev` is the one canonical address. `www.yahya-hallani.dev` redirects to the apex (permanent redirect, set in Vercel domain settings).
- **D-03:** Rename every live reference from yahya-h.dev to yahya-hallani.dev in this phase: `CLAUDE.md`, `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md` (DEP-01), `.planning/STATE.md` (remove the "must be bought" blocker), `.planning/research/*.md`, and `docs/superpowers/specs/2026-11-03-portfolio-design.md`. Completed Phase 1 plans/research stay as historical record (do not rewrite them).
- **D-04:** Because the domain is on Vercel already, there is no waiting-for-DNS fallback: the domain attaches as soon as the Vercel project exists. The phase is done only when https://yahya-hallani.dev serves the build with a valid certificate.

#### Repo and merge gate
- **D-05:** Create a **public** GitHub repo `Yahya-github/portfolio` (matches the local folder) and push the existing history. Public keeps branch protection free and Actions minutes unlimited, and the code is itself proof for recruiters.
- **D-06:** Before the first public push, audit the tracked tree and history for anything not public-safe (secrets, private fonts, metadata). Known state: `docs/reference/fonts-private/` is gitignored and was never tracked; the committed fonts are OFL. Resume PDF metadata reads Author/Creator "Yahya Hallani" (fine). Stop and ask Yahya if anything else looks private.
- **D-07:** `main` requires a pull request with passing status checks (lint, type check, unit tests, Playwright on the built export). **Admin bypass is allowed**, so Yahya and GSD doc commits can still go straight to main when needed.
- **D-08:** Vercel Git integration deploys `main` to production automatically on push (success criterion 1).

#### Placeholder page
- **D-09:** The placeholder is a **bare test page**, not an on-brand card. Nobody has the link yet, so it only has to prove the pipeline: text in the self-hosted Instrument Sans, one image, a link to the resume PDF. No design polish.
- **D-10:** The test image is the greyscale portrait `docs/material/portrait-devfest-2026-grey.jpg`, copied in an optimised form to `public/` (or static-imported).
- **D-11:** The resume is `docs/material/resume-public.pdf`, copied to `public/` and linked from the page.
- **D-12:** The site is **noindex until launch** (`<meta name="robots" content="noindex">` and/or an `X-Robots-Tag` header). Removing it is a Phase 7 launch task.
- **D-13:** All assets come from yahya-hallani.dev itself: the network panel shows zero third-party requests (success criterion 2). No Google Fonts runtime, no Vercel Analytics/Speed Insights scripts.

#### Preview deploys
- **D-14:** Vercel preview deployments for PRs are **public** (Deployment Protection off for previews), so they open on phones and in the LinkedIn in-app browser for Phase 4 device tests. Previews stay noindex.
- **D-15:** Playwright in CI runs **only against the locally built static export** (`next build`, serve `out/`), not the Vercel preview URL.

### Claude's Discretion
- Security headers in `vercel.json` (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy) now or deferred, and their exact values. `.dev` is HSTS-preloaded already.
- How the baseline JS size is measured (e.g. gzipped sum of `out/_next/static/chunks` loaded by `/`) and where it is written down (phase SUMMARY plus a line in the design doc or a `docs/` perf note).
- CI workflow layout (one job vs several), caching, Node pin (`.nvmrc` 22, `engines`), `packageManager` pnpm 12.
- Image format and sizing for the test portrait.
- How Vercel is connected (dashboard Git import vs Vercel CLI); Yahya does any dashboard/login steps himself when asked.

### Folded Todos
- **Regenerate the CLAUDE.md stack section for Vercel** (`.planning/todos/pending/2026-11-07-regenerate-claude-md-stack-for-vercel.md`): the stack section still prescribes GitHub Pages (Pages workflow, configure-pages basePath, `withBase()`, CNAME). Phase 2 sets up Vercel, so rewrite it here: drop the Pages workflow, basePath and CNAME notes, keep the library and test choices, note headers are possible via `vercel.json`, and use yahya-hallani.dev (D-03).
- **Carry v7 review warnings into the build** (`.planning/todos/pending/2026-11-07-carry-v7-review-warnings-into-build.md`): Yahya folded it here. Its fixes are pager/cursor behaviour for Phases 3-5, so Phase 2 builds none of them. In Phase 2 it means: the test scaffold (Vitest + Playwright) is set up so those behaviours (WR-04 Space on focused controls, WR-05 no (0,0) pointer, WR-06 focus hand-off, WR-07 cursor class set by script, WR-08 live reduced-motion, IN-01 wheel accumulator reset) can be tested later, and the todo stays referenced from Phases 3-5 planning. Do not close the todo in Phase 2.

### Deferred Ideas (OUT OF SCOPE)
- Remove `noindex` at launch — Phase 7.
- Smoke-testing the live Vercel preview in CI (headers, hosting differences) — not now; revisit if a hosting-only bug appears.
- Reviewed, not folded: `2026-11-07-update-portfolio-skills-to-design-rev-5.md` — tooling outside the repo; not matched to this phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEP-01 | Site is live on Vercel at yahya-hallani.dev over HTTPS. The REQUIREMENTS line still names the old domain and says "bought before the first deploy"; D-03 rewrites it. | Checked with `dig` today: DNS is already on `ns1`/`ns2.vercel-dns.com`, the apex and www resolve, and CAA allows letsencrypt, pki.goog and sectigo. Vercel's builder handles the export natively. The human dashboard steps are in "Vercel Connection". The live checks use `curl` and `openssl` (see Validation Architecture). |
| DEP-02 | Fonts, images and the resume are self-hosted (no hotlinked assets) | Checked in the spike: `next/font/local` emits an `@font-face` pointing at `/_next/static/media/*.woff2` and adds a preload link. The static-imported image gets a hashed `/_next/static/media/*.webp`. The PDF lives in `public/`. The built `index.html` contains no `http(s)://` URLs. A Playwright test asserts zero foreign-origin requests, and on the live site the CSP `default-src 'self'` enforces the same rule in browsers. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Hosting:** Next.js static export (`output: 'export'`) on Vercel's free hobby tier, with no basePath stage. The GitHub Pages notes in CLAUDE.md are stale and get rewritten in this phase.
- **Versions:** Next 16.4.x, React 19.3.x, **TypeScript `~6.0.3` (not 7.x)**, Node 22 LTS, pnpm 12, Vitest 5 (jsdom + Testing Library), Playwright 1.65 against the built `out/`, `@axe-core/playwright`, ESLint 10 flat config with `eslint-config-next` 16.4 (no `next lint`), Prettier 3.
- **Styling:** CSS Modules plus a global `tokens.css`. **No Tailwind.** The Phase 2 placeholder needs no design system, so one global CSS file or inline styles is enough.
- **Fonts:** through `next/font`, self-hosted at build time. No Google Fonts `<link>` and no runtime CDN.
- **Content, assets, accessibility:** only verified, real facts. Self-host fonts and media; nothing hotlinked. Meet WCAG contrast, keyboard and reduced-motion rules.
- **Images:** `next/image` with the default loader is unsupported under export. Use `images.unoptimized: true` and/or static imports.
- **Do not use:** TypeScript 7, `next lint` / `.eslintrc`, Lenis/Locomotive/fullPage, `@use-gesture/react`, carousel libraries, the `framer-motion` package name, `gsap-trial`, runtime CDN fonts, or WebGL in the initial bundle. Phase 2 needs none of them.
- **User global rules:** immutability, small files, conventional commits (`feat:`, `docs:`, `ci:`...), no hardcoded secrets, an 80% coverage target, TDD, and a security checklist before commits. Commit attribution is disabled globally.
- **GSD workflow enforcement:** file changes go through GSD execute-phase.
- **CLAUDE.md is generated.** It has `<!-- GSD:stack-start source:research/STACK.md -->` markers. To fix the folded todo, edit `.planning/research/STACK.md`, then run `node ~/.claude/get-shit-done/bin/gsd-tools.cjs generate-claude-md`. A hand edit of CLAUDE.md alone gets overwritten by the next regeneration. [VERIFIED: CLAUDE.md markers lines 20/135, gsd-tools.cjs `generate-claude-md` case]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| HTML for `/` (placeholder text, img, PDF link) | Build time (Next SSG to `out/`) | CDN / Static (Vercel) | Server Components render during `next build`. There is no runtime server. |
| Font self-hosting | Build time (`next/font/local`) | CDN / Static | The loader copies the WOFF2 to `/_next/static/media` with a hash, and emits the `@font-face` and a preload link. |
| Image and PDF | CDN / Static | — | The static import gives a hashed, immutable URL. The PDF is a plain `public/` file. |
| noindex | CDN (`X-Robots-Tag` header in `vercel.json`) | Browser (`<meta name="robots">` via the Metadata API) | Only a header can noindex the PDF. The meta tag also covers the HTML if headers are ever lost. |
| Security headers / CSP | CDN (`vercel.json` `headers`) | — | `headers()` in `next.config` is unsupported with export. Vercel applies `vercel.json` headers at the edge. |
| www to apex redirect, HTTPS, certificate | CDN / Vercel Domains | — | Set in the Vercel project's domain settings. No code. |
| Deploy on push / previews | Vercel Git integration | — | Vercel builds from the repo. GitHub Actions does not deploy. |
| Merge gate (lint, type check, unit, e2e) | GitHub Actions | GitHub branch protection | CI runs the checks; branch protection makes them required. |
| Baseline JS measurement | Script over the build artifact (`out/`) | Live site (`curl`) | A deterministic gzip sum of the script tags in `out/index.html`, cross-checked against the live brotli transfer. |

## Standard Stack

### Core (versions verified with `npm view` on 2026-11-07)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.4.5 | Framework, static export | Project constraint and the latest release. Engines `node >=20.9.0`. [VERIFIED: npm] |
| react / react-dom | 19.3.1 | UI | Latest; Next peers on `^19`. create-next-app 16.4.5 pins 19.3.0, so pin 19.3.1 explicitly. [VERIFIED: npm + scaffold] |
| typescript | ~6.0.3 | Types | `typescript-eslint@8.72.1` peers on `typescript >=4.8.4 <6.1.0`, which rules out 7.0.2 even though it is `latest` on npm. [VERIFIED: npm peerDependencies] |
| @types/node | ^22 | Node types | Matches Node 22. Vitest peers on `@types/node ^22 \|\| >=24`. [VERIFIED: npm] |
| @types/react / @types/react-dom | 19.3.0 | React types | Latest. [VERIFIED: npm] |

### Dev / test

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| eslint | 10.14.0 | Lint | Per CLAUDE.md. **It works:** rules-of-hooks, jsx-a11y and next rules all fired in a probe. pnpm still reports unmet peers, because `eslint-plugin-import`, `eslint-plugin-jsx-a11y` and `eslint-plugin-react` declare `eslint <=9`. The warnings are harmless. Fallback: `eslint@9.39.5`, which create-next-app 16.4.5 installs. [VERIFIED: spike] |
| eslint-config-next | 16.4.5 | Next, a11y and hooks rules | Flat config through `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. [VERIFIED: scaffold] |
| prettier | 3.9.10 | Format | Standard. [VERIFIED: npm] |
| vitest | 5.1.0 | Unit tests | Engines `node ^22.12 \|\| ^24 \|\| >=26`; local Node 22.22 qualifies. [VERIFIED: npm + spike run] |
| vite | 8.3.6 | Vitest peer | Must be installed explicitly. [VERIFIED] |
| @vitejs/plugin-react | 6.2.1 | JSX in Vitest | No peer warnings with Vite 8. [VERIFIED] |
| jsdom | 31.0.0 | DOM environment | [VERIFIED: spike] |
| @testing-library/react / jest-dom / user-event | 16.3.3 / 7.0.1 / 14.6.8 | Component tests | Put `import "@testing-library/jest-dom/vitest"` in the setup file. [VERIFIED: spike] |
| @playwright/test | 1.65.0 | E2E on `out/` | Next 16.4.5 lists it as an optional peer, `^1.51.1`. [VERIFIED] |
| @axe-core/playwright | 4.14.0 | Accessibility smoke test | One AxeBuilder run on the placeholder is cheap and sets up Phase 3. [VERIFIED: npm] |
| serve | **14.2.7** (CLAUDE.md says 14.2.6) | Static server for Playwright | `serve out -l 4173`. Handles brotli and clean URLs. [VERIFIED: npm + spike] |

**Do not add:**
- `vite-tsconfig-paths`: it pulls `tsconfck`, which peers on `typescript ^5`. Use a plain Vite `resolve.alias` instead.
- `sharp`: there is no image optimisation at build time.
- `@vercel/analytics` and `@vercel/speed-insights`: ruled out by D-13.
- GSAP: that is Phase 5.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-written scaffold | `pnpm dlx create-next-app@16.4.5 --empty` | It adds `cacheComponents: true` and `partialPrefetching: true` to `next.config.ts`, plus ESLint ^9, TS ^5, react 19.3.0, AGENTS.md and a README, and all of that would need undoing. [VERIFIED: scaffold output] |
| `<img>` + static import | `next/image` + `images.unoptimized: true` | `next/image` adds 5.7 kB gzip of client JS against about 18 kB of headroom, plus a `style="color:transparent"` attribute. [VERIFIED: measured] |
| Classic branch protection | Repository ruleset | A ruleset's admin bypass needs the numeric `RepositoryRole` id for admin. The docs did not confirm it, and a wrong id silently gives no bypass. Classic protection with `enforce_admins: false` is documented and enough here. |
| Vercel dashboard import | Vercel CLI (`vercel login`, `link`, `git connect`, `domains add`, `env add`) | The CLI also needs Yahya to log in interactively, and it is not installed. The dashboard takes fewer steps and shows the domain status. |
| 4 CI jobs | 1 job running everything | One job gives one check name, but D-07 names four checks. With the pnpm store cache, each extra parallel job costs about 20 s of install. |

**Installation:**

```bash
pnpm add next@16.4.5 react@19.3.1 react-dom@19.3.1
pnpm add -D typescript@~6.0.3 @types/node@^22 @types/react@19.3.0 @types/react-dom@19.3.0 \
  eslint@10.14.0 eslint-config-next@16.4.5 prettier@3.9.10 \
  vitest@5.1.0 vite@8.3.6 @vitejs/plugin-react@6.2.1 jsdom@31.0.0 \
  @testing-library/react@16.3.3 @testing-library/jest-dom@7.0.1 @testing-library/user-event@14.6.8 \
  @playwright/test@1.65.0 @axe-core/playwright@4.14.0 serve@14.2.7
```

## Architecture Patterns

### System Architecture Diagram

```
 developer push / PR
        |
        v
  GitHub repo (public, Yahya-github/portfolio)
        |                                   \
        | pull_request / push                \ Vercel GitHub App webhook
        v                                     v
  GitHub Actions                          Vercel build (Node 22 via engines,
  [lint] [typecheck] [unit] [e2e]          pnpm 12 via Corepack env)
     |       |         |      |             next build -> out/ (export detected)
     |       |         |      +-- next build -> out/ -> serve :4173            |
     |       |         |          -> Playwright: no foreign requests,           v
     |       |         |             font loaded, img decoded, PDF 200,     Vercel CDN
     |       |         |             vercel.json CSP injected, axe;          + vercel.json headers
     |       |         |             measure-js budget gate                   (CSP, HSTS, X-Robots-Tag)
     v       v         v                                                         |
  branch protection on main: 4 checks required, 0 approvals,                    |
  enforce_admins=false (admin bypass)                                            |
        |                                                                         |
   merge to main ------------------------------------> production deploy -------+
                                                                                  v
                     browser -> https://yahya-hallani.dev (apex, cert)  <- www 308 redirect
                     PR branch -> public preview URL (*.vercel.app, noindex)
```

### Recommended Project Structure

```
app/
├── layout.tsx            # html/body, font variable class, metadata (robots noindex)
├── page.tsx              # bare placeholder: text, <img>, PDF link, build SHA
├── globals.css           # body font-family: var(--font-sans); minimal
├── fonts.ts              # next/font/local definition (single instance)
└── fonts/
    ├── InstrumentSans-wdth-wght.woff2   # copy of the docs/reference/fonts file
    └── OFL-InstrumentSans.txt           # licence travels with the font
assets/
└── portrait-800.webp     # pre-optimised, static-imported (hashed URL)
public/
└── yahya-hallani-resume.pdf   # copy of docs/material/resume-public.pdf
lib/
└── build-info.ts         # pure fn: short SHA from env, or "local" (unit-tested)
scripts/
└── measure-js.mjs        # baseline JS sum from out/index.html (gzip + brotli)
tests/                    # Vitest (jsdom)
├── setup.ts
├── build-info.test.ts
└── vercel-config.test.ts # asserts the noindex, CSP and HSTS headers exist in vercel.json
e2e/                      # Playwright against serve out/
├── assets.spec.ts        # first-party only, font, img, PDF, noindex meta
├── csp.spec.ts           # vercel.json CSP injected, zero violations
└── a11y.spec.ts          # axe on /
.github/workflows/ci.yml
vercel.json
next.config.ts  eslint.config.mjs  vitest.config.mts  playwright.config.ts
tsconfig.json  package.json  pnpm-workspace.yaml  .nvmrc  .prettierrc  .gitignore
```

Leave `docs/reference/fonts/` as it is. It is the Phase 1 record that `font-metrics.md` points to. The 88 KB copy in `app/fonts/` is the production asset.

### Pattern 1: next.config.ts for export

```ts
// Source: nextjs.org/docs/app/guides/static-exports (updated 2026-08-09); verified by spike build
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true }, // defensive: any future next/image use still builds
  // trailingSlash left at default (false): Vercel's builder strips .html, so /about serves about.html.
  // Phase 3 owns the route-shape decision.
};

export default nextConfig;
```

Do **not** copy create-next-app's `cacheComponents: true` or `partialPrefetching: true`. How they interact with export was not tested, and this site does not need them. [VERIFIED: scaffold adds them by default]

### Pattern 2: next/font/local with the wdth + wght variable WOFF2

```ts
// app/fonts.ts — Source: nextjs.org/docs/app/api-reference/components/font (2026-09-24); verified in Chromium
import localFont from "next/font/local";

export const instrumentSans = localFont({
  src: "./fonts/InstrumentSans-wdth-wght.woff2",
  weight: "400 700",               // the font's real wght range; 700 is the max, never synthesise 800
  style: "normal",
  display: "swap",
  variable: "--font-sans",
  // `axes` is next/font/google only. For local fonts, declare the wdth range so
  // `font-stretch: 75%` maps onto the wdth axis.
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
  fallback: ["system-ui", "Arial", "sans-serif"],
  // adjustFontFallback defaults to 'Arial' -> generated size-adjust/ascent overrides (CLS guard)
});
```

What the build generated and what Chromium measured [VERIFIED: spike + Playwright]:

- **CSS:** `@font-face{font-stretch:75% 100%;font-family:instrumentSans;src:url(../media/InstrumentSans_wdth_wght-s.p.<hash>.woff2)format("woff2");font-display:swap;font-weight:400 700;...}`, plus a metric-adjusted `instrumentSans Fallback` on `local(Arial)`.
- **Preload:** `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `<head>`.
- **Measured width of YAHYA at 100px, weight 700:**
  - wdth 100: 336px
  - `font-stretch:75%`: 239px
  - `font-variation-settings:'wdth' 75`: 239px

These match font-metrics.md: 3.36 em at wdth 100 and 2.38 em at wdth 75.

### Pattern 3: Placeholder page (zero extra client JS)

```tsx
// app/page.tsx — Server Component, no "use client"
import portrait from "@/assets/portrait-800.webp";
import { shortSha } from "@/lib/build-info";

export default function Home() {
  return (
    <main>
      <h1 style={{ fontStretch: "75%", fontWeight: 700 }}>YAHYA</h1>
      <p>Deploy pipeline test, Instrument Sans body text.</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- export has no optimizer; asset is pre-sized */}
      <img src={portrait.src} width={portrait.width} height={portrait.height}
           alt="Yahya Hallani, greyscale portrait" />
      <p><a href="/yahya-hallani-resume.pdf">Resume (PDF)</a></p>
      <p><small>build {shortSha(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA)}</small></p>
    </main>
  );
}
```

For the Next.js preset, Vercel provides `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` at build time. [CITED: vercel.com/docs/environment-variables/framework-environment-variables] Rendering it makes "push to main redeploys" checkable: `curl` the live page and compare the SHA with `git rev-parse --short HEAD`.

### Pattern 4: Metadata noindex

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { instrumentSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yahya Hallani",
  robots: { index: false, follow: false }, // -> <meta name="robots" content="noindex, nofollow"/> (verified)
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>{children}</body>
    </html>
  );
}
```

`LayoutProps<"/">` is a global type generated by `next typegen` or `next build`. See Pitfall 3.

### Pattern 5: vercel.json (recommended: add headers now)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

- **`script-src` needs `'unsafe-inline'`.** The export emits two inline RSC payload scripts (`<script>self.__next_f.push(...)</script>`). A negative-control test with `script-src 'self'` produced 3 `script-src-elem inline` violations. [VERIFIED: spike] Nonces need a server, and per-build hashes cannot go into a static `vercel.json`. So `'unsafe-inline'` is the documented trade-off for an export, and CLAUDE.md already notes it.
- **The CSP still does real work.** `default-src 'self'` blocks every third-party origin, so browsers enforce D-13/DEP-02 on the live site.
- `style-src 'unsafe-inline'` is needed for React `style` attributes.
- Phase 8 (Atlantis wasm) will need `'wasm-unsafe-eval'` added.
- HSTS: the `.dev` TLD is HSTS-preloaded [ASSUMED: well-known Google TLD policy], so the header is belt and braces.
- The `headers` syntax and `source` patterns come from the official reference (updated 2026-08-14). [CITED: vercel.com/docs/project-configuration/vercel-json]
- Whether these headers apply to a Next export deployment is [ASSUMED, MEDIUM]. The builder's export branch emits `routes` that include `headers`, and vercel.json headers are platform-level. The live `curl -I` check confirms it.

### Pattern 6: CI workflow (4 required checks)

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  lint:
    name: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6        # reads "packageManager": "pnpm@12.11.2"; v6.1.0+ supports pnpm 12
        with: { cache: true }
      - uses: actions/setup-node@v7
        with: { node-version-file: .nvmrc }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint                     # eslint . --max-warnings 0
      - run: pnpm format:check             # prettier --check .
  typecheck:
    name: typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
        with: { cache: true }
      - uses: actions/setup-node@v7
        with: { node-version-file: .nvmrc }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck                # next typegen && tsc --noEmit
  unit:
    name: unit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
        with: { cache: true }
      - uses: actions/setup-node@v7
        with: { node-version-file: .nvmrc }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test                     # vitest run
  e2e:
    name: e2e
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
        with: { cache: true }
      - uses: actions/setup-node@v7
        with: { node-version-file: .nvmrc }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm measure:js -- --max-gzip-kb 150
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - if: failure()
        uses: actions/upload-artifact@v7
        with: { name: playwright-report, path: playwright-report, retention-days: 7 }
```

- **Action tags are current:** checkout v7.0.1, setup-node v7.1.0, pnpm/action-setup v6.1.1 (pnpm 12 support since v6.1.0), upload-artifact v7.0.2. [VERIFIED: GitHub API releases 2026-11-07]
- **The required check contexts are the job `name:` values: `lint`, `typecheck`, `unit`, `e2e`.** Keep them stable. If a job is renamed, protection waits forever for a check that never reports.
- **Browsers in CI: Chromium only for Phase 2.** This phase only proves the pipeline. Wheel and trackpad differences start to matter in Phase 4, which should add `firefox` and `webkit` projects.
- **Do not add `paths:` filters to the workflow.** A required check that never runs blocks the PR forever.

### Pattern 7: Branch protection (classic, admin bypass, solo-friendly)

```bash
gh api -X PUT repos/Yahya-github/portfolio/branches/main/protection --input - <<'EOF'
{
  "required_status_checks": {
    "strict": false,
    "checks": [{ "context": "lint" }, { "context": "typecheck" }, { "context": "unit" }, { "context": "e2e" }]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null
}
EOF
gh api repos/Yahya-github/portfolio/branches/main/protection \
  --jq '{checks: [.required_status_checks.checks[].context], admins: .enforce_admins.enabled, reviews: .required_pull_request_reviews.required_approving_review_count}'
```

- **API rules:** all four top-level fields are required, and each can be null. `required_approving_review_count` takes 0 to 6, and 0 means a PR is required but no approval is needed. Branch protection is free on public repos. [CITED: docs.github.com/en/rest/branches/branch-protection]
- **Use 0 approvals.** GitHub never lets an author approve their own PR, so 1 or more would push every merge through the admin bypass.
- **`enforce_admins: false` is the admin bypass (D-07).** Yahya can still `git push` straight to main; git prints a "bypassed rule violations" notice. `gh pr merge --admin` merges before the checks go green.
- **`strict: false`** avoids forced rebases on a solo repo.
- **Optional hardening:** add `"app_id": 15368` (the GitHub Actions app) to each check, so another app such as Vercel's check cannot satisfy it. [ASSUMED: 15368 is the github-actions app id]
- **Token scopes:** the `gh` token has `repo` and `workflow`, which covers creating the repo, pushing workflows and setting protection. [VERIFIED: `gh auth status`]

### Pattern 8: Baseline JS measurement script

```js
// scripts/measure-js.mjs — verified in spike; prints JSON, optional --max-gzip-kb gate
import { readFileSync } from "node:fs";
import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import { join } from "node:path";

const args = process.argv.slice(2);
const outDir = args.find((a) => !a.startsWith("--")) ?? "out";
const maxIdx = args.indexOf("--max-gzip-kb");
const maxGzipKb = maxIdx === -1 ? null : Number(args[maxIdx + 1]);

const html = readFileSync(join(outDir, "index.html"), "utf8");
const files = new Set();
for (const [tag, src] of html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>/g)) {
  if (!/\bnoModule\b/i.test(tag)) files.add(src); // modern browsers skip noModule polyfills
}
for (const [link] of html.matchAll(/<link\b[^>]*rel="(?:preload|modulepreload)"[^>]*>/g)) {
  const href = link.match(/href="([^"]+\.js)"/)?.[1];
  if (href) files.add(href);
}
const totals = [...files].reduce((acc, src) => {
  const buf = readFileSync(join(outDir, src.replace(/^\//, "")));
  return {
    raw: acc.raw + buf.length,
    gzip: acc.gzip + gzipSync(buf, { level: 9 }).length,
    brotli: acc.brotli + brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
  };
}, { raw: 0, gzip: 0, brotli: 0 });
const kb = (n) => Number((n / 1024).toFixed(1));
const result = { route: "/", files: files.size, rawKB: kb(totals.raw), gzipKB: kb(totals.gzip), brotliKB: kb(totals.brotli) };
console.log(JSON.stringify(result));
if (maxGzipKb !== null && result.gzipKB > maxGzipKb) {
  console.error(`JS budget exceeded: ${result.gzipKB} kB gzip > ${maxGzipKb} kB`);
  process.exit(1);
}
```

Spike results on Next 16.4.5 (Turbopack), using this method:

| Build | Files | Raw | gzip -9 | brotli q11 |
|-------|-------|-----|---------|------------|
| Empty page (`<main>Hello world!</main>`) | 5 | 447 kB | **132.1 kB** | 112.6 kB |
| Placeholder with `<img>` + static import + font | 5 | 447 kB | 132.1 kB | 112.6 kB |
| Placeholder with `next/image` | 6 | 462 kB | 137.8 kB | 117.7 kB |
| (reference) adding the `noModule` polyfill | +1 | +110 kB | +38.6 kB | — |

Cross-check: for the `next/image` variant, Playwright on `serve out` recorded 6 script responses totalling 137.5 kB transferred (brotli from serve), and the noModule file was never requested. [VERIFIED: spike]

After deploying, this measures what Vercel actually sends:

```bash
for s in $(curl -s https://yahya-hallani.dev/ | grep -o '<script[^>]*src="[^"]*"[^>]*>' | grep -v -i nomodule | grep -o 'src="[^"]*"' | cut -d'"' -f2); do
  curl -s -H 'Accept-Encoding: br' -o /dev/null -w '%{size_download}\n' "https://yahya-hallani.dev$s"
done | awk '{s+=$1} END {printf "live brotli transfer: %.1f kB\n", s/1024}'
```

Record the results in the phase SUMMARY and in a short `docs/reference/perf-baseline.md`: date, Next version, method, the numbers above and the live number. Add one line to the performance budget bullet in the design doc that points to it.

### Anti-Patterns to Avoid

- **Overriding the output directory**, either with `outputDirectory: "out"` in vercel.json or in the dashboard. Vercel's builder detects the export itself, and its error docs tell export users not to override it. [CITED: github.com/vercel/vercel/blob/main/errors/now-next-routes-manifest.md]
- **Using `robots.txt` with `Disallow: /` for noindex.** Blocked crawlers never see the `noindex`, and URLs they already know about can still be listed. Use the header and the meta tag only. [ASSUMED: standard Google guidance]
- **Hotlinking anything**, including Vercel Analytics or Google Fonts (D-13).
- **Hand-editing CLAUDE.md's stack block.** Edit `.planning/research/STACK.md` and regenerate.
- **Pushing before the audit.** The repo is public from its first push, and published history cannot be taken back.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font self-hosting, preload, fallback metrics | Manual `@font-face` in `public/fonts` | `next/font/local` | It hashes the file, adds the preload link and generates a size-adjusted Arial fallback (verified). |
| Secret scanning across history | grep for "password" | `gitleaks` 8.30.1 (`gitleaks git -v --redact`) | Hundreds of tuned rules plus entropy checks, run on every commit. |
| Static server for E2E | A Node http server | `serve@14.2.7` through Playwright's `webServer` | Handles clean URLs, compression and MIME types. |
| Accessibility checks | Custom DOM assertions | `@axe-core/playwright` | A maintained WCAG rule set. |
| Deploy pipeline | A GitHub Action that runs `vercel deploy` | Vercel Git integration | Required by D-08. Previews and production come with it, and CI needs no tokens. |
| HTTPS, certificate, www redirect | Anything in code | Vercel Domains settings | Certificates are automatic, and the redirect runs at the edge. |

**Key insight:** most of this phase is configuring hosted systems. The code is about 10 small files. The risk lies in setting up the external systems correctly and proving each one with a check.

## Runtime State Inventory

(This phase includes a domain rename, D-03.)

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None. There is no database or datastore. | none |
| Live service config | The Vercel account already holds `yahya-hallani.dev`: DNS on `ns1`/`ns2.vercel-dns.com`, apex 216.198.79.65 / 64.29.17.1, www 216.198.79.65 / 64.29.17.65, CAA set (verified with `dig` and `getent`). The old domain was never bought, so it has no DNS, registrar or Vercel record. No GitHub repo exists yet (`gh repo view` returned "Could not resolve"). | Attach the domain to the new Vercel project (human step). |
| OS-registered state | None. No scheduled tasks, services or launchd/systemd units relate to this project. | none |
| Secrets / env vars | None in the repo. The Vercel project needs `ENABLE_EXPERIMENTAL_COREPACK=1`, which is not secret. CI needs no secrets, because Vercel deploys through its GitHub App. | Set the env var in Vercel (human step). |
| Build artifacts | None yet. `.ruff_cache/` is gitignored and unrelated. | none |
| Text references (code/doc edits) | Old-domain occurrences outside `.planning/phases/` (`git grep -c`): ROADMAP 8, PITFALLS 6, PROJECT 3, design doc 3, REQUIREMENTS 2, STATE 2, STACK 2, SUMMARY 2, CLAUDE.md 2, ARCHITECTURE 1, FEATURES 1. `~/.claude/skills` has none. | Doc edits per D-03, with CLAUDE.md changed through STACK.md plus regeneration. Final check: `git grep -n "yahya-h\.dev" -- ':!.planning/phases/'` prints nothing. |

The Phase 2 CONTEXT, DISCUSSION-LOG and this RESEARCH have to name the old domain, because they record dropping it. They live under `.planning/phases/`, which the check excludes, in line with D-03's "historical record" rule.

## Public-Safety Audit (D-06): findings before the push

These were checked in this session. The plan still needs the gitleaks run and a final human confirmation.

- **Commit identity:** all 91 commits are `Yahya-github <yahya.hallani.email@gmail.com>`. Yahya confirmed that email as public in `docs/material/links.md` ("confirmed public by Yahya, 2026-11-07"). [VERIFIED]
- **Media metadata:** `exiftool -r` found no GPS or camera EXIF in any `docs/material` image. The resume PDF metadata is Author and Creator "Yahya Hallani", Title "Yahya Hallani - Resume". [VERIFIED]
- **History shape:** no deleted files in history (`git log --diff-filter=D` is empty). The largest blob is 1.15 MB, a club award photo, and `.git` is 14 MB. [VERIFIED]
- **Ignored files:** `docs/reference/fonts-private/` and `*client_secret*.json` are gitignored.
- **Not checked yet: secret patterns** across all 91 commits. This needs gitleaks.
- **Not checked yet: `.planning/` going public.** It holds discussion logs with Yahya's quotes, STATE and reviews. D-05 implies this is intended, but the audit checkpoint should name it so Yahya confirms.

gitleaks is not installed, but `docker` and `podman` are. This recommended route needs no system install:

```bash
S=<scratch dir outside repo>
gh release download v8.30.1 -R gitleaks/gitleaks -p 'gitleaks_8.30.1_linux_x64.tar.gz' -p 'gitleaks_8.30.1_checksums.txt' -D "$S"
(cd "$S" && grep linux_x64 gitleaks_8.30.1_checksums.txt | sha256sum -c - && tar xzf gitleaks_8.30.1_linux_x64.tar.gz gitleaks)
"$S/gitleaks" git -v --redact /home/atlas/dev/mine/portfolio      # all history; exit 1 = findings
"$S/gitleaks" dir -v --redact /home/atlas/dev/mine/portfolio      # working tree incl. untracked
```

The `git` and `dir` subcommands are the CLI form from v8.19 on. [ASSUMED: syntax from training; confirm with `gitleaks --help`]

## Vercel Connection: human and automatable steps

Every dashboard step needs Yahya's login. Make each one a `checkpoint:human-action` with the exact click path and the expected result.

1. **(human) Import the project.** Vercel dashboard > Add New > Project > Import Git Repository > `Yahya-github/portfolio`. When prompted, install or configure the Vercel GitHub App with access to this repo. The Framework Preset should auto-select **Next.js**. Leave Build Command, Output Directory and Install Command at their defaults.
2. **(human, on the import screen before Deploy) Add an environment variable:** `ENABLE_EXPERIMENTAL_COREPACK` = `1`, for all environments. Without it, Vercel picks pnpm 9 or 10 for a `lockfileVersion: '9.0'` lockfile. [CITED: vercel.com/docs/package-managers, vercel.com/docs/builds/configure-a-build#corepack] The first deployment of a project is always production. [CITED: vercel.com/docs/domains/working-with-domains/deploying-and-redirecting]
3. **(human) Domains.** Project > Settings > Domains > add `yahya-hallani.dev`, then accept the suggested `www.yahya-hallani.dev`. Edit www and set "Redirect to" `yahya-hallani.dev` with 308 Permanent. Vercel recommends www as the primary, but apex-primary is supported (Anycast A record), and D-02 locks the apex. [CITED: same page]
4. **(human) Deployment Protection.** Project > Settings > Deployment Protection > set Vercel Authentication to **Disabled**, or the scope to none. Standard Protection "protects all domains except production domains", so previews stay protected unless this changes (D-14). [CITED: vercel.com/docs/deployment-protection] That new projects start with Vercel Authentication on is [ASSUMED]; check what the screen shows.
5. **(human, optional) Vercel Toolbar.** Consider turning it off for previews. It injects a `vercel.live` script on preview deployments [ASSUMED]. The CSP would block that script, and it would muddy the Phase 4 third-party checks on previews.
6. **(automatable) Everything after.** The `curl`/`openssl` checks, the SHA-match redeploy check, and Playwright against the live URL from the local machine. D-15 only restricts what CI does.

**Node version:** `"engines": { "node": "22.x" }` in `package.json` overrides the project setting. Vercel's default is now **26.x**, and the available versions are 26.x, 24.x and 22.x. [CITED: vercel.com/docs/functions/runtimes/node-js/node-js-versions] Without the pin, Vercel builds on Node 26 while CI runs 22.

## Common Pitfalls

### Pitfall 1: The 150 kB landing budget is mostly gone before any feature
**What goes wrong:** Phases 4-5 add GSAP core, Flip, `@gsap/react` and the pager, and the landing page goes over 150 kB gzip.
**Why it happens:** Next 16.4.5's App Router runtime alone is 132.1 kB gzip on an empty page. [VERIFIED]
**How to avoid:**
- Record the baseline now.
- Gate CI with `measure:js --max-gzip-kb 150`.
- Flag for Phase 4/5 planning: about 18 kB gzip of headroom. Load the motion layer with a dynamic import after first paint, and keep `next/image` (+5.7 kB) and `next/link`-heavy client code off `/`.
- The design doc owner may want to restate the budget in brotli terms (112.6 kB baseline), since Vercel serves brotli.

**Warning signs:** `measure:js` creeping above 140 kB gzip.

### Pitfall 2: Vercel builds with the wrong pnpm or Node
**What goes wrong:** Vercel installs with pnpm 9 or 10 (its lockfile 9.0 heuristic) and ignores `allowBuilds` in `pnpm-workspace.yaml`, which is pnpm 11+ syntax. Or Vercel builds on Node 26 while CI uses Node 22.
**How to avoid:** Set `ENABLE_EXPERIMENTAL_COREPACK=1` and `"packageManager": "pnpm@12.11.2"`, and add `"engines": { "node": "22.x" }`. Check the pnpm and Node versions in the first Vercel build log.
**Warning signs:** "Detected pnpm 10" or "Node.js 26" in the build log.

### Pitfall 3: `tsc --noEmit` fails in CI on a clean checkout
**What goes wrong:** Errors `Cannot find name 'LayoutProps'` and `Cannot find module '@/assets/portrait-800.webp'`.
**Why it happens:** `next-env.d.ts` (image module types) and `.next/types` (route globals) only exist after `next dev`, `next build` or `next typegen`, and `next-env.d.ts` is gitignored by convention. [VERIFIED: reproduced in spike]
**How to avoid:** Use `"typecheck": "next typegen && tsc --noEmit"`.

### Pitfall 4: Required check names drift from job names
**What goes wrong:** PRs sit at "Expected — Waiting for status to be reported" forever.
**How to avoid:** Give every job an explicit `name:`, use the same names in the protection payload, and add no `paths:` filters. Verify with the `gh api ... --jq` read-back and one real PR.

### Pitfall 5: Requiring approvals on a solo repo
**What goes wrong:** With `required_approving_review_count` at 1 or more, Yahya cannot merge his own PRs without `--admin`, which defeats the gate.
**How to avoid:** Use 0.

### Pitfall 6: Leaking private history
**What goes wrong:** A secret or private file anywhere in the 91 commits becomes public with the first push.
**How to avoid:** Run the gitleaks history and working-tree scans and get Yahya's confirmation before `gh repo create --push`. If anything turns up, stop: rewriting history is a separate decision for Yahya (D-06).

### Pitfall 7: The CSP is only checked on the live site
**What goes wrong:** `serve` does not send the `vercel.json` headers, so a change that breaks the CSP passes CI and then breaks production.
**How to avoid:** `e2e/csp.spec.ts` reads `vercel.json`, injects its CSP into the document response through `page.route`, and asserts there are no `securitypolicyviolation` events or page errors. Strip `upgrade-insecure-requests` for the http://localhost run. A negative control with a strict `script-src 'self'` failed as expected. [VERIFIED: spike]

### Pitfall 8: `next dev` writes AGENTS.md
**What goes wrong:** Running `next dev` under an AI agent creates or updates `AGENTS.md`, which appears as an unexpected diff.
**How to avoid:** Decide once. Either commit the file, whose pointer to `node_modules/next/dist/docs/` helps later agents, or set `agentRules: false` in `next.config.ts`. [VERIFIED: log message in `node_modules/next/dist/server/lib/start-server.js` and the config schema] Recommendation: commit it.

### Pitfall 9: Live 404 and trailing-slash behaviour differ from `serve`
**What goes wrong:** An unknown path returns Vercel's generic 404 instead of the exported `404.html`, or `/x/` versus `/x` redirects surprise Phase 3.
**How to avoid:** Add a live check: `curl -s -o /dev/null -w '%{http_code}' https://yahya-hallani.dev/nope` should print 404, and the body should contain Next's 404 markup. Record the result. The builder source adds a 404 route and takes `trailingSlash` from the export intent. [VERIFIED: vercel/vercel packages/next/src/index.ts lines 1031-1120]

## Code Examples

### package.json (scripts and pins)

```json
{
  "name": "portfolio",
  "private": true,
  "packageManager": "pnpm@12.11.2",
  "engines": { "node": "22.x" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint . --max-warnings 0",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "next typegen && tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "measure:js": "node scripts/measure-js.mjs out"
  }
}
```

Put `22` in `.nvmrc`. Keep the `allowBuilds` block that create-next-app emits in `pnpm-workspace.yaml` (`sharp: false`, `unrs-resolver: false`); lint ran fine with both blocked. [VERIFIED: spike]

### eslint.config.mjs

```js
// Source: create-next-app 16.4.5 output (verified)
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "playwright-report/**", "test-results/**"]),
]);
```

### vitest.config.mts (no vite-tsconfig-paths)

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"], // import "@testing-library/jest-dom/vitest";
  },
});
```

### playwright.config.ts (local export by default, live URL on demand)

```ts
import { defineConfig, devices } from "@playwright/test";

const liveBaseUrl = process.env.BASE_URL; // e.g. https://yahya-hallani.dev for a manual, non-CI check
export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: liveBaseUrl ?? "http://localhost:4173", trace: "retain-on-failure" },
  webServer: liveBaseUrl ? undefined : {
    command: "pnpm exec serve out -l 4173 --no-clipboard",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

### e2e/assets.spec.ts (core DEP-02 assertion; this shape was verified)

```ts
import { test, expect } from "@playwright/test";

test("all assets first-party; font, image and PDF load; page is noindex", async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const foreign: string[] = [];
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith(origin) && !u.startsWith("data:")) foreign.push(u);
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(foreign).toEqual([]);

  const fontLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some((f) => f.status === "loaded" && f.family.includes("instrumentSans"));
  });
  expect(fontLoaded).toBe(true);

  const img = page.getByRole("img", { name: /Yahya Hallani/ });
  await expect(img).toBeVisible();
  expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);

  const pdfHref = await page.getByRole("link", { name: /Resume/ }).getAttribute("href");
  const pdf = await page.request.get(pdfHref!);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
```

The font family name comes from the exported const (`instrumentSans`). [VERIFIED: generated CSS] Renaming the const changes the family string this test matches.

### Image preparation (ImageMagick 7 is installed; this build has no AVIF support)

```bash
magick docs/material/portrait-devfest-2026-grey.jpg -resize 800x -strip -quality 78 assets/portrait-800.webp
# -> 800x656, 37.7 KB (JPEG q80 at the same size is 66.9 KB). Source is 1512x1240 grey, 468 KB.
```

800px covers a placeholder up to about 400 CSS px at 2x. Phase 6 can produce proper responsive sizes.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GitHub Pages, Actions artifact, basePath and CNAME | Vercel Git integration, no basePath | Project decision, 2026-11-06 | Drop the `withBase()`, configure-pages and CNAME notes from STACK.md and CLAUDE.md. |
| create-next-app with minimal defaults | create-next-app 16.4.5 turns on `cacheComponents` and `partialPrefetching` and writes AGENTS.md | Next 16.x | Write the config by hand for an export site. |
| `next lint` | `eslint .` with a flat config | Next 16 | Already reflected in CLAUDE.md. |
| Vercel default Node 22/24 | Vercel default Node 26.x | 2026 | Pin `engines.node`. |
| pnpm/action-setup only | pnpm/action-setup v6.1+ (pnpm 12) or the newer `pnpm/setup` v3 | 2026 | Either works. Keep action-setup with setup-node, which the README says is still supported. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | vercel.json `headers` apply to a Next static-export deployment | Pattern 5 | Low. The live `curl -I` shows it at once. Fallback: a `<meta http-equiv>` CSP plus the metadata robots tag. |
| A2 | The `.dev` TLD is HSTS-preloaded | Pattern 5 | None. The HSTS header is sent anyway. |
| A3 | New Vercel projects start with Vercel Authentication on (previews protected) | Vercel step 4 | Low. Yahya sees the setting either way. |
| A4 | The Vercel Toolbar injects `vercel.live` on previews | Vercel step 5 | Low. It only affects network checks on previews. |
| A5 | The gitleaks v8.30 CLI form is `gitleaks git` / `gitleaks dir` | Audit | Low. `--help` corrects it. |
| A6 | The GitHub Actions app id is 15368 | Pattern 7 | Low. Optional hardening only. |
| A7 | A robots.txt Disallow hides the noindex from crawlers | Anti-patterns | Low. The advice is simply not to add one. |
| A8 | Without Corepack, Vercel's pnpm 10 may switch itself to pnpm 12 because of `packageManager` | Pitfall 2 | Low. Setting the env var makes this moot. |

## Open Questions

1. **Is the ~150 kB landing JS budget gzip or brotli, and does it need revisiting?**
   - What we know: empty Next 16.4.5 is 132.1 kB gzip and 112.6 kB brotli. The design doc says "gzipped".
   - What's unclear: whether Yahya wants to restate the budget, or accept about 18 kB of headroom for motion.
   - Recommendation: Phase 2 records the numbers and adds the CI gate at 150 kB gzip. Bring this into Phase 4/5 planning instead of deciding it in Phase 2.
2. **`.planning/` going public.**
   - What we know: D-05 pushes "the existing history", and that history includes `.planning/`.
   - Recommendation: name it explicitly in the D-06 audit checkpoint.
3. **Resume URL name.** Recommendation: `/yahya-hallani-resume.pdf`, because the filename is what a recruiter's download shows. D-11 only says "copied to public/". Low stakes, but Phases 6-7 link to it.
4. **Vercel `ignoreCommand` for doc-only commits.** Each GSD doc commit to main triggers a production build. That is harmless and takes a few seconds. An option is `"ignoreCommand": "git diff --quiet HEAD^ HEAD -- . ':(exclude).planning' ':(exclude)docs'"`. Recommendation: skip it for now (YAGNI). A skipped build would also make the SHA-match check fail on doc commits.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build, tests | ✓ | 22.22.2 | — |
| pnpm | install | ✓ | 12.11.2 | — |
| gh CLI (logged in, scopes repo+workflow) | repo creation, branch protection | ✓ | 2.96.0 | — |
| ImageMagick (`magick`) | portrait WebP | ✓ | 7.1.2-34 (WebP yes, AVIF no) | — |
| exiftool | metadata audit | ✓ | 13.50 | — |
| Playwright browsers | local e2e | ✓ (the download works; Fedora gets a harmless "ubuntu24.04 fallback build" warning) | chromium for 1.65 | — |
| gitleaks | D-06 audit | ✗ | — | Download the v8.30.1 release binary to a scratch dir and verify the checksum (above), or `podman run ghcr.io/gitleaks/gitleaks` |
| Vercel CLI | — | ✗ | (65.12.1 on npm) | Not needed: Yahya imports through the dashboard |
| Vercel account + domain | DEP-01 | ✓ (domain on Vercel DNS, resolves) | — | — |
| jq, curl, openssl, dig | live checks | ✓ | — | — |

**Missing with no fallback:** none.
**Missing with a fallback:** gitleaks (release binary) and the Vercel CLI (dashboard).

Local note: the pnpm store on `/home` cannot hard-link into projects under `/tmp`. This is harmless, and the repo itself is on `/home`.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 5.1.0 (jsdom 31), Playwright 1.65.0 (Chromium), @axe-core/playwright 4.14.0 |
| Config file | `vitest.config.mts`, `playwright.config.ts` (neither exists yet; Wave 0) |
| Quick run command | `pnpm lint && pnpm typecheck && pnpm test` |
| Full suite command | `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm measure:js -- --max-gzip-kb 150 && pnpm test:e2e` |

### Phase Requirements to Test Map

| Req / SC | Behavior | Test Type | Automated Command | File Exists? |
|----------|----------|-----------|-------------------|-------------|
| DEP-02 / SC2 | Zero non-origin requests on `/`; the `instrumentSans` face loads; the img decodes; the PDF returns 200 `application/pdf` | e2e | `pnpm test:e2e -g "first-party"` | ❌ Wave 0 `e2e/assets.spec.ts` |
| DEP-02 / SC2 | Built HTML has no `http(s)://` asset URLs | smoke | `! grep -Eo '(src\|href)="https?://' out/index.html` | — (inline in the plan's verify step) |
| D-12 | `<meta name="robots" content="noindex, nofollow">` is present | e2e | part of `assets.spec.ts` | ❌ Wave 0 |
| D-12 / D-13 | vercel.json has the X-Robots-Tag noindex, a CSP with `default-src 'self'`, and HSTS | unit | `pnpm test -- vercel-config` | ❌ Wave 0 `tests/vercel-config.test.ts` |
| D-13 | The page runs under the production CSP with zero violations | e2e | `pnpm test:e2e -g "CSP"` | ❌ Wave 0 `e2e/csp.spec.ts` |
| Accessibility baseline | axe finds no violations on `/` | e2e | `pnpm test:e2e -g "axe"` | ❌ Wave 0 `e2e/a11y.spec.ts` |
| SC1 redeploy proof | `shortSha()` returns the 7-character SHA, or "local" when unset | unit | `pnpm test -- build-info` | ❌ Wave 0 `tests/build-info.test.ts` |
| SC4 | Baseline JS is measured, and CI fails above 150 kB gzip | script | `pnpm measure:js -- --max-gzip-kb 150` | ❌ Wave 0 `scripts/measure-js.mjs` |
| SC3 | Protection lists exactly lint, typecheck, unit and e2e, with admins not enforced and 0 approvals | API | `gh api repos/Yahya-github/portfolio/branches/main/protection --jq '[.required_status_checks.checks[].context]'` | — |
| SC3 | A failing check blocks the merge | manual, scripted | Open a throwaway PR with a unit test that fails on purpose. `gh pr checks <n>` shows `unit` failing, and `gh pr view <n> --json mergeStateStatus` returns `BLOCKED`. Then close the PR and delete the branch. | — |
| DEP-01 / SC1 | HTTPS returns 200 with a valid certificate (no `-k`) | live | `curl -sSfI https://yahya-hallani.dev/ \| head -1` and `openssl s_client -connect yahya-hallani.dev:443 -servername yahya-hallani.dev </dev/null 2>/dev/null \| openssl x509 -noout -issuer -enddate` | — |
| D-02 | www redirects permanently to the apex | live | `curl -sI https://www.yahya-hallani.dev/ \| grep -Ei '^(HTTP\|location)'` shows 308 and `location: https://yahya-hallani.dev/` | — |
| SC1 | A push to main redeploys | live | After a merge, poll until `curl -s https://yahya-hallani.dev/ \| grep -o "build [0-9a-f]\{7\}"` equals `git rev-parse --short origin/main` | — |
| D-12 live | The headers are present on the HTML and the PDF | live | `curl -sI https://yahya-hallani.dev/yahya-hallani-resume.pdf \| grep -i x-robots-tag` | — |
| DEP-02 live | The live page makes only first-party requests | live (local run, not CI, per D-15) | `BASE_URL=https://yahya-hallani.dev pnpm test:e2e -g "first-party"` | — |
| D-14 | A preview URL opens without a login | live | `curl -s -o /dev/null -w '%{http_code}' <preview-url>` returns 200, not a 401 or a 302 to vercel.com/login | — |
| D-03 | The old domain is gone from live docs | grep | `! git grep -n "yahya-h\.dev" -- ':!.planning/phases/'` | — |
| Folded todo | The CLAUDE.md stack section has no Pages, basePath or CNAME notes | grep | `! grep -nEi "configure-pages\|withBase\|CNAME\|github pages" CLAUDE.md` (allow mentions deliberately kept in alternatives or history) | — |

### Sampling Rate
- **Per task commit:** `pnpm lint && pnpm typecheck && pnpm test`
- **Per wave merge:** the full suite (build, measure, e2e)
- **Phase gate:** full suite green in CI on main, plus every live check above, before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.mts` and `tests/setup.ts` (framework config)
- [ ] `playwright.config.ts` (serve `out/` webServer, `BASE_URL` override)
- [ ] `tests/build-info.test.ts`, `tests/vercel-config.test.ts`
- [ ] `e2e/assets.spec.ts`, `e2e/csp.spec.ts`, `e2e/a11y.spec.ts`
- [ ] `scripts/measure-js.mjs`
- [ ] Browser install: `pnpm exec playwright install chromium` locally, `--with-deps chromium` in CI
- Readiness for the folded v7 todo (WR-04..IN-01) is covered by the scaffold: jsdom with user-event for keyboard and focus tests in Phase 4, and Playwright's reduced-motion emulation (`test.use({ reducedMotion: 'reduce' })`, with `page.emulateMedia` for live media-query changes). Phase 2 writes no tests for those behaviours.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | The site has no auth. Vercel and GitHub accounts are out of scope. |
| V3 Session Management | no | No sessions or cookies. |
| V4 Access Control | partly | GitHub branch protection is the merge gate. Vercel Deployment Protection is off for previews on purpose (D-14), and previews hold only public content. |
| V5 Input Validation | no | The static page has no forms and takes no user input. |
| V6 Cryptography | no | Vercel provides TLS with managed certificates. Never hand-roll it. |
| V10 Malicious Code / supply chain | yes | Lockfile with `--frozen-lockfile`, exact version pins, pnpm 12's build-script allowlist (`allowBuilds`), official actions on major tags (SHA pinning optional), `permissions: contents: read`, and no CI secrets. |
| V14 Configuration | yes | `vercel.json` headers: CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, frame denial and X-Robots-Tag. No source maps are shipped (Next's default is `productionBrowserSourceMaps: false`). |

### Known Threat Patterns for a static Next export on Vercel

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| A secret or private file published in git history | Information disclosure | gitleaks history scan and a human review before the first public push (D-06) |
| Third-party script injection or a compromised hotlinked asset | Tampering | Self-host everything (D-13). The CSP `default-src 'self'` blocks foreign origins. |
| Clickjacking | Tampering | `frame-ancestors 'none'` and `X-Frame-Options: DENY` |
| Search engines indexing a preview | Information disclosure | `X-Robots-Tag` header (which applies to previews too) and the meta robots tag |
| A malicious PR from a fork running CI | Elevation of privilege | Use `pull_request`, not `pull_request_target`; read-only token; no secrets in the workflow |
| Domain takeover or dangling DNS | Spoofing | The domain is registered and its DNS managed in the same Vercel account, with no wildcard records |

## Sources

### Primary (HIGH confidence)
- The throwaway spike build in this session (scratchpad, Next 16.4.5 Turbopack): export output, font CSS, the wdth axis in Chromium, JS sizes, the `tsc` failure on a clean checkout, the ESLint 10 rule probe, the Vitest 5 run, the Playwright + serve run, and the CSP positive and negative controls.
- npm registry (`npm view`, 2026-11-07): every version and peerDependency in the Standard Stack tables.
- GitHub API releases (2026-11-07): actions/checkout v7.0.1, setup-node v7.1.0, pnpm/action-setup v6.1.1 (pnpm 12 support in v6.1.0), upload-artifact v7.0.2, gitleaks v8.30.1.
- vercel/vercel `packages/next/src/index.ts` (main branch): the static-export branch, around lines 1031-1120.
- https://nextjs.org/docs/app/guides/static-exports (updated 2026-08-09)
- https://nextjs.org/docs/app/api-reference/components/font (updated 2026-09-24)
- https://vercel.com/docs/project-configuration/vercel-json (updated 2026-08-14)
- https://vercel.com/docs/package-managers (updated 2026-08-11)
- https://vercel.com/docs/builds/configure-a-build (updated 2026-08-28)
- https://vercel.com/docs/functions/runtimes/node-js/node-js-versions (updated 2026-02-27)
- https://vercel.com/docs/deployment-protection (updated 2026-09-15)
- https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting (updated 2026-08-11)
- https://vercel.com/docs/environment-variables/framework-environment-variables (updated 2026-09-16)
- https://docs.github.com/en/rest/branches/branch-protection (update branch protection)
- https://docs.github.com/en/rest/repos/rules (rulesets; considered, not chosen)

### Secondary (MEDIUM confidence)
- https://github.com/vercel/vercel/blob/main/errors/now-next-routes-manifest.md (do not override the output directory)
- The pnpm/action-setup README (v6 supports pnpm 12; `pnpm/setup` is the successor)

### Tertiary (LOW confidence)
- Assumptions A1-A8 above

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. Versions come from the registry, and the combination was built and tested.
- Architecture: HIGH for the build, CI and branch protection. MEDIUM for Vercel edge behaviour until the first deploy.
- Pitfalls: HIGH. Pitfalls 1, 3, 7 and 8 were reproduced in the spike, and Pitfall 2 comes from Vercel's docs.

**Research date:** 2026-11-07
**Valid until:** about 2026-12-07. Next, Vercel and pnpm move monthly, so re-run `npm view` before execution if the plan slips.
