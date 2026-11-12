/**
 * Toggles feature (CONT-12, DSGN-05, D-09, D-11).
 * - Touch taps on [data-tap-colour] toggle data-colour (marks show true colours; a second tap releases).
 * - [data-portrait-toggle] buttons are enabled here, toggle aria-pressed on click, and load their
 *   on-demand colour twin on first hover, focus or click.
 * Only attribute writes on server-rendered nodes; no markup is created.
 */
import { loadDeferred } from "@/lib/media/defer";
import type { FeatureMount } from "@/lib/features/types";

const TWIN_SELECTOR = 'img[data-twin="colour"]';

export const mount: FeatureMount = (root) => {
  const buttons = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-portrait-toggle]"),
  ];
  const taps = new Set<Element>();
  const disposers: Array<() => void> = [];

  const onPointerDown = (e: Event) => {
    if ((e as PointerEvent).pointerType !== "touch") return;
    const target = (e.target as Element | null)?.closest("[data-tap-colour]");
    if (!target || !root.contains(target)) return;
    const on = target.toggleAttribute("data-colour");
    if (on) taps.add(target);
    else taps.delete(target);
  };
  root.addEventListener("pointerdown", onPointerDown);
  disposers.push(() => root.removeEventListener("pointerdown", onPointerDown));

  for (const button of buttons) {
    const load = () => {
      const twin = button.querySelector<HTMLImageElement>(TWIN_SELECTOR);
      if (twin) loadDeferred(twin);
    };
    const onClick = () => {
      load();
      const pressed = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", pressed ? "false" : "true");
    };
    button.removeAttribute("disabled");
    button.addEventListener("click", onClick);
    button.addEventListener("pointerenter", load);
    button.addEventListener("focus", load);
    disposers.push(() => {
      button.removeEventListener("click", onClick);
      button.removeEventListener("pointerenter", load);
      button.removeEventListener("focus", load);
      button.setAttribute("disabled", "");
      button.setAttribute("aria-pressed", "false");
    });
  }

  return () => {
    for (const d of disposers) d();
    for (const el of taps) el.removeAttribute("data-colour");
    taps.clear();
  };
};
