---
status: partial
phase: 05-letter-navigation-and-motion
source: [05-VERIFICATION.md]
started: 2026-11-10T13:00:00Z
updated: 2026-11-10T13:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Visual baselines after the 05-12 hint/footer change
expected: In the Playwright container, `VISUAL=1 pnpm exec playwright test e2e/visual.spec.ts` matches the baselines, or the baselines are intentionally regenerated because the 05-12 hint/footer change moved pixels.
result: [pending]

### 2. Non-chromium browsers (webkit, firefox) in the container
expected: `ALL_BROWSERS=1` run of pager-wheel, letters-glide, cursor and first-visit passes, in particular the hardened wheel-stream test at e2e/pager-wheel.spec.ts in webkit.
result: [pending]

### 3. Phone glide from a scrolled Index (Pitfall 6)
expected: On a real phone, scroll the Index partway then swipe to the next page; the letters start the glide with no jump.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
