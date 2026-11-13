/** Pure orbit maths for the robot viewer (PROOF-02). No DOM, no clock. */
export type Pose = Readonly<{ yaw: number; pitch: number }>;

const TAU = Math.PI * 2;

export const PITCH_LIMIT = Math.PI / 6;
export const START_POSE: Pose = { yaw: -Math.PI / 5, pitch: Math.PI / 12 };

const YAW_STEP = Math.PI / 12;
const PITCH_STEP = Math.PI / 18;
const TOUCH_THRESHOLD_PX = 8;

const clampPitch = (pitch: number): number =>
  Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));

/** A drag of one stage width is one full turn; pitch is clamped. */
export function dragTo(
  p: Pose,
  dx: number,
  dy: number,
  stageW: number,
  allowPitch: boolean,
): Pose {
  if (stageW <= 0) return p;
  return {
    yaw: p.yaw + (dx / stageW) * TAU,
    pitch: allowPitch ? clampPitch(p.pitch + (dy / stageW) * TAU) : p.pitch,
  };
}

/** Keyboard orbit; null for keys the viewer does not handle. */
export function keyStep(p: Pose, key: string): Pose | null {
  switch (key) {
    case "ArrowLeft":
      return { yaw: p.yaw - YAW_STEP, pitch: p.pitch };
    case "ArrowRight":
      return { yaw: p.yaw + YAW_STEP, pitch: p.pitch };
    case "ArrowUp":
      return { yaw: p.yaw, pitch: clampPitch(p.pitch + PITCH_STEP) };
    case "ArrowDown":
      return { yaw: p.yaw, pitch: clampPitch(p.pitch - PITCH_STEP) };
    case "Home":
      return START_POSE;
    default:
      return null;
  }
}

/** Decide whether a touch drag orbits or scrolls the page (touch is yaw-only). */
export function touchIntent(
  dx: number,
  dy: number,
  threshold: number = TOUCH_THRESHOLD_PX,
): "orbit" | "scroll" | null {
  if (Math.hypot(dx, dy) < threshold) return null;
  return Math.abs(dx) > Math.abs(dy) ? "orbit" : "scroll";
}

/** Advance yaw for auto-rotate: one turn per turnMs. */
export function autoRotateYaw(p: Pose, dtMs: number, turnMs: number): Pose {
  if (turnMs <= 0) return p;
  return { yaw: p.yaw + (dtMs / turnMs) * TAU, pitch: p.pitch };
}

export interface AutoRotateInputs {
  readonly reducedMotion: boolean;
  readonly motionOn: boolean;
  readonly inView: boolean;
  readonly visible: boolean;
  readonly touched: boolean;
}

/** Auto-rotate runs only when nothing argues against it. */
export const shouldAutoRotate = (i: AutoRotateInputs): boolean =>
  !i.reducedMotion && i.motionOn && i.inView && i.visible && !i.touched;
