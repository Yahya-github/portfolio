---
phase: 08
slug: interactive-proof
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-12
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.1.0 (jsdom) + Playwright 1.65.0 (+ `@axe-core/playwright` 4.14.0) |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` (webServer `serve out -l 4173`) |
| **Quick run command** | `pnpm test -- tests/proof-*.test.ts tests/vercel-config.test.ts` |
| **Full suite command** | `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm measure:js -- --max-gzip-kb 150 --max-chunk-kb 12 && pnpm test:e2e` |
| **Estimated runtime** | ~300 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick run command
- **After every plan wave:** Run the full suite command
- **Before `/gsd-verify-work`:** Full suite must be green, plus `curl -sI` header checks on the Vercel preview and a manual play-through on desktop Chrome and Safari
- **Max feedback latency:** 60 seconds (quick run)

---

## Per-Task Verification Map

| Req | Behavior | Test Type | Automated Command | File Exists |
|-----|----------|-----------|-------------------|-------------|
| PROOF-01 | Game state machine transitions | unit | `pnpm test -- tests/proof-game-state.test.ts` | ❌ W0 |
| PROOF-01 | Message guard rejects foreign origin/source/malformed payloads | unit | `pnpm test -- tests/proof-game-protocol.test.ts` | ❌ W0 |
| PROOF-01 | `/games/(.*)` CSP (`'wasm-unsafe-eval'`, `img-src blob:`, `frame-ancestors 'self'`, XFO SAMEORIGIN); every other path keeps strict CSP + DENY; one CSP rule per path; negative control | unit | `pnpm test -- tests/vercel-config.test.ts` | ✅ extend |
| PROOF-01 | No `/games/` request on any route except after Play click | e2e | `pnpm test:e2e -- e2e/proof-isolation.spec.ts` | ❌ W0 |
| PROOF-01 | Play, loading, playing, Esc to exit, focus returns to Play, no Tab trap (stub game) | e2e | `pnpm test:e2e -- e2e/atlantis.spec.ts` | ❌ W0 |
| PROOF-01 | Real export boots to title under game CSP, zero violations | e2e (slow) | `pnpm test:e2e -- e2e/atlantis-real.spec.ts` | ❌ W0 |
| PROOF-01 | Touch shows fallback and no Play; JS off shows poster + links | e2e | `pnpm test:e2e -- e2e/atlantis.spec.ts --project=chromium-touch`, `routes.spec.ts` | ✅ extend |
| PROOF-01 | Size line equals build JSON; content passes never-on-site list | unit | `pnpm test -- tests/content.test.ts` | ✅ extend |
| PROOF-02 | Orbit maths (drag, pitch clamp, keys, Home, touch yaw-only, auto-rotate gate) | unit | `pnpm test -- tests/proof-orbit.test.ts` | ❌ W0 |
| PROOF-02 | Mesh header parse and quantized sizes | unit | `pnpm test -- tests/proof-mesh.test.ts` | ❌ W0 |
| PROOF-02 | Still first; viewer chunk only on `/projects/robot/`; no WebGL2 leaves still, no console error; keys/Reset; reduced motion | e2e | `pnpm test:e2e -- e2e/robot.spec.ts` | ❌ W0 |
| PROOF-02 | Viewer chunk ≤12 kB gzip; mesh ≤ budget | build gate | `pnpm measure:js -- --max-chunk-kb 12` (+ `--max-model-kb`) | ✅ extend |
| D-17/18 | View-transition focus, reduced motion, interruption, VT-disabled fallback | e2e | `pnpm test:e2e -- e2e/dive-transition.spec.ts` | ❌ W0 |
| All | axe on both new routes; CSP zero violations | e2e | `pnpm test:e2e -- e2e/a11y.spec.ts e2e/csp.spec.ts` | ✅ extend |
| All | Sitemap 9 URLs; robots disallows `/games/` | unit | `pnpm test -- tests/robots-sitemap.test.ts` | ✅ extend |
| All | New `"use client"` files on allowlist | unit | `pnpm test -- tests/source-guard.test.ts` | ✅ extend |

*Status tracking happens per plan during execution.*

---

## Wave 0 Requirements

- [ ] `e2e/fixtures/game-stub/play.html` + `shell.js` — stub speaking `progress/ready/exit/error/escape` protocol, served via `page.route('**/games/atlantis/**')`
- [ ] `tests/proof-game-state.test.ts`, `tests/proof-game-protocol.test.ts`, `tests/proof-orbit.test.ts`, `tests/proof-mesh.test.ts` (+ tiny fixture `.bin`)
- [ ] `e2e/proof-isolation.spec.ts`, `e2e/atlantis.spec.ts`, `e2e/atlantis-real.spec.ts` (slow), `e2e/robot.spec.ts`, `e2e/dive-transition.spec.ts`
- [ ] `e2e/csp.spec.ts` path-specific CSP injection + game-path negative control
- [ ] ESLint and Prettier ignores for `public/games/**` and `public/models/**`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Teammate consent and asset licences confirmed | PROOF-01, PROOF-02 | Human decision | Record written consent before publishing |
| Play-through on desktop Chrome and Safari | PROOF-01 | Real GPU/audio/input | Play to level 1 on the Vercel preview |
| Vercel brotli of engine file | PROOF-01 | Needs live deploy | `curl -sI -H 'Accept-Encoding: br'` on preview |
| Rotating real CAD model | PROOF-02 | CAD file comes from teammate | Swap placeholder for real glTF, check look and size |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
