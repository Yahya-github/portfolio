# Project Research Summary

**Project:** Yahya Hallani Portfolio (yahya-hallani.dev)
**Domain:** Static, animation-heavy personal developer portfolio (dark Swiss, six horizontal full-screen pages, name-as-navigation)
**Researched:** 2026-11-06
**Confidence:** MEDIUM-HIGH

Detail lives in `STACK.md`, `FEATURES.md`, `ARCHITECTURE.md` and `PITFALLS.md` in this folder. This file synthesizes them and flags where they disagree. (Synthesized by the research synthesizer; written to disk by the orchestrator.)

## Executive Summary

A small static site whose risk is almost entirely in the interaction model, not the stack. Recommended build: Next.js 16 App Router static export on GitHub Pages; all six pages rendered as Server Components into the HTML; one persistent client shell owning a single pager reducer; a transform-based horizontal track. CSS Modules plus `tokens.css` and a 12-column grid. Hand-written pure gesture state machines (no smooth-scroll, carousel or gesture library). WebGL, if it ships, is a lazy progressive enhancement over a static image. All four researchers agree on this skeleton.

Product insight (FEATURES + PITFALLS): the signature design must sit on content a recruiter reads in about five seconds and can link to. First screen needs a role line and a proof line beside the giant YAHYA, a resume PDF, visible contact, a visible Next/pager, per-page links, and 75/75 readable without waiting. Rail letters need visible labels (numbered captions; names on hover/focus).

Main risks: (1) trackpad inertia and cross-device wheel handling, tunable only on hardware; (2) taking over scrolling breaks accessibility, zoom, short screens and deep links unless `inert`, focus hand-off, inner scroll and URL state live in the pager controller from day one; (3) iOS Safari touch behaviour (edge-back swipe, address bar, rubber-band) where the left rail sits; (4) fitted giant type shifting on font load; (5) GitHub Pages `basePath`/domain mistakes. Mitigation: pager controller and input model first, on real devices, with placeholder pages.

## Decisions needed from Yahya

Recommendations are defaults unless Yahya overrules. Decisions 1, 2, 5, 6 before Phase 2; 3 and 4 proceed on recommendations.

### 1. URL model and Back button
- A. Six real exported routes (`/projects/`) + persistent shell + `pushState` (ARCHITECTURE): Back steps through pages (rapid changes within ~400 ms coalesce via `replaceState`); no flash; per-page title/OG; each HTML contains all six pages (choose canonical policy).
- B. One route, hash URLs (STACK leans, defers to ARCHITECTURE): zero routing config; needs a pre-paint script; same metadata everywhere.
- C. Hash URLs + `replaceState` always (PITFALLS): Back leaves the site; conflicts with FEATURES table stakes.
**Recommendation: A.** The Back policy is a one-line switch, easy to revisit on a phone.

### 2. Letter FLIP animation
- A. GSAP 3.15 + Flip + `@gsap/react` (STACK): handles interruption/resize; fast to re-time; free since 2025-04-30; adds unmeasured weight.
- B. Native WAAPI `el.animate()` FLIP, rAF for the judge (ARCHITECTURE, PITFALLS): 0 kB; interruptible; resting layouts in CSS; ~60 LOC to own.
**Recommendation: B**, isolated in `features/letter-nav/flip.ts`; swap to GSAP if Phase 6 interruption/resize bugs cost over a day.

### 3. Left rail vs iOS left-edge back swipe
Rail stays left (his choice). Mitigations: inset letters 24-32 px on phones; ignore our own swipe starts within ~20 px of the left edge; with 1A an edge swipe steps back one page; test on a real iPhone (Safari + LinkedIn in-app) in Phase 5; only if that fails, a phone-only bottom rail with his explicit approval.

### 4. Inner scroll vs fit one screen
**Both:** design every page to fit 1366x768 and 1440x900; build inner-scroll containers and boundary-aware paging from the start for zoom/reflow (WCAG 1.4.4, 1.4.10) and landscape phones. Fit hero type to `min(width, height)`.

### 5. Resume PDF
**Add it:** "Resume (PDF)" on Say hi plus one always-reachable spot; self-hosted; public, so omit home address/phone if desired.

### 6. Domain yahya-hallani.dev bought before first deploy
- A. Buy first, no `basePath` stage; `.dev` HTTPS wait (up to 24 h) happens in Phase 2.
- B. Deploy at `<user>.github.io/portfolio` first; every raw asset URL needs `withBase()`; second cutover later.
**Recommendation: A.** Verify domain in GitHub before DNS; set it in repo Settings > Pages; keep `basePath: process.env.PAGES_BASE_PATH`.

## Key Findings

### Stack (STACK.md)
Next.js 16.4.5, React 19.3.1, TypeScript ~6.0.3 (not 7.x: typescript-eslint peers `<6.1.0`), Node 22, pnpm 12, ESLint 10 flat config (no `next lint`), Prettier, Stylelint. `output: 'export'`, `trailingSlash: true`, `images.unoptimized`, official Actions Pages workflow. CSS Modules + `tokens.css`, 12-col grid with `subgrid`, no Tailwind. `next/font` self-hosted. Hand-written `usePager`; avoid Lenis, fullPage.js, Swiper, `@use-gesture`. Vitest 5, Playwright on built `out/` (320/768/1024/1440, reduced motion, WebKit), axe, Lighthouse CI. WebGL later: raw WebGL2, lazy, poster; no three.js.

### Features (FEATURES.md)
Table stakes: first-screen name/role/proof with no intro; resume; contact everywhere; project evidence with links; per-page URLs + Back; static HTML text; SEO (title, description, canonical, `Person` JSON-LD), OG card, favicon, 404, HTTPS; keyboard, focus, skip link, inert pages, live region, reduced motion; phones; fast; 00 / 05 pager, Next, progress bar, first-visit hint.
Differentiators: letters-to-rail nav with labels; 75/75 judge (short, final state immediate); typographic restraint; one depth-map placement (v1.x); 1-2 project deep dives later.
Defer: French, more deep dives, writing, analytics, build notes.
Anti-features: intro/loader, scrolljacked text, inertia skipping pages, contact form, skill bars/logo walls, custom cursor, sound, WebGL everywhere, theme toggle, invented metrics.

### Architecture (ARCHITECTURE.md)
Single pager reducer (`index`, `from`, `source`, `phase`) in one persistent shell; inputs emit intents only; URL, transform, `inert`, focus, letter mode, pager and islands are projections. Server Components render all six pages in every HTML. Letter layouts in CSS, FLIP in flight only. Refs for per-frame work. Components: `content/sections.ts` + typed `content/*.ts`; `PagerProvider`/`pagerReducer`; `InputLayer` (wheel, swipe, keymap; pure, trace-tested); `Track`; `LetterNav` (real `<a href>`, `data-mode`); `FooterPager`; `JudgeDots`; `DepthMap`.

### Pitfalls (PITFALLS.md)
1. Trackpad momentum: classify gestures; page on first event past threshold; swallow until ~150 ms quiet; rising delta = new gesture; recorded-trace tests; tune on Mac trackpad, Magic Mouse, Windows wheel, Linux touchpad.
2. Passive `onWheel`: native `{ passive: false }` listeners; `overscroll-behavior: none`.
3. Offscreen a11y: `inert`, nav never inert, focus with `preventScroll`, `overflow: clip`, live region, no focus theft on wheel/swipe.
4. Clipped content at zoom/short screens: inner scroll (Decision 4).
5. Font-load shift on fitted type: CSS-only fit `calc(100cqi / K)`, preload display weight, `document.fonts.ready` before first FLIP; never animate `font-size`.
6. Recruiter bounce: role + proof, resume, contact, Next; 5-second test.
7. Deploy: `basePath`, unoptimized images, CNAME ignored under Actions, domain verification, `.dev` HSTS, `window` during prerender.
Also: `svh` not `dvh`; `touch-action: pan-y`; WebGL context loss; grey text ≥ #8a8a8a on #000; current section not by colour alone.

## Implications for Roadmap

1. **Design gate and decisions** — approve updated design doc; v6 sketch into `docs/reference/`; record Decisions 1-6; domain; resume PDF; font candidates on "YAHYA".
2. **Scaffold and deploy spike** — Next 16, strict TS, export, Actions deploy, live hello page with image, font, PDF, 404; baseline JS measured; CI with lint, unit, Playwright.
3. **Design system and static shell** — tokens, grid, YAHYA fit token, content schema + registry, six routes + metadata, server-rendered pages, `inert`, letters as links in both modes, hero role/proof, contrast tests; no-JS works.
4. **Pager core** — reducer, track, URL sync + `popstate`, title, focus hand-off, live region, `overflow: clip`, letter-click + Next.
5. **Input model on real hardware** — keymap, wheel FSM with traces, swipe with edge exclusion, inner-scroll edge rules, device tuning incl. iPhone/Android.
6. **Letter navigation and footer pager (signature)** — hero-to-rail FLIP, captions, names on hover/focus, `aria-current` + non-colour cue, 00 / 05, progress bar, first-visit hint, iOS inset.
7. **Page content and set pieces** — all six pages with JudgeDots and resume; 1366x768 and 200% zoom checks.
8. **Copy** — final verified copy in data files.
9. **Hardening and launch** — reduced motion, phones, VoiceOver/NVDA, axe, Lighthouse budgets, OG validation, 5-second test.
10. **Depth map (optional, post-launch OK)** — static depth image, then lazy WebGL island.

Research flags: Phase 5 (hardware, iOS swipe), Phase 6 (FLIP interruption spike), Phase 10 (depth-map production, shader, placement). Standard: 2, 3, 4, 7, 8, 9.

## Confidence

| Area | Confidence | Notes |
|---|---|---|
| Stack | HIGH | npm-verified; MEDIUM on animation/WebGL choices |
| Features | MEDIUM | NN/g + Awwwards HIGH; recruiter advice mostly opinion |
| Architecture | MEDIUM-HIGH | Next routing/export HIGH; Safari history swipe LOW |
| Pitfalls | MEDIUM-HIGH | needs device testing |

## Gaps
- Baseline App Router JS unmeasured; measure in Phase 2 before deciding GSAP.
- Canonical policy for six routes sharing all content.
- No-JS fallback form: track at route index vs stacked document; decide in Phase 3.
- iOS/Safari gesture specifics: device test in Phase 5.
- Final font (Inter Tight "revisit").
- Judge: final state in HTML, animation as replay.
- Collect early: repo URLs, demos, outcomes, robot photo/clip, resume PDF, GitHub username, OG image.
- PROJECT.md Active additions: hero role + proof; resume; contact everywhere; first-visit hint + Next; per-page URLs + Back; SEO/JSON-LD/OG/favicon/404; skip link + live region; contrast tokens.

---
*Research completed: 2026-11-06. Ready for roadmap after Yahya answers Decisions 1, 2, 5 and 6.*
