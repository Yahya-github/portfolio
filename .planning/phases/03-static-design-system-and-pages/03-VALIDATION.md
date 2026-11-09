---
phase: 3
slug: static-design-system-and-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-08
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.1.0 (jsdom 31) + Playwright 1.65.0 + @axe-core/playwright 4.14.0 |
| **Config file** | `vitest.config.mts`, `playwright.config.ts` |
| **Quick run command** | `pnpm lint && pnpm typecheck && pnpm test` |
| **Full suite command** | `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm measure:js -- --max-gzip-kb 150 && pnpm test:e2e` |
| **Estimated runtime** | ~30 s quick, ~180 s full |

---

## Sampling Rate

- **After every task commit:** Run `pnpm lint && pnpm typecheck && pnpm test`
- **After every plan wave:** Run the full suite command
- **Before `/gsd-verify-work`:** Full suite must be green locally and in CI; visual baselines committed from the `mcr.microsoft.com/playwright:v1.65.0-noble` container
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

Task IDs are filled in by the planner; requirement-level map below.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | DSGN-01 | — | N/A | unit + e2e | `pnpm test tests/contrast.test.ts tests/css-guard.test.ts`; `pnpm test:e2e e2e/layout.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | DSGN-02 | — | N/A | unit + e2e | `pnpm test tests/css-guard.test.ts`; `pnpm test:e2e e2e/layout.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | DSGN-06 | — | N/A | e2e + visual | `pnpm test:e2e e2e/layout.spec.ts e2e/visual.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CONT-01 | — | N/A | e2e (JS off) | `pnpm test:e2e --project=chromium-nojs e2e/routes.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CONT-09 | — | No invented facts / no phone number in content | lint + unit | `pnpm lint`; `pnpm test tests/content.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | LTR-01 | — | N/A | e2e (JS on + off) | `pnpm test:e2e e2e/routes.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | LTR-02 | — | N/A | unit + e2e | `pnpm test tests/shell.test.tsx`; `pnpm test:e2e e2e/routes.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | A11Y-02 | — | N/A | e2e | `pnpm test:e2e e2e/focus.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | A11Y-03 | — | N/A | unit + e2e | `pnpm test tests/contrast.test.ts`; `pnpm test:e2e e2e/a11y.spec.ts` | ⚠ partial (a11y.spec covers `/` only) | ⬜ pending |
| TBD | TBD | TBD | A11Y-05 | — | N/A | e2e (JS off) | `pnpm test:e2e --project=chromium-nojs` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SC-2 font shift | — | N/A | e2e | `pnpm test:e2e e2e/font-shift.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | D-04 no overflow | — | N/A | e2e | `pnpm test:e2e e2e/layout.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | D-07 metadata | — | noindex present until launch | e2e | `pnpm test:e2e e2e/routes.spec.ts` (canonical, title, robots) | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | JS budget | — | N/A | script | `pnpm measure:js -- --max-gzip-kb 150` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/contrast.test.ts`, `tests/css-guard.test.ts`, `tests/content.test.ts`, `tests/sections.test.ts`, `tests/shell.test.tsx`
- [ ] `e2e/routes.spec.ts`, `e2e/focus.spec.ts`, `e2e/layout.spec.ts`, `e2e/font-shift.spec.ts`, `e2e/visual.spec.ts`
- [ ] Extend `e2e/a11y.spec.ts` and `e2e/csp.spec.ts` to all six routes; fix `e2e/assets.spec.ts` (portrait moves to hidden About section)
- [ ] `playwright.config.ts`: `chromium-nojs` project + visual project
- [ ] `eslint.config.mjs`: `react/jsx-no-literals` `{ noStrings: true, ignoreProps: true }`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel 308 `/about` → `/about/` | D-07 | Needs a real preview deploy | `curl -sI https://<preview>/about` expects `308` + `location: /about/`; else add `"trailingSlash": true` to `vercel.json` |
| Screen-reader pass of hero letters and skip link | LTR-02, A11Y-02 | axe does not judge spoken output | Orca/VoiceOver: Tab through hero, confirm names "01 Achievements" … "05 Say hi" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 180s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
