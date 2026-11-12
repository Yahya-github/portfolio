/** A pure preview offset, no DOM (CONT-10, v7 lines 683-690). */

export const PREVIEW_INSET_PX = 8;

export interface PreviewBox {
  readonly top: number;
  readonly bottom: number;
  readonly viewportTop: number;
  readonly limit: number;
}

/** The vertical shift that keeps a preview above `limit` without rising past `viewportTop`. */
export function previewOffset(b: PreviewBox): number {
  return b.bottom > b.limit
    ? Math.max(b.viewportTop - b.top, b.limit - b.bottom)
    : 0;
}
