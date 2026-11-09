---
phase: 03-static-design-system-and-pages
plan: 02
subsystem: design-system
tags: [css, tokens, a11y, contrast, fonts, vitest]
requires: []
provides:
  - styles/tokens.css (all 03-UI-SPEC tokens as :root custom properties)
  - styles/base.css (reset, base type, links, focus, global utility classes)
  - WCAG contrast unit gate (tests/contrast.test.ts)
  - CSS guard unit gate (tests/css-guard.test.ts)
affects:
  - plans 03-05 to 03-08 (style only through these tokens and the global class contract)
  - plan 03-08 (imports tokens.css + base.css in the layout, deletes app/globals.css)
tech-stack:
  added: []
  patterns:
    - "Design tokens as CSS custom properties in one file; raw hex allowed nowhere else"
    - "Longhand font properties only (font shorthand resets font-stretch)"
    - "Global utility class contract: grid, visually-hidden, t-label, t-body, t-heading, t-display, c-dim, c-accent, tnum, ulink, measure"
key-files:
  created:
    - styles/tokens.css
    - styles/base.css
    - tests/contrast.test.ts
    - tests/css-guard.test.ts
  modified:
    - app/fonts.ts
key-decisions:
  - "--font-sans is not defined in tokens.css; next/font owns it on <html>"
  - "Font display is block (not swap), so no fallback face paints the Poster at the wrong width"
  - "CSS guard strips comments before matching and treats missing dirs as empty"
requirements-completed: [DSGN-01, DSGN-02, A11Y-03]
metrics:
  duration: ~10min
  completed: 2026-11-08
  tasks: 2
  files: 5
---

# Phase 3 Plan 02: Design Tokens, Base Styles and CSS Gates Summary

This plan adds `styles/tokens.css`, which holds every 03-UI-SPEC token (46 top-level custom properties plus overrides for phone, short viewports, coarse pointers and reduced motion). It also adds `styles/base.css` with the global primitives and the class-name contract, and switches the font to `display: "block"`. Two Vitest gates now enforce WCAG AA text contrast (A11Y-03) and a single source of colour and font family (DSGN-01/02).

## Tasks

| # | Task | Commits |
|---|------|---------|
| 1 | tokens.css and the contrast gate (TDD) | da9b7ee (RED test), 966a62f (GREEN tokens) |
| 2 | base.css, font display block, CSS guard (TDD) | 3a28c6a (guard test), cfc942f (base.css + fonts.ts) |

## Verification

- `pnpm test`: 4 files, 21 tests pass. `pnpm lint`, `pnpm typecheck` and `pnpm format:check` are green.
- Contrast RED: 6 of 8 tests failed with ENOENT before tokens.css existed. GREEN: all 8 pass, covering 3 AA checks, 3 grey-floor checks, the 21:1 sanity case and the missing-token throw.
- Mutation check: setting `--color-dim` to `#777777` failed 2 tests ("dim meets WCAG AA" and "dim, if grey, is not darker than #8a8a8a"). I then reverted it to `#8e8e8e`.
- CSS guard mutation check: a scratch `components/tmp.module.css` containing `color: #fff`, `font-family: Arial`, a `font:` shorthand and a hex value inside a comment failed all 3 guard tests. Only `#fff` was reported, so the comment was ignored. I deleted the scratch file and the empty `components/` dir.
- Acceptance greps: `"swap"` has 0 matches in fonts.ts. base.css has no hex, no `font:` shorthand and no `height: 100%; overflow: hidden`. `main:focus` has `outline: none`. All 11 utility rule starts are present.

## TDD Gate Compliance

- Task 1: RED commit `test(03-02)` da9b7ee, followed by GREEN commit `feat(03-02)` 966a62f.
- Task 2: the CSS guard is a regression gate. Against the current tree it passed straight away, because `app/globals.css` already uses only `var(--font-sans)` and has no hex. To show it can fail, I used the scratch-file check above in place of a failing RED run. The `test(03-02)` commit 3a28c6a comes before the `feat(03-02)` commit cfc942f.

## Deviations from Plan

- **[Process] Commits made without `--no-verify`.** The orchestrator asked for `--no-verify`, but a local PreToolUse hook (everything-claude-code) blocks that flag. I committed normally instead, the repo's git hooks ran, and every commit succeeded.
- **[Rule 2 - Test completeness] Missing-token throw is tested.** The plan's behavior list included it, so `token()` takes an optional source string, and one extra test asserts the "token --color-NAME missing" error.

Otherwise the plan was executed as written.

## Known Stubs

None. As planned, the layout does not import tokens.css or base.css yet; plan 03-08 wires them in.

## Self-Check: PASSED

- FOUND: styles/tokens.css, styles/base.css, tests/contrast.test.ts, tests/css-guard.test.ts, app/fonts.ts
- FOUND commits: da9b7ee, 966a62f, 3a28c6a, cfc942f
