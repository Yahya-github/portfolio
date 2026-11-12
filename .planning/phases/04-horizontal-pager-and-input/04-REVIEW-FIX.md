---
phase: 04-horizontal-pager-and-input
fixed_at: 2026-11-09T20:40:00Z
review_path: .planning/phases/04-horizontal-pager-and-input/04-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 4: Code Review Fix Report

**Fixed at:** 2026-11-09
**Source review:** .planning/phases/04-horizontal-pager-and-input/04-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### WR-01: `settle()` / `cancelAll()` cancels the CSS `rail-in` fade on the letters nav

**Files modified:** `lib/pager/animator.ts`, `tests/pager-dom.test.ts`, `e2e/pager-motion.spec.ts`
**Commit:** 0ee0d5c
**Applied fix:** `cancelOn` now skips `CSSAnimation` and `CSSTransition` instances returned by `getAnimations()`, so only WAAPI slide animations are cancelled. Added a unit test (CSS stubs survive `settle`) and a Chromium e2e that records `animationstart`/`animationcancel`/`animationend` for `rail-in` on a landing off 00. The e2e was confirmed to fail without the fix (`animationcancel` instead of start+end) and pass with it.

### WR-02: Controller can strand in `sliding` when a slide ends without a newer slide

**Files modified:** `lib/pager/controller.ts`, `tests/pager-controller.test.ts`
**Commit:** 1d3b794
**Applied fix:** The slide chain is now `startSlide(...).catch(() => false).then(() => { if (state.slideId === id) landNow(); })`. `startSlide` turns a synchronous throw from `animator.slideTo` into a rejection. A cancelled, rejected or throwing slide that was not superseded now converges on the target, and a superseded slide is still ignored by id. The old test "never lands when the slide is cancelled" encoded the stranding behaviour, so it was rewritten. New tests cover abandoned slide, superseded cancelled slide, rejected promise and synchronous throw.
**Status note:** fixed: requires human verification (controller state-handling logic; unit and full e2e suites pass).

### WR-03: Dynamic import of the debug overlay has no rejection handler

**Files modified:** `components/shell/PagerProvider.tsx`, `tests/pager-debug-import.test.tsx` (new)
**Commit:** a17b03b
**Applied fix:** Added `.catch(() => {})` (with a comment) to the `import("./DebugOverlay")` chain. The new test mocks the overlay module to throw, renders the shell with `?debug` and asserts no `unhandledRejection`; it failed before the fix.

### WR-04: A `popstate` during a slide can retarget the pager back to the page it is leaving

**Files modified:** `components/shell/usePagerNavigation.ts`, `tests/pager-shell.test.tsx`
**Commit:** c6872f5
**Applied fix:** The handler tracks the last-seen pathname (initial load, each landing via `signals.onLanded`, and each handled popstate) and returns early when a popstate leaves the pathname unchanged (fragment navigation). Updating on every handled popstate, not only on landing, keeps a real Back then Forward to the origin page mid-slide working. Added a regression test for the mid-slide fragment popstate (failed before the fix) and a test that Back to the origin mid-slide still works.
**Status note:** fixed: requires human verification (popstate state-handling logic; unit and full e2e suites pass).

## Verification

- `pnpm test`: 26 files, 453 tests passed
- `pnpm typecheck`: clean
- `pnpm lint`: clean (max-warnings 0)
- `pnpm format:check`: clean
- `pnpm build`: succeeded
- `pnpm test:e2e`: 227 passed (chromium projects; port 4173 was free)

`.planning/config.json` and `CLAUDE.md` were left untouched and unstaged.

---

_Fixed: 2026-11-09_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
