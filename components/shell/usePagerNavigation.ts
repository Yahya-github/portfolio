/**
 * Navigation inputs that are not gestures (NAV-04): internal link clicks and
 * Back/Forward. Gesture inputs live in usePagerInput (plan 04-10).
 *
 * T-04-21: only same-origin, fragment-free links whose pathname is exactly one
 * of the six routes are intercepted. Modifier and middle clicks, `target`,
 * `download`, hash links (the skip link) and external links stay with the browser.
 * T-04-22: unknown paths on popstate are ignored.
 * WR-04: a popstate that keeps the pathname (fragment navigation) is ignored, even mid-slide.
 */
import { useEffect } from "react";
import { indexOfRoute } from "@/lib/sections";
import { indexFromLocation, silenceNextAnnouncer } from "@/lib/pager/history";
import type { PagerController } from "@/lib/pager/types";

/**
 * The URL only changes at landing, so during a slide it still names the page
 * being left. `seen` tracks the pathname the pager last loaded, landed on or
 * was popped to; a popstate that leaves it unchanged is a fragment navigation
 * (the skip link, an in-page #hash link) and never a history move (WR-04).
 */
function popstateHandler(
  controller: PagerController,
  seen: { pathname: string },
): () => void {
  return () => {
    const pathname = window.location.pathname;
    if (pathname === seen.pathname) return;
    seen.pathname = pathname;
    const index = indexFromLocation();
    if (index === null) return;
    if (index === controller.getSnapshot().target) return;
    silenceNextAnnouncer();
    controller.intent({ type: "goto", index, source: "history" });
  };
}

function isPlainClick(e: MouseEvent): boolean {
  return !(
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey
  );
}

/** The page index a click should page to, or null when the browser keeps it. */
function pagedIndexOf(e: MouseEvent): number | null {
  if (!isPlainClick(e)) return null;
  const target = e.target as Element | null;
  const a = target?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || a.target || a.hasAttribute("download")) return null;
  if ((a.getAttribute("href") ?? "").startsWith("#")) return null;
  let url: URL;
  try {
    url = new URL(a.href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin || url.hash !== "") return null;
  return indexOfRoute(url.pathname);
}

function clickHandler(controller: PagerController): (e: MouseEvent) => void {
  return (e) => {
    const index = pagedIndexOf(e);
    if (index === null) return;
    e.preventDefault();
    controller.intent({ type: "goto", index, source: "link" });
  };
}

/** Pitfall 11: the document never keeps a horizontal scroll offset. */
function onScroll(): void {
  if (window.scrollX !== 0) {
    window.scrollTo({ top: window.scrollY, left: 0, behavior: "instant" });
  }
}

export function usePagerNavigation(controller: PagerController): void {
  useEffect(() => {
    const seen = { pathname: window.location.pathname };
    const offLanded = controller.signals.onLanded(() => {
      seen.pathname = window.location.pathname;
    });
    const onPop = popstateHandler(controller, seen);
    const onClick = clickHandler(controller);
    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      offLanded();
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, [controller]);
}
