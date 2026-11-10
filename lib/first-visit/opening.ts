/**
 * The opening (EXP-01, D-01..D-06, A11Y-04; RESEARCH Pattern 4, Pitfalls 7, 8).
 * Fresh load: letters slide in from the right on black, then captions and chrome
 * fade up. First paged arrival at the Index (D-03): same slide from the left.
 * Skippable by any key but Tab/modifiers, or a click; the skipping input does
 * not also page or navigate. Always hands back a fully visible page.
 */
import {
  OPENING_CHROME_DELAY_MS,
  OPENING_UI_MS,
  isSkipKey,
  openingStartX,
} from "@/lib/first-visit/opening-rules";
import { OPENING_KEY, markSeen, seenState } from "@/lib/first-visit/storage";
import { LETTERS_MS, STAGGER_MS } from "@/lib/letters/geometry";
import type { GlideStart } from "@/lib/letters/glide";
import { GLIDE_SETTLED_EVENT, OPENING_DONE_EVENT } from "@/lib/motion/events";
import {
  FALLBACK_EASE,
  canAnimate,
  cancelOn,
  readEase,
} from "@/lib/motion/waapi";

export interface OpeningOptions {
  readonly nav: HTMLElement;
  readonly isReduced: () => boolean;
}

export interface Opening {
  /** Fresh-load path. */
  claim(): void;
  /** D-03 paged path; finishes a running opening first. */
  interceptArrival(start: GlideStart): boolean;
  /** Skip, resize, reduced-motion switch, page change. */
  finish(): void;
  isRunning(): boolean;
  destroy(): void;
}

export function createOpening(options: OpeningOptions): Opening {
  const { nav } = options;
  let running = false;
  let playedThisLoad = false;
  let animations: Animation[] = [];
  let removeSkip: (() => void) | null = null;

  // Child effects run before the pager provider syncs its reduced flag, so also read the media query (A11Y-04).
  const reduced = (): boolean =>
    options.isReduced() ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const letters = (): HTMLElement[] =>
    Array.from(nav.querySelectorAll<HTMLElement>(":scope > a"));

  const done = (): void => {
    running = false;
    animations.forEach((a) => a.cancel());
    animations = [];
    removeSkip?.();
    removeSkip = null;
    delete document.documentElement.dataset.opening;
    document.dispatchEvent(new Event(OPENING_DONE_EVENT));
    document.dispatchEvent(new Event(GLIDE_SETTLED_EVENT));
  };

  const finish = (): void => {
    if (!running) return;
    animations.forEach((a) => {
      try {
        a.finish();
      } catch {
        /* already cancelled */
      }
    });
    done();
  };

  const installSkip = (): void => {
    const onKey = (e: KeyboardEvent): void => {
      if (!isSkipKey(e)) return;
      finish();
      e.preventDefault();
      e.stopPropagation();
    };
    const swallowClick = (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      window.removeEventListener("click", swallowClick, { capture: true });
    };
    const onPointer = (): void => {
      finish();
      window.addEventListener("click", swallowClick, { capture: true });
      const drop = (): void => {
        setTimeout(
          () =>
            window.removeEventListener("click", swallowClick, {
              capture: true,
            }),
          0,
        );
      };
      window.addEventListener("pointerup", drop, { once: true });
      window.addEventListener("pointercancel", drop, { once: true });
    };
    window.addEventListener("keydown", onKey, { capture: true });
    window.addEventListener("pointerdown", onPointer, { capture: true });
    removeSkip = () => {
      window.removeEventListener("keydown", onKey, { capture: true });
      window.removeEventListener("pointerdown", onPointer, { capture: true });
    };
  };

  const play = (from: "right" | "left", chrome: boolean): void => {
    playedThisLoad = true;
    running = true;
    markSeen(OPENING_KEY);
    document.documentElement.dataset.opening = "running";
    nav.dataset.mode = "hero";
    delete nav.dataset.flight;
    const els = letters();
    els.forEach(cancelOn);
    const x0 = openingStartX(window.innerWidth, from);
    const slide = readEase("--ease-page", FALLBACK_EASE.page);
    els.forEach((el, i) => {
      animations.push(
        el.animate([{ translate: `${x0}px 0px` }, { translate: "0px 0px" }], {
          duration: LETTERS_MS,
          delay: i * STAGGER_MS,
          easing: slide,
          fill: "both",
        }),
      );
    });
    const fade: HTMLElement[] = Array.from(
      nav.querySelectorAll<HTMLElement>(":scope > a .t-label"),
    );
    if (chrome) {
      for (const el of [
        document.querySelector<HTMLElement>("header"),
        document.querySelector<HTMLElement>("footer"),
        document.getElementById("page-index"),
      ]) {
        if (el) fade.push(el);
      }
    }
    const ui = readEase("--ease-ui", FALLBACK_EASE.ui);
    fade.forEach((el) => {
      animations.push(
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: OPENING_UI_MS,
          delay: OPENING_CHROME_DELAY_MS,
          easing: ui,
          fill: "both",
        }),
      );
    });
    installSkip();
    void Promise.all(
      animations.map((a) =>
        a.finished.then(
          () => true,
          () => false,
        ),
      ),
    ).then(() => {
      if (running) done();
    });
  };

  return {
    claim() {
      const html = document.documentElement;
      if (html.dataset.opening === "pending") {
        if (!canAnimate(letters()[0])) {
          markSeen(OPENING_KEY);
          delete html.dataset.opening;
          document.dispatchEvent(new Event(OPENING_DONE_EVENT));
          return;
        }
        play("right", true);
        return;
      }
      if (
        location.pathname === "/" &&
        reduced() &&
        seenState(OPENING_KEY) === "unseen"
      ) {
        markSeen(OPENING_KEY);
      }
    },
    interceptArrival(s) {
      if (running) {
        finish();
        return false;
      }
      if (s.to !== 0 || playedThisLoad) return false;
      if (reduced()) {
        if (seenState(OPENING_KEY) === "unseen") markSeen(OPENING_KEY);
        return false;
      }
      if (seenState(OPENING_KEY) !== "unseen") return false;
      if (!canAnimate(letters()[0])) return false;
      play("left", false);
      return true;
    },
    finish,
    isRunning: () => running,
    destroy() {
      if (running) finish();
    },
  };
}
