/**
 * Touch-swipe recogniser for the pager (NAV-03, D-08). A pure state machine
 * folded over pointer samples; the input hook (plan 04-10) feeds it Pointer
 * Events. No finger-follow in Phase 4: the track slides on commit only.
 */
import type { Direction } from "@/lib/pager/types";

export interface PointerSample {
  readonly kind: "down" | "move" | "up" | "cancel";
  readonly x: number;
  readonly y: number;
  readonly t: number;
  readonly pointerType: string;
  readonly id: number;
  /** visualViewport.scale > 1: the visitor is pinch-zoomed (Pitfall 7). */
  readonly zoomed: boolean;
}

export type SwipeLock = "none" | "h" | "v";

export interface SwipeSamplePoint {
  readonly x: number;
  readonly t: number;
}

export interface SwipeState {
  readonly active: boolean;
  readonly id: number;
  readonly x0: number;
  readonly y0: number;
  readonly lock: SwipeLock;
  readonly samples: readonly SwipeSamplePoint[];
}

export interface SwipeStep {
  readonly state: SwipeState;
  readonly intent: Direction | null;
}

/** Touches starting this close to the left edge belong to the system back gesture (Decision 3). */
export const SWIPE_EDGE_PX = 20;
/** Movement on either axis before the gesture locks its axis. */
export const AXIS_LOCK_PX = 12;
/** Horizontal lock needs |dx| > AXIS_RATIO * |dy| (about 34 degrees). */
export const AXIS_RATIO = 1.5;
/** A release this far horizontally always pages. */
export const SWIPE_COMMIT_PX = 48;
/** A shorter release pages only when fast enough. */
export const SWIPE_FAST_PX = 24;
/** px/ms over the last VELOCITY_WINDOW_MS. */
export const SWIPE_VELOCITY = 0.3;
export const VELOCITY_WINDOW_MS = 100;

export const INITIAL_SWIPE: SwipeState = Object.freeze({
  active: false,
  id: -1,
  x0: 0,
  y0: 0,
  lock: "none",
  samples: Object.freeze([]) as readonly SwipeSamplePoint[],
});

const IDLE: SwipeStep = Object.freeze({ state: INITIAL_SWIPE, intent: null });

/** Absolute px/ms over the samples within VELOCITY_WINDOW_MS of `now`. */
export function swipeVelocity(
  samples: readonly SwipeSamplePoint[],
  now: number,
): number {
  const recent = samples.filter((p) => now - p.t <= VELOCITY_WINDOW_MS);
  if (recent.length < 2) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  const elapsed = last.t - first.t;
  if (elapsed <= 0) return 0;
  return Math.abs((last.x - first.x) / elapsed);
}

/**
 * Current horizontal offset of the tracked finger, 0 when idle. Exposed so a
 * finger-follow can be added later without an API change (RESEARCH Open Question 2).
 */
export function swipeDx(state: SwipeState): number {
  const last = state.samples[state.samples.length - 1];
  return state.active && last ? last.x - state.x0 : 0;
}

/** Keeps only points within the velocity window of the newest one (T-04-10). */
function withSample(
  samples: readonly SwipeSamplePoint[],
  point: SwipeSamplePoint,
): readonly SwipeSamplePoint[] {
  return [...samples, point].filter((p) => point.t - p.t <= VELOCITY_WINDOW_MS);
}

/** Axis decision once either axis passes AXIS_LOCK_PX; "none" before that. */
function lockFor(dx: number, dy: number): SwipeLock {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < AXIS_LOCK_PX && ay < AXIS_LOCK_PX) return "none";
  return ax > AXIS_RATIO * ay ? "h" : "v";
}

function start(sample: PointerSample): SwipeStep {
  // NAV-03: touch only; D-08 / Decision 3: 20px left edge; Pitfall 7: zoomed.
  if (sample.pointerType !== "touch") return IDLE;
  if (sample.x < SWIPE_EDGE_PX || sample.zoomed) return IDLE;
  const state: SwipeState = {
    active: true,
    id: sample.id,
    x0: sample.x,
    y0: sample.y,
    lock: "none",
    samples: [{ x: sample.x, t: sample.t }],
  };
  return { state, intent: null };
}

function move(state: SwipeState, sample: PointerSample): SwipeStep {
  const lock =
    state.lock === "none"
      ? lockFor(sample.x - state.x0, sample.y - state.y0)
      : state.lock;
  const samples = withSample(state.samples, { x: sample.x, t: sample.t });
  return { state: { ...state, lock, samples }, intent: null };
}

function release(state: SwipeState, sample: PointerSample): SwipeStep {
  const dx = sample.x - state.x0;
  const lock =
    state.lock === "none" ? lockFor(dx, sample.y - state.y0) : state.lock;
  if (lock !== "h") return IDLE; // a vertical lock never pages
  const samples = withSample(state.samples, { x: sample.x, t: sample.t });
  const distance = Math.abs(dx);
  const fast =
    distance >= SWIPE_FAST_PX &&
    swipeVelocity(samples, sample.t) >= SWIPE_VELOCITY;
  if (distance < SWIPE_COMMIT_PX && !fast) return IDLE;
  return { state: INITIAL_SWIPE, intent: dx < 0 ? "next" : "prev" };
}

/**
 * Folds one pointer sample into the swipe state. Only the `up` that ends a
 * horizontal, long-or-fast gesture yields an intent; finger right-to-left is
 * "next". `cancel` (Pitfall 8: the browser took the touch) aborts with no
 * page. Samples from a pointer other than the tracked one are ignored.
 */
export function stepSwipe(state: SwipeState, sample: PointerSample): SwipeStep {
  if (!state.active) {
    return sample.kind === "down" ? start(sample) : IDLE;
  }
  if (sample.id !== state.id) return { state, intent: null };
  switch (sample.kind) {
    case "down":
      return { state, intent: null };
    case "move":
      return move(state, sample);
    case "up":
      return release(state, sample);
    case "cancel":
      return IDLE;
  }
}
