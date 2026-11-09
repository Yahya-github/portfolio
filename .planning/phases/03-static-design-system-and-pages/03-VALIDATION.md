---
phase: 3
slug: static-design-system-and-pages
status: planned
nyquist_compliant: true
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

Task IDs are `{plan}-T{n}`. Checkpoint tasks (03-01-T2, 03-10-T2) are human sign-offs. Every task around them has an automated verify, so no stretch has three tasks in a row without one.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-T1 | 01 | 1 | CONT-09 | T-03-01, T-03-02 | Skill files never committed; no PII rules kept | grep | `grep -q "Instrument Sans" ~/.claude/skills/portfolio-design/SKILL.md && grep -q "Jun 2026 to Oct 2026" ~/.claude/skills/portfolio-voice-and-facts/SKILL.md` | ✅ (skills exist) | ⬜ pending |
| 03-01-T2 | 01 | 1 | CONT-09 | T-03-03 | Yahya approves facts | checkpoint | n/a (human-verify) | n/a | ⬜ pending |
| 03-01-T3 | 01 | 1 | CONT-09 | — | N/A | file check | `test -f .planning/todos/done/2026-11-07-update-portfolio-skills-to-design-rev-5.md` | n/a | ⬜ pending |
| 03-02-T1 | 02 | 1 | DSGN-01, A11Y-03 | T-03-06 | Text tokens >= 4.5:1 | unit | `pnpm test tests/contrast.test.ts` | ❌ W0 (created in task) | ⬜ pending |
| 03-02-T2 | 02 | 1 | DSGN-01, DSGN-02 | T-03-04 | Self-hosted font only | unit | `pnpm test tests/css-guard.test.ts` | ❌ W0 (created in task) | ⬜ pending |
| 03-03-T1 | 03 | 1 | CONT-09 | T-03-10 | robots noindex kept | unit | `pnpm test tests/sections.test.ts tests/metadata.test.ts` | ❌ W0 (created in task) | ⬜ pending |
| 03-03-T2 | 03 | 1 | CONT-09, CONT-01 | T-03-07, T-03-08, T-03-09 | No phone, no invented facts, safe hrefs | unit | `pnpm test tests/content.test.ts` | ❌ W0 (created in task) | ⬜ pending |
| 03-04-T1 | 04 | 1 | DSGN-06 | T-03-11 | No EXIF/GPS in assets | unit + script | `pnpm test tests/photo.test.tsx && test -z "$(exiftool assets/*.webp \| grep -iE 'GPS\|Camera Model')"` | ❌ W0 (created in task) | ⬜ pending |
| 03-04-T2 | 04 | 1 | CONT-09 | T-03-12, T-03-13 | No client JS, no literal a11y strings | lint + unit | `pnpm lint && pnpm test tests/source-guard.test.ts tests/heading.test.tsx tests/display-fit.test.ts` | ❌ W0 (created in task) | ⬜ pending |
| 03-05-T1 | 05 | 2 | A11Y-02, DSGN-01 | T-03-14, T-03-15 | First-party hrefs only | unit | `pnpm test tests/frame.test.tsx` | ❌ W0 (created in task) | ⬜ pending |
| 03-05-T2 | 05 | 2 | LTR-01, LTR-02, DSGN-01 | T-03-16 | Visible focus ring | unit | `pnpm test tests/letters.test.tsx` | ❌ W0 (created in task) | ⬜ pending |
| 03-06-T1 | 06 | 2 | CONT-01, CONT-09, DSGN-02 | T-03-17, T-03-18 | rel noopener noreferrer | unit | `pnpm test tests/pages-index-achievements.test.tsx` | ❌ W0 (created in task) | ⬜ pending |
| 03-06-T2 | 06 | 2 | CONT-09, DSGN-06 | T-03-17 | rel noopener noreferrer | unit | `pnpm test tests/pages-projects.test.tsx` | ❌ W0 (created in task) | ⬜ pending |
| 03-07-T1 | 07 | 2 | CONT-09, DSGN-02 | T-03-20, T-03-21 | rel noopener noreferrer; no phone | unit | `pnpm test tests/pages-experience-sayhi.test.tsx` | ❌ W0 (created in task) | ⬜ pending |
| 03-07-T2 | 07 | 2 | DSGN-02, DSGN-06 | T-03-22 | Stripped image metadata | unit | `pnpm test tests/pages-about.test.tsx` | ❌ W0 (created in task) | ⬜ pending |
| 03-08-T1 | 08 | 3 | A11Y-05, LTR-01 | — | N/A | unit | `pnpm test tests/shell.test.tsx` | ❌ W0 (created in task) | ⬜ pending |
| 03-08-T2 | 08 | 3 | A11Y-05, CONT-09 | T-03-23, T-03-24, T-03-25, T-03-26 | noindex kept; no client JS; build SHA gone | build + script | `pnpm build && grep -q noindex out/index.html && pnpm measure:js -- --max-gzip-kb 150` | ✅ (measure-js) | ⬜ pending |
| 03-09-T1 | 09 | 4 | A11Y-05, LTR-01, LTR-02, CONT-01 | T-03-29, T-03-30 | rel checks; noindex on every route | e2e (JS on + off) | `pnpm exec playwright test e2e/routes.spec.ts --project=chromium --project=chromium-nojs` | ❌ W0 (created in task) | ⬜ pending |
| 03-09-T2 | 09 | 4 | A11Y-02, DSGN-01, DSGN-02, DSGN-06, SC-2, D-04 | — | N/A | e2e | `pnpm exec playwright test e2e/focus.spec.ts e2e/layout.spec.ts e2e/font-shift.spec.ts --project=chromium` | ❌ W0 (created in task) | ⬜ pending |
| 03-09-T3 | 09 | 4 | A11Y-03 | T-03-27, T-03-28 | CSP zero violations; first-party only | e2e | `pnpm test:e2e` | ⚠ extends a11y/csp/assets specs | ⬜ pending |
| 03-10-T1 | 10 | 5 | DSGN-01, DSGN-02, DSGN-06 | T-03-31 | Pinned official image, non-root | visual (container) | `podman run ... mcr.microsoft.com/playwright:v1.65.0-noble ... playwright test --project=visual` | ❌ W0 (created in task) | ⬜ pending |
| 03-10-T2 | 10 | 5 | DSGN-01, DSGN-02, DSGN-06 | — | Yahya approves visuals | checkpoint | n/a (human-verify) | n/a | ⬜ pending |
| 03-10-T3 | 10 | 5 | D-07 | T-03-32, T-03-33 | Preview noindex; 308 to trailing slash | script + CI | `pnpm test tests/vercel-config.test.ts && gh pr checks && curl -sI "$PREVIEW/about"` | ✅ (vercel-config test) | ⬜ pending |

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

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (each test file is created inside the task that needs it, TDD-first)
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
