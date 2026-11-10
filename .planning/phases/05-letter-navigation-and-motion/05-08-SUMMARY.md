---
phase: 05-letter-navigation-and-motion
plan: 08
subsystem: cursor
tags: [cursor, lazy-import, playwright, pointer-events]
requires: ["05-01", "05-02", "05-03", "05-04"]
provides:
  - "lib/cursor/mount.ts mountCursor(signals): React-free imperative cursor"
  - "PagerProvider lazy import gated on fine pointer and not forced colours"
  - "Resume link data-cursor-tag"
  - "e2e/cursor.spec.ts (11 tests)"
affects: []
key-files:
  created:
    - lib/cursor/mount.ts
    - e2e/cursor.spec.ts
  modified:
    - components/shell/PagerProvider.tsx
    - components/frame/Header.tsx
requirements-completed: [EXP-03, LTR-04]
metrics:
  tasks: 2
  completed: 2026-11-09
---

# Phase 5 Plan 08: Custom cursor mount Summary

A lazily imported, React-free cursor: 4px dot on the pointer, 16px difference-blend square that snaps to links, buttons and letters with a tag from `data-cursor-tag`. It releases on paging and re-snaps after landing and glide settle. It is loaded only for hover and fine-pointer devices outside forced colours.

## Commits
- 8a4f59f: mountCursor
- fd84fa6: provider lazy load and Resume tag
- Final commit: e2e spec plus first-hover snap fix

## Deviations from Plan
- **[Rule 1 - Bug]** `pointerover` fires before the first `pointermove`, so the plan's `if (paging || !pos) return` blocked the first snap. Now only `paging` and touch block it. The root stays invisible until the first move, so WR-05/WR-07 hold.
- Snap geometry assertion in e2e polls the final box, since hairlines finish their 150ms transition just after `data-snapping` clears.
- A repo hook blocks `--no-verify`, so commits ran with hooks. No Co-Authored-By trailer, per the user's rule.
- The worktree was hard-reset to the specified base first, as instructed.

## Verification
- vitest 527/527, typecheck and lint clean, `grep innerHTML|requestAnimationFrame` on mount.ts is empty.
- `playwright test e2e/cursor.spec.ts`: 11/11. Full chromium suite 207 passed; one wheel test (`pager-wheel.spec.ts:45`) failed once under full-suite load and passed in two isolated reruns (4/4). Unrelated to this plan.
- JS budget: 141.4 KB gzip (limit 150); the cursor code is not in the initial scripts (test k).

## Known Stubs
None.

## Self-Check: PASSED
