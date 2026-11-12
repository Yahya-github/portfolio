---
phase: 06
slug: page-compositions-and-content
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-12
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.1.0 (jsdom) + Playwright 1.65.0 + axe 4.14.0 |
| **Config file** | `vitest.config.mts`, `playwright.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm build && pnpm measure:js -- --max-gzip-kb 150 --max-chunk-kb 12 && pnpm test:e2e` (visual: `VISUAL=1` inside the container) |
| **Estimated runtime** | ~120 seconds (unit ~15s, build+e2e ~100s) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test` plus `pnpm lint` / `pnpm typecheck`
- **After every plan wave:** Build + measure + Chromium e2e
- **Before `/gsd-verify-work`:** Full suite green, incl. `VISUAL=1` baselines regenerated in the container and reviewed
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD by planner | — | — | DSGN-03 | — | N/A | e2e + visual | `pnpm test:e2e e2e/layouts-distinct.spec.ts` | ❌ W0 | ⬜ pending |
| TBD by planner | — | — | DSGN-05 | — | N/A | unit + e2e | `pnpm test tests/css-guard.test.ts` | extend | ⬜ pending |
| TBD by planner | — | — | CONT-02 | — | N/A | e2e | `pnpm test:e2e e2e/achievements.spec.ts` | ❌ W0 | ⬜ pending |
| TBD by planner | — | — | CONT-10 | — | links open new tab with noopener | unit + e2e | `pnpm test tests/previews-nudge.test.ts` | ❌ W0 | ⬜ pending |
| TBD by planner | — | — | CONT-03 | — | N/A | e2e | `pnpm test:e2e e2e/projects.spec.ts` | ❌ W0 | ⬜ pending |
| TBD by planner | — | — | CONT-11 | — | N/A | unit + e2e | `pnpm test tests/walkthrough-hold.test.ts` | ❌ W0 | ⬜ pending |
| TBD by planner | — | — | CONT-04 | — | N/A | e2e + axe | `pnpm test:e2e e2e/deep-dive.spec.ts` | ❌ W0 | ⬜ pending |
| TBD by planner | — | — | CONT-08 | — | N/A | e2e | `pnpm test:e2e e2e/routes.spec.ts` | extend | ⬜ pending |
| TBD by planner | — | — | CONT-12 | — | N/A | e2e + content | `pnpm test tests/content.test.ts` | extend | ⬜ pending |
| TBD by planner | — | — | CONT-07 | — | clipboard failure falls back to mailto | unit + e2e | `pnpm test tests/copy-email.test.ts` | ❌ W0 | ⬜ pending |
| TBD by planner | — | — | CONT-05 | — | N/A | unit | `pnpm test tests/pages-experience-sayhi.test.tsx` | ✅ | ⬜ pending |
| TBD by planner | — | — | EXP-02 | — | N/A | e2e (touch) + visual 320x568 | `pnpm test:e2e e2e/no-scrollbar.spec.ts` | extend | ⬜ pending |
| TBD by planner | — | — | Budget | — | N/A | unit + CI | `pnpm test tests/measure-js.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/walkthrough-hold.test.ts`, `tests/previews-nudge.test.ts`, `tests/copy-email.test.ts`, `tests/measure-js.test.ts`, `tests/media-manifest.test.ts`
- [ ] `e2e/achievements.spec.ts`, `e2e/projects.spec.ts`, `e2e/walkthrough.spec.ts`, `e2e/deep-dive.spec.ts`, `e2e/say-hi.spec.ts`, `e2e/motion-control.spec.ts`, `e2e/layouts-distinct.spec.ts`
- [ ] `a11y.spec.ts` / `visual.spec.ts` / `routes.spec.ts`: add `/projects/facturo/` and the 320x568 viewport, plus new states
- [ ] Visual specs neutralise motion (reduced motion forced) so spiral, names and walkthrough frames are deterministic

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real-phone swipe, landscape hint, tap-to-colour | EXP-02, CONT-12 | iPhone Safari, LinkedIn in-app browser, Android cannot be automated here | Open the Vercel preview on each device, swipe all six pages, rotate, tap portrait and marks |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
