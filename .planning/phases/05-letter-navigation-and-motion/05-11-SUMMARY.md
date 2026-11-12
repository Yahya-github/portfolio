---
phase: 05-letter-navigation-and-motion
plan: 11
subsystem: testing
tags: [playwright, reduced-motion, a11y, nav-05, feel-check, validation]
requires:
  - phase: 05-letter-navigation-and-motion
    provides: pager, opening, cursor, hint (05-07 to 05-10), hint/nudge gap closure (05-12)
provides:
  - Reduced-motion e2e spec covering opening, glide, nudge and cursor, including a live mid-flight switch
  - NAV-05 retarget and post-opening counter/Next/progress checks
  - Closed folded v7 review-warnings todo and filled validation map
  - Real-hardware feel approval by Yahya
affects: [phase-05 close, wheel-flake follow-up]
tech-stack:
  added: []
  patterns: ["page.emulateMedia reducedMotion for live switch tests"]
key-files:
  created:
    - e2e/reduced-motion.spec.ts
  modified:
    - e2e/pager-motion.spec.ts
    - .planning/phases/05-letter-navigation-and-motion/05-VALIDATION.md
    - .planning/phases/05-letter-navigation-and-motion/deferred-items.md
key-decisions:
  - "pager-wheel load-sensitive failure is logged as deferred and tracked as a follow-up gap, not fixed here"
requirements-completed: [A11Y-04, NAV-05, DSGN-04, LTR-03, EXP-01, EXP-03, NAV-06]
duration: multi-session
completed: 2026-11-10
---

# Phase 5 Plan 11: Reduced Motion, NAV-05 and Feel Check Summary

**Reduced-motion e2e across every Phase 5 animation, NAV-05 retarget checks, closed v7 todo, and Yahya's real-hardware approval after a hint/nudge gap-closure round.**

## Accomplishments
- `e2e/reduced-motion.spec.ts` (6 tests): opening, glide, hint nudge and cursor shape changes are instant under reduced motion; switching it on mid-flight snaps everything.
- `e2e/pager-motion.spec.ts`: 2 added NAV-05 tests (counter, Next and progress bar track the target through retargets and after the opening).
- Folded todo `2026-11-07-carry-v7-review-warnings-into-build` moved to `todos/done`; 05-VALIDATION.md map filled.
- Phone-scroll glide test (Pitfall 6) is skipped in 05-10 because the Index does not scroll at 390x844.

## Task Commits
1. Task 1: reduced-motion spec and NAV-05 checks: f9de7a6 (+ 77d14c0 lint/format)
2. Task 2: full gate, todo, validation map: fa8e888, 6c35c0e
3. Task 3: real-hardware feel check (checkpoint, no commit)

## Task 3: Feel check outcome
During the check Yahya first reported two issues, verbatim: "I don't even see where's the hint" and "I don't really see where's the nudging". These were recorded in 05-UAT.md, planned as gap plan 05-12, executed and merged (including the merge of worktree-agent-a53eaed2712b2f0c9). After 05-12 Yahya responded, verbatim: **"Ok its good"**. Asked whether that covered the whole check (opening, glide, rail, cursor, reduced motion, hint and nudge) or only hint and nudge, he chose "Everything is good".

## Verification
- Post-merge gate green: 530 unit tests, typecheck, lint, build, JS 143.3 KB gzip of 150.
- e2e on merged tree: 292 passed, 1 skipped, 1 failed. The failure is `e2e/pager-wheel.spec.ts:45` (load-sensitive wheel stream test, see deferred-items.md). Not resolved by this plan; Yahya chose to plan a fix now, tracked as a follow-up gap.
- Visual baselines were NOT regenerated after 05-12 (no container in this environment). `VISUAL=1` in the container remains to be run before phase close.

## Deviations from Plan
None in task scope. The feel check surfaced UAT gaps that were closed by plan 05-12 rather than inside this plan.

## Remaining before Phase 5 closes
- Wheel-flake fix plan (pager-wheel.spec.ts:45).
- Container visual baseline run (VISUAL=1) after 05-12.
- Code review and verifier.

## Self-Check: PASSED
