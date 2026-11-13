---
phase: 08-interactive-proof
plan: 13
subsystem: routing-seo-e2e
tags: [projects, sitemap, robots, e2e, a11y, isolation]
requires: ["08-10", "08-12"]
provides:
  - Projects row links to /projects/atlantis/ and /projects/robot/
  - Nine-URL sitemap, robots disallow /games/
  - Nine-route e2e lists and the proof-isolation request audit
affects: [content/projects.ts, app/sitemap.ts, app/robots.ts, components/proof/proof.module.css, e2e]
key-files:
  created: [e2e/proof-isolation.spec.ts]
  modified:
    - content/types.ts
    - content/projects.ts
    - components/pages/ProjectsPage.tsx
    - components/pages/projects-page.module.css
    - tests/pages-projects.test.tsx
    - app/sitemap.ts
    - app/robots.ts
    - tests/robots-sitemap.test.ts
    - components/proof/proof.module.css
    - e2e/a11y.spec.ts
    - e2e/seo.spec.ts
    - e2e/routes.spec.ts
    - e2e/csp.spec.ts
metrics:
  tasks: 3
  completed: 2026-11-13
---

# Phase 8 Plan 13: Connect the proof routes Summary

Projects rows 02.3 and 02.5 now link same-tab to the Atlantis ("Play") and Robot ("3D model") routes beside their external links, the sitemap lists nine URLs, robots disallows /games/, and every site-wide e2e list plus a new request audit cover both routes.

## Commits

- 1d0aa07 feat: Projects row links (`dive` made required, `diveCursorTag` added, links grouped in a wrapping span)
- cd0ff19 feat: sitemap nine URLs, robots `disallow: "/games/"`
- ba73646 fix: reset UA button chrome on proof controls
- 53c1a3c test: route lists extended, `e2e/proof-isolation.spec.ts` added

## Deviations from Plan

**1. [Rule 1 - Bug] Proof control buttons had default browser button chrome**
- **Found during:** Task 3 (axe on /projects/atlantis/)
- **Issue:** "Play Atlantis" rendered on the UA grey fill (#efefef), contrast 2.18:1 against the accent. No button reset existed in proof.module.css.
- **Fix:** zero-specificity `:where(.controls button, .modelControls button)` reset (longhands, because css-guard forbids the `font` shorthand and non-`var(--font-sans)` families).
- **Files:** components/proof/proof.module.css. **Commit:** ba73646

**2. [Adjustment] Isolation audit scope**
The robot route legitimately fetches its own `/models/robot/` mesh, so the audit forbids `/games/` everywhere (Atlantis before Play) and `/models/` on every route except robot, rather than both on all nine. Proof chunk names are computed as scripts loaded on a proof route that no non-proof route loads, then asserted absent from the other seven routes.

**3.** The JS-off tests for the two new routes were added to routes.spec.ts and skip outside the chromium-nojs project.

## Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (885 passed), `pnpm build`: pass
- `node scripts/measure-js.mjs out --max-gzip-kb 150 --max-chunk-kb 12 --max-model-kb 700`: exit 0
- Playwright chromium (a11y, seo, csp, proof-isolation, routes, projects, layout, layouts-distinct, atlantis, robot, deep-dive): 233 passed, 4 skipped; chromium-nojs routes.spec: 32 passed; chromium-phone phone, atlantis-touch, robot-touch plus cursor: 44 passed
- Skips in the chromium run are gate-state cases (atlantis "not playable" and robot "gate off" variants, plus the JS-off-only tests outside chromium-nojs). proof-isolation runs all 4 tests (the Play step is guarded by `atlantisPlayable`, the live step by `robotViewerOn`; the first version used `test.skip` under serial mode and silently skipped the chunk checks, fixed before commit). The robot live state ran with the placeholder mesh.
- stylelint is not installed in the worktree (`stylelint` command not found), so CSS was checked by prettier and the css-guard unit test only.

## Known Stubs

None added.

## Self-Check: PASSED
