---
phase: 08-interactive-proof
plan: 15
subsystem: proof-gate
tags: [atlantis, clearance, licences, visual-baselines]
requires: [08-07, 08-10, 08-13, 08-14]
provides: [Atlantis cleared, committed build 68a6876b9a1e, credits, Atlantis/Facturo/Projects baselines]
key-files:
  modified:
    - docs/material/proof-clearance.md
    - content/proof-gate.ts
    - content/atlantis.ts
    - components/proof/ProofRoute.tsx
    - app/projects/atlantis/page.tsx
    - tests/proof-route.test.tsx
    - .gitignore
    - e2e/visual.spec.ts
  created:
    - public/games/atlantis/68a6876b9a1e/ (11 files incl. LICENSES.txt)
    - e2e/visual.spec.ts-snapshots/ (7 new, 9 regenerated)
requirements: [PROOF-01]
metrics:
  completed: 2026-11-13
---

# Phase 8 Plan 15: Atlantis gate and baselines Summary

Atlantis recorded as cleared, the versioned Godot export committed as plain files with a LICENSES.txt and visible credits, and the Atlantis, Facturo and Projects visual baselines refreshed in the pinned container.

## Gate outcome
Yahya's answer (2026-11-13): "Cleared by teammates" (teammates gave their OK to host the playable build with credits, no sale, no download). Gate record: `Atlantis: cleared`. Inventory: repo licence, Freepik, Black Ops One, Dialogic, Controller Icons = cleared; Mermaids in Town = excluded (MUSIC=none); spiderman.jpeg = excluded. Robot untouched (pending, 08-16). `content/proof-gate.ts` atlantis = cleared, embed true.

## Commits
- a2e775f: gate record, clearance, credits, committed build (task 2)
- 453d69d: visual spec and baselines (task 3)

## What shipped
- `public/games/atlantis/68a6876b9a1e/` committed (wasm 27488111 B, pck 7948620 B, matching content/generated/atlantis-build.ts). `.gitignore` now ignores only `public/games/atlantis-demo/` (local measuring build) and `public/models/`.
- `LICENSES.txt`: Freepik sources (from the fork's sources.txt), Black Ops One OFL note, Dialogic (authors from its plugin.cfg) and Controller Icons (Ricardo Subtil, copied LICENSE) MIT notices.
- `credits` in content/atlantis.ts: three lines (Freepik, Black Ops One OFL, Dialogic and Controller Icons MIT) rendered in the side column by ProofRoute; a "Credits" internal link to LICENSES.txt added to the links.
- Baselines: atlantis x4 viewports, state-atlantis-loading (50%), state-atlantis-error, state-projects-play-focus; regenerated facturo-deep-dive x4, projects x3, state-mame-focus, state-walkthrough-held.

## Verification
- lint, typecheck clean; `pnpm test` 904/904; `pnpm build` ok.
- `node scripts/measure-js.mjs out --max-gzip-kb 150 --max-chunk-kb 12 --max-model-kb 700`: exit code 0 (max route 146.7 KB gzip).
- Playwright chromium (own server, port 4391): atlantis.spec, atlantis-real.spec (real boot under /games/ CSP), proof-isolation.spec: 19 passed, 1 skipped (not-playable case).
- Container visual run (VISUAL=1, no update), twice in a row: `45 passed (41.7s)` and `45 passed (40.5s)`.
- Reviewed PNGs: Atlantis blue, Facturo yellow rules and Back link, Projects Play ring green.

## Deviations from Plan
- **[Rule 1 - Bug] Stale Facturo/Projects baselines.** The existing baselines passed against the new accent because `maxDiffPixelRatio` 0.002 allows about 7300 px on a full-page shot and the yellow is about 4000 px. I deleted and regenerated those baselines (plus the two Projects state shots) instead of relying on a diff.
- **[Rule 3] Test adjusted.** tests/proof-route.test.tsx forbade any `/games/` href; it now skips the Credits link (a user navigation, not a request). e2e proof-isolation still passes.
- **[Rule 2]** Credits rendering added to ProofRoute (plan said "if 08-09 did not already"); only passed when the route is playable.
- Container run used host node_modules directly (pnpm installed in the image); host `pnpm install --frozen-lockfile` re-run afterwards.
- Dialogic's MIT text has no per-year copyright line (the addon ships no LICENSE; holders named from plugin.cfg). Yahya's teammates' OK is recorded as given, no written message was seen by me.

## Known Stubs
None.

## Self-Check: PASSED
Commits a2e775f and 453d69d exist; LICENSES.txt, play.wasm and baselines tracked.
