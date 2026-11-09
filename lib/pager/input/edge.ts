import { slugAt } from "@/lib/sections";
import type { EdgeInfo } from "@/lib/pager/types";

const TOLERANCE_PX = 1;

export function pageElement(index: number): HTMLElement | null {
  return document.getElementById(`page-${slugAt(index)}`);
}

export function pageScrolls(page: HTMLElement): boolean {
  const overflowY = getComputedStyle(page).overflowY;
  return overflowY === "auto" || overflowY === "scroll";
}

function overflows(el: Element): boolean {
  return el.scrollHeight - el.clientHeight > TOLERANCE_PX;
}

/**
 * The element that scrolls the page's content. Under document-scroll layouts
 * (phones, or 200% zoom on 1366x768 = 683px wide) that is the document (Pitfall 3).
 */
export function scrollerFor(page: HTMLElement | null): Element {
  if (page && pageScrolls(page) && overflows(page)) return page;
  return document.scrollingElement ?? document.documentElement;
}

export function edgeInfo(scroller: Element): EdgeInfo {
  return {
    overflowing: overflows(scroller),
    atStart: scroller.scrollTop <= TOLERANCE_PX,
    atEnd:
      scroller.scrollTop + scroller.clientHeight >=
      scroller.scrollHeight - TOLERANCE_PX,
  };
}
