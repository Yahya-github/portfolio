import type { Animator, SlideOptions } from "@/lib/pager/types";

/** One slide, shared by track, progress bar and riding hero row (D-03, D-09, D-11). */
export const SLIDE_MS = 600;

const FALLBACK_EASE = {
  page: "cubic-bezier(0.77, 0, 0.18, 1)",
  retarget: "cubic-bezier(0.3, 0.6, 0.18, 1)",
} as const;

export interface AnimatorTargets {
  track(): HTMLElement | null;
  bar(): HTMLElement | null;
  letters(): HTMLElement | null;
}

const MATRIX = /^matrix(3d)?\(([^)]*)\)$/;

/** Horizontal translation (px) of a computed transform; 0 for none or anything unparseable. */
export function translateXOf(transform: string): number {
  const match = MATRIX.exec(transform.trim());
  if (!match) return 0;
  const values = match[2].split(",").map((v) => Number.parseFloat(v));
  const is3d = match[1] === "3d";
  if (values.length !== (is3d ? 16 : 6)) return 0;
  const x = values[is3d ? 12 : 4];
  return Number.isFinite(x) ? x : 0;
}

/** Track offset at rest. Phase 5 replaces the viewport width with the rail measurement. */
export function restingOffsetPx(
  index: number,
  viewportWidth: number = window.innerWidth,
): number {
  return -index * viewportWidth;
}

function renderedX(el: HTMLElement | null): number {
  return el ? translateXOf(getComputedStyle(el).transform) : 0;
}

function easing(retarget: boolean): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(retarget ? "--ease-retarget" : "--ease-page")
    .trim();
  return value || (retarget ? FALLBACK_EASE.retarget : FALLBACK_EASE.page);
}

/** CSS-driven animations and transitions (e.g. the letters' `rail-in` fade) are not ours to cancel. */
function isCssDriven(animation: Animation): boolean {
  return (
    (typeof CSSAnimation !== "undefined" &&
      animation instanceof CSSAnimation) ||
    (typeof CSSTransition !== "undefined" && animation instanceof CSSTransition)
  );
}

/** Cancels the WAAPI slide animations on `el`; getAnimations() also returns CSS ones (WR-01). */
function cancelOn(el: HTMLElement | null): void {
  el?.getAnimations?.()
    .filter((a) => !isCssDriven(a))
    .forEach((a) => a.cancel());
}

function canAnimate(el: HTMLElement | null): el is HTMLElement {
  return el !== null && typeof el.animate === "function";
}

function track3d(x: number): Keyframe {
  return { transform: `translate3d(${x}px, 0, 0)` };
}

/** WAAPI animator: every slide starts from the rendered position, so a retarget never snaps (D-01). */
export function createWaapiAnimator(targets: AnimatorTargets): Animator {
  const cancelAll = (): void => {
    cancelOn(targets.track());
    cancelOn(targets.bar());
    cancelOn(targets.letters());
  };

  const settle = (index: number): void => {
    targets.track()?.style.setProperty("--track-index", String(index));
    targets.bar()?.style.setProperty("--page-index", String(index));
    cancelAll();
  };

  const slideTo = (index: number, options: SlideOptions): Promise<boolean> => {
    const track = targets.track();
    if (!track) return Promise.resolve(true);
    if (options.reduced || !canAnimate(track)) {
      settle(index);
      return Promise.resolve(true);
    }
    const bar = targets.bar();
    const letters = targets.letters();
    // Read every "from" before cancelling: cancel drops the fill and would snap to rest.
    const trackFrom = renderedX(track);
    const barFrom = renderedX(bar);
    cancelAll();

    const timing: KeyframeAnimationOptions = {
      duration: SLIDE_MS,
      easing: easing(options.retarget),
      fill: "forwards",
    };
    const trackTo = -index * window.innerWidth;
    const trackAnimation = track.animate(
      [track3d(trackFrom), track3d(trackTo)],
      timing,
    );
    if (canAnimate(bar)) {
      bar.animate(
        [
          { transform: `translateX(${barFrom}px)` },
          { transform: `translateX(${index * bar.offsetWidth}px)` },
        ],
        timing,
      );
    }
    if (canAnimate(letters) && letters.dataset.mode === "hero") {
      letters.animate([track3d(trackFrom), track3d(trackTo)], timing);
    }
    return trackAnimation.finished.then(
      () => true,
      () => false,
    );
  };

  return { slideTo, settle };
}
