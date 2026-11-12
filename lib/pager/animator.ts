import {
  FALLBACK_EASE,
  cancelOn,
  canAnimate,
  readEase,
} from "@/lib/motion/waapi";
import type { Animator, SlideOptions } from "@/lib/pager/types";

/** One slide, shared by track and progress bar (D-03, D-11); the letters glide on their own (Phase 5, lib/letters/glide.ts). */
export const SLIDE_MS = 600;

export interface AnimatorTargets {
  track(): HTMLElement | null;
  bar(): HTMLElement | null;
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

/** Track offset at rest. The letters are outside the track, so the glide measures their own CSS rests (Phase 5 D-15). */
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
  return retarget
    ? readEase("--ease-retarget", FALLBACK_EASE.retarget)
    : readEase("--ease-page", FALLBACK_EASE.page);
}

function track3d(x: number): Keyframe {
  return { transform: `translate3d(${x}px, 0, 0)` };
}

/** WAAPI animator: every slide starts from the rendered position, so a retarget never snaps (D-01). */
export function createWaapiAnimator(targets: AnimatorTargets): Animator {
  const cancelAll = (): void => {
    cancelOn(targets.track());
    cancelOn(targets.bar());
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
    return trackAnimation.finished.then(
      () => true,
      () => false,
    );
  };

  return { slideTo, settle };
}
