---
phase: 08-interactive-proof
plan: 09
subsystem: proof-routes
tags: [atlantis, static-route, game-stage, accent]
requires: [08-02, 08-07]
provides: [content/atlantis.ts, components/proof/*, /projects/atlantis/]
affects: [08-10, 08-13, 08-15]
key-files:
  created:
    - content/atlantis.ts
    - components/proof/ProofRoute.tsx
    - components/proof/ProofLinks.tsx
    - components/proof/GameStage.tsx
    - components/proof/proof.module.css
    - app/projects/atlantis/page.tsx
    - lib/proof/media.ts
    - tests/proof-route.test.tsx
  modified:
    - tests/content.test.ts
    - tests/metadata.test.ts
requirements: [PROOF-01]
metrics:
  completed: 2026-11-13
---

# Phase 8 Plan 09: Atlantis static route Summary

Static `/projects/atlantis/` with shared lean proof layout, game stage markup for every state (poster, control bar, bar, slot, noscript), blue project accent, gallery and team photo, all from typed content.

## Commits
- 0f8f576: Atlantis content, fact guards and metadata tests
- f3e41ba: ProofRoute, ProofLinks, GameStage, CSS module, route page, tests

## Verification
typecheck, lint, 867 tests, `pnpm build` pass. `out/projects/atlantis/index.html` exists, `data-dive="atlantis"` appears twice (main, footer). The only `/games/` string is the `data-game-src` attribute (not a request). Not run: `pnpm measure:js` and Playwright e2e.

## Deviations
- **[Rule 3] Added `lib/proof/media.ts` (`proofMedia`)**: `ProofMediaKey` includes `robot/robot-still-grey` and colour keys not yet in the manifest, so direct `media[key]` failed typecheck. The helper throws if a key is unregistered.
- Team-photo alt is read from `content/achievements.ts` by search, not retyped.
- "Atlantis" has no entry in `DISPLAY_WORD_EM`; the default 4.6 is used (phone title slightly small, never overflowing). Measuring it is deferred.

## Notes for the orchestrator
- `atlantisPlayable()` returns true while clearance is "pending" (only "withheld" disables), so with `embed: true` the route currently renders the Play controls, not the fallback. I followed the existing gate unchanged. If the fallback must show until "cleared", change `lib/proof/gate.ts` (and its test); nothing is pushed until 08-17 and `publishProblems` blocks pending.
- Controls only render when playable; the stage markup/poster/gallery/links always render.
- `credits: []` awaits 08-15.

## Self-Check: PASSED
Files and commits 0f8f576, f3e41ba exist.
