/**
 * Wheel / trackpad gesture recogniser (NAV-01, NAV-07). A pure,
 * timestamp-driven state machine (RESEARCH Pattern 3): no DOM, no timers.
 *
 * Caller contract: read `event.deltaMode` BEFORE `deltaX`/`deltaY` (Firefox
 * reports pixels otherwise, Pitfall 5), pass `event.timeStamp` as `t`, and
 * call `preventDefault()` when the step says so.
 *
 * - One gesture = one intent. A gesture ends after GESTURE_GAP_MS of silence
 *   (IN-01) or when a fresh flick starts inside a decaying momentum tail.
 * - The momentum tail of a paged gesture ("spent") is swallowed however long.
 * - D-04: the accumulated delta's dominant axis decides the direction.
 * - D-05 / D-07a: on an overflowing page, a vertical gesture that does not
 *   start at the edge in its direction scrolls natively for its whole life;
 *   only a fresh gesture starting at the edge pages.
 * - Pitfall 4: Safari/Mac mouse notches arrive with tiny deltas; a legacy
 *   wheelDelta multiple of DISCRETE_NOTCH (or line mode) pages at once.
 * - Pitfall 6: every event of a paging gesture is preventDefault-ed, even at
 *   the ends, so Safari's history swipe never fires. Ctrl (pinch-zoom) events
 *   are never touched, so browser zoom always works.
 *
 * FRESH_FLICK_* and DECAY_RATIO are Claude's-discretion thresholds (CONTEXT
 * "Wheel accumulator thresholds"), to be tuned on devices in plan 04-15. A
 * fresh flick only counts once the stream has decayed to DECAY_RATIO of its
 * peak, so the rising edge of one flick (3, 8, 18, 35, 60) is not read as two.
 */
import type { Direction, EdgeInfo } from "@/lib/pager/types";
import { normalizeDelta } from "./normalize";

export const WHEEL_THRESHOLD_PX = 48;
export const GESTURE_GAP_MS = 160;
export const FRESH_FLICK_MIN_PX = 16;
export const FRESH_FLICK_RATIO = 2;
export const DECAY_RATIO = 0.5;
export const DISCRETE_NOTCH = 120;

const RECENT_LIMIT = 3;

export interface WheelSample {
  readonly dx: number;
  readonly dy: number;
  readonly mode: 0 | 1 | 2;
  readonly t: number;
  readonly ctrl: boolean;
  readonly vh: number;
  readonly legacy?: number;
}

export type WheelPhase = "idle" | "accumulating" | "scrolling" | "spent";

export interface WheelState {
  readonly phase: WheelPhase;
  readonly sumX: number;
  readonly sumY: number;
  readonly lastT: number;
  readonly recent: readonly number[];
  readonly peak: number;
  readonly decayed: boolean;
  readonly gestureId: number;
}

export const INITIAL_WHEEL: WheelState = {
  phase: "idle",
  sumX: 0,
  sumY: 0,
  lastT: -Infinity,
  recent: [],
  peak: 0,
  decayed: false,
  gestureId: 0,
};

export interface WheelStep {
  readonly state: WheelState;
  readonly intent: Direction | null;
  readonly preventDefault: boolean;
}

const directionOf = (value: number): Direction => (value > 0 ? "next" : "prev");

function isFreshFlick(state: WheelState, mag: number): boolean {
  return (
    (state.phase === "spent" || state.phase === "scrolling") &&
    state.decayed &&
    state.recent.length > 0 &&
    mag > FRESH_FLICK_MIN_PX &&
    mag >= FRESH_FLICK_RATIO * Math.min(...state.recent)
  );
}

function isDiscrete(sample: WheelSample): boolean {
  const { legacy } = sample;
  return (
    sample.mode === 1 ||
    (legacy !== undefined && legacy !== 0 && legacy % DISCRETE_NOTCH === 0)
  );
}

function startGesture(
  state: WheelState,
  sample: WheelSample,
  x: number,
  y: number,
  edge: EdgeInfo,
): WheelStep {
  const mag = Math.max(Math.abs(x), Math.abs(y));
  const axis = Math.abs(x) > Math.abs(y) ? "x" : "y";
  const value = axis === "x" ? x : y;
  const dir = directionOf(value);
  const base = {
    sumX: x,
    sumY: y,
    lastT: sample.t,
    recent: [mag],
    peak: mag,
    decayed: false,
    gestureId: state.gestureId + 1,
  };
  const atEdge = dir === "next" ? edge.atEnd : edge.atStart;
  if (axis === "y" && edge.overflowing && !atEdge) {
    return {
      state: { ...base, phase: "scrolling" },
      intent: null,
      preventDefault: false,
    };
  }
  const pages = isDiscrete(sample) || Math.abs(value) >= WHEEL_THRESHOLD_PX;
  return {
    state: { ...base, phase: pages ? "spent" : "accumulating" },
    intent: pages ? dir : null,
    preventDefault: true,
  };
}

function continueGesture(
  state: WheelState,
  sample: WheelSample,
  x: number,
  y: number,
): WheelStep {
  const mag = Math.max(Math.abs(x), Math.abs(y));
  const peak = Math.max(state.peak, mag);
  const next: WheelState = {
    ...state,
    lastT: sample.t,
    recent: [...state.recent, mag].slice(-RECENT_LIMIT),
    peak,
    decayed: state.decayed || mag <= peak * DECAY_RATIO,
  };
  if (state.phase === "scrolling") {
    return { state: next, intent: null, preventDefault: false };
  }
  if (state.phase === "spent") {
    return { state: next, intent: null, preventDefault: true };
  }
  const sumX = state.sumX + x;
  const sumY = state.sumY + y;
  const dominant = Math.abs(sumX) > Math.abs(sumY) ? sumX : sumY;
  const pages = Math.abs(dominant) >= WHEEL_THRESHOLD_PX;
  return {
    state: { ...next, sumX, sumY, phase: pages ? "spent" : "accumulating" },
    intent: pages ? directionOf(dominant) : null,
    preventDefault: true,
  };
}

export function stepWheel(
  state: WheelState,
  sample: WheelSample,
  edge: EdgeInfo,
): WheelStep {
  if (sample.ctrl) return { state, intent: null, preventDefault: false };
  const { x, y } = normalizeDelta(sample.dx, sample.dy, sample.mode, sample.vh);
  const mag = Math.max(Math.abs(x), Math.abs(y));
  // T-04-07: NaN/Infinity deltas are ignored outright.
  if (!Number.isFinite(mag)) {
    return { state, intent: null, preventDefault: false };
  }
  if (mag === 0) {
    return {
      state: { ...state, lastT: sample.t },
      intent: null,
      preventDefault: state.phase === "accumulating" || state.phase === "spent",
    };
  }
  const isNew =
    state.phase === "idle" ||
    sample.t - state.lastT > GESTURE_GAP_MS ||
    isFreshFlick(state, mag);
  return isNew
    ? startGesture(state, sample, x, y, edge)
    : continueGesture(state, sample, x, y);
}
