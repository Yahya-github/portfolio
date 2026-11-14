---
phase: 07-copy-sharing-and-launch
plan: 08
subsystem: launch
tags: [seo, robots, sitemap, indexing, vercel, lighthouse]
requires: [07-07]
provides:
  - noindex removed from vercel.json and root metadata
  - /robots.txt and /sitemap.xml (seven URLs)
  - Lighthouse SEO 1 and is-crawlable asserted on page routes
affects: []
requirements: [SEO-01, SEO-02]
key-files:
  created:
    - app/robots.ts
    - app/sitemap.ts
    - tests/robots-sitemap.test.ts
  modified:
    - vercel.json
    - lib/metadata.ts
    - lighthouserc.json
    - tests/vercel-config.test.ts
    - tests/metadata.test.ts
    - tests/lighthouserc.test.ts
    - e2e/seo.spec.ts
    - e2e/assets.spec.ts
    - e2e/deep-dive.spec.ts
    - e2e/routes.spec.ts
decisions:
  - "Launch shipped as PR #7 on branch phase-07-launch (plan said `launch`); Yahya merged it himself (D-10)"
metrics:
  completed: 2026-11-12
---

# Phase 7 Plan 08: Launch Summary

The X-Robots-Tag header and the root robots noindex meta are gone, force-static robots.txt and sitemap.xml are served, and Yahya merged the launch PR himself; production now serves the indexable site.

## Tasks and commits

| Task | Commit | Result |
|------|--------|--------|
| 1 launch code | 93d15c8 | vercel.json X-Robots-Tag removed (other headers kept), rootMetadata robots removed, app/robots.ts, app/sitemap.ts (no lastModified), unit tests flipped/added |
| 2 e2e + Lighthouse | d85c09a | page routes assert `is-crawlable` error and `categories:seo` 1; e2e flipped to no robots meta; new robots/sitemap/404 e2e |
| 3 merge | merge c793828 | PR #7 merged by Yahya-github at 2026-11-13T00:31:56Z |

## Local gate (before the PR)

lint, format:check, typecheck, 726 unit tests, build, measure:js (150/12 KB) green; Playwright (chromium, nojs, touch, phone) 477 passed, 1 skipped on fresh out/ at port 4178; LHCI green. Lighthouse SEO = 1 in all 3 runs on each of the seven page routes. The 404 scored 0.45 and keeps per-audit assertions only (is-crawlable off), as planned.

## PR checks

lint, typecheck, unit, e2e, lighthouse all passed (plus Vercel preview and Sourcery).

## Live verification (production, after the merge deploy)

- `/robots.txt`: "User-Agent: *", "Allow: /", "Sitemap: https://yahya-hallani.dev/sitemap.xml"
- `/sitemap.xml`: 7 `<loc>` entries: `/`, `/achievements/`, `/projects/`, `/experience/`, `/about/`, `/say-hi/`, `/projects/facturo/` (absolute, trailing slash)
- All seven routes: HTTP 200, no x-robots-tag header, no robots meta, one canonical, og:image present
- 404 (`/this-page-does-not-exist/`): HTTP 404, robots meta `noindex` and `noindex, follow`, no x-robots-tag header
- Security headers still present on `/`: CSP, HSTS, X-Content-Type-Options nosniff, X-Frame-Options DENY

## Deviations from Plan

- Branch named `phase-07-launch` instead of `launch`; local `main` was not committed to.
- Process note: an early `pkill` I used to stop the port-4178 `serve` killed my own shell; no repo effect.

## Remaining (optional, non-blocking, D-12)

07-HUMAN-UAT.md items: LinkedIn Post Inspector, five-second test, screen reader, Search Console.

## Self-Check: PASSED

Commits 93d15c8, d85c09a and merge c793828 exist; created files exist; live results above were observed by curl.
