# Deferred items (Phase 5)

## CLOSED (05-13): pager-wheel "a continuous stream of small deltas moves exactly one page" is load-sensitive in the CI image

- Found in plan 05-11 container run (mcr.microsoft.com/playwright:v1.65.0-noble, VISUAL=1 ALL_BROWSERS=1, full suite): fails in chromium and webkit (2 of 343); passes in isolation (host and container) and in later container reruns about half the time.
- Pre-Phase-5 code (parent of 8cb24b4) passed 36/36 with the same repeat run, so Phase 5 raised the cost of the first slide enough that Playwright's 12 wheel events sometimes gap more than GESTURE_GAP_MS (160) and the tail counts as a second gesture (page lands on /projects/).
- Not caused by the cursor chunk (disabling it did not remove the webkit failures).
- Suggested follow-up: done in 05-13 (dispatch the 12 deltas inside one page.evaluate with dispatchEvent).

### Diagnosis (05-13, 2026-11-10) - initial run STOPPED: ESCAPE-NOREPRO (superseded below)

Host: Fedora, Chromium only, serving this worktree's out/ on port 4414. Stream of 12 events, deltaY 40. Run a = idle, `--repeat-each=12 --workers=1`. Run b = load, `--repeat-each=36 --workers=4`.

| mode | run | double pages / runs | maxGap ms (median / max) | handlerMs (median / max) | max longtask ms |
|---|---|---|---|---|---|
| playwright (M1) | a | 0 / 12 | 80.5 / 91 | 10 / 15 | 0 |
| playwright (M1) | b | 0 / 36 | 86 / 137 | 11 / 19 | 0 |
| prebuilt (M2) | a | 0 / 12 | 0 / 0 | 9 / 11 | 0 |
| prebuilt (M2) | b | 0 / 36 | 0 / 0 | 10 / 20 | 0 |
| timer16 (M3) | a | 0 / 12 | 25.5 / 27 | 9 / 10 | 0 |
| timer16 (M3) | b | 0 / 36 | 27 / 35 | 11 / 19 | 0 |
| cost (M4) | a | 0 / 12 | n/a | 9 / 9 | 0 |
| cost (M4) | b | 0 / 36 | n/a | 10 / 19 | 0 |

M4 handler cost: median 10 ms, max 20 ms vs GESTURE_GAP_MS 160 ms (below threshold)

Bisect: not run (decision rule stopped at step 2; the bisect does not feed the rule).

Outcome: ESCAPE-NOREPRO (rule step 2). M1 never double-paged in the 36 loaded runs, and the worst Playwright inter-event gap was 137 ms, under 160. The failure does not reproduce on this host, so no Branch line is written and no product or test code was changed. On this host the slide-start handler costs about 10 ms, far from 160 ms, which contradicts the 05-11 hypothesis for this environment. The failure was observed only in the CI image container (mcr.microsoft.com/playwright:v1.65.0-noble). Suggested next step: rerun this same diagnosis inside that container (docker/podman not tried here).

#### Diagnosis addendum (05-13, orchestrator reproduction under load)

The earlier ESCAPE-NOREPRO stop was caused by testing at 4 Playwright workers only, which is below the load where the failure appears. The evidence below was gathered by the orchestrator on the merged main tree (chromium, built out/ served on 4415, 12 events of deltaY 40, then wait for landing + 600ms), not by Task 1's temporary spec.

M1 (current test, Playwright page.mouse.wheel loop at e2e/pager-wheel.spec.ts:45), `--repeat-each=36`:

| workers | failed / 36 |
|---|---|
| 4 | 0 |
| 12 (machine default, 24 cores) | 11 |
| 24 | 27 |

Failure = page lands on /projects/ (two pages).

In-page dispatch at workers=24, `--repeat-each=60` each:

| mode | double pages / 60 | timestamp maxGap |
|---|---|---|
| prebuilt (M2: 12 WheelEvents created first, dispatched back-to-back on document.elementFromPoint(720,450)) | 0 (60/60 landed exactly +1 page) | 0-1 ms |
| timer16 (M3: create + dispatch one event every 16 ms) | 0 (60/60 landed exactly +1 page) | never over 160 ms (max about 83 ms) |

M4 handler cost (earlier diagnosis): median 10 ms, max 20 ms vs GESTURE_GAP_MS 160 ms (below threshold).

M1 reproduces under load while M2 and M3 never double-page, and no ESCAPE condition holds.

Branch: TEST

No product code changes (nothing under lib/ or components/ in any 05-13 commit).

### Resolution (05-13)

Root cause: Playwright's `page.mouse.wheel` creates wheel event N+1 only after event N is acked, so under heavy parallel load (12 or more workers) the ack latency pushed timeStamp gaps past GESTURE_GAP_MS (160 ms) and the tail opened a second gesture. Pre-built and 16 ms-timer in-page streams never split (0/60 each at 24 workers), so the recogniser is correct and the product was left alone.

Branch: TEST. Changed only `e2e/pager-wheel.spec.ts`: added `dispatchWheelStream` (pre-built in-page WheelEvents) and used it in the unchanged-name, unchanged-assertion test. No lib/ or components/ change.

Results (chromium, built out/ on port 4414), "a continuous stream" test at `--repeat-each=36`:

| workers | passed |
|---|---|
| 4 | 36/36 |
| 12 | 36/36 |
| 24 | 36/36 |

Whole pager-wheel.spec.ts at `--repeat-each=36 --workers=24`: 144/144. Sibling pager specs at `--repeat-each=12 --workers=4`: pager-swipe (chromium-touch) 72/72; pager-overflow + pager-keys (chromium) 192/192.

Webkit / CI container: not run (no container runtime tried; CI container covers it). VISUAL=1 not run.

Full default e2e suite (chromium, chromium-nojs, chromium-touch): 293 passed, 1 skipped, 0 failed (the known pager-motion "switching reduced motion mid-session" flake did not appear this run). `vitest run`: 530/530. lint and typecheck clean. `measure:js`: / is 143.3 gzip KB (budget 150).

Unrelated pre-existing issue found, not fixed (out of scope, none of these files touched by 05-13): `pnpm format:check` reports Prettier warnings in e2e/first-visit-hint.spec.ts, e2e/first-visit.spec.ts, e2e/helpers/first-visit.ts, e2e/helpers/letters.ts, lib/first-visit/hint.ts, lib/first-visit/opening-rules.ts, lib/letters/glide.ts. e2e/pager-wheel.spec.ts is Prettier-clean.
