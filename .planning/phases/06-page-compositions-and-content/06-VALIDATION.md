---
phase: 06
slug: page-compositions-and-content
status: draft
nyquist_compliant: true
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
| 06-01-01 | 01 | 1 | CONT-10/11/12, CONT-04 | T-06-01, T-06-04 | WebP metadata-stripped, <=150 kB | script | `pnpm media:build && git diff --exit-code lib/media/manifest.ts` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | DSGN-05 | T-06-01, T-06-02 | no EXIF/XMP, self-hosted src | unit + e2e | `pnpm vitest run tests/media-manifest.test.ts tests/media-defer.test.ts tests/photo.test.tsx` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | Budget (D-08) | T-06-05 | N/A | unit | `pnpm vitest run tests/measure-js.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 1 | Budget (D-08) | T-06-05 | gate can fail (negative controls) | CI script | `pnpm measure:js -- --max-gzip-kb 150 --max-chunk-kb 12` | extend | ⬜ pending |
| 06-03-01 | 03 | 1 | CONT-02/03/04/07/10/11/12, EXP-02 | T-06-07, T-06-08 | fact guards + SAFE_HREF on facturo | unit | `pnpm vitest run tests/content.test.ts` | extend | ⬜ pending |
| 06-03-02 | 03 | 1 | DSGN-05 | — | no CSS filter | unit | `pnpm vitest run tests/css-guard.test.ts tests/motion-guard.test.ts` | extend | ⬜ pending |
| 06-04-01 | 04 | 1 | CONT-07/10/11/12 | T-06-10, T-06-12 | literal import() only; deferred imgs skipped | unit | `pnpm vitest run tests/features-registry.test.ts tests/decode-images.test.ts` | ❌ W0 | ⬜ pending |
| 06-04-02 | 04 | 1 | CONT-07/10/11/12 | T-06-11 | failed chunk keeps server state | unit + e2e | `pnpm vitest run tests/use-features.test.tsx` | ❌ W0 | ⬜ pending |
| 06-05-01 | 05 | 2 | CONT-10 | T-06-15 | no innerHTML | unit | `pnpm vitest run tests/previews-nudge.test.ts tests/previews-mount.test.ts` | ❌ W0 | ⬜ pending |
| 06-05-02 | 05 | 2 | CONT-02, CONT-10, DSGN-05 | T-06-13 | noopener noreferrer | unit | `pnpm vitest run tests/pages-index-achievements.test.tsx` | extend | ⬜ pending |
| 06-05-03 | 05 | 2 | CONT-02, CONT-10 | T-06-13 | new-tab links | e2e | `pnpm exec playwright test e2e/achievements.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-06-01 | 06 | 2 | CONT-11 | — | N/A | unit (512-case matrix) | `pnpm vitest run tests/walkthrough-hold.test.ts` | ❌ W0 | ⬜ pending |
| 06-06-02 | 06 | 2 | CONT-11, CONT-03, DSGN-05 | T-06-16, T-06-18 | textContent only; deferred frames | unit + budget | `pnpm vitest run tests/pages-projects.test.tsx && pnpm measure:js -- --max-gzip-kb 150 --max-chunk-kb 12` | extend | ⬜ pending |
| 06-06-03 | 06 | 2 | CONT-11 | T-06-17, T-06-18 | paused off-page/hidden | e2e | `pnpm exec playwright test e2e/walkthrough.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-07-01 | 07 | 2 | CONT-12, DSGN-05 | — | N/A | unit | `pnpm vitest run tests/toggles.test.ts` | ❌ W0 | ⬜ pending |
| 06-07-02 | 07 | 2 | CONT-05, CONT-12 | T-06-19 | colour twin on demand | unit | `pnpm vitest run tests/org-mark.test.tsx tests/pages-about.test.tsx` | ❌ W0 | ⬜ pending |
| 06-07-03 | 07 | 2 | CONT-12, DSGN-05 | T-06-20 | N/A | e2e | `pnpm exec playwright test e2e/marks-portrait.spec.ts e2e/assets.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-08-01 | 08 | 2 | CONT-07 | T-06-22, T-06-23 | constant only; textContent | unit | `pnpm vitest run tests/copy-email.test.ts tests/pages-experience-sayhi.test.tsx` | ❌ W0 | ⬜ pending |
| 06-08-02 | 08 | 2 | CONT-07 | T-06-22 | failure falls back to mailto | e2e | `pnpm exec playwright test e2e/say-hi.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-09-01 | 09 | 2 | CONT-04 | — | client allowlist updated | unit | `pnpm vitest run tests/source-guard.test.ts tests/frame.test.tsx tests/letters.test.tsx tests/metadata.test.ts` | extend | ⬜ pending |
| 06-09-02 | 09 | 2 | CONT-04 | T-06-25, T-06-26 | noopener; verified facts | unit + build | `pnpm vitest run tests/deep-dive.test.tsx && pnpm build` | ❌ W0 | ⬜ pending |
| 06-09-03 | 09 | 2 | CONT-04, CONT-08 | T-06-27, T-06-28 | CSP + noindex on new route | e2e + axe | `pnpm exec playwright test e2e/deep-dive.spec.ts e2e/routes.spec.ts e2e/a11y.spec.ts e2e/csp.spec.ts --project=chromium --project=chromium-nojs` | ❌ W0 | ⬜ pending |
| 06-10-01 | 10 | 3 | CONT-03, CONT-10, CONT-12 | T-06-29 | noopener | unit | `pnpm vitest run tests/pages-projects.test.tsx` | extend | ⬜ pending |
| 06-10-02 | 10 | 3 | CONT-03 | — | N/A | e2e | `pnpm exec playwright test e2e/projects.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-11-01 | 11 | 4 | EXP-02 | T-06-31 | hint never blocks | unit | `pnpm vitest run tests/pages-index-achievements.test.tsx` | extend | ⬜ pending |
| 06-11-02 | 11 | 4 | EXP-02 | T-06-31 | N/A | e2e (phone)  | `pnpm exec playwright test --project=chromium-phone --project=chromium-touch` | ❌ W0 | ⬜ pending |
| 06-12-01 | 12 | 5 | DSGN-03 | T-06-33 | N/A | guards | `pnpm vitest run && pnpm build` | extend | ⬜ pending |
| 06-12-02 | 12 | 5 | DSGN-03 | T-06-33 | pointer-events none | e2e | `pnpm exec playwright test e2e/device-grid-lines.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-13-01 | 13 | 6 | DSGN-03 | T-06-34 | N/A | guards | `pnpm vitest run && pnpm build` | extend | ⬜ pending |
| 06-13-02 | 13 | 6 | DSGN-03 | T-06-34 | no horizontal scroll | e2e | `pnpm exec playwright test e2e/device-edge-number.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-14-01 | 14 | 7 | DSGN-03 | T-06-35 | no hex, no innerHTML | unit | `pnpm vitest run tests/quarter-rings.test.tsx` | ❌ W0 | ⬜ pending |
| 06-14-02 | 14 | 7 | DSGN-03 | — | N/A | e2e | `pnpm exec playwright test e2e/device-rings.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-15-01 | 15 | 8 | DSGN-03 (D-06) | T-06-36 | N/A | unit + e2e | `pnpm vitest run tests/first-visit-hint.test.ts` | extend | ⬜ pending |
| 06-15-02 | 15 | 8 | DSGN-03 | T-06-37 | React nodes never mutated | guards | `pnpm vitest run tests/frame.test.tsx tests/motion-guard.test.ts` | extend | ⬜ pending |
| 06-15-03 | 15 | 8 | DSGN-03 (D-06) | T-06-36, T-06-38 | WCAG 2.2.2 pause | unit + e2e | `pnpm vitest run tests/motion-devices.test.ts && pnpm exec playwright test e2e/motion-control.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-16-01 | 16 | 9 | DSGN-03 | T-06-39 | no literal durations | unit | `pnpm vitest run tests/say-hi-spiral.test.tsx tests/motion-guard.test.ts` | ❌ W0 | ⬜ pending |
| 06-16-02 | 16 | 9 | DSGN-03 | T-06-39, T-06-40 | pausable | e2e | `pnpm exec playwright test e2e/spiral.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-17-01 | 17 | 10 | DSGN-03 | — | axe on states | e2e + axe | `pnpm exec playwright test e2e/layouts-distinct.spec.ts e2e/a11y.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-17-02 | 17 | 10 | DSGN-03, EXP-02 | T-06-42 | N/A | visual (container) | `VISUAL=1 pnpm exec playwright test --project=visual` (in mcr.microsoft.com/playwright:v1.65.0-noble) | extend | ⬜ pending |
| 06-17-03 | 17 | 10 | all | T-06-41 | N/A | manual checkpoint | full suite, then Yahya's review | — | ⬜ pending |

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
| Real-phone swipe, landscape hint, tap-to-colour | EXP-02, CONT-12 | iPhone Safari, LinkedIn in-app browser, Android cannot be automated here | Open the Vercel preview on each device, swipe all six pages, rotate, tap portrait and marks (plan 06-17 Task 3) |
| JS-off colour twins, footer collision rule, device cuts | DSGN-05, D-05, D-06 | Product decisions (RESEARCH Open Question 1, UI-SPEC discretion rule) | Yahya decides at the plan 06-17 checkpoint; defaults are built |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (each plan creates its own test file in the task that needs it)
- [x] No watch-mode flags
- [ ] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
