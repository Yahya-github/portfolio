---
phase: 04-horizontal-pager-and-input
plan: 02
subsystem: shell-layout
tags: [track, css, data-js, touch-action, e2e]
requires: []
provides:
  - "html[data-js] flag set by an inline head script before first paint (lib/js-flag.ts)"
  - "JS-on horizontal track: six 100vw pages in one flex row, positioned by --track-index"
  - "--ease-retarget and --page-count tokens"
  - "root overflow-x clip, overscroll-behavior-x none, touch-action pan-y pinch-zoom (phones/coarse)"
  - "title focus-ring rules (keyboard-only; never on visually hidden titles)"
affects: [04-03, 04-07, 04-08, 04-12, 04-14]
tech-stack:
  added: []
  patterns:
    - "Server-rendered inline custom property (--track-index) for first paint"
    - ":global(html[data-js]) scoping in CSS Modules for JS-on layout"
key-files:
  created:
    - lib/js-flag.ts
  modified:
    - app/layout.tsx
    - components/shell/Track.tsx
    - components/shell/shell.module.css
    - styles/base.css
    - styles/tokens.css
    - e2e/routes.spec.ts
    - e2e/layout.spec.ts
decisions:
  - "touch-action: pan-y pinch-zoom sits on html (phones and coarse pointers), not on the track, so pinch-zoom stays and swipes starting on header/footer/rail can page"
  - "The e2e overflow scan leaves out main#content itself (it is six viewports wide by design); the document scrollWidth assertion still guards real overflow"
metrics:
  duration: "~10 min"
  completed: 2026-11-09
  tasks: 2
  files: 8
---

# Phase 4 Plan 02: JS-on track layout at rest Summary

With JS on, an inline head script sets `html[data-js]` before first paint. All six pages then sit in one horizontal flex track that the server-rendered `--track-index` positions with `translate3d`. A deep link paints its page at x=0, with no slide and no flash of Index. With JS off, the Phase 3 single-page behaviour is unchanged.

## Tasks

| Task | Name | Commit |
| ---- | ---- | ------ |
| 1 | data-js flag, track layout, root rules and tokens | dcfc24c |
| 2 | Update Phase 3 e2e specs for the rendered track | 17172b0 |

## Verification

- `pnpm vitest run tests/css-guard.test.ts tests/shell.test.tsx`: 17/17 pass
- `pnpm typecheck` and `pnpm lint`: clean; Prettier check clean
- `pnpm build`: OK. `pnpm measure:js -- --max-gzip-kb 150`: 132.2 kB gzip
- `pnpm test`: 180/180 pass
- `pnpm test:e2e` (chromium and chromium-nojs): 168/168 pass. The run used `BASE_URL=http://localhost:4219` against this worktree's own `out/` to avoid `reuseExistingServer` picking up a parallel agent's server on 4173.
- `e2e/a11y.spec.ts` passed unchanged; the optional axe exclusion for inert sections was not needed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The overflow scan flagged the track container**
- **Found during:** Task 2
- **Issue:** The `[inert]` exclusion did not cover `main#content` itself. The track is `6 * 100vw` wide, so its rect extends past `innerWidth` on every route except Say hi (20 failures).
- **Fix:** The offender scan now also leaves out `main#content`. The `scrollWidth <= clientWidth` assertion already proves there is no document overflow.
- **Files modified:** e2e/layout.spec.ts
- **Commit:** 17172b0

### Process notes

- Commits were made without `--no-verify`, because a project PreToolUse hook blocks that flag. The git hooks ran and passed.
- The worktree base was 7861a39 instead of e6d9480. It was reset to e6d9480 as the worktree_branch_check instructed.

## Known Stubs

None. `.track[data-phase="sliding"]` is a CSS hook that the pager (a later plan) sets. It is intentional.

## Self-Check: PASSED

- lib/js-flag.ts exists; commits dcfc24c and 17172b0 are in the git log.
