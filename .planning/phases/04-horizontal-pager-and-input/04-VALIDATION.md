---
phase: 4
slug: horizontal-pager-and-input
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-09
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: `04-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.1.0 (jsdom 31) + Playwright 1.65.0 + @axe-core/playwright 4.14.0 |
| **Config file** | `vitest.config.*` (exists), `playwright.config.ts` (exists; Wave 0 adds firefox/webkit/touch-phone projects for `e2e/pager-*.spec.ts`, gated by `ALL_BROWSERS=1` or container) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm build && pnpm measure:js -- --max-gzip-kb 150 && pnpm test && pnpm test:e2e` |
| **Estimated runtime** | ~10s quick; ~3–5 min full (Chromium); cross-browser + `VISUAL=1` in `mcr.microsoft.com/playwright:v1.65.0-noble` container |

---

## Sampling Rate

- **After every task commit:** `pnpm test` + touched `e2e/pager-*.spec.ts` on Chromium
- **After every plan wave:** `pnpm build && pnpm test && pnpm test:e2e` (Chromium + nojs), then Firefox/WebKit projects in container
- **Before `/gsd-verify-work`:** Full suite green in CI (all browsers, `VISUAL=1`), JS gate passes, D-12 device checklist ticked on PR preview
- **Max feedback latency:** 10 seconds (unit)

---

## Per-Task Verification Map

Filled by planner/executor per task. Requirement → test map:

| Req | Behavior | Test Type | Automated Command | File Exists | Status |
|-----|----------|-----------|-------------------|-------------|--------|
| NAV-01 | Wheel trace replays (Mac flick tail=1, two flicks=2, Win notch=1/notch, Firefox 3-line=1, Safari 12px discrete=1, Linux touchpad=1, ctrl pinch=0, >160ms gap resets, overflow mid-scroll=0 then edge gesture=1) | unit | `pnpm vitest run tests/pager-wheel.test.ts` | ❌ W0 | ⬜ pending |
| NAV-01 | One `mouse.wheel` = 1 page in Chromium/Firefox/WebKit; horizontal wheel pages; ends `defaultPrevented`, no page | e2e | `pnpm exec playwright test e2e/pager-wheel.spec.ts` | ❌ W0 | ⬜ pending |
| NAV-02 | `keyIntent` table (Space on link/button=null, modifiers, text targets, 600ms repeat gate) | unit | `pnpm vitest run tests/pager-keys.test.ts` | ❌ W0 | ⬜ pending |
| NAV-02 | Each key pages once; Home/End; →→ fast = +2 with one history entry; held → under reduced motion ≤1 page/600ms; Space/PgDn scroll overflowing page with focus on body | e2e | `pnpm exec playwright test e2e/pager-keys.spec.ts` | ❌ W0 | ⬜ pending |
| NAV-03 | Swipe FSM: 20px edge exclusion, 12px axis lock, 1.5 ratio, 48px or 24px+0.3px/ms commit, pointercancel aborts | unit | `pnpm vitest run tests/pager-swipe.test.ts` | ❌ W0 | ⬜ pending |
| NAV-03 | Touch swipe at 390x844 pages; vertical never pages; swipe from x=10 does nothing | e2e (chromium) | `pnpm exec playwright test e2e/pager-swipe.spec.ts` | ❌ W0 | ⬜ pending |
| NAV-04 | Reducer: one push per landing, retargets coalesce, history-sourced change never pushes | unit | `pnpm vitest run tests/pager-state.test.ts` | ❌ W0 | ⬜ pending |
| NAV-04 | Deep link paints page with no running animation; URL updates; Back/Forward no reload (window marker); title correct after Back; `?debug` preserved; no `next-route-announcer` after first change; `scrollRestoration === "manual"` | e2e | `pnpm exec playwright test e2e/pager-history.spec.ts` | ❌ W0 | ⬜ pending |
| NAV-07 | 1366x768 fits; at 683x384@2x on Projects/Experience wheel scrolls, bottom momentum no page, fresh edge gesture pages; `scrollX === 0` | e2e | `pnpm exec playwright test e2e/pager-overflow.spec.ts e2e/layout.spec.ts` | ❌ W0 / ✅ | ⬜ pending |
| A11Y-01 | One non-inert section + one h1; `aria-current` moves; live-region text from template | unit (RTL, stub animator) | `pnpm vitest run tests/pager-shell.test.tsx` | ❌ W0 | ⬜ pending |
| A11Y-01 | Focus on `#title-{slug}` not inside `[inert]`; live region correct; ring only after key change; Tab never reaches hidden rail/riding row; axe 0 violations per page at 1440x900 + 390x844, both motion modes | e2e | `pnpm exec playwright test e2e/pager-a11y.spec.ts e2e/a11y.spec.ts` | ❌ W0 / ✅ | ⬜ pending |
| Motion | Mid-slide retarget: no jump >4px, no reversal; bar+track share timing; reduced-motion switch mid-session applies | e2e (chromium) | `pnpm exec playwright test e2e/pager-motion.spec.ts` | ❌ W0 | ⬜ pending |
| Budget | JS < 150 kB gzip; debug chunk not in initial set | script | `pnpm build && pnpm measure:js -- --max-gzip-kb 150` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/traces/*.json` + loader (`{ device, browser, os, samples: [{t, dx, dy, mode, wheelDeltaY?}], expectPages }`)
- [ ] `tests/pager-state.test.ts`, `tests/pager-wheel.test.ts`, `tests/pager-keys.test.ts`, `tests/pager-swipe.test.ts`, `tests/pager-shell.test.tsx`
- [ ] Stub animator + `matchMedia` stub in `tests/setup.ts`
- [ ] `tests/source-guard.test.ts` → client-component allowlist (instead of "none")
- [ ] `tests/shell.test.tsx` updated for client projections
- [ ] `e2e/pager-*.spec.ts` + shared helpers (`waitForLanded()` on `main[data-phase="idle"]`; no fixed sleeps except >160ms gesture gap)
- [ ] `playwright.config.ts`: firefox + webkit projects for pager specs, touch phone project
- [ ] Debug trace recorder (`window.__pagerTrace`, `?debug` only, lazy chunk)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mac trackpad + Magic Mouse (Safari, Chrome), no history swipe; Windows wheel; Linux touchpad | NAV-01 | Real inertia curves not reproducible headless | D-12 checklist on PR preview: one flick = one page; long momentum never skips; at ends no browser back swipe |
| iPhone Safari, LinkedIn in-app browser, Android Chrome swipe; left-edge swipe → system back | NAV-03 | Real touch + OS gestures | D-12 checklist: horizontal swipe pages; vertical reads; edge swipe goes back |
| Pinch-zoomed phone can still pan sideways | NAV-03 / NAV-07 | Visual-viewport behavior device-specific | Pinch in on iPhone, pan sideways, confirm no page change |
| Screen reader announcement (VoiceOver/NVDA) single, correct title | A11Y-01 | AT output not automatable | Page with keys; confirm one announcement per change, correct after Back |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
