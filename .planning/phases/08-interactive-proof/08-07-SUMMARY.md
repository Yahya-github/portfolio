---
phase: 08-interactive-proof
plan: 07
status: partial (awaiting Task 3 decision)
requirements: [PROOF-01]
---

# Phase 8 Plan 07: Real boot proof, frames, timing Summary

Status: Tasks 1 and 2 done and committed. Task 3 (embed / custom-template / fallback) awaits Yahya; `content/proof-gate.ts` still has `embed: false`.

## Commits
- 1550c3b: real-boot e2e, capture script, 3 colour + 3 grey PNGs
- ba84149: Atlantis WebP media jobs (12 files, 632 KB total, all under 150 kB), manifest regenerated

## Measurements (25 Mbps down / 5 up / 20 ms RTT, Chromium 1280x720, served by `serve`)
- Cold play-to-title: 17,859 ms; transferred 32,793,684 bytes (~32.8 MB)
- Warm reload: 18,557 ms (no benefit: `serve` sends no cache validators/immutable headers, so this is not representative of Vercel caching; compile+pck load dominates)
- Content-Encoding seen: play.wasm br, play.js br, play.pck identity (24.2 MB, not compressed)
- Build: wasm 38.0 MB raw, 9.26 MB gzip, 7.61 MB brotli-5; pck 24.24 MB; total 33.6 MB
- Unthrottled boot in the e2e: ~7.8 s test wall time including browser start

## Real boot under /games/ CSP
- `pnpm exec playwright test e2e/atlantis-real.spec.ts --project=chromium`: 2 passed, zero violations, "ready" message received, no "error".
- media-src check: with the `media-src` directive removed, 0 violations and still boots (SFX/audio uses worklets, music removed). The defensive `media-src 'self' blob:` in vercel.json is unused today; plan 08-05 may drop it (left in place, not my file).

## Frames (alt-text seeds)
- atlantis-01: Title menu, brushed-metal bulkhead with a porthole onto ruins, "ATLANTIS" plate and JOUER / TOUCHES / QUITTER buttons.
- atlantis-02: Level 1 gameplay, submarine at the centre of a rocky cave with a pressure gauge (PRESSION), oxygen gauge (RESERVES DE O2) and a Tab "Inventaire" hint; no dialogue visible at 6 s.
- atlantis-03: Same level with the Inventaire panel open, four collectible slots at 0000.

## Deviations
- Spec reads `out/` (not `public/`) for the skip check; build uses 960/1280 widths (source is 1280 wide, plan said 1440 which sharp clamps and mislabels).
- Commit attribution trailer omitted per user's memory rule.

## Threshold check (08-proof-clearance THRESHOLD)
- first-play transfer <= 25 MB: FAIL (32.8 MB)
- play-to-title <= 12 s: FAIL (17.9 s)
- warm replay <= 4 s: FAIL as measured (18.6 s), caveat above
