/**
 * Pure target and geometry rules for the custom cursor (EXP-03).
 *
 * Snap targets are letters, links, buttons and anything marked
 * data-cursor-snap (D-16). The tag text comes only from data-cursor-tag, with
 * no fallback to element content (D-17). The box is recomputed from live
 * rects rather than cached, avoiding the stale-snap bugs of the v7
 * prototype (WR-05).
 */

export const SNAP_SELECTOR = "a, button, [data-cursor-snap]";
export const SNAP_INFLATE_PX = 4;
export const IDLE_SIZE_PX = 16;

export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface CursorBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** The element the cursor should snap to, or null. Ignores the cursor's own parts. */
export function snapTargetOf(el: Element | null): HTMLElement | null {
  if (!el) return null;
  if (el.closest("[data-cursor-part]")) return null;
  return el.closest<HTMLElement>(SNAP_SELECTOR);
}

/** Tag text from data-cursor-tag only; blank means no tag (D-17). */
export function tagTextOf(el: Element): string | null {
  return el.getAttribute("data-cursor-tag")?.trim() || null;
}

/** Grows a rect by the snap padding on every side. */
export function inflate(r: Rect): CursorBox {
  return {
    x: r.left - SNAP_INFLATE_PX,
    y: r.top - SNAP_INFLATE_PX,
    w: r.width + SNAP_INFLATE_PX * 2,
    h: r.height + SNAP_INFLATE_PX * 2,
  };
}

/** The resting square, centred on the pointer. */
export function idleBox(px: number, py: number): CursorBox {
  const half = IDLE_SIZE_PX / 2;
  return { x: px - half, y: py - half, w: IDLE_SIZE_PX, h: IDLE_SIZE_PX };
}

/** Top, right, bottom, left hairline transforms for 1px-based line elements. */
export function hairlineTransforms(
  b: CursorBox,
): readonly [string, string, string, string] {
  return [
    `translate(${b.x}px, ${b.y}px) scaleX(${b.w})`,
    `translate(${b.x + b.w - 1}px, ${b.y}px) scaleY(${b.h})`,
    `translate(${b.x}px, ${b.y + b.h - 1}px) scaleX(${b.w})`,
    `translate(${b.x}px, ${b.y}px) scaleY(${b.h})`,
  ];
}
