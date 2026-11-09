/**
 * Gesture inputs for the pager (NAV-01, NAV-02, NAV-03, NAV-07): thin DOM
 * listeners around the pure state machines in lib/pager/input. Link clicks
 * and Back/Forward live in usePagerNavigation.
 *
 * - Wheel: a non-passive window listener (Chrome/Safari default window wheel
 *   listeners to passive), never React onWheel. deltaMode is read before the
 *   deltas (Pitfall 5); preventDefault only when the FSM says so (T-04-27).
 * - Keys: modifiers, text fields, defaultPrevented events and Space on
 *   controls are left to the browser (WR-04, T-04-28). The 600ms repeat gate
 *   lives in the controller.
 * - Swipe: passive Pointer Events; never preventDefault (touch-action on html
 *   keeps vertical scroll native).
 */
import { useEffect } from "react";
import { emitDebug } from "@/lib/pager/debug";
import { edgeInfo, pageElement, scrollerFor } from "@/lib/pager/input/edge";
import {
  KEY_LINE_PX,
  KEY_PAGE_RATIO,
  keyIntent,
  resolveScrollKey,
  targetKindOf,
  type KeyIntent,
} from "@/lib/pager/input/keys";
import {
  INITIAL_SWIPE,
  stepSwipe,
  swipeDx,
  swipeVelocity,
  type PointerSample,
} from "@/lib/pager/input/swipe";
import { INITIAL_WHEEL, stepWheel } from "@/lib/pager/input/wheel";
import { PAGE_COUNT } from "@/lib/pager/state";
import type { EdgeInfo, PagerController } from "@/lib/pager/types";

type Cleanup = () => void;

function currentScroller(controller: PagerController): Element {
  return scrollerFor(pageElement(controller.getSnapshot().target));
}

function edgeLabel(edge: EdgeInfo): "top" | "bottom" | "none" {
  if (edge.atEnd) return "bottom";
  if (edge.atStart && edge.overflowing) return "top";
  return "none";
}

function bindWheel(controller: PagerController): Cleanup {
  let wheel = INITIAL_WHEEL;
  const onWheel = (e: WheelEvent) => {
    const mode = e.deltaMode as 0 | 1 | 2; // Pitfall 5: read before the deltas
    const legacy = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
    const sample = {
      mode,
      dx: e.deltaX,
      dy: e.deltaY,
      t: e.timeStamp,
      ctrl: e.ctrlKey,
      vh: window.innerHeight,
      legacy,
    };
    const edge = edgeInfo(currentScroller(controller));
    const step = stepWheel(wheel, sample, edge);
    wheel = step.state;
    if (step.preventDefault) e.preventDefault();
    if (step.intent) controller.intent({ type: step.intent, source: "wheel" });
    emitDebug({
      wheel: { t: sample.t, dx: sample.dx, dy: sample.dy, mode, legacy },
      accum: Math.max(Math.abs(wheel.sumX), Math.abs(wheel.sumY)),
      gesture: {
        id: wheel.gestureId,
        open: wheel.phase === "accumulating" || wheel.phase === "scrolling",
      },
      edge: edgeLabel(edge),
    });
  };
  window.addEventListener("wheel", onWheel, { passive: false });
  return () => window.removeEventListener("wheel", onWheel);
}

/** Pitfall 8: native key scrolling only works when focus sits in the scroller. */
function scrollsNatively(scroller: Element): boolean {
  const active = document.activeElement;
  if (scroller === document.scrollingElement) {
    return !active || active === document.body || scroller.contains(active);
  }
  return active !== null && scroller.contains(active);
}

function scrollStep(
  controller: PagerController,
  e: KeyboardEvent,
  k: KeyIntent,
): void {
  const scroller = currentScroller(controller);
  const decision = resolveScrollKey(k, edgeInfo(scroller));
  if (decision === "page") {
    e.preventDefault();
    controller.intent({
      type: k.action as "next" | "prev",
      source: "key",
      repeat: k.repeat,
    });
    return;
  }
  if (decision === "stop") {
    e.preventDefault();
    return;
  }
  if (scrollsNatively(scroller)) return;
  e.preventDefault();
  const dir = k.action === "next" ? 1 : -1;
  const amount =
    k.scrollBy === "page"
      ? KEY_PAGE_RATIO * scroller.clientHeight
      : KEY_LINE_PX;
  scroller.scrollBy({
    top: dir * amount,
    behavior: controller.isReducedMotion() ? "instant" : "auto",
  });
}

function bindKeys(controller: PagerController): Cleanup {
  const onKey = (e: KeyboardEvent) => {
    const k = keyIntent({
      key: e.key,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      repeat: e.repeat,
      defaultPrevented: e.defaultPrevented,
      targetKind: targetKindOf(document.activeElement),
    });
    if (!k) return;
    if (k.action === "first" || k.action === "last") {
      e.preventDefault();
      const index = k.action === "first" ? 0 : PAGE_COUNT - 1;
      controller.intent({ type: "goto", index, source: "key" });
      return;
    }
    if (k.scrollFirst) {
      scrollStep(controller, e, k);
      return;
    }
    e.preventDefault();
    controller.intent({ type: k.action, source: "key", repeat: k.repeat });
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}

const POINTER_KINDS = {
  pointerdown: "down",
  pointermove: "move",
  pointerup: "up",
  pointercancel: "cancel",
} as const;

function bindSwipe(controller: PagerController): Cleanup {
  let swipe = INITIAL_SWIPE;
  const handlers = Object.entries(POINTER_KINDS).map(([type, kind]) => {
    const handler = (e: PointerEvent) => {
      const sample: PointerSample = {
        kind,
        x: e.clientX,
        y: e.clientY,
        t: e.timeStamp,
        pointerType: e.pointerType,
        id: e.pointerId,
        zoomed: (window.visualViewport?.scale ?? 1) > 1,
      };
      const before = swipe;
      const step = stepSwipe(swipe, sample);
      swipe = step.state;
      if (step.intent)
        controller.intent({ type: step.intent, source: "swipe" });
      if (before.active || swipe.active) {
        emitDebug({
          swipe: {
            dx: swipeDx(swipe.active ? swipe : before),
            v: swipeVelocity(swipe.samples, sample.t),
            lock: swipe.active ? swipe.lock : before.lock,
          },
        });
      }
    };
    window.addEventListener(type, handler as EventListener, { passive: true });
    return [type, handler as EventListener] as const;
  });
  return () => {
    for (const [type, handler] of handlers) {
      window.removeEventListener(type, handler);
    }
  };
}

export function usePagerInput(controller: PagerController): void {
  useEffect(() => {
    const cleanups = [
      bindWheel(controller),
      bindKeys(controller),
      bindSwipe(controller),
    ];
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [controller]);
}
