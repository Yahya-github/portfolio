---
phase: 03-static-design-system-and-pages
plan: 09
subsystem: e2e
tags: [playwright, axe, csp, a11y, layout, font-shift, no-js]
requires:
  - "03-08: Shell, Track and six static routes"
provides:
  - "chromium-nojs Playwright project (routes.spec only)"
  - "routes, focus, layout and font-shift specs on all six routes"
  - "a11y, csp and assets specs looped over all six routes"
affects:
  - "03-10 (adds the visual project next to chromium and chromium-nojs)"
  - "Phase 4 (once JS paging lands, the layout, focus and routes specs must stay green)"
tech-stack:
  added: []
  patterns:
    - "Data-driven specs: loop over `sections` from ../content/site (relative import, no @/ alias)"
    - "JS-off spec uses DOM reads only (locators, getAttribute, textContent)"
key-files:
  created:
    - e2e/routes.spec.ts
    - e2e/focus.spec.ts
    - e2e/layout.spec.ts
    - e2e/font-shift.spec.ts
  modified:
    - playwright.config.ts
    - e2e/a11y.spec.ts
    - e2e/csp.spec.ts
    - e2e/assets.spec.ts
    - components/pages/ProjectsPage.tsx
    - components/pages/projects-page.module.css
    - components/pages/achievements-page.module.css
    - components/pages/experience-page.module.css
decisions:
  - "Phone Display words re-declare letter-spacing: var(--display-track) wherever their parent resets font-size to inherit"
  - "A visually-hidden PageTitle that is a direct grid child is taken out of flow with position: absolute"
metrics:
  duration: "~15 min"
  completed: 2026-11-08
  tasks: 3
  files: 12
---

# Phase 3 Plan 09: E2E proof of the static design system Summary

Every Phase 3 success criterion now has a browser test against the built `out/`, on all six routes. 162 Playwright tests pass across chromium and chromium-nojs. They cover JS-off routing, the skip link and focus rings, axe at two sizes, overflow and desktop fit, accent discipline, the 12-column grid, Poster sizes, no ornament, font-shift geometry, the CSP and first-party requests. Writing the tests turned up two real CSS bugs, both now fixed.

## What was built

- **playwright.config.ts:** a `chromium-nojs` project (`javaScriptEnabled: false`, `testMatch: /routes\.spec\.ts/`).
- **e2e/routes.spec.ts:** each route shows one visible section and one h1, with the right title, canonical, description and noindex robots. All page text is in the DOM, the role line is visible, and all five hero letters and the rail letter navigate. The footer chains through all six routes back to `/`, the header Resume href is checked on every route, and every `target=_blank` link is https with `noopener noreferrer`. The same file passes with JS off.
- **e2e/focus.spec.ts:** the first Tab lands on "Skip to content" at opacity 1, and Enter focuses `main#content`. A walk of up to `MAX_TABS = 60` stops checks each focus stop for a solid outline of at least 2px, with at least 8 stops per route. A focused rail letter has an ink outline.
- **e2e/layout.spec.ts:**
  - No horizontal overflow at 320, 390, 1366 and 1440.
  - Every route fits 1440x900, 1366x768 and 1280x720 without vertical scroll.
  - Accent text at rest is exactly the table from the plan (none on the Index, Y + 75/75 on Achievements).
  - The rail marks one current letter in accent, and the hero has no `aria-current`.
  - Every page grid has 12 px columns.
  - Poster is 636 at 1440x900, 589 at 1366x768 and 164 at 390x844.
  - The Index phone list clears the wordmark.
  - No svg; 2 img in the DOM, visible only on /about/ and /projects/.
  - The portrait `currentSrc` is the 1200 or 1512 file.
- **e2e/font-shift.spec.ts:** the five letter boxes match within 1px between a normal load (instrumentSans confirmed loaded) and a context that aborts `**/*.woff2`, at 1440x900 and at 390x844.
- **a11y.spec.ts:** 12 axe tests (6 routes x 2 viewports), no rules disabled.
- **csp.spec.ts:** `runUnderCsp(page, csp, route: string)`, with the positive test run on all six routes. The negative control stays on `/` and still expects `violations.length > 0`.
- **assets.spec.ts:**
  - The first-party check runs on all six routes.
  - The font, PDF (scoped to `getByRole("banner")`) and noindex checks stay on `/`.
  - `/` fetches no `portrait-` or `facturo-` file.
  - The portrait check moved to `/about/` (Pitfall 7).

## Verification

- `pnpm build && pnpm test:e2e`: 162 passed (chromium + chromium-nojs).
- `pnpm measure:js -- --max-gzip-kb 150`: 132.2 kB gzip.
- `pnpm lint`, `tsc --noEmit`, `pnpm test` (180 unit tests) pass.
- Acceptance greps: `javaScriptEnabled: false`, a single `from "../content/site"` in routes.spec, no `"@/`, `noreferrer`, `MAX_TABS = 60`, 636/589/164, `r.abort()`, no `disableRules`, `goto("/about/"`, `getByRole("banner")`, `route: string`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Phone Display words overflowed at 320px on Achievements and Experience**
- **Found during:** Task 2 (layout.spec overflow at 320x640)
- **Issue:** `.title` and `.head` reset `font-size: inherit` on phones. Their `t-display` `letter-spacing: -0.05em` then resolved against the 16px base to `-0.8px`, and the inner word spans inherited that px value. The real word widths came out 0.4em wider than the `DISPLAY_WORD_EM` measurements. "Achievements" ended at 325.9px and "Involvement" at 328.7px on a 320px viewport.
- **Fix:** `letter-spacing: var(--display-track)` on `.one` (components/pages/achievements-page.module.css) and on `.word` (components/pages/experience-page.module.css), inside the max-width 820px block.
- **Commit:** 959fef8

**2. [Rule 1 - Bug] Projects did not fit any desktop viewport (1541px tall at 1440x900)**
- **Found during:** Task 2 (layout.spec desktop fit)
- **Issue:** The visually-hidden `PageTitle` h1 is a direct child of the `.root` grid (`grid-template-rows: 100%`). Auto-placement gave it the whole 100% row and pushed the lead and rows into a second implicit row.
- **Fix:** added `.title { position: absolute; }` in components/pages/projects-page.module.css and passed `className={styles.title}` to PageTitle in components/pages/ProjectsPage.tsx.
- **Commit:** 959fef8

## Commits

- c5e49aa test(03-09): add chromium-nojs project and routes spec
- 959fef8 fix(03-09): phone display tracking and Projects desktop fit
- 2967446 test(03-09): add focus, layout and font-shift specs
- ab45eb0 test(03-09): run axe, CSP and asset checks on all six routes

## Known Stubs

None.

## Threat Flags

None. These are test-only changes plus two CSS fixes. The register's T-03-27 to T-03-30 are now enforced by csp, assets and routes specs.

## Self-Check: PASSED

- e2e/routes.spec.ts, focus.spec.ts, layout.spec.ts and font-shift.spec.ts exist.
- Commits c5e49aa, 959fef8, 2967446 and ab45eb0 are present in git log.
