---
phase: 04-horizontal-pager-and-input
verified: 2026-11-09T21:00:00Z
status: human_needed
score: 5/5 roadmap criteria verified in code and automated tests; real-hardware parts of criteria 1 and 2, plus a screen-reader pass for criterion 5, need a human
overrides_applied: 0
re_verification:
  previous_status: none
  note: initial verification
gaps: []
deferred: []
human_verification:
  - test: "Mac trackpad (Safari and Chrome): one flick, then a long hard flick with momentum, on every page"
    expected: "Each flick moves exactly one page, momentum never skips a page, and the horizontal swipe never triggers browser Back/Forward"
    why_human: "Real inertia curves cannot be reproduced headless. The tests use deterministic synthetic traces, not recordings from a device."
  - test: "Magic Mouse (Safari, Chrome): scroll sideways and vertically"
    expected: "One gesture is one page; no history swipe; no double page"
    why_human: "Real hardware"
  - test: "Windows mouse wheel (Chrome, Edge, Firefox): single notches and fast multi-notch spins"
    expected: "One notch is one page; a fast spin pages once per notch and never overshoots"
    why_human: "Real hardware. Only a hand-written Windows Chrome trace exists, and D-13 already notes a recording gap here."
  - test: "Linux touchpad (Firefox and Chrome)"
    expected: "A two-finger flick is one page with no skip. Sideways swipes do not trigger Back/Forward."
    why_human: "Real hardware"
  - test: "iPhone Safari and the LinkedIn in-app browser: swipe left/right, vertical scroll, swipe from the left edge"
    expected: "A horizontal swipe pages; vertical scroll never pages; an edge swipe goes to the system back gesture; the footer stays visible above the address bar"
    why_human: "Real touch and OS gestures. The 20px edge exclusion is only a guard; whether the OS back gesture takes over is a device behaviour."
  - test: "Android Chrome: swipe, vertical scroll, edge swipe"
    expected: "Same as iPhone"
    why_human: "Real device"
  - test: "iOS Safari pinch-zoom, then swipe and pan (IN-05, plan 04-15 Open Question 3)"
    expected: "A pinch-zoomed page can pan sideways without paging; a slide ends at the same offset as the CSS resting position (the animator uses window.innerWidth, the resting transform uses 100vw)"
    why_human: "visualViewport and innerWidth behaviour under pinch-zoom differs by engine and cannot be run here. No fallback to touch-action:auto was built."
  - test: "VoiceOver (Safari) and NVDA (Firefox/Chrome): page with keyboard and links, then Back"
    expected: "One announcement per page change, naming the correct page, including after Back; focus lands on the page heading; Tab/virtual cursor never reach inactive pages"
    why_human: "Automated tests assert the live-region text, the focus target and inert, but not what a screen reader actually speaks."
  - test: "Firefox and WebKit pager specs (ALL_BROWSERS=1, in the Playwright container or on a CI PR run)"
    expected: "e2e/pager-wheel, pager-keys and pager-history pass in Firefox and WebKit"
    why_human: "This host has Chromium only. The Phase 4 branch has no CI run yet, so these two engines have never run the pager specs."
  - test: "WR-02 (slide ends without a newer slide) and WR-04 (fragment popstate mid-slide), exercised by hand"
    expected: "Page quickly with arrows and click the skip link mid-slide: no reversal, no stuck 'sliding' state, one history entry per landing"
    why_human: "04-REVIEW-FIX.md flags both as 'requires human verification'. Unit tests and the full e2e suite pass, but the race windows are small."
---

# Phase 4: Horizontal Pager and Input Verification Report

**Phase Goal:** Visitors move between the six full-screen pages sideways with any input device, one page at a time, and every page change is a real, shareable, accessible navigation.
**Verified:** 2026-11-09
**Status:** human_needed
**Re-verification:** No, initial verification

All five roadmap criteria are implemented and covered by automated tests that pass at HEAD. No code gap blocks the goal. Status is `human_needed` because plan 04-15 (real-device checks) was deliberately skipped, so the "verified on a Mac trackpad, Magic Mouse, Windows wheel, Linux touchpad, real iPhone Safari, LinkedIn in-app browser and Android" parts of criteria 1 and 2 cannot be claimed. The Firefox and WebKit pager specs have also never run.

## Goal Achievement

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | One wheel notch or trackpad flick moves exactly one page; momentum never skips | VERIFIED in code and synthetic traces; real hardware is HUMAN | `lib/pager/input/wheel.ts` is a pure FSM (gesture gap, discrete-notch detection, momentum decay, ctrl-pinch ignored, NaN guard). `components/shell/usePagerInput.ts` binds a non-passive window `wheel` listener and calls `preventDefault` only when the FSM says so. `tests/pager-wheel.test.ts` replays 5 JSON traces plus generated Mac-flick traces. `e2e/pager-wheel.spec.ts` passes in Chromium: notch pages and goes back, a continuous stream of small deltas moves one page, the last page is a no-op that is still prevented. The traces are deterministic synthetic or hand-authored (`tests/traces/synthetic.ts`, `*.json`), not recordings from a device. |
| 2 | Arrow keys, Page Up/Down, Space, Home/End page; phone swipe pages; left-edge swipe left to the system | VERIFIED in code and CDP touch tests; real devices are HUMAN | `lib/pager/input/keys.ts` and `bindKeys` handle all keys. Modifiers, text fields, `defaultPrevented` and Space on links/buttons are left to the browser, and the 600ms repeat gate is in the controller. `e2e/pager-keys.spec.ts` passes. `lib/pager/input/swipe.ts` has a 20px edge exclusion (`SWIPE_EDGE_PX`), a 12px axis lock, a 1.5 ratio and 48px or 24px plus velocity commit. `styles/base.css:126` sets `touch-action: pan-y pinch-zoom` and `overscroll-behavior-x: none`. `e2e/pager-swipe.spec.ts` (chromium-touch, 390x844) covers forward/back, edge start does nothing, vertical never pages, short swipes do nothing and the last page is a no-op. Whether the OS back gesture actually takes the edge swipe is a device behaviour. |
| 3 | Deep link lands on the page; URL updates on every page change; Back steps through visited pages | VERIFIED | `app/*/page.tsx` for all six routes statically exported (build output lists `/`, `/achievements`, `/experience`, `/projects`, `/say-hi` and `/about`). `lib/pager/history.ts` pushes only the six constant routes plus the query, once per landing, and sets `scrollRestoration = "manual"`. `usePagerNavigation.ts` intercepts only exact same-origin routes and handles popstate (unknown paths ignored; fragment-only popstate ignored per WR-04). `e2e/pager-history.spec.ts` passes: deep link per route with nothing animating, link then Back/Forward without a reload, one entry per landing, `?debug` survives, unknown path popstate ignored. |
| 4 | Every page fits one screen at 1366x768; at 200% zoom or on a short screen the page scrolls vertically and paging happens only at its edge | VERIFIED | `e2e/pager-overflow.spec.ts:143` asserts each of the six routes fits at 1366x768 with the pager on. At 683x384 (200% zoom equivalent) the Projects and Experience pages scroll first: a wheel scrolls, bottom momentum does not page, and a fresh edge gesture pages. Space and Page Down scroll before paging (`scrollStep`, `resolveScrollKey`). `lib/pager/input/edge.ts` picks the page scroller or the document scroller. A horizontal wheel mid-scroll pages at once. `e2e/no-scrollbar.spec.ts` (commit b811cee) covers the Index page. `onScroll` resets any horizontal document offset. |
| 5 | Keyboard and screen-reader users only reach the current page; focus moves to the new page heading; a live region announces the page | VERIFIED by automation; spoken output is HUMAN | `components/shell/PageSection.tsx` sets `inert` on every page that is not live (target or focus holder), `data-collapsed` at rest, and the heading level (h1 on the target, h2 otherwise). `lib/pager/focus.ts` focuses `#title-{slug}` with `preventScroll`. `LiveRegion.tsx` is `aria-live="polite"` with text from `liveRegionText`, empty on first load. `silenceNextAnnouncer` removes Next's route announcer. `e2e/pager-a11y.spec.ts` passes: one reachable page, focus on the title, announcement text, axe-clean per page in both motion modes and at phone size, ring follows input source, the riding hero row is unreachable by Tab. |

**Score:** 5/5 criteria implemented and automatically verified. The real-hardware, real-screen-reader and Firefox/WebKit parts remain human items (listed in the frontmatter).

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `lib/pager/state.ts`, `controller.ts`, `history.ts`, `focus.ts`, `scroll.ts`, `animator.ts`, `signals.ts` | VERIFIED | Substantive and wired. The controller takes injected ports, and the reducer is pure. The WR-02 fix (`startSlide(...).catch(...).then(landNow)`) is in place. |
| `lib/pager/input/wheel.ts`, `keys.ts`, `swipe.ts`, `edge.ts`, `normalize.ts` | VERIFIED | Pure recognisers used by `usePagerInput.ts` |
| `components/shell/PagerProvider.tsx`, `PagerContext.tsx`, `Track.tsx`, `PageSection.tsx`, `LiveRegion.tsx`, `Shell.tsx`, `usePagerInput.ts`, `usePagerNavigation.ts` | VERIFIED | All imported and used; the `?debug` overlay is a lazy chunk with the WR-03 `.catch` |
| `tests/pager-*.test.ts(x)`, `tests/traces/*`, `e2e/pager-*.spec.ts`, `e2e/helpers/pager.ts`, `e2e/no-scrollbar.spec.ts` | VERIFIED | Present, pass, and are assertion-bearing |
| `playwright.config.ts` firefox/webkit/touch projects | VERIFIED (config) | The touch project runs. Firefox/WebKit are gated by `ALL_BROWSERS=1` and CI sets it in the container. |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| `usePagerInput` | `controller.intent` | wheel, key, pointer handlers | WIRED |
| `controller.landNow` | history push, focus, live-region state, scroll reset | injected ports from `PagerProvider` | WIRED |
| `usePagerNavigation` | `controller.intent({source:"history"/"link"})` | popstate and click | WIRED |
| `PageSection` | pager state | `usePagerState` -> `inert`, `data-collapsed`, heading level | WIRED |
| `LiveRegion` | `state.announced` | `liveRegionText(announced)` | WIRED |

### Data-Flow Trace (Level 4)

| Artifact | Data | Source | Real data | Status |
|----------|------|--------|-----------|--------|
| `LiveRegion` | `announced` | set in `land()` from `target` | Yes | FLOWING |
| `PageSection` | `inert`, `data-collapsed` | reducer state | Yes | FLOWING |
| `Track`/animator | target offset | `state.target`, `window.innerWidth` | Yes | FLOWING |

### Behavioral Spot-Checks (run by this verifier at HEAD)

| Check | Result | Status |
|-------|--------|--------|
| `pnpm test` | 26 files, 453 tests passed | PASS |
| `pnpm typecheck` | clean | PASS |
| `pnpm lint` (max-warnings 0) | clean | PASS |
| `pnpm format:check` | clean | PASS |
| `pnpm build` | succeeded, static routes prerendered | PASS |
| `pnpm measure:js -- --max-gzip-kb 150` | 140.3 KB gzip (budget 150) | PASS |
| `pnpm test:e2e` against `out/` on port 4391 (`BASE_URL`) | 227 passed (Chromium, Chromium-touch, nojs) | PASS |

### Requirements Coverage

| Requirement | Plans | Status | Evidence |
|-------------|-------|--------|----------|
| NAV-01 | see plan frontmatter; 04-15 planned only | SATISFIED in code and synthetic traces; real hardware NEEDS HUMAN | See criterion 1. REQUIREMENTS.md leaves it unchecked, which is right until the device checks are done. |
| NAV-02 | see plan frontmatter | SATISFIED | `keyIntent` table, `pager-keys` unit and e2e. The box is unchecked in REQUIREMENTS.md; the evidence supports ticking it. |
| NAV-03 | see plan frontmatter; 04-15 planned only | SATISFIED in code and CDP touch tests; real devices NEED HUMAN | See criterion 2. Keep unchecked until the device pass. |
| NAV-04 | 04-08, 04-14 | SATISFIED | Fully automatable and covered by `pager-history.spec.ts`, `routes.spec.ts`, `layout.spec.ts` deep links. The tick in REQUIREMENTS.md is justified. Plan 04-14 itself was a label-kerning and baseline plan, so the tick was bundled with unrelated work; the evidence comes from the pager plans, not 04-14. |
| NAV-07 | 04-12, 04-14 | SATISFIED | 1366x768 fit for all six routes, scroll-first-then-page at 683x384, Index page without a scrollbar. The tick is justified. The same bundling remark applies. A real phone and real browser zoom were not checked. |
| A11Y-01 | see plan frontmatter | SATISFIED by automation; screen-reader pass NEEDS HUMAN | See criterion 5. Still unchecked in REQUIREMENTS.md; it can be ticked after the VoiceOver/NVDA check, or now if you accept axe and the focus/inert/live-region assertions. |

No orphaned requirements: REQUIREMENTS.md maps exactly NAV-01, NAV-02, NAV-03, NAV-04, NAV-07 and A11Y-01 to Phase 4, and all six appear in plan frontmatter. NAV-05 and NAV-06 belong to Phase 5.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `lib/pager/animator.ts:94` | Slide end uses `window.innerWidth` while the resting transform is `100vw` (IN-05) | Warning | May snap or mis-end under iOS pinch-zoom; needs a device check |
| `lib/pager/animator.ts:30-36` | `restingOffsetPx` is exported and tested but unused in production (IN-01) | Info | Drift risk |
| `lib/pager/input/wheel.ts:91-97` | `wheelDeltaY % 120` heuristic is not gated to Safari (IN-03) | Info | A Chromium 40/80/120px first delta can page a little early; still one page per gesture |
| duplicated constants for slide duration, repeat gate, page count (IN-02) | drift risk | Info | |
| `components/pages/Heading.tsx:39` `slug: string` (IN-04) | no type safety for heading ids | Info | |
| `content/projects.ts` "Showdown AI" row (IN-06) | content decision | Info | Honest wording; not a Phase 4 concern |

No blockers, TODO stubs or empty implementations found in the Phase 4 source. IN-01 through IN-06 remain open by decision.

### Plan 04-15 (not executed)

Plan 04-15 was not run. What was lost and what that means:

- Real-device checks: carried above as human items.
- Tuning folded back as trace-backed tests: nothing was tuned, so no change was made. All traces are synthetic.
- The `touch-action` fallback while `visualViewport.scale > 1` (Open Question 3) and `tests/pager-zoom.test.tsx` do not exist.
- Bookkeeping not done: WR-04, WR-06, WR-08 and IN-01 are still listed in `.planning/todos/pending/2026-11-07-carry-v7-review-warnings-into-build.md` (the code for WR-04 and the Space rule exists, but the todo was not updated); `04-VALIDATION.md` still reads `nyquist_compliant: false` and `wave_0_complete: false` with all rows pending, although the automated checks it lists are now green.
- The Phase 4 branch has no CI run in `gh run list`, so the pinned-container visual baselines and the Firefox/WebKit pager specs were not exercised by CI either.

None of these is a code defect, so they are not recorded as `gaps`. They are what separates `human_needed` from `passed`.

### Gaps Summary

No code gaps. The pager, input recognisers, history, scroll-edge rule, focus hand-off, inert handling and live region are all present, wired and covered by passing tests (453 unit, 227 e2e at HEAD, plus typecheck, lint, format, build and the JS budget). Remaining work is verification-only: the device and screen-reader checks above, a Firefox/WebKit CI run, and optional closure of the IN-0x items.

---

_Verified: 2026-11-09_
_Verifier: Claude (gsd-verifier)_
