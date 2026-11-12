---
phase: 03-static-design-system-and-pages
plan: 05
subsystem: frame-and-letter-navigation
tags: [frame, navigation, letters, a11y, server-components]
requires:
  - "03-02 tokens.css + base.css (adv/rail/frame tokens, link colours, focus ring)"
  - "03-03 content/site.ts + lib/sections.ts (sectionBySlug, indexOfSlug, nextLink, counterLabel, headerLabel, letterSections)"
provides:
  - "SkipLink, Header({ current }), Footer({ current }) in components/frame"
  - "LetterNav({ current }) in components/letters (hero on index, rail elsewhere)"
affects:
  - "03-08 Shell assembly (imports all four components)"
  - "Phase 5 FLIP (animates the same five LetterNav anchors)"
tech-stack:
  added: []
  patterns:
    - "Synchronous server components taking current: Slug, rendering from content data only"
    - "data-mode attribute selects hero/rail CSS; same DOM in both modes"
    - "Fixed em-width letter boxes via per-glyph --adv custom property"
key-files:
  created:
    - components/frame/SkipLink.tsx
    - components/frame/Header.tsx
    - components/frame/Footer.tsx
    - components/frame/frame.module.css
    - components/letters/LetterNav.tsx
    - components/letters/letters.module.css
    - tests/frame.test.tsx
    - tests/letters.test.tsx
  modified: []
key-decisions:
  - "Rail letters are ink in every interaction state; only aria-current=page gets the accent (DSGN-01 accent rule 1); the rail focus ring is ink"
  - "Hero and rail captions are visually hidden (clip-path), never display:none, so each link keeps its '0N Section' accessible name"
metrics:
  duration: "~15 min (excluding rate-limit interruption)"
  completed: 2026-11-08
  tasks: 2
  files: 8
---

# Phase 3 Plan 5: Frame and Letter Navigation Summary

These are synchronous server components built from plain anchors, so they work with JS off:
- **Frame:** a skip link, a header (name, section label, Contact nav with the resume and Say hi links) and a footer (0N / 05 counter, next link, static progress bar).
- **YAHYA LetterNav:** a single set of five letter links. It is a fixed-geometry hero wordmark on / and a vertical rail on the other routes. Only the current route's rail letter is accent.

## Tasks

| Task | Name | Commits | Files |
| ---- | ---- | ------- | ----- |
| 1 | SkipLink, Header, Footer, frame.module.css | 44be701 (RED), ef4a18f (GREEN) | components/frame/*, tests/frame.test.tsx |
| 2 | LetterNav hero and rail | 8f054f0 (RED), 3533e32 (GREEN) | components/letters/*, tests/letters.test.tsx |

## What Was Built

- **SkipLink:** `<a href="#content">` with `site.skipLabel`. It sits at opacity 0 with pointer-events off and becomes visible on focus.
- **Header:**
  - `<nav aria-label={site.headerNavLabel}>` holds the resume PDF link and the Say hi link.
  - The Say hi link gets `aria-current="page"` on /say-hi/.
  - The section label comes from `headerLabel(current)` and is hidden at 820px and below.
- **Footer:**
  - The counter comes from `counterLabel(current)` and the link from `nextLink(current)` ("Next, X" or "Back to the start").
  - The progress bar is aria-hidden and positioned by `style="--page-index:N"` with `translateX(calc(var(--page-index) * 100%))`. It has no transition.
- **LetterNav:**
  - It maps `letterSections()` to anchors carrying `data-glyph`, an aria-hidden glyph span and a `t-label` caption (`0N` dim + name). The caption is the accessible name.
  - Rail mode adds an aria-hidden vertical current-name label.
- **letters.module.css:**
  - Letter box width is `var(--adv-y|a|h)` and height is 0.76em.
  - Hero mode: an absolutely positioned row with min(width-fit, height-fit) font size and the YA kern on both Y letters. Hover, focus and active turn the whole caption accent, including the dim number.
  - Rail mode: fixed position, hit area of the rail column minus 8px plus half the gap, and a 44px minimum on coarse pointers.
  - The file has no transition, transform or display:none.

## Verification

- `pnpm test`: 141/141 pass (frame 11 cases, letters 10 cases, css-guard and source-guard green)
- `pnpm lint`, `pnpm typecheck` and `pnpm format:check` are all clean
- Acceptance greps:
  - 3 `var(--adv-` uses
  - 1 kern rule
  - 1 `position: fixed`
  - no transition/transform/fonts-ready/display:none in letters.module.css
  - no next/link or "use client" in either component dir

## Deviations from Plan

None. The plan was executed as written. Prettier rewrote the planned `{" "}` space in LetterNav captions as a plain JSX space, which ESLint accepts, so the rendered text is unchanged.

## Notes

- The run was interrupted by an API rate limit after the Task 1 RED commit and resumed from GREEN. No work was lost.
- The Task 1 RED commit was amended once to drop a Co-Authored-By trailer, per the user's memory rule.

## TDD Gate Compliance

Both tasks have a `test(...)` commit followed by a `feat(...)` commit. RED failed before the implementation (module not found) and GREEN passed.

## Known Stubs

None.

## Self-Check: PASSED

- All 8 created files exist on disk.
- Commits 44be701, ef4a18f, 8f054f0 and 3533e32 are present in `git log`.
