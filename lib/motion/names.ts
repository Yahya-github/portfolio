/** Margin section names (design doc 4.2 item 4a, D-04 device 4): sizing maths, no DOM. */

/** Names per strip: two identical halves of 16 so translating by -50% loops seamlessly. */
export const NAMES_PER_STRIP = 32;

/** Used when --names-speed cannot be read (px per second). */
export const NAMES_SPEED_FALLBACK = 30;

/** Loop duration for a strip whose first half is `halfPx` tall; null when it cannot be sized. */
export function stripDuration(halfPx: number, speed: number): string | null {
  if (!(halfPx > 0) || !(speed > 0)) return null;
  return `${(halfPx / speed).toFixed(2)}s`;
}
