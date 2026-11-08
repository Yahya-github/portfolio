# Stack Research

**Domain:** Static, animation-heavy personal portfolio (Next.js static export on Vercel): horizontal full-screen paging, kinetic typographic nav (FLIP letters to a rail), timeline animation, optional lazy WebGL depth-map effect
**Researched:** 2026-11-06
**Confidence:** HIGH for versions and hosting (checked against the npm registry, nextjs.org docs, GitHub docs and the official nextjs/deploy-github-pages template on 2026-11-06). MEDIUM for the animation and WebGL choices (they are judgement calls based on verified capabilities).
**Updated 2026-11-07 (Phase 2):** hosting switched to Vercel on 2026-11-06; the GitHub Pages workflow, basePath and custom-domain DNS notes are removed.

## TL;DR (prescriptive)

- **Next.js 16.4 (App Router) + React 19.3 + TypeScript 6.0.x**, with `output: 'export'`, deployed by the **Vercel Git integration** (a push to `main` deploys production; PRs get public previews). No basePath. Domain `yahya-hallani.dev` (apex canonical, www 308 to the apex). Headers (CSP, HSTS, X-Robots-Tag) live in `vercel.json`.
- **Styling:** **CSS Modules + one global `tokens.css`** made of CSS custom properties, with a **CSS Grid 12-column system** (`repeat(12, minmax(0,1fr))` + `subgrid`). **No Tailwind.**
- **Font:** **`next/font`**. Use `next/font/google` `Inter_Tight` (variable) now; switch to `next/font/local` if the final font is not on Google Fonts. Fonts are self-hosted at build time in both cases.
- **Motion:**
  - **Page slides:** plain CSS `transform` transitions on a single track. No library.
  - **YAHYA letters to rail FLIP and the 75/75 judge timeline:** **GSAP 3.15 + Flip plugin + `@gsap/react` `useGSAP`**. All of GSAP is now free.
  - **Reduced motion:** `prefers-reduced-motion` in CSS plus `gsap.matchMedia()`.
- **Input paging:** a hand-written `usePager` hook (wheel delta accumulator with a lock and idle gap to ignore inertia, keyboard map, Pointer Events swipe). **No gesture or smooth-scroll library.**
- **WebGL (later):** **raw WebGL2** in a lazily `import()`ed client module with a static poster fallback. Move to **OGL** only if you need meshes or point clouds. three.js only if you need loaders or post-processing.
- **Testing:** Vitest 5 (jsdom + Testing Library) for logic and hooks; Playwright 1.65 against the built `out/` folder for E2E, visual regression and reduced-motion runs; `@axe-core/playwright` for accessibility; Lighthouse CI for performance budgets.
- **Lint/format:** ESLint 10 flat config with `eslint-config-next` 16.4 (which already bundles `jsx-a11y` and `react-hooks` 7), Prettier 3, Stylelint 18.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Next.js | `16.4.5` (latest on 2026-11-06) | Framework, build, static export | Required by the project constraint. In v16, Turbopack is the default for `dev` and `build`, `next lint` is removed, `reactCompiler` is a stable option, and the minimum is Node 20.9. `output: 'export'` turns Server Components into static HTML at build time, so the site ships as plain files. | HIGH (npm + nextjs.org v16 upgrade guide) |
| React / React DOM | `19.3.1` | UI | Next 16 peers on `^19`. React 19 treats `inert` as a real boolean prop, which the "inactive pages inert" requirement needs. It also has `useEffectEvent`, which suits wheel and keyboard listeners that read the latest page index without re-subscribing. | HIGH (npm); MEDIUM for `inert` (secondary sources agree) |
| TypeScript | **`~6.0.3`, not 7.x** | Types | TS 7.0.2 (the Go-native compiler) is `latest` on npm, but **`typescript-eslint` 8.72 peers on `typescript >=4.8.4 <6.1.0`**, and `eslint-config-next` depends on it. Pin 6.0.x until typescript-eslint supports 7. Next 16 needs TS 5.1 or later. | HIGH (npm peerDependencies checked) |
| Node.js | 22 LTS (local is 22.22) or 24 LTS | Runtime for build and CI | Next 16 needs 20.9 or later. **Vitest 5 needs `^22.12 \|\| ^24`**. Pin CI to the same major as local, with an `.nvmrc` or `engines` field. Pin `"engines": { "node": "22.x" }` in package.json, because Vercel's default is Node 26.x. | HIGH |
| pnpm | 12.x (12.11 installed locally) | Package manager | Already installed. Set `"packageManager": "pnpm@12.11.2"` (pnpm/action-setup reads it) and set `ENABLE_EXPERIMENTAL_COREPACK=1` in the Vercel project. Without it, Vercel installs a v9.0 lockfile with pnpm 9 or 10. | MEDIUM (template uses pnpm 10; v12 is current) |
| Vercel (Hobby) + Vercel GitHub App; CI on GitHub Actions (`actions/checkout@v7`, `pnpm/action-setup@v6`, `actions/setup-node@v7`, `actions/upload-artifact@v7`) | n/a | Hosting, deploy, merge gate | Vercel's Next builder detects `output: 'export'`, serves `out/`, strips `.html` and adds a 404 route, so leave Output Directory unset. `vercel.json` `headers` give real CSP, HSTS and X-Robots-Tag headers. GitHub Actions only runs lint, typecheck, unit and e2e (the required checks on `main`); it never deploys. | HIGH (Vercel docs + builder source, 2026-11-07) |

### Styling, Fonts, Animation

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| CSS Modules (built into Next) + global `tokens.css` | n/a | Component styles plus design tokens (`--color-ground`, `--color-ink`, `--color-accent`, type scale with `clamp()`, `--grid-gutter`, `--grid-margin`, durations, easings) | Always. No dependency. Matches the user's rule "define design tokens as CSS variables". Class names stay stable for GSAP selectors, and the small number of bespoke components does not benefit from utility classes. | HIGH |
| CSS Grid + `subgrid` | Baseline, inside the Next 16 browser floor (Chrome/Edge/Firefox 111+, Safari 16.4+) | Strict Swiss 12-column grid | A `.grid` primitive (`grid-template-columns: repeat(12, minmax(0,1fr))`) at page level. Children use `grid-template-columns: subgrid` so nested blocks stay on the master columns. Column spans are expressed in CSS, not JS. | MEDIUM (subgrid support is well known; Next's browser floor is documented) |
| `next/font/google` (`Inter_Tight`) or `next/font/local` | ships with Next 16.4 | Self-hosted variable font, zero layout shift, preloaded | Font files are fetched **at build time** and served from `/_next/static/media`. Nothing is requested from Google at runtime, which satisfies "self-host fonts". Set `variable: '--font-sans'` and use it in the tokens. Change to `next/font/local` with a committed `.woff2` if the final font (still open) comes from a foundry or a font not on Google Fonts. `@fontsource-variable/inter-tight@5.3.0` is a fallback only. | HIGH that next/font self-hosts and works with export; MEDIUM on Inter Tight's axis details |
| GSAP | `3.15.1` | Timeline engine: letter choreography, judge 0 to 75/75 counter, staggered reveals | The FLIP letters and the judge animation are the core value. GSAP timelines can be interrupted, reversed and scrubbed, and `gsap.matchMedia()` gives reduced-motion variants in one place. **Since 2025-04-30 all of GSAP, including Flip and SplitText, is free for commercial use** under the Webflow "no charge" license. | HIGH (npm; Webflow announcement) |
| GSAP Flip plugin (`gsap/Flip`) | ships with gsap 3.15 | Giant hero letters to a vertical left rail | `Flip.getState(letters)`, then change the layout (React state toggles `data-mode="rail"`), then `Flip.from(state, { scale: true, nested: true, absolute: true })`. Handles mid-animation interruption (the user pages again during the glide), resize, and nested transforms. Hand-rolled FLIP gets these cases wrong. | MEDIUM-HIGH |
| `@gsap/react` | `2.1.2` | `useGSAP()` hook | Runs GSAP in a scoped `gsap.context()` that reverts on unmount, which avoids double animations under React StrictMode. Peers: gsap ^3.12.5, react >=17. | HIGH |
| CSS transitions / WAAPI | platform | Horizontal page track (`transform: translate3d(calc(var(--page) * -100vw),0,0)`), progress bar, accent colour swaps | Paging is a single transform on one element and needs no library. Driving `--page` from React state keeps it declarative. Use a `transitionend` or `element.getAnimations()` promise to sequence "slide finished, then letters land". | HIGH |
| Raw WebGL2 (phase "depth map", lazy) | platform | Depth-map parallax or displacement of a portrait (colour texture + greyscale depth texture on one full-screen quad) | One shader on one quad is about 150 LOC and adds 0 KB of dependencies. Load with `await import('./depth-scene')` inside `useEffect`, gated by IntersectionObserver, `!matchMedia('(prefers-reduced-motion: reduce)').matches` and a WebGL2 check. Always render a static `<img>` poster first and as the fallback. | MEDIUM |
| OGL (escalation only) | `1.0.11` | Minimal WebGL scene graph (geometry, program, camera) | Only if the depth aesthetic grows into point-cloud terrain or a contour sphere with real geometry. Much smaller than three.js and ships TS types. **Note: the repo has had no pushes since April 2025.** It is stable but quiet, so treat it as frozen. | MEDIUM |

### Development and Test Tools

| Tool | Version | Purpose | Notes | Confidence |
|------|---------|---------|-------|------------|
| Vitest | `5.1.0` (+ `vite@8.3.6`, `@vitejs/plugin-react@6.2.1`, `@vitest/coverage-v8@5.1.0`; no `vite-tsconfig-paths`, which peers on typescript ^5, so use a Vite `resolve.alias` instead) | Unit and integration tests | Test pure logic first: the pager reducer (index clamp, Home/End), the wheel-gesture accumulator (simulated inertia tail produces exactly one page), the swipe threshold, and grid-span helpers. Vitest 5 lists `vite` as a peer, so install it explicitly. **Async Server Components are not supported by Vitest.** Keep tested components synchronous or cover them in Playwright. | HIGH on versions; MEDIUM on the Vite 8 plugin peers |
| jsdom + Testing Library | `jsdom@31.0.0`, `@testing-library/react@16.3.3`, `@testing-library/user-event@14.6.8`, `@testing-library/jest-dom@7.0.1` | DOM tests for keyboard paging, focus moving into the active page, `inert` on inactive pages | jsdom has no layout, so FLIP and transforms cannot be asserted here. That belongs in Playwright. | HIGH |
| Playwright | `@playwright/test@1.65.0` | E2E, visual regression, motion and a11y flows | Run against the **production export**: `next build`, then `serve out` (`serve@14.2.7`) as `webServer`. Use `test.use({ reducedMotion: 'reduce' })` for the reduced-motion project, `page.mouse.wheel()` and keyboard presses for paging, `toHaveScreenshot()` at 320/768/1024/1440, and Chromium + Firefox + WebKit projects (Safari matters for wheel and trackpad behaviour). | HIGH |
| `@axe-core/playwright` | `4.14.0` | Automated WCAG checks | Run `AxeBuilder` on every page index, after paging, in both motion modes. It covers contrast for the green accent on black. It does not replace manual keyboard and screen-reader passes. | HIGH |
| Lighthouse CI | `@lhci/cli@0.16.0` | Performance and a11y budgets in CI | Assert LCP < 2.5 s, CLS < 0.1, TBT < 200 ms on `out/`, matching the user's web performance rules. | MEDIUM |
| ESLint | `eslint@10.14.0` + `eslint-config-next@16.4.5` | Lint | `next lint` is gone in v16, so call `eslint .` directly with a flat config. `eslint-config-next` 16.4+ supports ESLint 10 and already includes `eslint-plugin-jsx-a11y` and `eslint-plugin-react-hooks@^7` (React Compiler rules). | HIGH |
| Prettier | `3.9.10` | Format | Standard. | HIGH |
| Stylelint | `stylelint@18.0.0` + `stylelint-config-standard@41.0.0` | CSS lint | Optional but cheap, since most of the design lives in CSS. Add a rule that bans raw hex outside `tokens.css`. | MEDIUM |
| React Compiler | `babel-plugin-react-compiler@1.0.0`, `reactCompiler: true` | Auto-memoisation | **Optional; default to off.** It routes builds through Babel and is slower. This site has about six components and the hot path is GSAP and CSS, not React re-renders. Enable later only if profiling shows a need. | HIGH (Next docs) |

## Key Configuration

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true }, // defensive: any future next/image use still builds
  // No basePath. trailingSlash left at default (false): Vercel's builder strips .html,
  // so /about serves about.html. Phase 3 owns the route-shape decision.
};

export default nextConfig;
```

- **`vercel.json`:** one `headers` block on `/(.*)` sets `X-Robots-Tag: noindex, nofollow` (until launch); a CSP with `default-src 'self'` and `script-src 'self' 'unsafe-inline'` (the export inlines RSC payload scripts, and nonces need a server); `Strict-Transport-Security` (HSTS); `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; a `Permissions-Policy` that turns off camera, microphone, geolocation and browsing-topics; and `X-Frame-Options: DENY`. A second block gives `/_next/static/(.*)` `Cache-Control: public, max-age=31536000, immutable`.

- **CI:** `.github/workflows/ci.yml` has four jobs named lint, typecheck, unit and e2e. typecheck is `next typegen && tsc --noEmit`, because a clean checkout otherwise has no LayoutProps or image module types.

- **Domain:** yahya-hallani.dev on Vercel Domains. The apex is primary and www redirects to it with a 308, set in Project > Settings > Domains.

## Installation

```bash
cd /home/atlas/dev/mine/portfolio
pnpm create next-app@latest . --ts --app --eslint --no-tailwind --src-dir --import-alias "@/*" --use-pnpm

# Pin TS to a typescript-eslint-compatible line
pnpm add -D typescript@~6.0.3 @types/react@^19.3 @types/react-dom@^19.3 @types/node@^22

# Animation
pnpm add gsap@^3.15.1 @gsap/react@^2.1.2

# Tests
pnpm add -D vitest@^5.1 vite@^8.3 @vitejs/plugin-react@^6.2 @vitest/coverage-v8@^5.1 \
  jsdom@^31 @testing-library/react@^16.3 @testing-library/user-event@^14.6 @testing-library/jest-dom@^7
pnpm add -D @playwright/test@^1.65 @axe-core/playwright@^4.14 serve@^14.2.7 @lhci/cli@^0.16

# Lint/format
pnpm add -D prettier@^3.9 stylelint@^18 stylelint-config-standard@^41

# Later, only if the depth phase needs a scene graph
# pnpm add ogl@^1.0.11
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| GSAP + Flip for the letter choreography | **Motion** (`motion@14.9.1`, formerly Framer Motion) with `layout` / `layoutId` | Use Motion if you want the hero-to-rail change expressed purely as React state (`<motion.a layout>`). It is a good fit for state-driven FLIP. It loses on hand-tuned multi-step timelines (the judge counter, letter stagger then caption fade), and layout features need the heavier `domMax` bundle (about 30 KB, per third-party reports, LOW confidence). Do not use both libraries. |
| GSAP Flip | Hand-written FLIP with WAAPI (`el.animate`) | Use this if you want zero dependencies and accept writing interruption and resize handling yourself. It is about 60 LOC for five letters. It is reasonable once the choreography is frozen. |
| CSS Modules + tokens | **Tailwind CSS 4.3** | Use Tailwind if the site grows into many generic components. Here it adds a build step and utility noise to a few bespoke components. The Swiss grid, `clamp()` type scale and animation hooks read better as named CSS, and the user's rules ban "default Tailwind" looks anyway. |
| CSS transform track for paging | React `<ViewTransition>` / View Transitions API | Use it for cross-document route morphs. Paging here is gesture-driven and must be interruptible and index-addressed, and view transitions snapshot and cannot be scrubbed or interrupted cleanly. |
| Single route `/` with hash state (`#projects`) | Six real routes (`/projects/`, ...) | Use real routes if per-page SEO metadata matters more than continuity. Separate routes remount content and fight the shared-element letter FLIP. If you want them anyway, keep the stage in `layout.tsx`. That decision belongs to ARCHITECTURE.md. |
| Raw WebGL2 | **three.js `0.187.0`** | Use three.js only if you need GLTF or point-cloud loaders, post-processing, or many scenes. It is roughly 10x the bytes of OGL for one shader on a quad. |
| `next/font` | Hand-written `@font-face` in `/public/fonts` | Use only if you need a font feature next/font cannot express. You lose automatic preload and size-adjusted fallback (CLS protection). |
| Vercel | GitHub Pages (original plan, dropped 2026-11-06) | Only if the site must avoid Vercel. It cannot set HTTP headers and needs a basePath stage on a project page. |
| Vitest jsdom | Vitest Browser Mode (`@vitest/browser-playwright@5.1.0`) | Use it if you want component tests with real layout (for example, asserting FLIP end positions) without full E2E. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| TypeScript 7.x (today) | Breaks the `typescript-eslint` peer range (`<6.1.0`), which `eslint-config-next` pulls in. You get install warnings and possible lint crashes. | `typescript@~6.0.3`; revisit when typescript-eslint supports 7 |
| `next lint`, `.eslintrc`, `eslint` key in next.config | Removed in Next 16 | `eslint .` with `eslint.config.mjs` (flat) |
| Default `next/image` loader | Unsupported with `output: 'export'` (build error) | `images.unoptimized: true` plus pre-sized AVIF/WebP, or static `import img from './x.jpg'` so paths and basePath resolve automatically |
| `headers`, `redirects`, `rewrites`, `proxy`/middleware, Server Actions, route handlers that read `Request` | Not supported by static export | `vercel.json` `headers` (applied at Vercel's edge), with a `<meta>` robots tag as backup |
| Lenis, Locomotive Scroll, fullPage.js | Smooth-scroll and scroll-hijack libraries built for vertical scroll. They fight the "one gesture = one page, inertia ignored" rule and native keyboard behaviour. fullPage.js also needs a commercial license. | Custom `usePager` (wheel accumulator + lock + idle gap) |
| `@use-gesture/react` | No release since March 2024, no pushes since July 2024 | Native Pointer Events: `pointerdown`/`pointerup` delta plus velocity threshold, with `touch-action: pan-y` on the stage |
| `react-swipeable`, Swiper, Embla for page switching | Carousel abstractions that add their own a11y semantics (roles, live regions) and DOM structure that conflict with full-screen sections and `inert` | One transform track you own |
| Framer Motion (`framer-motion` package name) | Renamed to `motion`; the old name is legacy | `motion` if you choose Motion at all |
| `gsap-trial`, Club GreenSock private registry | Deprecated. Every plugin is in the public `gsap` package. | `gsap` from npm |
| Google Fonts `<link>` or any runtime CDN font | Breaks the self-host constraint; adds a third-party connection and FOUT | `next/font` |
| `next/image` on the landing page | +5.7 kB gzip of client JS against ~18 kB of headroom (the empty App Router build is 132.1 kB gzip) | `<img>` with a static import (hashed, immutable URL) |
| WebGL in the initial bundle, or without a fallback | Hurts LCP and TBT; breaks reduced-motion and low-power users | Dynamic `import()` after first paint and in view; poster `<img>`; skip entirely under `prefers-reduced-motion` |

## Stack Patterns by Variant

**If the final font is not on Google Fonts (font is still open):**
- Use `next/font/local({ src: './fonts/X-Variable.woff2', variable: '--font-sans', display: 'swap' })`, subset to Latin (and Latin-Extended for French later).

**If reduced motion is on:**
- CSS: `@media (prefers-reduced-motion: reduce)` sets page track transitions to near-zero opacity crossfades.
- GSAP: `gsap.matchMedia().add('(prefers-reduced-motion: reduce)', ...)` jumps letters straight to the rail (`Flip.from(..., { duration: 0 })`) and shows the judge result as a static 75/75.
- WebGL: not loaded.

**If the WebGL depth effect grows beyond one shader:**
- Move to OGL, still lazy-loaded, still with a poster fallback. three.js only if you need loaders or post-processing.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@16.4.5 | react/react-dom ^18.2 \|\| ^19, node >=20.9, @playwright/test ^1.51.1 (optional peer) | Turbopack default; any custom `webpack` config fails the build unless you pass `--webpack` |
| eslint-config-next@16.4.5 | eslint >=9 (ESLint 10 OK from 16.4.0), typescript >=3.3.1 | Pulls typescript-eslint ^8.56, jsx-a11y ^6.10, react-hooks ^7.1 |
| typescript-eslint@8.72.1 | **typescript >=4.8.4 <6.1.0**, eslint ^8.57 \|\| ^9 \|\| ^10 | The reason to pin TS 6.0.x |
| vitest@5.1.0 | vite ^6.4 \|\| ^7 \|\| ^8, node ^22.12 \|\| ^24 \|\| >=26, @types/node ^22 \|\| >=24 | `@vitest/*` packages must match the exact version (5.1.0) |
| @vitejs/plugin-react@6.2.1 | vite 8 (Rolldown/Oxc) | Only used by Vitest, not by Next |
| @gsap/react@2.1.2 | gsap ^3.12.5, react >=17 | Use `useGSAP({ scope })`, not raw `useEffect` + `gsap.context` |
| motion@14.9.1 (if chosen) | react ^18 \|\| ^19 | Not in the recommended stack |
| next/font + output: 'export' | works | Files are downloaded at build time (CI needs network for `next/font/google`) |

## Sources

- npm registry (`npm view`, 2026-11-06): versions and peerDependencies for next, react, typescript, typescript-eslint, eslint-config-next, gsap, @gsap/react, motion, three, ogl, vitest, vite, @playwright/test, @axe-core/playwright, testing-library, tailwindcss, lenis, @use-gesture/react. HIGH
- https://nextjs.org/docs/app/guides/static-exports (updated 2026-08-09): `output: 'export'`, supported and unsupported features, image loader. HIGH
- https://nextjs.org/docs/app/guides/upgrading/version-16 (updated 2026-10-15): Turbopack default, `next lint` removal, Node 20.9 / TS 5.1 minimums, browser floor, React 19.2 features, `reactCompiler` stable but off by default, scroll-behavior change. HIGH
- https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath: basePath is applied to Link and the router, not to `next/image` `src` strings. HIGH
- GitHub API releases (2026-11-06): checkout v7.0.1, setup-node v7.1.0, pnpm/action-setup v6.1.1. HIGH
- https://vercel.com/docs/project-configuration/vercel-json, /docs/package-managers, /docs/deployment-protection (2026-11-07): headers, Corepack, previews. HIGH
- https://webflow.com/blog/gsap-becomes-free and https://gsap.com/community/standard-license/: GSAP and all plugins free since 2025-04-30. HIGH
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-react-inert-value/ and https://github.com/patternfly/patternfly-react/issues/12295: React 19 boolean `inert`. MEDIUM
- GitHub API repo metadata: oframe/ogl last push 2025-04-13; pmndrs/use-gesture last push 2024-07-15. HIGH (for staleness facts)
- Motion layout bundle-size figures: third-party only (motion.dev changelog did not show v14 notes). LOW

---
*Stack research for: static animation-heavy portfolio (Next.js export on Vercel)*
*Researched: 2026-11-06*
