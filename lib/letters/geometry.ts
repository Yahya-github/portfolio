/**
 * Pure glide maths for the letter navigation (LTR-03, D-11..D-13).
 * No DOM: the runner in glide.ts measures, this module decides.
 */

export type LettersMode = "hero" | "rail";

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly height: number;
}

export interface Delta {
  readonly dx: number;
  readonly dy: number;
  readonly s: number;
}

export type GlidePlan =
  | { readonly kind: "none" }
  | { readonly kind: "fly"; readonly dest: LettersMode };

/** Per-letter stagger in reading order Y A H Y A (D-12). */
export const STAGGER_MS = 30;
/** Y and scale start this long after X (D-11). */
export const Y_LAG_MS = 100;
export const LETTER_COUNT = 5;
/** Equals SLIDE_MS (D-13): letters and track finish together. */
export const LETTERS_MS = 600;

export const IDENTITY: Delta = { dx: 0, dy: 0, s: 1 };

/** Transform that maps the hero box onto `target`; IDENTITY for degenerate input. */
export function deltaOnto(hero: Box, target: Box): Delta {
  const values = [
    hero.left,
    hero.top,
    hero.height,
    target.left,
    target.top,
    target.height,
  ];
  if (!values.every(Number.isFinite) || hero.height <= 0) return IDENTITY;
  return {
    dx: target.left - hero.left,
    dy: target.top - hero.top,
    s: target.height / hero.height,
  };
}

/** Index 0 is the home page (hero letters); everything else shows the rail. */
export function destinationOf(index: number): LettersMode {
  return index === 0 ? "hero" : "rail";
}

/** Rail-to-rail and same-destination moves never restart the letters (D-13). */
export function planGlide(heading: LettersMode, to: number): GlidePlan {
  const dest = destinationOf(to);
  return dest === heading ? { kind: "none" } : { kind: "fly", dest };
}

export function letterTiming(index: number): {
  xDelay: number;
  yDelay: number;
} {
  const xDelay = index * STAGGER_MS;
  return { xDelay, yDelay: xDelay + Y_LAG_MS };
}

/** Moves a box up by `scrollY` (the absolute hero row moved with a scroll reset, Pitfall 6). */
export function shiftBox(box: Box, scrollY: number): Box {
  return { left: box.left, top: box.top - scrollY, height: box.height };
}

export function lastLetterEndMs(
  count: number = LETTER_COUNT,
  duration: number = LETTERS_MS,
): number {
  return (count - 1) * STAGGER_MS + Y_LAG_MS + duration;
}
