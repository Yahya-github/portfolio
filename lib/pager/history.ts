import { sections } from "@/content/site";
import { indexOfRoute } from "@/lib/sections";
import type { HistoryPort } from "@/lib/pager/types";

/**
 * Removes Next's route announcer (RESEARCH Pitfall 1). It double-announces
 * and reads the wrong title on Back; the pager's polite live region is the only
 * announcement. Depends on Next 16.4.5 internals: re-check after any `next` upgrade.
 */
export function silenceNextAnnouncer(): void {
  document.querySelector("next-route-announcer")?.remove();
}

/** The pager owns scroll positions (Pitfall 2, D-06). */
export function setManualScrollRestoration(): void {
  try {
    window.history.scrollRestoration = "manual";
  } catch {
    /* unsupported: ignore */
  }
}

/** Exact route match only; unknown paths give null (T-04-16). */
export function indexFromLocation(): number | null {
  return indexOfRoute(window.location.pathname);
}

/**
 * Pushes only the six constant section routes plus the existing query (T-04-15).
 * Uses Next's patched pushState on the window's history: no reload, no remount (Pattern 2).
 */
export function createHistoryPort(): HistoryPort {
  return {
    push(index) {
      const route = sections[index]?.route;
      if (!route || window.location.pathname === route) return;
      silenceNextAnnouncer();
      try {
        window.history.pushState(null, "", route + window.location.search);
      } catch {
        /* UI-SPEC Error state: the slide happened, the URL stays (T-04-17) */
      }
    },
  };
}
