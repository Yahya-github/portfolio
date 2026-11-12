/**
 * Global motion module (D-04 device 4, D-06, WCAG 2.2.2). Lazy and React-free.
 * It never animates anything itself: it flips html flags that the CSS reads
 *   html[data-motion-ready]  the module is live (CSS shows the Pause motion button)
 *   html[data-motion="off"]  the visitor paused motion (the footer button toggles it)
 *   html[data-tab-hidden]    document.hidden mirrored so offscreen tabs do no work
 * and sizes each [data-names-strip] once per layout (fonts ready, resize via one rAF).
 * Pausing is not stored: every load starts running. React-owned footer nodes are
 * only read (click target), never mutated (T-06-37).
 */
import type { FeatureMount } from "@/lib/features/types";
import { NAMES_SPEED_FALLBACK, stripDuration } from "./names";

const STRIP = "[data-names-strip]";
const TOGGLE = "[data-motion-toggle]";

function namesSpeed(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--names-speed")
    .trim();
  const n = Number.parseFloat(raw);
  return n > 0 ? n : NAMES_SPEED_FALLBACK;
}

function sizeStrips(): void {
  const speed = namesSpeed();
  for (const strip of document.querySelectorAll<HTMLElement>(STRIP)) {
    const duration = stripDuration(
      strip.getBoundingClientRect().height / 2,
      speed,
    );
    if (duration) strip.style.setProperty("--names-d", duration);
  }
}

export const mount: FeatureMount = () => {
  const html = document.documentElement;
  let frame = 0;
  let live = true;

  html.dataset.motionReady = "";
  if (document.hidden) html.dataset.tabHidden = "";

  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest(TOGGLE)) return;
    if (html.dataset.motion === "off") delete html.dataset.motion;
    else html.dataset.motion = "off";
  };

  const onVisibility = (): void => {
    if (document.hidden) html.dataset.tabHidden = "";
    else delete html.dataset.tabHidden;
  };

  const onResize = (): void => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      sizeStrips();
    });
  };

  document.addEventListener("click", onClick);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", onResize);
  sizeStrips();
  void document.fonts?.ready.then(() => {
    if (live) sizeStrips();
  });

  return () => {
    live = false;
    if (frame) cancelAnimationFrame(frame);
    document.removeEventListener("click", onClick);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", onResize);
    delete html.dataset.motionReady;
    delete html.dataset.motion;
    delete html.dataset.tabHidden;
  };
};
