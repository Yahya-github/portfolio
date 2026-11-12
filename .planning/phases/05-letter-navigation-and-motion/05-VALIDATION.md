---
phase: 5
slug: letter-navigation-and-motion
status: executing
nyquist_compliant: true
wave_0_complete: true
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
| 5-02-01 | 05-02 | 1 | LTR-03 | — | N/A | unit | `pnpm vitest run tests/letters-glide.test.ts` | ✅ | ✅ green |
| 5-10-01 | 05-10 | 4 | LTR-03 | — | N/A | e2e | `pnpm playwright test e2e/letters-glide.spec.ts` | ✅ | ✅ green |
| 5-10-02 | 05-10 | 4 | LTR-03 / DSGN-04 | — | N/A | e2e (rAF sampler) | `pnpm playwright test e2e/letters-glide.spec.ts` | ✅ | ✅ green |
| 5-10-03 | 05-10 | 4 | LTR-04 | — | N/A | e2e | `pnpm playwright test e2e/letters-labels.spec.ts` | ✅ | ✅ green |
| 5-10-04 | 05-10 | 4 | LTR-05 | — | N/A | e2e (extend) | `pnpm playwright test e2e/layout.spec.ts` | ✅ | ✅ green |
| 5-10-05 | 05-10 | 4 | LTR-06 | — | N/A | e2e | `pnpm playwright test e2e/letters-glide.spec.ts` | ✅ | ✅ green |
| 5-11-01 | 05-11 | 5 | NAV-05 | — | N/A | e2e (extend) | `pnpm playwright test e2e/pager-motion.spec.ts` | ✅ | ✅ green |
| 5-05-01 | 05-05 | 2 | NAV-06 | — | N/A | unit (fake timers) | `pnpm vitest run tests/first-visit-hint.test.ts` | ✅ | ✅ green |
| 5-07-01 | 05-07 | 3 | NAV-06 | T-5 storage denial | Storage throwing is harmless | e2e | `pnpm playwright test e2e/first-visit-hint.spec.ts` | ✅ | ✅ green |
| 5-05-02 | 05-05 | 2 | EXP-01 | T-5 storage denial | Wrappers never throw; Tab/Shift+Tab/modifiers never intercepted | unit | `pnpm vitest run tests/first-visit-opening.test.ts` | ✅ | ✅ green |
| 5-09-01 | 05-09 | 4 | EXP-01 | T-5 input capture | Listeners removed when opening ends; JS off stays readable | e2e | `pnpm playwright test e2e/first-visit.spec.ts` | ✅ | ✅ green |
| 5-03-01 | 05-03 | 2 | EXP-03 | T-5 DOM XSS | Tag text via `textContent` only | unit | `pnpm vitest run tests/cursor.test.ts` | ✅ | ✅ green |
| 5-08-01 | 05-08 | 3 | EXP-03 | — | N/A | e2e | `pnpm playwright test e2e/cursor.spec.ts` | ✅ | ✅ green |
| 5-11-02 | 05-11 | 5 | A11Y-04 | — | N/A | e2e | `pnpm playwright test e2e/reduced-motion.spec.ts` | ✅ | ✅ green |
| 5-01-01 | 05-01 | 1 | DSGN-04 / A11Y-04 | — | N/A | unit (guard) | `pnpm vitest run tests/motion-guard.test.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Playwright default `storageState` (or fixture) seeding both first-visit flags; opt-out for first-visit specs
- [x] `e2e/helpers/letters.ts` — rect reader, rAF sampler of per-letter `translate`/`transform`, "glide settled" wait
- [x] `tests/letters-glide.test.ts`, `tests/first-visit-opening.test.ts`, `tests/first-visit-hint.test.ts`, `tests/cursor.test.ts`, `tests/motion-guard.test.ts`
- [x] `e2e/letters-glide.spec.ts`, `e2e/letters-labels.spec.ts`, `e2e/first-visit.spec.ts`, `e2e/cursor.spec.ts`, `e2e/reduced-motion.spec.ts`
- [x] Update `tests/pager-state.test.ts`, `tests/letters.test.tsx`, `e2e/pager-a11y.spec.ts` (lines 141-152) once `lettersMode`/`railEnter`/`lettersInert` are removed
- [x] `tests/source-guard.test.ts` `CLIENT_ALLOWLIST` if any new `"use client"` file is added

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
