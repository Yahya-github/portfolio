---
status: diagnosed
phase: 05-letter-navigation-and-motion
source: [05-07-SUMMARY.md, 05-11 checkpoint (real-hardware feel check, still open)]
started: 2026-11-10T00:00:00Z
updated: 2026-11-10T12:00:00Z
---

## Current Test

number: 1
name: First-visit hint is noticeable
expected: |
  With yh-hint-seen cleared, the hint appears and a visitor notices it without hunting for it.
awaiting: gap plan (issue reported)

## Tests

### 1. First-visit hint is noticeable
expected: With `yh-hint-seen` deleted, opening /projects/ shows "Scroll or use the arrow keys" about 1.5s in, where a visitor looking at the page would notice it.
result: issue
reported: "I don't even see where's the hint"
severity: major
resolved_by: 05-12 (user re-check: "Ok its good")

### 2. Next link nudge is perceptible
expected: When the hint appears, the Next link visibly nudges once toward the hint's direction, so the eye is drawn to the Next control.
result: issue
reported: "I don't really see where's the nudging"
severity: major
resolved_by: 05-12 (user re-check: "Ok its good")

### 3. Opening (slide-in, click-to-skip, no replay on reload)
expected: Letters slide in from the right in under a second, then captions and chrome appear; a click skips to the end without navigating; a reload shows no opening.
result: pass
reported: \"Ok its good\" (user chose \"Everything is good\" for the whole feel check)

### 4. Letter glide (order, easing, no bounce, resize mid-glide)
expected: Letters slide left first then settle into the column; no bounce, nothing stranded, including fast double presses and resize mid-glide.
result: pass
reported: \"Ok its good\" (user chose \"Everything is good\" for the whole feel check)

### 5. Rail labels
expected: Hover and Tab across rail letters show the name to the right; only the current letter is green with its vertical numbered name.
result: pass
reported: \"Ok its good\" (user chose \"Everything is good\" for the whole feel check)

### 6. Custom cursor
expected: Dot sits on the pointer, square snaps to letters and links, tag never leaves the screen, snap drops while paging and returns after landing.
result: pass
reported: \"Ok its good\" (user chose \"Everything is good\" for the whole feel check)

### 7. Reduced motion
expected: With reduced motion on, paging, letters and opening are all instant.
result: pass
reported: \"Ok its good\" (user chose \"Everything is good\" for the whole feel check)

### 8. A continuous wheel stream moves exactly one page
expected: A continuous stream of small wheel deltas (one gesture) moves exactly one page, every run, in chromium and webkit.
result: issue
reported: "e2e/pager-wheel.spec.ts:45 fails in the full chromium run (3 occurrences) and in the container (chromium + webkit); 5 of 12 with --repeat-each=12; page lands on /projects/ instead of /achievements/. Passed 36/36 before Phase 5 (parent of 8cb24b4). User chose: plan a fix now."
severity: major

## Summary

total: 8
passed: 5
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

<!-- YAML format for plan-phase --gaps consumption -->
- truth: "With yh-hint-seen cleared, the first-visit hint is noticed by a visitor without hunting for it."
  status: failed
  reason: "User reported: I don't even see where's the hint"
  severity: major
  test: 1
  root_cause: "Diagnosed by orchestrator (2026-11-10): hint renders (opacity 1, data-state=shown) but is 12px grey rgb(142,142,142) uppercase in the far bottom-right footer corner next to 'NEXT, EXPERIENCE', far from the content/letters where attention is. components/frame/useHint.ts calls markSeen(HINT_KEY) at show time, so a visitor who looked away, or any reload after first show, never sees it again; it also ends on first slide start."
  artifacts:
    - components/frame/useHint.ts
    - components/frame/Footer.tsx
    - components/frame/frame.module.css
    - lib/first-visit/hint.ts
    - lib/first-visit/storage.ts
    - e2e/first-visit-hint.spec.ts
    - .planning/phases/05-letter-navigation-and-motion/05-UI-SPEC.md
  missing:
    - "Hint text uses ink colour and a larger size (contrast and size asserted in e2e)."
    - "Hint sits closer to where the eye is (planner discretion on exact placement; default recommendation: footer centre between counter and Next on desktop, keep the one-line no-overlap rule on phone)."
    - "markSeen is written only once the visitor actually pages (or the hint has stayed visible for a few seconds), not at appearance; reload before first paging still shows it."
    - "e2e: a reload before first paging still shows the hint."
  debug_session: ""
- truth: "When the hint appears, the Next link nudge is perceptible."
  status: failed
  reason: "User reported: I don't really see where's the nudging"
  severity: major
  test: 2
  root_cause: "Diagnosed by orchestrator (2026-11-10): nudge runs but measures 3.8-4px of travel (NUDGE_PX=4, NUDGE_MS=300, once) per UI-SPEC row 'Nudge', and it fires at the same moment the hint fades in (150ms), so it is lost. The existing e2e only asserts getAnimations().length > 0, never visible displacement."
  artifacts:
    - components/frame/useHint.ts
    - e2e/first-visit-hint.spec.ts
    - .planning/phases/05-letter-navigation-and-motion/05-UI-SPEC.md
  missing:
    - "Travel of about 10-12px on X only, two pulses with a short pause, starting about 200ms after the hint appears; still skipped under reduced motion; no overshoot past the start position."
    - "e2e asserts the Next link's x position changes by more than a stated threshold during the nudge and returns to rest."
    - "UI-SPEC 'Nudge' and 'Hint' rows updated to match."
  debug_session: ""
- truth: "A continuous stream of small wheel deltas moves exactly one page, deterministically."
  status: failed
  reason: "Test 1/12-repeat failure rate observed after Phase 5; see deferred-items.md. Passed 36/36 on the parent of 8cb24b4."
  severity: major
  test: 8
  root_cause: "UNCONFIRMED hypothesis (05-11 agent): Phase 5 made the first slide heavier, so Playwright's 12 wheel events sometimes gap more than GESTURE_GAP_MS (160) and the tail counts as a second gesture. Not caused by the cursor chunk. Could be a test-only timing artefact OR a real double page jump for wheel users; the plan must diagnose which before choosing a fix."
  artifacts:
    - e2e/pager-wheel.spec.ts
    - lib/pager/wheel.ts
    - lib/pager/controller.ts
    - components/letters/useGlide.ts
    - lib/letters/glide.ts
    - .planning/phases/05-letter-navigation-and-motion/deferred-items.md
  missing:
    - "Diagnosis: reproduce with the 12 wheel deltas dispatched in one page.evaluate (removes Playwright inter-event latency). If it still double-pages, it is a real pager/glide regression: fix the product code. If it passes deterministically, the failure was test-side latency: harden the test."
    - "Result is deterministic: --repeat-each=36 under parallel load passes 36/36 on chromium (and webkit if available)."
    - "deferred-items.md entry closed with the diagnosis."
  debug_session: ""
