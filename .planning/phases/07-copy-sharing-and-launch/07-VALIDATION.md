---
phase: 07
slug: copy-sharing-and-launch
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-12
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.1.0 (jsdom 31) + Playwright 1.65.0 + @axe-core/playwright 4.14.0; LHCI 0.16.1 (new) |
| **Config file** | `vitest.config.mts`, `playwright.config.ts`, `lighthouserc.json` (new, Wave 0) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm build && pnpm measure:js -- --max-gzip-kb 150 --max-chunk-kb 12 && pnpm test:e2e && pnpm exec lhci autorun` |
| **Estimated runtime** | ~30 s quick, several minutes full |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test` plus `pnpm lint` and `pnpm typecheck`
- **After every plan wave:** Run `pnpm build && pnpm test:e2e` (Chromium projects) and `pnpm exec lhci autorun`
- **Before `/gsd-verify-work`:** Full suite green in CI, including the new `lighthouse` required check
- **Max feedback latency:** 30 seconds (quick run)

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists | Status |
|--------|----------|-----------|-------------------|-------------|--------|
| CONT-06 | No forbidden wording in any content file, incl. `not-found.ts` | unit | `pnpm test tests/content.test.ts` | ✅ (add `notFound`) | ⬜ pending |
| CONT-06 | Resume PDF hash matches; public equals docs copy; extract contains each site fact | unit | `pnpm test tests/resume-facts.test.ts` | ❌ W0 | ⬜ pending |
| CONT-06 | Meta descriptions 50 to 160 chars | unit | `pnpm test tests/metadata.test.ts` | ✅ (extend) | ⬜ pending |
| CONT-06 | Final copy fits 1366x768 / 1440x900 / 390x844 without scroll | e2e visual | `VISUAL=1 pnpm exec playwright test --project visual` | ✅ (update baselines) | ⬜ pending |
| SEO-01 | Title, description, canonical, og:url, og:image, twitter card per route | unit + e2e | `pnpm test tests/metadata.test.ts`; `pnpm exec playwright test e2e/seo.spec.ts` | ❌ W0 (seo.spec) | ⬜ pending |
| SEO-01 | Person JSON-LD present, parseable, no PII, `<` escaped | unit + e2e | `pnpm test tests/structured-data.test.ts` | ❌ W0 | ⬜ pending |
| SEO-01 | Launch: no noindex; robots.txt and sitemap.xml with 7 URLs | unit + e2e | `pnpm test tests/vercel-config.test.ts tests/metadata.test.ts` | ✅ (flip in launch plan) | ⬜ pending |
| SEO-02 | share-card.png 1200x630, under 300 KB, absolute URL | unit + e2e | `pnpm test tests/share-card.test.ts` | ❌ W0 | ⬜ pending |
| SEO-02 | icon.svg / apple-icon links; apple icon 180x180 | unit + e2e | `pnpm test tests/favicon.test.ts` | ❌ W0 | ⬜ pending |
| SEO-02 | 404 status, heading, five letter links, Back to the start, noindex follow | e2e | `pnpm exec playwright test e2e/not-found.spec.ts` | ❌ W0 | ⬜ pending |
| SEO-02 | 404 axe clean, keyboard order, reduced motion | e2e | `pnpm exec playwright test e2e/a11y.spec.ts e2e/reduced-motion.spec.ts` | ✅ (extend) | ⬜ pending |
| D-11 | Lighthouse budgets on all 8 routes | CI | `pnpm exec lhci autorun` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `lighthouserc.json` + `pnpm add -D @lhci/cli@0.16.1` + baseline run recorded
- [ ] `e2e/seo.spec.ts`: head metadata, JSON-LD, assets
- [ ] `e2e/not-found.spec.ts`: status, structure, keyboard
- [ ] `tests/structured-data.test.ts`, `tests/share-card.test.ts`, `tests/favicon.test.ts`, `tests/resume-facts.test.ts`
- [ ] `e2e/a11y.spec.ts` and `e2e/visual.spec.ts` ROUTES extended with the 404
- [ ] `.gitignore` / `.prettierignore`: `.lighthouseci/`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Five-second test with someone new; VoiceOver/NVDA pass | Criterion 4 | Human judgement; non-blocking per D-12 | Record in `07-HUMAN-UAT.md` |
| LinkedIn Post Inspector shows the branded card | SEO-02 | LinkedIn crawler only reaches the live site | After launch, paste URL into Post Inspector |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
