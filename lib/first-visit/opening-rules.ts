import {
  LETTERS_MS,
  LETTER_COUNT,
  STAGGER_MS,
} from "@/lib/letters/geometry";

/**
 * Pure opening rules (EXP-01, D-01, D-06, UI-SPEC section 2). No DOM, no clock.
 */

/** Equals --dur-ui: the chrome fades in over this long after the letters land. */
export const OPENING_UI_MS = 150;

/** Chrome appears once the last letter has finished its staggered slide. */
export const OPENING_CHROME_DELAY_MS = (LETTER_COUNT - 1) * STAGGER_MS + LETTERS_MS;

/** Whole opening: under one second (EXP-01). */
export const OPENING_TOTAL_MS = OPENING_CHROME_DELAY_MS + OPENING_UI_MS;

/** Letters start this far beyond the viewport edge (UI-SPEC section 2). */
export const OPENING_OFFSET_PAD_PX = 24;

export function openingStartX(vw: number, from: "right" | "left"): number {
  const distance = vw + OPENING_OFFSET_PAD_PX;
  return from === "right" ? distance : -distance;
}

export interface SkipKeyLike {
  readonly key: string;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
}

/** Keys that must never skip: focus movement and bare modifiers (D-06, T-05-11). */
const NEVER_SKIP: ReadonlySet<string> = new Set([
  "Tab",
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "AltGraph",
  "Fn",
  "OS",
]);

/** D-06: any real key skips, except focus movement, bare modifiers and chords. */
export function isSkipKey(e: SkipKeyLike): boolean {
  if (e.altKey || e.ctrlKey || e.metaKey) return false;
  return !NEVER_SKIP.has(e.key);
}
