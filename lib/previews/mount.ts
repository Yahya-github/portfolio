/**
 * Previews feature (CONT-10). Keeps each hover/focus preview inside the
 * viewport above the footer, and keeps a stale hover preview hidden after the
 * window lost focus until the pointer really moves. Only a CSS variable and a
 * data attribute are written; no HTML is ever injected (T-06-15).
 */
import type { FeatureMount } from "@/lib/features/types";
import { PREVIEW_INSET_PX, previewOffset } from "./nudge";

const FALLBACK_FRAME_TOP = 72;

function frameTop(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--frame-top",
  );
  return parseFloat(raw) || FALLBACK_FRAME_TOP;
}

export const mount: FeatureMount = (root) => {
  const setQuiet = () => {
    root.dataset.quiet = "";
  };
  const clearQuiet = () => {
    delete root.dataset.quiet;
  };

  const onBlur = () => setQuiet();
  const onVisibility = () => {
    if (document.visibilityState === "hidden") setQuiet();
  };
  const onPointerMove = (e: PointerEvent) => {
    if (e.movementX !== 0 || e.movementY !== 0) clearQuiet();
  };

  const nudge = (e: Event) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const item = target.closest("[data-preview-item]");
    const figure = item?.querySelector<HTMLElement>("[data-preview]");
    if (!figure) return;
    figure.style.setProperty("--pv-y", "0px");
    const r = figure.getBoundingClientRect();
    const footer = document.querySelector("footer");
    const limit =
      (footer ? footer.getBoundingClientRect().top : window.innerHeight) -
      PREVIEW_INSET_PX;
    const offset = previewOffset({
      top: r.top,
      bottom: r.bottom,
      viewportTop: frameTop() + PREVIEW_INSET_PX,
      limit,
    });
    figure.style.setProperty("--pv-y", `${offset}px`);
  };

  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  root.addEventListener("pointerleave", clearQuiet);
  root.addEventListener("pointerenter", nudge, { capture: true });
  root.addEventListener("focusin", nudge);

  return () => {
    window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerleave", clearQuiet);
    root.removeEventListener("pointerenter", nudge, { capture: true });
    root.removeEventListener("focusin", nudge);
    clearQuiet();
  };
};
