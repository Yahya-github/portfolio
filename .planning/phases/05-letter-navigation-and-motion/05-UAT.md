---
status: partial
phase: 05-letter-navigation-and-motion
source: [05-07-SUMMARY.md, 05-11 checkpoint (real-hardware feel check, still open)]
started: 2026-11-10T00:00:00Z
updated: 2026-11-10T00:00:00Z
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

### 2. Next link nudge is perceptible
expected: When the hint appears, the Next link visibly nudges once toward the hint's direction, so the eye is drawn to the Next control.
result: issue
reported: "I don't really see where's the nudging"
severity: major

### 3. Opening (slide-in, click-to-skip, no replay on reload)
expected: Letters slide in from the right in under a second, then captions and chrome appear; a click skips to the end without navigating; a reload shows no opening.
result: [pending]

### 4. Letter glide (order, easing, no bounce, resize mid-glide)
expected: Letters slide left first then settle into the column; no bounce, nothing stranded, including fast double presses and resize mid-glide.
result: [pending]

### 5. Rail labels
expected: Hover and Tab across rail letters show the name to the right; only the current letter is green with its vertical numbered name.
result: [pending]

### 6. Custom cursor
expected: Dot sits on the pointer, square snaps to letters and links, tag never leaves the screen, snap drops while paging and returns after landing.
result: [pending]

### 7. Reduced motion
expected: With reduced motion on, paging, letters and opening are all instant.
result: [pending]

## Summary

total: 7
passed: 0
issues: 2
pending: 5
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
