---
status: partial
phase: 04-horizontal-pager-and-input
source: [04-VERIFICATION.md]
started: 2026-11-10T01:46:38Z
updated: 2026-11-10T01:46:38Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Mac trackpad (Safari and Chrome): one flick, then a long hard flick with momentum, on every page
expected: Each flick moves exactly one page, momentum never skips a page, and the horizontal swipe never triggers browser Back/Forward
why_human: Real inertia curves cannot be reproduced headless. The tests use deterministic synthetic traces, not recordings from a device.
result: [pending]

### 2. Magic Mouse (Safari, Chrome): scroll sideways and vertically
expected: One gesture is one page; no history swipe; no double page
why_human: Real hardware
result: [pending]

### 3. Windows mouse wheel (Chrome, Edge, Firefox): single notches and fast multi-notch spins
expected: One notch is one page; a fast spin pages once per notch and never overshoots
why_human: Real hardware. Only a hand-written Windows Chrome trace exists, and D-13 already notes a recording gap here.
result: [pending]

### 4. Linux touchpad (Firefox and Chrome)
expected: A two-finger flick is one page with no skip. Sideways swipes do not trigger Back/Forward.
why_human: Real hardware
result: [pending]

### 5. iPhone Safari and the LinkedIn in-app browser: swipe left/right, vertical scroll, swipe from the left edge
expected: A horizontal swipe pages; vertical scroll never pages; an edge swipe goes to the system back gesture; the footer stays visible above the address bar
why_human: Real touch and OS gestures. The 20px edge exclusion is only a guard; whether the OS back gesture takes over is a device behaviour.
result: [pending]

### 6. Android Chrome: swipe, vertical scroll, edge swipe
expected: Same as iPhone
why_human: Real device
result: [pending]

### 7. iOS Safari pinch-zoom, then swipe and pan (IN-05, plan 04-15 Open Question 3)
expected: A pinch-zoomed page can pan sideways without paging; a slide ends at the same offset as the CSS resting position (the animator uses window.innerWidth, the resting transform uses 100vw)
why_human: visualViewport and innerWidth behaviour under pinch-zoom differs by engine and cannot be run here. No fallback to touch-action:auto was built.
result: [pending]

### 8. VoiceOver (Safari) and NVDA (Firefox/Chrome): page with keyboard and links, then Back
expected: One announcement per page change, naming the correct page, including after Back; focus lands on the page heading; Tab/virtual cursor never reach inactive pages
why_human: Automated tests assert the live-region text, the focus target and inert, but not what a screen reader actually speaks.
result: [pending]

### 9. Firefox and WebKit pager specs (ALL_BROWSERS=1, in the Playwright container or on a CI PR run)
expected: e2e/pager-wheel, pager-keys and pager-history pass in Firefox and WebKit
why_human: This host has Chromium only. The Phase 4 branch has no CI run yet, so these two engines have never run the pager specs.
result: [pending]

### 10. WR-02 (slide ends without a newer slide) and WR-04 (fragment popstate mid-slide), exercised by hand
expected: Page quickly with arrows and click the skip link mid-slide: no reversal, no stuck 'sliding' state, one history entry per landing
why_human: 04-REVIEW-FIX.md flags both as 'requires human verification'. Unit tests and the full e2e suite pass, but the race windows are small.
result: [pending]

## Summary

total: 10
passed: 0
issues: 0
pending: 10
skipped: 0
blocked: 0

## Gaps
