/** Visible-picture hit geometry for the walkthrough frame (CONT-11). */
export interface Box {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

interface Size {
  readonly width: number;
  readonly height: number;
}

/**
 * The rect the picture actually covers. A landscape frame covers its whole box;
 * a tall (phone) frame is the centred contain rect, grown about its centre by `scale`.
 */
export function visibleBox(
  frame: Box,
  natural: Size,
  scale: number,
  tall: boolean,
): Box {
  if (!tall) return frame;
  const fit = Math.min(
    frame.width / natural.width,
    frame.height / natural.height,
  );
  const width = natural.width * fit * scale;
  const height = natural.height * fit * scale;
  return {
    left: frame.left + (frame.width - width) / 2,
    top: frame.top + (frame.height - height) / 2,
    width,
    height,
  };
}

export function contains(b: Box, x: number, y: number): boolean {
  return (
    x >= b.left && x <= b.left + b.width && y >= b.top && y <= b.top + b.height
  );
}
