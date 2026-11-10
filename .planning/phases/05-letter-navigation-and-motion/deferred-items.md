# Deferred items (Phase 5)

## pager-wheel "a continuous stream of small deltas moves exactly one page" is load-sensitive in the CI image

- Found in plan 05-11 container run (mcr.microsoft.com/playwright:v1.65.0-noble, VISUAL=1 ALL_BROWSERS=1, full suite): fails in chromium and webkit (2 of 343); passes in isolation (host and container) and in later container reruns about half the time.
- Pre-Phase-5 code (parent of 8cb24b4) passed 36/36 with the same repeat run, so Phase 5 raised the cost of the first slide enough that Playwright's 12 wheel events sometimes gap more than GESTURE_GAP_MS (160) and the tail counts as a second gesture (page lands on /projects/).
- Not caused by the cursor chunk (disabling it did not remove the webkit failures).
- Suggested follow-up: make the test's stream robust (dispatch the 12 deltas inside one page.evaluate with dispatchEvent) or raise the gap margin; CI retries: 1 may mask it.
