/**
 * Pager controller (Phase 4, RESEARCH Pattern 6). A plain store around the
 * pure reducer; every side effect goes through an injected port.
 *
 * Accepted intent: commit -> scroll -> animate -> focus -> slideStart.
 * Landing:         focus -> commit -> settle -> history -> scroll -> landed.
 *
 * - D-01: a retarget restarts the slide and never refocuses.
 * - D-10: the new state commits before the track moves.
 * - Pitfall 9 / WR-06: landing focus runs before the commit that makes the
 *   old focus holder inert.
 * - Only the last slide of a chain lands (stale promises are ignored by
 *   slideId), so history, the announcement and `landed` are coalesced.
 * - Held keys: a repeat is accepted only at rest and REPEAT_GATE_MS after
 *   the last accepted step, independent of motion settings (UI-SPEC).
 *
 * No timers, no DOM, no logging.
 */
import { createSignals } from "@/lib/pager/signals";
import { initialState, land, reduce } from "@/lib/pager/state";
import type {
  Intent,
  PagerController,
  PagerDeps,
  PagerState,
} from "@/lib/pager/types";

/** Fixed, not --dur-page (which is 0ms under reduced motion). */
export const REPEAT_GATE_MS = 600;

export function createPagerController(
  deps: PagerDeps,
  initialIndex: number,
): PagerController {
  let state: PagerState = initialState(initialIndex);
  let reduced = false;
  let lastAcceptedAt = Number.NEGATIVE_INFINITY;
  const listeners = new Set<() => void>();
  const signals = createSignals();

  function apply(next: PagerState): void {
    deps.commit(() => {
      state = next;
      for (const listener of [...listeners]) listener();
    });
  }

  function isGated(i: Intent): boolean {
    if (i.type === "goto" || !i.repeat) return false;
    return (
      state.phase !== "idle" || deps.now() - lastAcceptedAt < REPEAT_GATE_MS
    );
  }

  function landNow(): void {
    const prev = state;
    const next = land(prev);
    if (next === prev) return;
    if (prev.focusHolder !== prev.target) {
      deps.focus.focusTitle(prev.target, prev.source === "key");
    }
    apply(next);
    deps.animator.settle(next.current);
    if (prev.source !== "history") deps.history.push(next.current);
    deps.scroll.afterLand(next.current);
    signals.emitLanded(next.current);
  }

  function intent(i: Intent): boolean {
    if (isGated(i)) return false;
    const prev = state;
    const next = reduce(prev, i);
    if (next === prev) return false;
    lastAcceptedAt = deps.now();
    apply(next);
    const fromRest = prev.phase === "idle";
    deps.scroll.beforeSlide(prev.current, next.target, fromRest);
    const id = next.slideId;
    void deps.animator
      .slideTo(next.target, { retarget: next.retarget, reduced })
      .then((finished) => {
        if (finished && state.slideId === id) landNow();
      });
    if (fromRest) deps.focus.focusTitle(next.target, i.source === "key");
    signals.emitSlideStart({
      from: prev.target,
      to: next.target,
      source: i.source,
    });
    return true;
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    intent,
    setReducedMotion(value) {
      reduced = value;
    },
    isReducedMotion: () => reduced,
    signals,
  };
}
