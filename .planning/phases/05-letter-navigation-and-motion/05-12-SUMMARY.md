---
phase: 05-letter-navigation-and-motion
plan: 12
subsystem: ui
tags: [first-visit-hint, nudge, footer, waapi, uat-gap-closure]
requires:
  - phase: 05-letter-navigation-and-motion
    provides: hint machine, useHint hook, footer (05-07)
provides:
  - Ink 16px hint centred in the footer (desktop) and between counter and Next (phone)
  - Seen rule: yh-hint-seen written only on paging or after 3000ms visible
  - Two-pulse 12px Next nudge 200ms after the hint shows
affects: [05-11 real-hardware checkpoint, UAT tests 1 and 2]
key-files:
  modified:
    - lib/first-visit/hint.ts
    - tests/first-visit-hint.test.ts
    - components/frame/useHint.ts
    - components/frame/Footer.tsx
    - components/frame/frame.module.css
    - e2e/first-visit-hint.spec.ts
    - e2e/first-visit.spec.ts
    - .planning/phases/05-letter-navigation-and-motion/05-UI-SPEC.md
key-decisions:
  - "Phone hint stays 16px: it fits on all six routes, so no font-size: inherit fallback was needed"
requirements-completed: [NAV-06, NAV-05]
duration: ~35min
completed: 2026-11-10
---

# Phase 5 Plan 12: Hint and Nudge Gap Closure Summary

Closes UAT gaps 1 and 2: the first-visit hint is now ink 16px and centred, is remembered only after paging or 3s visible, and Next pulses twice by 12px 200ms after the hint appears.

## Commits
- test: failing tests for seen rule and nudge keyframes (RED)
- feat: hint seen rule and two-pulse nudge keyframes (GREEN, `lib/first-visit/hint.ts`)
- feat: ink 16px centred hint, seen-on-transition, two-pulse 12px nudge (hook, Footer, CSS)
- test: hint e2e rewrite, first-visit.spec.ts assertion update, UI-SPEC rows

(Run `git log --oneline -5` for hashes.)

## Phone fit check (390x844)
Measured with the hint shown (data-state="shown") on all six routes, 16px, rgb(240,240,240), scrollWidth == clientWidth (fits, one line):

| Route | Next label | Hint slot width (px) |
|---|---|---|
| / | Next, Achievements (longest) | 150 |
| /achievements/ | Next, Projects | 186 |
| /projects/ | Next, Experience | 171 |
| /experience/ | Next, About | 205 |
| /about/ | Next, Say hi | 210 |
| /say-hi/ | Back to the start | 163 |

Chosen phone size: 16px (no `font-size: inherit` override). The tightest case is `/` (150px slot); it fits but with little margin, the e2e now asserts the fit on every route.

## Verification
- `pnpm typecheck`, `pnpm lint`: clean. `pnpm exec vitest run`: 32 files, 530 tests pass.
- Playwright (port 4412, chromium + chromium-touch): first-visit-hint, first-visit, reduced-motion, layout, a11y specs all pass (129 + 12 re-run after fix).
- `pnpm measure:js -- --max-gzip-kb 150`: route `/` gzip 143.3 KB (raw 477 KB, brotli 122.5 KB), under the 150 KB budget.
- Visual spec (VISUAL=1): not run, no container. No snapshots touched.
- Known flakes (pager-motion mid-session, pager-wheel:45) not seen.

## Deviations from Plan
**1. [Rule 1 - Bug] `e2e/first-visit.spec.ts` "the hint follows the opening" asserted the old write-at-show behaviour**
- Fix: now asserts storage is null at show, then polls to "1" after 3s.
- Not a 05-11 file.

**2. [Rule 3] Nudge test used `toBe(920)`** but `getComputedTiming().endTime` is 919.9999999999999; changed to `toBeCloseTo(920, 3)`.

**3. Phone e2e for `/`** seeds the opening-seen key via init script, because the home route otherwise runs the opening and delays the hint beyond the fake-clock window. The phone test also now loops over all six routes (plan asked for the longest label).

## Notes
- Worktree base was reset to d1234a7 as instructed.
- No edits to STATE.md, ROADMAP.md, CLAUDE.md or any 05-11 file.

## Self-Check: PASSED
