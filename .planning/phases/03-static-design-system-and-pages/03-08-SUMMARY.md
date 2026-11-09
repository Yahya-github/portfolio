---
phase: 03-static-design-system-and-pages
plan: 08
subsystem: shell-and-routes
tags: [next-static-export, inert, routing, metadata, a11y]
requires:
  - "03-03: sections, rootMetadata, pageMetadata"
  - "03-05: SkipLink, Header, Footer, LetterNav"
  - "03-06 / 03-07: six *Page components taking PageProps"
provides:
  - "Shell({ current }) server component in the binding DOM order"
  - "Track({ current }): <main id=content> with six sections, five inert"
  - "Six static routes with per-route title, description and trailing-slash canonical"
affects:
  - "03-09 (e2e: assets.spec must move to /about/, csp.spec extended to six routes)"
  - "03-10 (Vercel 308 trailing-slash check on a preview)"
  - "Phase 4 (overrides .page[inert] { display: none } under html[data-js])"
tech-stack:
  added: []
  patterns:
    - "Each app/<route>/page.tsx supplies `current`, because layouts cannot read the pathname"
    - "PAGE_COMPONENTS record keyed by Slug, mapped over `sections` for order"
    - "React 19 boolean inert -> inert=\"\" in the static HTML"
key-files:
  created:
    - components/shell/Shell.tsx
    - components/shell/Track.tsx
    - components/shell/shell.module.css
    - tests/shell.test.tsx
    - app/achievements/page.tsx
    - app/projects/page.tsx
    - app/experience/page.tsx
    - app/about/page.tsx
    - app/say-hi/page.tsx
  modified:
    - app/page.tsx
    - app/layout.tsx
    - next.config.ts
    - tests/source-guard.test.ts
  deleted:
    - lib/build-info.ts
    - tests/build-info.test.ts
    - app/globals.css
decisions:
  - "Explicit route folders, not a catch-all; each page.tsx is three lines plus metadata"
  - "Inactive pages are hidden with .page[inert] { display: none }, not the hidden attribute, so Phase 4 can override a single CSS rule"
  - "At <=820px pages use document flow (overflow-y: visible), so axe finds no scrollable region that cannot take focus"
metrics:
  duration: "~6 min"
  completed: 2026-11-08
  tasks: 2
  files: 17
---

# Phase 3 Plan 08: Shell, Track and Six Static Routes Summary

All six routes are now server-rendered. Each one holds every page as a `<section>`: its own page is live as the only h1, and the other five are `inert` and hidden by CSS. Each route has its own title, description and trailing-slash canonical. JS stays at the 132.2 kB gzip baseline.

## What was built

- **`components/shell/Track.tsx`** renders `<main id="content" tabIndex={-1} data-current={slug}>` with one section per slug, in `sections` order. Each section has `id=page-{slug}`, `data-page` and `aria-labelledby=title-{slug}`, and is `inert={!isCurrent}`. The current page gets `headingLevel={1}` and the others get 2.
- **`components/shell/Shell.tsx`** renders SkipLink, Header, LetterNav, Track and Footer as a fragment, so all five are direct children of body.
- **`components/shell/shell.module.css`** sets each page box to 100svh and lets it scroll inside itself on desktop. Non-index pages get padding for the rail. `.page[inert] { display: none }`. At <=820px pages switch to document flow.
- **Routes:** `app/page.tsx` plus five folders, each `export const metadata = pageMetadata(slug)` and `<Shell current=slug />`.
- **Layout** imports `@/styles/tokens.css` then `@/styles/base.css` and exports `rootMetadata`, so robots stays noindex/nofollow.
- **`next.config.ts`** sets `trailingSlash: true`, so the export writes `{route}/index.html`.

## Verification (build output)

| File | sections | inert | h1 | canonical | title |
|------|----------|-------|----|-----------|-------|
| out/index.html | 6 | 5 | 1 | https://yahya-hallani.dev/ | Yahya Hallani |
| out/achievements/index.html | 6 | 5 | 1 | .../achievements/ | Achievements, Yahya Hallani |
| out/projects/index.html | 6 | 5 | 1 | .../projects/ | Projects, Yahya Hallani |
| out/experience/index.html | 6 | 5 | 1 | .../experience/ | Experience, Yahya Hallani |
| out/about/index.html | 6 | 5 | 1 | .../about/ | About, Yahya Hallani |
| out/say-hi/index.html | 6 | 5 | 1 | .../say-hi/ | Say hi, Yahya Hallani |

- Every route includes `content="noindex, nofollow"`.
- `pnpm lint`, `format:check`, `typecheck` and `test` pass (17 files, 180 tests).
- `pnpm measure:js -- --max-gzip-kb 150` exits 0 at 132.2 kB gzip. A control run at 100 kB exits 1, so the gate is live.
- Nothing in app or components uses `use client`. Grep finds no reference to `build-info`, `shortSha` or `globals.css`.

## Deviations from Plan

**1. [Not applicable] eslint.config.mjs `ignores: ["app/page.tsx"]` removal skipped**
- **Found during:** Task 2, step 6
- **Issue:** The plan says to delete the plan 03-04 `ignores` entry on the jsx-no-literals config object. That entry was never added: 03-04-SUMMARY records that the user's config-protection hook blocked the edit to eslint.config.mjs. There was nothing to remove, so eslint.config.mjs is untouched.
- **Follow-up:** The `react/jsx-no-literals` rule (the lint half of CONT-09) still needs the user's approval to add. Now that the placeholder is gone, it can be added without any `ignores` entry. Until then, the source-guard test is the only check against literal strings.

**2. Expected e2e break (documented in the plan, no action taken):** `e2e/assets.spec.ts` asserts the portrait on `/`. The portrait now sits in the hidden About section, so that assertion fails until plan 03-09 moves it to `/about/`. I did not run or edit any e2e files in this plan.

## TDD Gate Compliance

- RED: `7a6aaca test(03-08): add failing Shell and Track test` failed because the module did not exist yet.
- GREEN: `56737eb feat(03-08): add Shell and Track with inert non-current pages`. Shell tests pass.
- No refactor was needed.

## Commits

- 7a6aaca test(03-08): add failing Shell and Track test
- 56737eb feat(03-08): add Shell and Track with inert non-current pages
- e165ce2 feat(03-08): wire six static routes through the Shell (also deletes build-info.ts, build-info.test.ts and globals.css on purpose)

## Known Stubs

None.

## Self-Check: PASSED

- All created files exist: components/shell/{Shell.tsx,Track.tsx,shell.module.css}, tests/shell.test.tsx and the five route page.tsx files.
- Commits 7a6aaca, 56737eb and e165ce2 are present in git log.
