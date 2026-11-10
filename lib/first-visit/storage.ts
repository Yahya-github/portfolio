/**
 * First-visit memory (Phase 5, D-04, D-09). One key for the opening, one for the hint.
 * Values are compared against null only, never parsed (Security V5). Never throws:
 * a private window or blocked storage reads as "unavailable".
 */
export const OPENING_KEY = "yh-opening-seen";
export const HINT_KEY = "yh-hint-seen";
export const SEEN_VALUE = "1";

export type SeenState = "unseen" | "seen" | "unavailable";

export function safeGet(key: string): string | null | undefined {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return undefined;
  }
}

export function safeSet(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function seenState(key: string): SeenState {
  const value = safeGet(key);
  if (value === undefined) return "unavailable";
  return value === null ? "unseen" : "seen";
}

export function markSeen(key: string): boolean {
  return safeSet(key, SEEN_VALUE);
}
