---
phase: 04-horizontal-pager-and-input
reviewed: 2026-11-09T00:00:00Z
depth: standard
files_reviewed: 87
files_reviewed_list:
  - app/layout.tsx
  - components/frame/Footer.tsx
  - components/frame/Header.tsx
  - components/letters/LetterNav.tsx
  - components/letters/letters.module.css
  - components/pages/AboutPage.tsx
  - components/pages/AchievementsPage.tsx
  - components/pages/ExperiencePage.tsx
  - components/pages/Heading.tsx
  - components/pages/IndexPage.tsx
  - components/pages/PageLevel.tsx
  - components/pages/ProjectsPage.tsx
  - components/pages/SayHiPage.tsx
  - components/pages/types.ts
  - components/shell/debug.module.css
  - components/shell/DebugOverlay.tsx
  - components/shell/LiveRegion.tsx
  - components/shell/PagerContext.tsx
  - components/shell/PagerProvider.tsx
  - components/shell/PageSection.tsx
  - components/shell/shell.module.css
  - components/shell/Shell.tsx
  - components/shell/Track.tsx
  - components/shell/usePagerInput.ts
  - components/shell/usePagerNavigation.ts
  - content/site.ts
  - content/types.ts
  - e2e/a11y.spec.ts
  - e2e/helpers/pager.ts
  - e2e/layout.spec.ts
  - e2e/no-scrollbar.spec.ts
  - e2e/pager-a11y.spec.ts
  - e2e/pager-debug.spec.ts
  - e2e/pager-history.spec.ts
  - e2e/pager-keys.spec.ts
  - e2e/pager-motion.spec.ts
  - e2e/pager-overflow.spec.ts
  - e2e/pager-swipe.spec.ts
  - e2e/pager-wheel.spec.ts
  - e2e/routes.spec.ts
  - .github/workflows/ci.yml
  - lib/js-flag.ts
  - lib/pager/animator.ts
  - lib/pager/controller.ts
  - lib/pager/debug.ts
  - lib/pager/focus.ts
  - lib/pager/history.ts
  - lib/pager/input/edge.ts
  - lib/pager/input/keys.ts
  - lib/pager/input/normalize.ts
  - lib/pager/input/swipe.ts
  - lib/pager/input/wheel.ts
  - lib/pager/scroll.ts
  - lib/pager/signals.ts
  - lib/pager/state.ts
  - lib/pager/types.ts
  - lib/sections.ts
  - playwright.config.ts
  - styles/base.css
  - styles/tokens.css
  - tests/debug-overlay.test.tsx
  - tests/frame.test.tsx
  - tests/heading.test.tsx
  - tests/helpers/stub-ports.ts
  - tests/letters.test.tsx
  - tests/pager-controller.test.ts
  - tests/pager-dom.test.ts
  - tests/pager-keys.test.ts
  - tests/pager-shell.test.tsx
  - tests/pager-state.test.ts
  - tests/pager-swipe.test.ts
  - tests/pager-wheel.test.ts
  - tests/pages-about.test.tsx
  - tests/pages-experience-sayhi.test.tsx
  - tests/pages-index-achievements.test.tsx
  - tests/pages-projects.test.tsx
  - tests/sections.test.ts
  - tests/setup.ts
  - tests/shell.test.tsx
  - tests/source-guard.test.ts
  - tests/traces/ctrl-pinch.json
  - tests/traces/firefox-linux-lines.json
  - tests/traces/idle-gap-reset.json
  - tests/traces/load.ts
  - tests/traces/safari-mac-mouse-notch.json
  - tests/traces/synthetic.ts
  - tests/traces/windows-chrome-notches.json
findings:
  critical: 0
  warning: 4
  info: 6
  total: 10
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-11-09
**Depth:** standard
**Files Reviewed:** 87
**Status:** issues_found

## Summary

The pager is well structured. The reducer is pure, the controller runs every side effect through injected ports, and the wheel and swipe recognisers are pure state machines. Input listeners are correctly non-passive for wheel and passive for pointer events. Link interception is limited to exact same-origin routes. Pushed history URLs are built from constants, and there is no `eval`, `innerHTML` or secret in the source (the contact addresses are intentionally public).

I found no security or crash-class issues. There are four warnings: one visible behavioural bug, one lost-recovery path in the controller, one unhandled rejection, and one history edge case. The info items are drift risks, dead code and one content note.

The e2e and unit suites are deterministic apart from intentional, documented time gaps. The unit tests stub `getAnimations`, which is why WR-01 is not caught.

## Warnings

### WR-01: `settle()` / `cancelAll()` cancels the CSS `rail-in` fade on the letters nav

**File:** `lib/pager/animator.ts:49-51` (used at `:63-67`, `:69-73`), triggered from `lib/pager/controller.ts:62-63`
**Issue:** `cancelOn` calls `el.getAnimations()` and cancels everything it returns. `Element.getAnimations()` flushes style and also returns CSS animations and transitions, not only WAAPI ones. In `landNow()`, `apply(next)` commits first. On a hero to rail landing that sets `data-mode="rail" data-enter`, which starts the CSS `rail-in` fade (`letters.module.css:156-158`). `deps.animator.settle()` then runs `cancelAll()` on the letters nav and cancels that fade. A CSSAnimation is not restarted after `cancel()`, so the D-09 150ms fade never plays and the rail pops in. The unit test (`tests/pager-dom.test.ts:55`) mocks `getAnimations` to return only a WAAPI stub, so it cannot catch this. I have not run it in a browser, so confirm visually or with `document.getAnimations()` after landing.
**Fix:** Cancel only the animations the animator created.
```ts
function cancelOn(el: HTMLElement | null): void {
  el?.getAnimations?.()
    .filter((a) => !(typeof CSSAnimation !== "undefined" && a instanceof CSSAnimation)
                && !(typeof CSSTransition !== "undefined" && a instanceof CSSTransition))
    .forEach((a) => a.cancel());
}
```
Alternatively, keep a `Set<Animation>` of the animations returned by `el.animate()` and cancel those.

### WR-02: Controller can strand in `sliding` when a slide ends without a newer slide

**File:** `lib/pager/controller.ts:72-83`, `lib/pager/animator.ts:111-114`
**Issue:** `landNow()` only runs when `finished === true`. The animator resolves `false` for any rejection of `trackAnimation.finished`, including an external `cancel()` that is not followed by a new `slideTo`. Two examples are the element being detached or hidden, and a stray `getAnimations().forEach(cancel)`. In that case `state.phase` stays `"sliding"` for good. The page never becomes `data-phase="idle"`, there is no history push, no live-region announcement and no `landed` signal, and `isCollapsed` stays false. The user can recover only by issuing another intent. Separately, if `track.animate()` throws synchronously (invalid keyframes, a detached track), `intent()` throws after `apply(next)` has already committed `sliding`, which leaves the same stuck state plus an uncaught exception inside an input handler.
**Fix:** Make the controller self-healing.
```ts
void deps.animator
  .slideTo(next.target, { retarget: next.retarget, reduced })
  .catch(() => false)
  .then((finished) => {
    if (state.slideId !== id) return;      // superseded
    landNow();                             // finished or abandoned: converge on the target
  });
```
Or have the animator distinguish "superseded by a newer slideTo" from "cancelled externally", and wrap `track.animate` in try/catch so it resolves `true` (settle) on failure.

### WR-03: Dynamic import of the debug overlay has no rejection handler

**File:** `components/shell/PagerProvider.tsx:113-115`
**Issue:** `import("./DebugOverlay").then(...)` has no `.catch`. If the chunk fails to load (offline, blocked, stale deploy), it produces an unhandled promise rejection. The `?debug` flag is user-supplied, so anyone can trigger it. The effect is cosmetic, but it shows up as a console error and fails the e2e `pageerror` style checks.
**Fix:**
```ts
import("./DebugOverlay")
  .then((m) => { if (alive) setDebug(() => m.DebugOverlay); })
  .catch(() => { /* debug overlay is optional */ });
```

### WR-04: A `popstate` during a slide can retarget the pager back to the page it is leaving

**File:** `components/shell/usePagerNavigation.ts:15-24`, `lib/pager/history.ts:34-37`
**Issue:** The URL is pushed only at landing, so while sliding A to B the URL is still A. A fragment navigation fires `popstate`, for example the skip link, which the code comment acknowledges. The handler only ignores it when `indexFromLocation() === target`. During the slide `indexFromLocation()` is A and `target` is B, so it issues `goto A` with `source: "history"`. A skip-link activation (or any in-page `#hash` link) inside the roughly 600ms slide window therefore reverses the navigation. Because the source is `history`, it also lands without a push. The window is small, but the symptom is a silent navigation reversal.
**Fix:** Ignore `popstate` events that did not change the pathname the pager last pushed or loaded. Track `lastPathname` (set on load and after each push or history landing), and return early when `location.pathname === lastPathname`. Alternatively, ignore `popstate` when `event.state === null && location.hash !== ""`.

## Info

### IN-01: Dead export and duplicated formula for the resting offset

**File:** `lib/pager/animator.ts:30-36`, `:94`
**Issue:** `restingOffsetPx` is exported and unit-tested but never used in production code. `slideTo` recomputes `-index * window.innerWidth` inline, so the tested helper and the real path can drift.
**Fix:** Use `restingOffsetPx(index)` at line 94, or delete the helper (and its test) until Phase 5 needs it.

### IN-02: Constants duplicated between JS, CSS and tests

**File:** `lib/pager/animator.ts:4` (`SLIDE_MS = 600`), `styles/tokens.css:50` (`--dur-page: 600ms`), `lib/pager/controller.ts:29`, `e2e/pager-keys.spec.ts:134` (`REPEAT_GATE_MS = 600`), `e2e/pager-motion.spec.ts:6` (`SLIDE_MS`), `styles/tokens.css:56` (`--page-count: 6` vs `sections.length`), `e2e/helpers/pager.ts:29` (the 200ms gap wait vs `GESTURE_GAP_MS`)
**Issue:** If one side changes, the animation duration, repeat gate, page count or gesture-gap margin can silently diverge. The page count is the riskiest: adding a section without updating the token gives a wrong track width.
**Fix:** Import `SLIDE_MS`, `REPEAT_GATE_MS` and `GESTURE_GAP_MS` in the e2e specs. Set `--page-count` from `sections.length` as an inline style on `main`, or add a unit test that asserts the token equals `sections.length`.

### IN-03: Legacy `wheelDeltaY` multiple-of-120 test can match ordinary Chromium pixel deltas

**File:** `lib/pager/input/wheel.ts:91-97`
**Issue:** Chromium reports `wheelDeltaY = -3 * deltaY` for pixel wheels. A touchpad gesture whose first event has `deltaY` of 40, 80 or 120 therefore looks like a Safari notch (`legacy % 120 === 0`) and pages at 40px instead of the 48px threshold. The effect is minor (a slightly early page), but the comment ties the heuristic to Safari and it is not gated to that engine.
**Fix:** Apply the legacy test only when `mode === 0 && Math.abs(dy) < LEGACY_SMALL_DELTA_PX` (the Safari notch case, where `deltaY` is tiny and `wheelDelta` is 120). Add a trace for Chromium 40px steps.

### IN-04: `PageTitle` takes `slug: string`, so the heading ids lose type safety

**File:** `components/pages/Heading.tsx:39`, consumed by `lib/pager/focus.ts:14` and `lib/sections.ts` (`title-${slug}`)
**Issue:** The focus port, `aria-labelledby` and the e2e specs all depend on `id="title-${slug}"`. `PageTitle` accepts any string, so a typo compiles and breaks focus hand-off and the accessible section name at runtime.
**Fix:** Type it as `slug: Slug` (from `@/content/types`).

### IN-05: Animator end position uses `window.innerWidth` while the rest position is `100vw`

**File:** `lib/pager/animator.ts:94`
**Issue:** The slide targets `-index * window.innerWidth`, but the resting transform is `calc(var(--track-index) * -100vw)`. These are normally equal. On engines where `innerWidth` follows the visual viewport (pinch-zoomed pages), the slide ends at a different offset and `settle()` snaps to the CSS position at landing. I am not certain which engines do this, so verify on iOS Safari with pinch-zoom.
**Fix:** Read the layout width instead, for example `document.documentElement.clientWidth` or `track.offsetWidth / PAGE_COUNT`. Alternatively, animate the CSS variable-derived value via `translate3d(calc(${index} * -100vw), 0, 0)`.

### IN-06: Content: "Showdown AI" entry advertises an unbuilt project

**File:** `content/projects.ts:282-290` (not in the review list; surfaced via `content/site.ts` description usage)
**Issue:** The row reads "In progress, nothing built yet" and sits in the same ruled list as shipped projects. It is honest, which fits the "only verified facts" rule. It also weakens the "that kid is cracked" goal and takes a slot in a five-row list. This is a product decision, not a defect.
**Fix:** Consider dropping the row until there is something to show, or label it as a plan. If you keep it, keep the wording factual.

---

_Reviewed: 2026-11-09_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
