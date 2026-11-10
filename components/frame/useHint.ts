/**
 * First-visit hint driver (NAV-06, D-07..D-10). Runs the pure stepHint machine with
 * real time, storage and signals. Text is written with textContent from typed
 * constants only (T-05-13); storage access never throws (T-05-14).
 */
import { useEffect, type RefObject } from "react";
import { usePagerController } from "@/components/shell/PagerContext";
import { site } from "@/content/site";
import {
  initialHint,
  nextWakeAt,
  stepHint,
  type HintEvent,
  type HintState,
} from "@/lib/first-visit/hint";
import { HINT_KEY, markSeen, seenState } from "@/lib/first-visit/storage";
import { OPENING_DONE_EVENT } from "@/lib/motion/events";
import { FALLBACK_EASE, canAnimate, readEase } from "@/lib/motion/waapi";

const HINT_FADE_MS = 150;
const NUDGE_MS = 300;
const NUDGE_PX = 4;

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

    const reduced = (): boolean => controller?.isReducedMotion() ?? false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    let state: HintState = initialHint();

    const show = (): void => {
      hint.textContent = window.matchMedia("(pointer: coarse)").matches
        ? site.hint.coarse
        : site.hint.fine;
      hint.dataset.state = "shown";
      markSeen(HINT_KEY);
      shownThisLoad = true;
      if (hint.scrollWidth > hint.clientWidth) {
        hint.dataset.state = "done";
        hint.textContent = "";
        return;
      }
      const next = nextRef.current;
      if (!reduced() && canAnimate(next)) {
        next.animate(
          [
            { translate: "0px 0px" },
            { translate: `${NUDGE_PX}px 0px` },
            { translate: "0px 0px" },
          ],
          { duration: NUDGE_MS, easing: readEase("--ease-ui", FALLBACK_EASE.ui) },
        );
      }
    };

    const hide = (): void => {
      hint.dataset.state = "done";
      clearTimer = setTimeout(
        () => {
          hint.textContent = "";
        },
        reduced() ? 0 : HINT_FADE_MS,
      );
    };

    const step = (event: HintEvent): void => {
      const prev = state;
      state = stepHint(state, event);
      if (state.phase !== prev.phase) {
        if (state.phase === "shown") show();
        else if (state.phase === "done" && prev.phase === "shown") hide();
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
      if (timer !== undefined) clearTimeout(timer);
      if (clearTimer !== undefined) clearTimeout(clearTimer);
      document.removeEventListener(OPENING_DONE_EVENT, onOpeningDone);
      offSlide?.();
    };
  }, [controller, hintRef, nextRef]);
}
