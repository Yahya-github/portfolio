---
phase: 5
slug: letter-navigation-and-motion
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-09
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Seeded from the Validation Architecture section of `05-RESEARCH.md`; the planner fills Task ID / Plan / Wave once plans exist.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.1.0 (jsdom) + Playwright 1.65.0 (+ @axe-core/playwright 4.14.0) |
| **Config file** | `vitest.config.*`, `playwright.config.ts` (both exist) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm build && pnpm test && pnpm test:e2e && pnpm measure:js -- --max-gzip-kb 150` |
| **Estimated runtime** | ~120 seconds (full), ~15 seconds (quick) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test` (plus the one relevant e2e spec after `pnpm build`)
- **After every plan wave:** Run `pnpm build && pnpm test && pnpm test:e2e && pnpm measure:js -- --max-gzip-kb 150`
- **Before `/gsd-verify-work`:** Full suite green, plus the container run (`ALL_BROWSERS=1`, visual baselines updated deliberately)
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 5-XX-XX | TBD | TBD | LTR-03 | — | N/A | unit | `pnpm vitest run tests/letters-glide.test.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | LTR-03 | — | N/A | e2e | `pnpm playwright test e2e/letters-glide.spec.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | LTR-03 / DSGN-04 | — | N/A | e2e (rAF sampler) | `pnpm playwright test e2e/letters-glide.spec.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | LTR-04 | — | N/A | e2e | `pnpm playwright test e2e/letters-labels.spec.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | LTR-05 | — | N/A | e2e (extend) | `pnpm playwright test e2e/layout.spec.ts` | ✅ extend | ⬜ pending |
| 5-XX-XX | TBD | TBD | LTR-06 | — | N/A | e2e | `pnpm playwright test e2e/letters-glide.spec.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | NAV-05 | — | N/A | e2e (extend) | `pnpm playwright test e2e/pager-motion.spec.ts` | ✅ extend | ⬜ pending |
| 5-XX-XX | TBD | TBD | NAV-06 | — | N/A | unit (fake timers) | `pnpm vitest run tests/first-visit-hint.test.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | NAV-06 | T-5 storage denial | Storage throwing is harmless | e2e | `pnpm playwright test e2e/first-visit.spec.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | EXP-01 | T-5 storage denial | Wrappers never throw; Tab/Shift+Tab/modifiers never intercepted | unit | `pnpm vitest run tests/first-visit-opening.test.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | EXP-01 | T-5 input capture | Listeners removed when opening ends; JS off stays readable | e2e | `pnpm playwright test e2e/first-visit.spec.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | EXP-03 | T-5 DOM XSS | Tag text via `textContent` only | unit | `pnpm vitest run tests/cursor.test.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | EXP-03 | — | N/A | e2e | `pnpm playwright test e2e/cursor.spec.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | A11Y-04 | — | N/A | e2e | `pnpm playwright test e2e/reduced-motion.spec.ts` | ❌ W0 | ⬜ pending |
| 5-XX-XX | TBD | TBD | DSGN-04 / A11Y-04 | — | N/A | unit (guard) | `pnpm vitest run tests/motion-guard.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Playwright default `storageState` (or fixture) seeding both first-visit flags; opt-out for first-visit specs
- [ ] `e2e/helpers/letters.ts` — rect reader, rAF sampler of per-letter `translate`/`transform`, "glide settled" wait
- [ ] `tests/letters-glide.test.ts`, `tests/first-visit-opening.test.ts`, `tests/first-visit-hint.test.ts`, `tests/cursor.test.ts`, `tests/motion-guard.test.ts`
- [ ] `e2e/letters-glide.spec.ts`, `e2e/letters-labels.spec.ts`, `e2e/first-visit.spec.ts`, `e2e/cursor.spec.ts`, `e2e/reduced-motion.spec.ts`
- [ ] Update `tests/pager-state.test.ts`, `tests/letters.test.tsx`, `e2e/pager-a11y.spec.ts` (lines 141-152) once `lettersMode`/`railEnter`/`lettersInert` are removed
- [ ] `tests/source-guard.test.ts` `CLIENT_ALLOWLIST` if any new `"use client"` file is added

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Glide and opening feel: easing, X-leads-Y, "fast with no bounce" | DSGN-04, LTR-03, EXP-01 | Easing feel needs real hardware and a human eye | Load `/` fresh, page hero→Index→hero several times, watch the letter glide on desktop and a real phone |
| Cursor sits exactly on the pointer and snaps to letters and links | EXP-03 | Pointer feel on real trackpad/mouse | Move across letters, links, footer controls; confirm snap and tag never clips an edge |
| Opening direction and overall impression | EXP-01 | Design judgment, open question for UI-SPEC | Clear storage, reload, review direction and duration |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
