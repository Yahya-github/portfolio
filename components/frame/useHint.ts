/**
 * First-visit hint driver (NAV-06, D-07..D-10). Runs the pure stepHint machine with
 * real time, storage and signals. Text is written with textContent from typed
 * constants only (T-05-13); storage access never throws (T-05-14).
 * Memory is written when the visitor pages or after 3000ms visible; the nudge is two
 * 12px pulses 200ms after showing (05-12 gap closure).
 * Phase 6: publishes html[data-hint] while the hint is pending or shown (and fires
 * HINT_DONE_EVENT when it ends) so the Pause motion control and the margin names never
 * share the footer or move with the hint (UI-SPEC footer collision rule).
 */
import { useEffect, type RefObject } from "react";
import { usePagerController } from "@/components/shell/PagerContext";
import { site } from "@/content/site";
import {
  NUDGE_DELAY_MS,
  NUDGE_TOTAL_MS,
  initialHint,
  nextWakeAt,
  nudgeKeyframes,
  stepHint,
  type HintEvent,
  type HintState,
} from "@/lib/first-visit/hint";
import { HINT_KEY, markSeen, seenState } from "@/lib/first-visit/storage";
import { HINT_DONE_EVENT, OPENING_DONE_EVENT } from "@/lib/motion/events";
import { FALLBACK_EASE, canAnimate, readEase } from "@/lib/motion/waapi";

const HINT_FADE_MS = 150;

/** Blocked storage cannot remember the hint, so cap it to one show per page load. */
let shownThisLoad = false;

export function useHint(
  hintRef: RefObject<HTMLElement | null>,
  nextRef: RefObject<HTMLElement | null>,
): void {
  const controller = usePagerController();
  useEffect(() => {
    const hint = hintRef.current;
    if (!hint) return;
    const seen = seenState(HINT_KEY);
    if (seen === "seen" || (seen === "unavailable" && shownThisLoad)) return;

    const html = document.documentElement;
    html.dataset.hint = "pending";
    let flagged = true;
    const clearFlag = (): void => {
      if (!flagged) return;
      flagged = false;
      delete html.dataset.hint;
      document.dispatchEvent(new Event(HINT_DONE_EVENT));
    };

    const reduced = (): boolean => controller?.isReducedMotion() ?? false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    let state: HintState = initialHint();
    let nudge: Animation | undefined;

    const show = (): void => {
      hint.textContent = window.matchMedia("(pointer: coarse)").matches
        ? site.hint.coarse
        : site.hint.fine;
      hint.dataset.state = "shown";
      shownThisLoad = true;
      if (hint.scrollWidth > hint.clientWidth) {
        hint.dataset.state = "done";
        hint.textContent = "";
        clearFlag();
        return;
      }
      const next = nextRef.current;
      if (!reduced() && canAnimate(next)) {
        nudge = next.animate(
          nudgeKeyframes(readEase("--ease-ui", FALLBACK_EASE.ui)),
          { duration: NUDGE_TOTAL_MS, delay: NUDGE_DELAY_MS, easing: "linear" },
        );
      }
    };

    const hide = (): void => {
      nudge?.cancel();
      hint.dataset.state = "done";
      // The flag outlives the 150ms fade so the control never shares the footer with the text.
      clearTimer = setTimeout(
        () => {
          hint.textContent = "";
          clearFlag();
        },
        reduced() ? 0 : HINT_FADE_MS,
      );
    };

    const step = (event: HintEvent): void => {
      const prev = state;
      state = stepHint(state, event);
      if (state.seen && !prev.seen) markSeen(HINT_KEY);
      if (state.phase !== prev.phase) {
        if (state.phase === "shown") show();
        else if (state.phase === "done" && prev.phase === "shown") hide();
        else if (state.phase === "done") clearFlag();
      }
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      const wake = nextWakeAt(state);
      if (wake !== null) {
        timer = setTimeout(
          () => step({ type: "tick", at: performance.now() }),
          Math.max(0, wake - performance.now()),
        );
      }
    };

    const onOpeningDone = (): void =>
      step({ type: "opening-done", at: performance.now() });
    document.addEventListener(OPENING_DONE_EVENT, onOpeningDone);
    const offSlide = controller?.signals.onSlideStart(() =>
      step({ type: "page-change", at: performance.now() }),
    );

    step({
      type: "load",
      at: performance.now(),
      openingPending: document.documentElement.dataset.opening !== undefined,
    });

    return () => {
      clearFlag();
      nudge?.cancel();
      if (timer !== undefined) clearTimeout(timer);
      if (clearTimer !== undefined) clearTimeout(clearTimer);
      document.removeEventListener(OPENING_DONE_EVENT, onOpeningDone);
      offSlide?.();
    };
  }, [controller, hintRef, nextRef]);
}
