/** CSS cubic-bezier evaluator so JS motion can share the token easings. */
export type BezierArgs = readonly [number, number, number, number];

const EPSILON = 1e-7;
const MAX_ITERATIONS = 40;

/** Returns f(t) with t clamped to 0..1; solves x(s) = t by bisection. */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (t: number) => number {
  const axis = (a: number, b: number, s: number): number => {
    const u = 1 - s;
    return 3 * u * u * s * a + 3 * u * s * s * b + s * s * s;
  };
  return (t: number): number => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let s = t;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      s = (lo + hi) / 2;
      const x = axis(x1, x2, s);
      if (Math.abs(x - t) < EPSILON) break;
      if (x < t) lo = s;
      else hi = s;
    }
    return axis(y1, y2, s);
  };
}

const PATTERN =
  /^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/;

/** Parses a CSS cubic-bezier() string; null when it is anything else. */
export function parseCubicBezier(css: string): BezierArgs | null {
  const m = PATTERN.exec(css.trim());
  if (!m) return null;
  const nums = [m[1], m[2], m[3], m[4]].map(Number);
  if (nums.some((n) => !Number.isFinite(n))) return null;
  return [nums[0], nums[1], nums[2], nums[3]] as const;
}
