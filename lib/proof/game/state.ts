/**
 * Pure Atlantis stage reducer (Phase 8, PROOF-01).
 *
 * - D-10: the stage moves only through ready, loading, playing, exited,
 *   error and fallback; a rejected intent returns the same object.
 * - RESEARCH Pattern 2: the DOM controller is thin glue around this reducer.
 * - Escape is a focus side effect handled by the controller, never a
 *   state change.
 *
 * No React, no DOM, no clock.
 */
export type GamePhase =
  | "ready"
  | "loading"
  | "playing"
  | "exited"
  | "error"
  | "fallback";

export interface GameState {
  readonly phase: GamePhase;
  readonly pct: number | null;
  readonly muted: boolean;
}

export type GameIntent =
  | { readonly type: "play" }
  | { readonly type: "progress"; readonly cur: number; readonly total: number }
  | { readonly type: "ready" }
  | { readonly type: "escape" }
  | { readonly type: "exit" }
  | { readonly type: "error" }
  | { readonly type: "retry" }
  | { readonly type: "mute" };

const PCT_STEP = 10;

export function initialState(supported: boolean): GameState {
  return { phase: supported ? "ready" : "fallback", pct: null, muted: false };
}

/** Load percentage floored to 10% steps, or null for unusable input. */
export function progressPct(cur: number, total: number): number | null {
  if (!Number.isFinite(cur) || !Number.isFinite(total) || total <= 0) {
    return null;
  }
  const ratio = Math.min(1, Math.max(0, cur / total));
  return Math.floor((ratio * 100) / PCT_STEP) * PCT_STEP;
}

function toLoading(state: GameState): GameState {
  return { ...state, phase: "loading", pct: null };
}

function onProgress(
  state: GameState,
  intent: Extract<GameIntent, { type: "progress" }>,
): GameState {
  if (state.phase !== "loading") return state;
  const pct = progressPct(intent.cur, intent.total);
  if (pct === null || pct === state.pct) return state;
  return { ...state, pct };
}

function isActive(state: GameState): boolean {
  return state.phase === "loading" || state.phase === "playing";
}

export function reduce(state: GameState, intent: GameIntent): GameState {
  if (state.phase === "fallback") return state;
  switch (intent.type) {
    case "play":
      return state.phase === "ready" || state.phase === "exited"
        ? toLoading(state)
        : state;
    case "retry":
      return state.phase === "error" ? toLoading(state) : state;
    case "progress":
      return onProgress(state, intent);
    case "ready":
      return state.phase === "loading" ? { ...state, phase: "playing" } : state;
    case "mute":
      return state.phase === "playing"
        ? { ...state, muted: !state.muted }
        : state;
    case "exit":
      return isActive(state) ? { ...state, phase: "exited", pct: null } : state;
    case "error":
      return isActive(state) ? { ...state, phase: "error" } : state;
    case "escape":
      return state;
  }
}
