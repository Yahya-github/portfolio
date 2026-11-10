/**
 * First-visit hint timing (NAV-06, D-07..D-10). A pure state machine: no DOM, no clock;
 * times are inputs. Unchanged transitions return the same object. Storage, wording and
 * DOM effects live in the runtime wiring. Memory is written by the runtime when `seen`
 * flips true: the visitor pages, or the hint has stayed visible for 3000ms (05-12).
 */
export const HINT_DELAY_AFTER_OPENING_MS = 1000;
export const HINT_DELAY_NO_OPENING_MS = 1500;
export const HINT_VISIBLE_MS = 8000;
export const HINT_SEEN_AFTER_MS = 3000;

/** Next-link nudge: two X pulses (motion constants, not layout spacing). */
export const NUDGE_PX = 12;
export const NUDGE_PULSE_MS = 300;
export const NUDGE_PAUSE_MS = 120;
export const NUDGE_DELAY_MS = 200;
export const NUDGE_TOTAL_MS = 2 * NUDGE_PULSE_MS + NUDGE_PAUSE_MS;

export type HintPhase = "idle" | "waiting" | "shown" | "done";

export interface HintState {
  readonly phase: HintPhase;
  readonly showAt: number | null;
  readonly hideAt: number | null;
  readonly seenAt: number | null;
  readonly seen: boolean;
}

export type HintEvent =
  | { readonly type: "load"; readonly at: number; readonly openingPending: boolean }
  | { readonly type: "opening-done"; readonly at: number }
  | { readonly type: "tick"; readonly at: number }
  | { readonly type: "page-change"; readonly at: number };

export function initialHint(): HintState {
  return { phase: "idle", showAt: null, hideAt: null, seenAt: null, seen: false };
}

export function stepHint(state: HintState, event: HintEvent): HintState {
  if (state.phase === "done") return state;
  switch (event.type) {
    case "load":
      if (state.phase !== "idle") return state;
      return {
        phase: "waiting",
        showAt: event.openingPending ? null : event.at + HINT_DELAY_NO_OPENING_MS,
        hideAt: null,
        seenAt: null,
        seen: false,
      };
    case "opening-done":
      if (state.phase !== "waiting" || state.showAt !== null) return state;
      return { ...state, showAt: event.at + HINT_DELAY_AFTER_OPENING_MS };
    case "tick":
      if (state.phase === "waiting" && state.showAt !== null && event.at >= state.showAt) {
        return {
          phase: "shown",
          showAt: state.showAt,
          hideAt: state.showAt + HINT_VISIBLE_MS,
          seenAt: state.showAt + HINT_SEEN_AFTER_MS,
          seen: false,
        };
      }
      if (state.phase === "shown") {
        if (state.hideAt !== null && event.at >= state.hideAt) {
          return { ...state, phase: "done", seen: true };
        }
        if (!state.seen && state.seenAt !== null && event.at >= state.seenAt) {
          return { ...state, seen: true };
        }
      }
      return state;
    case "page-change":
      if (state.phase === "waiting" || state.phase === "shown") {
        return { ...state, phase: "done", seen: true };
      }
      return state;
  }
}

export function nextWakeAt(state: HintState): number | null {
  if (state.phase === "waiting") return state.showAt;
  if (state.phase === "shown") return state.seen ? state.hideAt : state.seenAt;
  return null;
}

/** Two 0 -> NUDGE_PX -> 0 pulses with a pause at rest; never leaves 0..NUDGE_PX. */
export function nudgeKeyframes(easing: string): Keyframe[] {
  const p = NUDGE_PULSE_MS;
  const q = NUDGE_PAUSE_MS;
  const t = NUDGE_TOTAL_MS;
  const x = `${NUDGE_PX}px 0px`;
  const z = "0px 0px";
  return [
    { offset: 0, translate: z, easing },
    { offset: p / 2 / t, translate: x, easing },
    { offset: p / t, translate: z, easing },
    { offset: (p + q) / t, translate: z, easing },
    { offset: (p + q + p / 2) / t, translate: x, easing },
    { offset: 1, translate: z, easing },
  ];
}
