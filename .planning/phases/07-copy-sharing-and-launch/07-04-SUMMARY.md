---
phase: 07-copy-sharing-and-launch
plan: 04
subsystem: seo
tags: [404, not-found, a11y, e2e, server-components]
requires: [07-02]
provides:
  - app/not-found.tsx exported as out/404.html with notFoundMetadata
  - components/not-found (NotFoundPage, NotFoundFooter, NotFoundLetters)
  - e2e/not-found.spec.ts and the 404 route in axe coverage
affects: [07-07 visual baselines, 07-08 sitemap exclusion]
key-files:
  created:
    - app/not-found.tsx
    - components/not-found/NotFoundPage.tsx
    - components/not-found/NotFoundLetters.tsx
    - components/not-found/not-found.module.css
    - tests/not-found.test.tsx
    - e2e/not-found.spec.ts
  modified: [e2e/a11y.spec.ts]
decisions:
  - Plain anchor to "/" with an eslint-disable (no next/link), so the opening script gets a full load and no client code is added
metrics:
  tasks: 2
  completed: 2026-11-12
---

# Phase 07 Plan 04: On-brand 404 Summary

Unknown URLs now get a static, server-rendered 404 (giant "404", one plain line, five letter links with numbered captions, "Back to the start") with no pager chrome, noindex,follow and no canonical.

## Commits
- f2337a4: 404 route, server components, CSS module, unit test
- 18afacb: e2e/not-found.spec.ts and 404 added to a11y ROUTES

## Verification
- Unit, source-guard, css-guard tests pass; typecheck, lint, build pass; `out/404.html` title is "Page not found, Yahya Hallani".
- Playwright (chromium) not-found, a11y, seo specs: 35 passed, run against this worktree's build.
- measure:js: `/404/` row at 135 KB gzip, within the 150 KB budget; exits 0.

## Deviations from Plan
- **[Rule 1 - Bug] Heading name:** the heading rendered as "404Page not found" in jsdom because the leading space sat inside the visually-hidden span. The space is now a text node outside the span; the browser accessible name is "404 Page not found" in both.
- **[Rule 3 - Blocking] Lint:** `@next/next/no-html-link-for-pages` flags the `href="/"` anchor; added a targeted disable with a reason instead of next/link.
- **Global focus ring:** styles/base.css already has a `:focus-visible` ring, so the module adds no duplicate outline (per the plan's conditional).
- **Port:** 4174 was already held by another worker's server (serving a different build), so the specs were run against this worktree's `out/` on port 4191.
- Worktree base was reset to 0595056 as instructed.

## Known Stubs
None.

## Threat Flags
None. The page is fully static, reads no location, adds no "use client" files.

## Self-Check: PASSED
