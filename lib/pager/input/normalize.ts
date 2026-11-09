/**
 * Wheel delta normalisation (RESEARCH Pitfall 5). Converts WheelEvent deltas
 * to pixels: deltaMode 0 is already pixels, 1 is lines (Firefox mouse wheel),
 * 2 is pages (one viewport height).
 */
export const LINE_PX = 16;

export function normalizeDelta(
  dx: number,
  dy: number,
  mode: 0 | 1 | 2,
  vh: number,
): { readonly x: number; readonly y: number } {
  const scale = mode === 1 ? LINE_PX : mode === 2 ? vh : 1;
  return { x: dx * scale, y: dy * scale };
}
