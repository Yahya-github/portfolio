/**
 * Pure pager reducer (Phase 4). One function decides every page change.
 *
 * - D-01: relative intents (next/prev) apply to the in-flight target, so a
 *   second gesture mid-slide retargets instead of queueing.
 * - D-02: the ends are hard stops; a rejected intent returns the same object.
 * - D-03: goto jumps straight to any page (long jumps are one slide).
 * - UI-SPEC Focus hand-off: the page holding focus when a slide starts stays
 *   live (not inert) until landing, alongside the target.
 *
 * No React, no DOM, no clock. The key-repeat gate lives in the controller.
 */
import { sections } from "@/content/site";
import type { Intent, PagerState } from "@/lib/pager/types";

export const PAGE_COUNT = sections.length;

export function initialState(index: number): PagerState {
  return {
    current: index,
    target: index,
    phase: "idle",
    source: null,
    slideId: 0,
    retarget: false,
    focusHolder: index,
    announced: null,
    landId: 0,
  };
}

function destination(state: PagerState, intent: Intent): number {
  if (intent.type === "goto") return intent.index;
  return state.target + (intent.type === "next" ? 1 : -1);
}

export function reduce(state: PagerState, intent: Intent): PagerState {
  const to = destination(state, intent);
  if (!Number.isInteger(to) || to < 0 || to >= PAGE_COUNT) return state;
  if (to === state.target) return state;
  return {
    ...state,
    target: to,
    phase: "sliding",
    source: intent.source,
    slideId: state.slideId + 1,
    retarget: state.phase === "sliding",
    focusHolder: state.phase === "idle" ? to : state.focusHolder,
  };
}

export function land(state: PagerState): PagerState {
  if (state.phase === "idle") return state;
  return {
    ...state,
    current: state.target,
    phase: "idle",
    retarget: false,
    focusHolder: state.target,
    announced: state.target,
    landId: state.landId + 1,
  };
}

/** Only the target and the focus holder are live; at rest that is one page. */
export function isLive(state: PagerState, index: number): boolean {
  return index === state.target || index === state.focusHolder;
}

export function headingLevelOf(state: PagerState, index: number): 1 | 2 {
  return index === state.target ? 1 : 2;
}

export function isCollapsed(state: PagerState, index: number): boolean {
  return state.phase === "idle" && index !== state.current;
}
