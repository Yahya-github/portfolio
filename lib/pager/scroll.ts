import { pageElement, pageScrolls } from "@/lib/pager/input/edge";
import type { ScrollPort } from "@/lib/pager/types";

interface Origin {
  readonly index: number;
  readonly y: number;
  readonly held: boolean;
}

function scrollWindow(top: number): void {
  window.scrollTo({ top, left: 0, behavior: "instant" });
}

/**
 * Target pages open at their top (D-06). Under document scroll (phones, 200% zoom)
 * the outgoing page is held in place with a transform while the window resets, and
 * a cancelled leave restores its scroll. Only one page is ever held: a chained
 * retarget keeps the original origin.
 */
export function createScrollPort(): ScrollPort {
  let origin: Origin | null = null;

  return {
    beforeSlide(from, to, fromRest) {
      if (fromRest) origin = { index: from, y: window.scrollY, held: false };
      if (origin && to === origin.index) return; // cancelled leave: keep the scroll
      const target = pageElement(to);
      if (target && pageScrolls(target)) {
        target.scrollTop = 0;
        return;
      }
      if (!fromRest || !origin || origin.y <= 0) return;
      const outgoing = pageElement(from);
      if (outgoing) outgoing.style.transform = `translateY(${-origin.y}px)`;
      origin = { ...origin, held: true };
      scrollWindow(0);
    },

    afterLand(index) {
      if (origin?.held) {
        const held = pageElement(origin.index);
        if (held) held.style.transform = "";
        if (index === origin.index) scrollWindow(origin.y); // the one D-06 exception
      }
      origin = null;
      if (window.scrollX !== 0) {
        window.scrollTo({ top: window.scrollY, left: 0, behavior: "instant" });
      }
    },
  };
}
