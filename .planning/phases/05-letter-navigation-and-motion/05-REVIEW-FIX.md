---
phase: 05
fixed_at: 2026-11-10
review_path: .planning/phases/05-letter-navigation-and-motion/05-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 2
skipped: 1
status: partial
---

# Phase 5: Code Review Fix Report

**Source review:** .planning/phases/05-letter-navigation-and-motion/05-REVIEW.md
**Iteration:** 1

## Fixed Issues

### WR-01: Cursor resnap/tag while pointer is outside the window

**Files modified:** `lib/cursor/mount.ts`, `e2e/cursor.spec.ts`
**Commit:** 85b9639
**Applied fix:** Added an `outside` flag (set on pointerleave, cleared on pointermove and on pointerenter when a position exists). `resnap` returns early when `!pos || outside`, and the scroll re-snap is skipped while outside. `paging = false` reset is kept, onEnter still does nothing before a real pointermove, and first-hover snap via pointerover is unchanged. Added e2e regression test: snap a letter, dispatch pointerleave, dispatch the glide-settled event, assert no `data-visible` on tag or root.

### WR-02: Opening click swallower cleanup

**Files modified:** `lib/first-visit/opening.ts`
**Commit:** bd755ff
**Applied fix:** Hoisted the swallower to `createOpening` scope with a single `cleanupSwallow()` (removes capture click listener, pointerup/pointercancel listeners, clears pending timeout). Called from `drop` (via the deferred timeout), `swallowClick`, `removeSkip` and `destroy`. Normal path unchanged: the click after the skipping pointerdown is swallowed once.

## Skipped Issues

### WR-03: Opening skipped by the 3000ms failsafe replays on next visit

**File:** `lib/first-visit/script.ts`, `lib/first-visit/opening.ts` (claim())
**Reason:** needs a product decision: should an opening skipped by the 3000ms failsafe replay on the next visit? Currently it replays; the finding proposes marking it seen. claim() behaviour left unchanged.

## Verification

vitest 530/530, typecheck, lint, format:check pass; e2e cursor + first-visit on chromium and chromium-touch: 24/24 pass.

---

_Fixer: Claude (gsd-code-fixer)_
