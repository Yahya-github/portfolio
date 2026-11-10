/**
 * Shared WAAPI helpers (Phase 4 animator, Phase 5 glide, opening, hint nudge).
 * Read every 'from' before cancelling.
 */

export const FALLBACK_EASE = {
  page: "cubic-bezier(0.77, 0, 0.18, 1)",
  retarget: "cubic-bezier(0.3, 0.6, 0.18, 1)",
  settle: "cubic-bezier(0.5, 0, 0.2, 1)",
  ui: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

/** Reads an easing token from :root, falling back when it is empty (jsdom, missing CSS). */
export function readEase(
  name: "--ease-page" | "--ease-retarget" | "--ease-settle" | "--ease-ui",
  fallback: string,
): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/** CSS-driven animations and transitions (e.g. the letters' `rail-in` fade) are not ours to cancel. */
export function isCssDriven(animation: Animation): boolean {
  return (
    (typeof CSSAnimation !== "undefined" &&
      animation instanceof CSSAnimation) ||
    (typeof CSSTransition !== "undefined" && animation instanceof CSSTransition)
  );
}

/** Cancels the WAAPI animations on `el`; getAnimations() also returns CSS ones (WR-01). */
export function cancelOn(el: Element | null): void {
  el?.getAnimations?.()
    .filter((a) => !isCssDriven(a))
    .forEach((a) => a.cancel());
}

export function canAnimate(el: Element | null): el is HTMLElement {
  return el !== null && typeof (el as HTMLElement).animate === "function";
}
