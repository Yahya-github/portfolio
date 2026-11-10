---
phase: 05-letter-navigation-and-motion
reviewed: 2026-11-10T00:00:00Z
depth: standard
files_in_scope: 57
files_reviewed: 12
coverage: partial
files_reviewed_list:
  - app/layout.tsx
  - lib/first-visit/storage.ts
  - lib/first-visit/opening.ts
  - lib/first-visit/hint.ts
  - lib/first-visit/script.ts
  - lib/cursor/mount.ts
  - lib/letters/glide.ts
  - lib/motion/waapi.ts
  - components/letters/useGlide.ts
  - components/frame/useHint.ts
  - vercel.json
  - lib/js-flag.ts
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 5 Code Review

**Scope honesty:** 57 source files changed in Phase 5 (`git diff 8cb24b4^..HEAD`, excluding `.planning/`). The reviewer read the 12 files above in full and only excerpts of `styles/tokens.css`, `styles/base.css`, `lib/first-visit/opening-rules.ts` and the PagerProvider cursor gating. The remaining files, including all unit tests, were NOT reviewed (only a `waitForTimeout` grep over the e2e specs). Treat this as a partial review of the highest-risk files (inline script, storage, opening, hint, cursor, glide), not a full pass. A deeper pass over the pager core (`lib/pager/*`), `LetterNav.tsx`, `PagerProvider.tsx` and the tests is still open.

Orchestrator spot-check (2026-11-10) read `lib/cursor/mount.ts` and `lib/first-visit/opening.ts` against WR-01..03; notes inline.

## Critical Issues

None. The inline script is safe: `OPENING_SCRIPT` interpolates only `JSON.stringify` of a build-time constant key and a numeric constant. Storage access is wrapped in try/catch and the value is only compared to `null`, never parsed. There is no injection path.

## Warnings

### WR-01: Cursor tag and box can reappear while the pointer is outside the window
**File:** `lib/cursor/mount.ts:109-114, 147-153`
**Status (spot-check): CONFIRMED.** `onLeave` hides the root and tag but leaves `pos` set; `resnap()` only guards `if (!pos) return`, then calls `setTarget` -> `showTagFor` from the stale position after a landing or `GLIDE_SETTLED_EVENT`. The tag is a separate element from the root, so root visibility does not hide it.
**Fix:** Track `inside` (set in `onEnter`/`onPointerMove`, cleared in `onLeave`) and make `resnap` return early when `!pos || !inside`, or set `pos = null` in `onLeave` and re-arm on the next move.

### WR-02: Opening click-swallow listeners can outlive the opening
**File:** `lib/first-visit/opening.ts:86-105`
**Status (spot-check): PARTLY CONFIRMED, LOW IMPACT (treat as info).** `swallowClick` removes itself on the first click and `drop` removes it after `pointerup`/`pointercancel`, so the normal path is clean. Real gaps: `removeSkip`/`destroy` do not remove the swallower, so an unmount between pointerdown and pointerup leaves it installed until the next click (it eats that one click); and the unfired one of the `once` pointerup/pointercancel pair stays registered (harmless, it later removes an already-removed listener); the `setTimeout` is not tracked.
**Fix:** One `cleanupSwallow()` that removes the click, pointerup and pointercancel listeners and clears the timeout; call it from `removeSkip`, `destroy` and `drop`.

### WR-03: Failsafe in the inline script can leave the opening unrecorded
**File:** `lib/first-visit/script.ts:11`, `lib/first-visit/opening.ts:173-183`
**Status (spot-check): CONFIRMED, behaviour question.** If the bundle claims the opening after the 3000ms failsafe, `data-opening` is already gone, so `claim()` takes the non-pending branch, which writes `OPENING_KEY` only when the pointer is fine and reduced motion is on. The opening was never shown, the key stays unseen (so it plays on the next visit, which may even be desirable), `OPENING_DONE_EVENT` is never dispatched, and `useHint` reads `dataset.opening === undefined`, so the hint shows 1.5s after load.
**Fix (if the replay is not wanted):** in the non-pending, non-reduced branch call `markSeen(OPENING_KEY)` when `location.pathname === "/"` and the key is unseen. Decide first whether a failsafe-skipped opening should replay.

## Info

### IN-01: CSP relies on `script-src 'unsafe-inline'`
**File:** `vercel.json:8`
The inline scripts work, but `'unsafe-inline'` negates most XSS protection. They are build-time constants and could be hashed (`'sha256-...'`), but Next's own inline bootstrap scripts need handling too, so this is a larger change. Fine to defer for a static site with no user input.

### IN-02: React StrictMode dev double-mount skips the opening
**File:** `components/letters/useGlide.ts:9-51`, `lib/first-visit/opening.ts:209-211`
In dev, the first effect's cleanup calls `opening.destroy()`, which runs `done()`, deletes `data-opening` and writes the seen key, so the second effect never plays the opening. Production is unaffected. Optional: make `destroy` skip marking seen, or comment the quirk.

### IN-03: Hint text and state are not reset on effect cleanup
**File:** `components/frame/useHint.ts:110-116`
Cleanup cancels the nudge and timers but leaves `hint.textContent` and `data-state`. If the effect re-runs (controller null -> value) stale text can linger until the new state machine reaches `shown`. Fix: in cleanup set `hint.dataset.state = "done"` and `hint.textContent = ""`.

### IN-04: Test-timing concern in e2e
**File:** `e2e/first-visit-hint.spec.ts:149`
A hard `waitForTimeout(1000)` after the 920ms nudge is a wall-clock wait and can be flaky on slow CI. Wait on `nudge.finished` via `page.evaluate`, or `expect.poll` on `getAnimations().length === 0`. (The `GESTURE_GAP_WAIT_MS` waits in the wheel/a11y specs are intentional.)

## Checked and clean

- Never-throwing storage: `safeGet`/`safeSet` catch everything; the `undefined` "unavailable" state is handled in `useHint` (one show per load).
- Cursor gating: `cursor: none` only under `(hover: hover) and (pointer: fine) and (forced-colors: none)` and only once `html[data-cursor]` is set on the first non-touch move; touch pointerdown removes it; PagerProvider mounts the cursor only for fine pointers outside forced colors. Keyboard-only and touch users keep the native cursor.
- Cursor listeners, the snap timer and DOM nodes are removed on cleanup; the tag uses `textContent` only.
- Reduced motion: `--dur-*` tokens zeroed; the glide and opening check both `isReduced()` and the media query; the inline script skips the pending state under reduced motion.
- WAAPI: the glide uses `flightId` to ignore stale `finished` promises after retarget/cancel; the opening's `finish()` guards `a.finish()` with try/catch.
- Hydration: `<html>` has `suppressHydrationWarning` for the `data-js`/`data-opening` attributes set before React runs.
