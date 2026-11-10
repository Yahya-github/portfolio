/**
 * First-visit hint timing (NAV-06, D-07..D-10). A pure state machine: no DOM, no clock;
 * times are inputs. Unchanged transitions return the same object. Storage, wording and
 * DOM effects live in the runtime wiring.
 */
export const HINT_DELAY_AFTER_OPENING_MS = 1000;
export const HINT_DELAY_NO_OPENING_MS = 1500;
export const HINT_VISIBLE_MS = 8000;

export type HintPhase = "idle" | "waiting" | "shown" | "done";

export interface HintState {
  readonly phase: HintPhase;
  readonly showAt: number | null;
  readonly hideAt: number | null;
}

export type HintEvent =
  | { readonly type: "load"; readonly at: number; readonly openingPending: boolean }
  | { readonly type: "opening-done"; readonly at: number }
  | { readonly type: "tick"; readonly at: number }
  | { readonly type: "page-change"; readonly at: number };

export function initialHint(): HintState {
  return { phase: "idle", showAt: null, hideAt: null };
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
      };
    case "opening-done":
      if (state.phase !== "waiting" || state.showAt !== null) return state;
      return {
        ...state,
        showAt: event.at + HINT_DELAY_AFTER_OPENING_MS,
      };
    case "tick":
      if (state.phase === "waiting" && state.showAt !== null && event.at >= state.showAt) {
        return {
          phase: "shown",
          showAt: state.showAt,
          hideAt: state.showAt + HINT_VISIBLE_MS,
        };
      }
      if (state.phase === "shown" && state.hideAt !== null && event.at >= state.hideAt) {
        return { phase: "done", showAt: state.showAt, hideAt: state.hideAt };
      }
      return state;
    case "page-change":
      if (state.phase === "waiting" || state.phase === "shown") {
        return { phase: "done", showAt: state.showAt, hideAt: state.hideAt };
      }
      return state;
  }
}

export function nextWakeAt(state: HintState): number | null {
  if (state.phase === "waiting") return state.showAt;
  if (state.phase === "shown") return state.hideAt;
  return null;
}
