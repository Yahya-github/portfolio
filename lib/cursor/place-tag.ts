/**
 * Tag placement for the custom cursor (EXP-03): right, then above, then
 * below, then left of the box, always clamped inside the viewport.
 */

export const TAG_EDGE_PAD = 8;
export const TAG_GAP = 12;

interface BoxEdges {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export function placeTag(
  box: BoxEdges,
  w: number,
  h: number,
  vw: number,
  vh: number,
  pad = TAG_EDGE_PAD,
  gap = TAG_GAP,
): { x: number; y: number } {
  const spots: ReadonlyArray<readonly [number, number]> = [
    [box.right + gap, box.top - 4],
    [box.right + 4 - w, box.top - gap - h],
    [box.right + 4 - w, box.bottom + gap],
    [box.left - gap - w, box.top - 4],
  ];
  const fits = ([x, y]: readonly [number, number]) =>
    x >= pad && y >= pad && x + w <= vw - pad && y + h <= vh - pad;
  const [x, y] = spots.find(fits) ?? spots[0];
  return {
    x: Math.min(Math.max(x, pad), vw - pad - w),
    y: Math.min(Math.max(y, pad), vh - pad - h),
  };
}
