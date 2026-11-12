/**
 * The custom cursor (EXP-03, form a): a 4px dot on the pointer and a 16px ink
 * square that follows 1:1 and snaps to links, buttons and letters (D-16..D-19).
 *
 * React-free and lazily imported (see PagerProvider) so it stays out of the
 * initial JS. Nothing is drawn and the native cursor stays until the first
 * real mouse move (WR-05, WR-07): there is no (0,0) sentinel. The blend sits
 * on the fixed root (Pitfall 11), transitions run only while snapping
 * (Pitfall 14), and paging drops the snap and re-snaps after the track has
 * landed and the letters have settled (Pitfall 13). Tag text is textContent
 * only (T-05-15).
 */
import { parseDurationMs } from "@/lib/motion/duration";
import { GLIDE_SETTLED_EVENT } from "@/lib/motion/events";
import type { PagerSignals } from "@/lib/pager/types";
import { placeTag } from "./place-tag";
import {
  hairlineTransforms,
  idleBox,
  inflate,
  snapTargetOf,
  tagTextOf,
  type CursorBox,
} from "./targets";
import styles from "./cursor.module.css";

const LETTERS_NAV = 'nav[data-pager="letters"]';
const FALLBACK_SNAP_MS = 150;

function part(className: string, name: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = className;
  el.dataset.cursorPart = name;
  return el;
}

/** The numeric --dur-ui in ms; 0 under reduced motion (the token is zeroed). */
function snapDurationMs(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--dur-ui")
    .trim();
  const ms = parseDurationMs(raw);
  return Number.isFinite(ms) ? ms : FALLBACK_SNAP_MS;
}

export function mountCursor(signals: PagerSignals): () => void {
  const root = part(styles.root, "root");
  root.setAttribute("aria-hidden", "true");
  const dot = part(styles.dot, "dot");
  const lines = [0, 1, 2, 3].map(() => part(styles.line, "line"));
  root.append(dot, ...lines);
  const tag = part(`t-label t-tag ${styles.tag}`, "tag");
  tag.setAttribute("aria-hidden", "true");
  document.body.append(root, tag);

  const html = document.documentElement;
  let pos: { x: number; y: number } | null = null;
  let target: HTMLElement | null = null;
  let paging = false;
  // True between pointerleave and the next pointer activity: nothing may snap or show the tag then.
  let outside = false;
  let landed = true;
  let snapTimer: ReturnType<typeof setTimeout> | null = null;

  const drawBox = (b: CursorBox) => {
    const t = hairlineTransforms(b);
    lines.forEach((line, i) => {
      line.style.transform = t[i];
    });
  };

  const hideTag = () => {
    delete tag.dataset.visible;
  };

  const showTagFor = (t: HTMLElement) => {
    const text = tagTextOf(t);
    if (!text) return hideTag();
    const rect = t.getBoundingClientRect();
    tag.textContent = text;
    const { width, height } = tag.getBoundingClientRect();
    const { x, y } = placeTag(
      { ...rect, left: rect.left, top: rect.top },
      width,
      height,
      window.innerWidth,
      window.innerHeight,
    );
    tag.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    tag.dataset.visible = "";
  };

  const setTarget = (t: HTMLElement | null) => {
    target = t;
    root.dataset.snapping = "";
    if (snapTimer) clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      delete root.dataset.snapping;
      snapTimer = null;
    }, snapDurationMs());
    if (t) {
      root.dataset.snapped = "";
      drawBox(inflate(t.getBoundingClientRect()));
      showTagFor(t);
      return;
    }
    delete root.dataset.snapped;
    hideTag();
    if (pos) drawBox(idleBox(pos.x, pos.y));
  };

  const resnap = () => {
    paging = false;
    if (!pos || outside) return;
    const t = snapTargetOf(document.elementFromPoint(pos.x, pos.y));
    setTarget(t);
  };

  const settledNow = () =>
    !document.querySelector(`${LETTERS_NAV}[data-flight]`);

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const first = pos === null;
    outside = false;
    pos = { x: e.clientX, y: e.clientY };
    if (first) {
      html.dataset.cursor = "";
      root.dataset.visible = "";
    }
    dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    if (!target) drawBox(idleBox(pos.x, pos.y));
  };

  const onPointerOver = (e: PointerEvent) => {
    // pointerover fires before the first pointermove, so pos may still be null here (root stays invisible until the move).
    if (paging || e.pointerType === "touch") return;
    const t = snapTargetOf(e.target as Element);
    if (t !== target) setTarget(t);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "touch") return;
    // Hybrid laptops keep the native cursor until the next mouse move re-arms it.
    delete html.dataset.cursor;
    delete root.dataset.visible;
    hideTag();
    pos = null;
  };

  const onLeave = () => {
    outside = true;
    delete root.dataset.visible;
    hideTag();
  };
  const onEnter = () => {
    if (pos) {
      outside = false;
      root.dataset.visible = "";
    }
  };
  const onScroll = () => {
    if (target && !outside) setTarget(target);
  };
  const onGlideSettled = () => {
    if (landed) resnap();
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerover", onPointerOver, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  html.addEventListener("pointerleave", onLeave, { passive: true });
  html.addEventListener("pointerenter", onEnter, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  document.addEventListener(GLIDE_SETTLED_EVENT, onGlideSettled);

  const offSlide = signals.onSlideStart(({ from, to }) => {
    // Rail-to-rail keeps the rail letter snap.
    const keep =
      target !== null &&
      target.closest(LETTERS_NAV) !== null &&
      from !== 0 &&
      to !== 0;
    paging = true;
    landed = false;
    if (!keep) setTarget(null);
  });
  const offLanded = signals.onLanded(() => {
    landed = true;
    if (settledNow()) resnap();
  });

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerover", onPointerOver);
    window.removeEventListener("pointerdown", onPointerDown);
    html.removeEventListener("pointerleave", onLeave);
    html.removeEventListener("pointerenter", onEnter);
    window.removeEventListener("scroll", onScroll, { capture: true });
    document.removeEventListener(GLIDE_SETTLED_EVENT, onGlideSettled);
    offSlide();
    offLanded();
    if (snapTimer) clearTimeout(snapTimer);
    root.remove();
    tag.remove();
    delete html.dataset.cursor;
  };
}
