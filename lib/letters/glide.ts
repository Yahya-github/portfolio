/**
 * DOM glide runner for the letter navigation (LTR-03, D-11..D-15).
 * Hero-geometry FLIP: letters always fly in hero geometry (scale never
 * exceeds 1) and swap to the rail layout only at settle. RESEARCH Patterns
 * 1-3, Pitfalls 1, 2 and 6. A retarget starts from the rendered rect read
 * before cancel; rail-to-rail paging never restarts the letters.
 */
import {
  deltaOnto,
  IDENTITY,
  LETTERS_MS,
  letterTiming,
  planGlide,
  shiftBox,
  type Box,
  type LettersMode,
} from "@/lib/letters/geometry";
import { GLIDE_SETTLED_EVENT } from "@/lib/motion/events";
import {
  canAnimate,
  cancelOn,
  FALLBACK_EASE,
  readEase,
} from "@/lib/motion/waapi";

export interface GlideStart {
  readonly to: number;
  readonly retarget: boolean;
  readonly heldScrollY: number;
}

export interface GlideOptions {
  /** nav[data-pager="letters"] */
  readonly nav: HTMLElement;
  /** Live reduced-motion read (WR-08). */
  readonly isReduced: () => boolean;
  /** True when another module owns this arrival (D-03 opening). */
  readonly intercept?: (start: GlideStart) => boolean;
}

export interface Glide {
  start(start: GlideStart): void;
  /** Resize / reduced-motion switch: cancel and write the heading mode now. */
  snapToRest(): void;
  /** Mode the letters are at or flying to. */
  heading(): LettersMode;
  isFlying(): boolean;
  destroy(): void;
}

export function createGlide(options: GlideOptions): Glide {
  const { nav } = options;
  let heading: LettersMode = nav.dataset.mode === "rail" ? "rail" : "hero";
  let flying = false;
  let flightId = 0;

  const letters = (): HTMLElement[] =>
    Array.from(nav.querySelectorAll<HTMLElement>(":scope > a"));

  const rects = (): Box[] =>
    letters().map((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, height: r.height };
    });

  const settle = (mode: LettersMode): void => {
    nav.dataset.mode = mode;
    delete nav.dataset.flight;
    letters().forEach(cancelOn);
    flying = false;
    heading = mode;
    document.dispatchEvent(new Event(GLIDE_SETTLED_EVENT));
  };

  const animateLetters = (
    els: HTMLElement[],
    first: Box[],
    hero: Box[],
    rail: Box[],
    dest: LettersMode,
    retarget: boolean,
  ): Animation[] => {
    const xEase = retarget
      ? readEase("--ease-retarget", FALLBACK_EASE.retarget)
      : readEase("--ease-page", FALLBACK_EASE.page);
    const yEase = readEase("--ease-settle", FALLBACK_EASE.settle);
    const animations: Animation[] = [];
    els.forEach((el, i) => {
      const from = deltaOnto(hero[i], first[i]);
      const to = dest === "rail" ? deltaOnto(hero[i], rail[i]) : IDENTITY;
      const { xDelay, yDelay } = letterTiming(i);
      animations.push(
        el.animate(
          [
            { translate: `${from.dx}px 0px` },
            { translate: `${to.dx}px 0px` },
          ],
          {
            duration: LETTERS_MS,
            delay: xDelay,
            easing: xEase,
            fill: "both",
          },
        ),
        el.animate(
          [
            { transform: `translateY(${from.dy}px) scale(${from.s})` },
            { transform: `translateY(${to.dy}px) scale(${to.s})` },
          ],
          {
            duration: LETTERS_MS,
            delay: yDelay,
            easing: yEase,
            fill: "both",
          },
        ),
      );
    });
    return animations;
  };

  const start = (s: GlideStart): void => {
    if (options.intercept?.(s)) {
      flightId += 1;
      letters().forEach(cancelOn);
      flying = false;
      heading = "hero";
      return;
    }
    const plan = planGlide(heading, s.to);
    if (plan.kind === "none") return;

    const els = letters();
    if (options.isReduced() || !canAnimate(els[0] ?? null)) {
      flightId += 1;
      settle(plan.dest);
      return;
    }

    // Read the rendered rects before cancelling: cancel drops the fill.
    let first = rects();
    if (nav.dataset.mode === "hero" && s.heldScrollY > 0) {
      first = first.map((b) => shiftBox(b, s.heldScrollY));
    }
    els.forEach(cancelOn);
    nav.dataset.mode = "rail";
    const rail = rects();
    nav.dataset.mode = "hero";
    const hero = rects();
    nav.dataset.flight = plan.dest === "rail" ? "out" : "in";

    const animations = animateLetters(
      els,
      first,
      hero,
      rail,
      plan.dest,
      s.retarget,
    );
    const id = ++flightId;
    flying = true;
    heading = plan.dest;
    void Promise.all(
      animations.map((a) =>
        a.finished.then(
          () => true,
          () => false,
        ),
      ),
    ).then(() => {
      if (id === flightId) settle(plan.dest);
    });
  };

  return {
    start,
    snapToRest(): void {
      if (!flying) return;
      flightId += 1;
      settle(heading);
    },
    heading: () => heading,
    isFlying: () => flying,
    destroy(): void {
      flightId += 1;
      letters().forEach(cancelOn);
    },
  };
}
