/**
 * Facturo walkthrough runtime (CONT-11). React-free, mounted lazily on Projects.
 * One WAAPI clock (the current frame's push-in). sync() derives colour and pause
 * from one HoldInputs object. Ported from v7 with its three bug fixes: hover and
 * keyboard focus are separate flags, a mouse-focused button never holds, and hover
 * is tested against the visible frame only.
 */
import { projects } from "@/content/projects";
import type { FeatureMount } from "@/lib/features/types";
import { loadDeferred } from "@/lib/media/defer";
import { canAnimate } from "@/lib/motion/waapi";
import { contains, visibleBox } from "@/lib/walkthrough/geometry";
import { running, showColour } from "@/lib/walkthrough/hold";
import type { HoldInputs } from "@/lib/walkthrough/hold";
import { counterText, statusText } from "@/lib/walkthrough/text";

const FALLBACK_HOLD_MS = 5000;
const FALLBACK_SCALE = 1.06;
const FALLBACK_FADE_MS = 900;
const TAP_SLOP_PX = 10;
const PANS = [
  "translate(-1.5%, -1%)",
  "translate(0, -1.5%)",
  "translate(-1%, 0)",
];

function readToken(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function imgOf(frame: HTMLElement, twin: "grey" | "colour") {
  return frame.querySelector<HTMLImageElement>(`img[data-twin="${twin}"]`);
}

export const mount: FeatureMount = (root, ctx) => {
  const group = root.querySelector<HTMLElement>("[data-walk]");
  if (!group) return () => {};
  const frames = Array.from(
    group.querySelectorAll<HTMLElement>("[data-frame]"),
  );
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-walk-action]"),
  );
  const counter = root.querySelector<HTMLElement>("[data-walk-counter]");
  const status = root.querySelector<HTMLElement>("[data-walk-status]");
  const data = projects.flagship.walkthrough;
  const count = frames.length;
  const reduced = ctx.controller.isReducedMotion();
  const holdMs = readToken("--walk-hold", FALLBACK_HOLD_MS);
  const scale = readToken("--walk-scale", FALLBACK_SCALE);
  const fadeMs = readToken("--dur-frame", FALLBACK_FADE_MS);

  let index = 0;
  let seq = 0;
  let anim: Animation | null = null;
  let onFrame = false;
  let onControl = false;
  let touchHold = false;
  let keyFocus = false;
  let userPaused = false;
  let inView = true;
  let pointer: { x: number; y: number } | null = null;
  let tap: { x: number; y: number } | null = null;
  const timers = new Set<number>();

  const inputs = (): HoldInputs => ({
    onFrame,
    onControl,
    touchHold,
    keyFocus,
    userPaused,
    isCurrentPage: ctx.isCurrent(),
    inView,
    tabHidden: document.hidden,
    reduced: ctx.controller.isReducedMotion(),
  });

  function loadColour(i: number): void {
    const frame = frames[(i + count) % count];
    const img = frame ? imgOf(frame, "colour") : null;
    if (img) loadDeferred(img);
  }

  function loadGrey(i: number): HTMLImageElement | null {
    const img = imgOf(frames[(i + count) % count], "grey");
    if (img) loadDeferred(img);
    return img;
  }

  function sync(): void {
    const h = inputs();
    const colour = showColour(h);
    group!.toggleAttribute("data-colour", colour);
    if (colour) {
      loadColour(index - 1);
      loadColour(index);
      loadColour(index + 1);
    }
    if (!anim) return;
    if (running(h)) {
      if (anim.playState === "paused") anim.play();
    } else if (anim.playState === "running") {
      anim.pause();
    }
  }

  function currentScale(): number {
    const t = getComputedStyle(frames[index]).transform;
    if (!t || t === "none") return 1;
    return new DOMMatrixReadOnly(t).a;
  }

  function hit(): boolean {
    if (!pointer) return false;
    const frame = frames[index];
    const img = imgOf(frame, "grey");
    const r = group!.getBoundingClientRect();
    const natural = {
      width: Number(img?.getAttribute("width")) || 1,
      height: Number(img?.getAttribute("height")) || 1,
    };
    const tall = frame.hasAttribute("data-tall");
    const box = visibleBox(r, natural, tall ? currentScale() : 1, tall);
    return contains(box, pointer.x, pointer.y);
  }

  function pushTo(i: number): string {
    if (frames[i].hasAttribute("data-tall")) return `scale(${scale})`;
    return `scale(${scale}) ${PANS[i % PANS.length]}`;
  }

  function retire(old: Animation | null): void {
    if (!old) return;
    old.onfinish = null;
    const id = window.setTimeout(() => {
      timers.delete(id);
      old.cancel();
    }, fadeMs);
    timers.add(id);
  }

  function commit(next: number): void {
    const prev = frames[index];
    if (prev !== frames[next]) {
      prev.removeAttribute("data-current");
      prev.setAttribute("aria-hidden", "true");
    }
    index = next;
    const cur = frames[next];
    cur.setAttribute("data-current", "");
    cur.removeAttribute("aria-hidden");
    if (counter) counter.textContent = counterText(next, data.frames);
    retire(anim);
    anim = null;
    onFrame = hit();
    if (reduced || !canAnimate(cur)) return;
    const mine = cur.animate(
      [{ transform: "none" }, { transform: pushTo(next) }],
      { duration: holdMs, easing: "linear", fill: "forwards" },
    );
    mine.onfinish = () => {
      if (anim === mine) void show((next + 1) % count, false);
    };
    anim = mine;
  }

  async function show(next: number, first: boolean): Promise<void> {
    seq += 1;
    const mine = seq;
    const img = loadGrey(next);
    loadGrey(next + 1);
    if (!first && img) await img.decode().catch(() => {});
    if (mine !== seq) return;
    commit(next);
    sync();
  }

  function step(delta: number): void {
    const next = (index + delta + count) % count;
    void show(next, false);
    if (status) status.textContent = statusText(next, data.frames);
  }

  function recomputeFocus(): void {
    keyFocus =
      group!.matches(":focus-visible") ||
      buttons.some((b) => b.matches(":focus-visible"));
    sync();
  }

  const disposers: Array<() => void> = [];
  function on<T extends EventTarget>(
    target: T,
    type: string,
    handler: (e: Event) => void,
  ): void {
    target.addEventListener(type, handler);
    disposers.push(() => target.removeEventListener(type, handler));
  }

  const isMouse = (e: Event): boolean =>
    (e as PointerEvent).pointerType !== "touch";

  function bindFrameInput(): void {
    const move = (e: Event) => {
      if (!isMouse(e)) return;
      const p = e as PointerEvent;
      pointer = { x: p.clientX, y: p.clientY };
      onFrame = hit();
      sync();
    };
    on(group!, "pointermove", move);
    on(group!, "pointerenter", move);
    on(group!, "pointerleave", (e) => {
      if (!isMouse(e)) return;
      pointer = null;
      onFrame = false;
      sync();
    });
    on(group!, "mousedown", (e) => e.preventDefault());
    on(group!, "pointerdown", (e) => {
      const p = e as PointerEvent;
      tap = { x: p.clientX, y: p.clientY };
    });
    on(group!, "pointerup", (e) => {
      const p = e as PointerEvent;
      if (p.pointerType !== "touch" || !tap) return;
      const moved = Math.hypot(p.clientX - tap.x, p.clientY - tap.y);
      tap = null;
      if (moved > TAP_SLOP_PX) return;
      const wasHeld = touchHold;
      pointer = { x: p.clientX, y: p.clientY };
      if (wasHeld || hit()) touchHold = !wasHeld;
      pointer = null;
      sync();
    });
  }

  function bindButtons(): void {
    const pause = buttons.find((b) => b.dataset.walkAction === "pause");
    if (reduced && pause) pause.hidden = true;
    for (const b of buttons) {
      on(b, "pointerenter", (e) => {
        if (!isMouse(e)) return;
        onControl = true;
        sync();
      });
      on(b, "pointerleave", () => {
        onControl = false;
        sync();
      });
      on(b, "click", () => {
        const action = b.dataset.walkAction;
        if (action === "previous") step(-1);
        else if (action === "next") step(1);
        else if (pause) togglePause(pause);
      });
    }
  }

  function togglePause(btn: HTMLButtonElement): void {
    const c = data.controls;
    userPaused = !userPaused;
    btn.textContent = userPaused ? c.play : c.pause;
    btn.setAttribute("aria-label", userPaused ? c.playName : c.pauseName);
    sync();
  }

  function bindEnvironment(): void {
    for (const el of [group!, ...buttons]) {
      on(el, "focusin", recomputeFocus);
      on(el, "focusout", () => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          recomputeFocus();
        }, 0);
        timers.add(id);
      });
    }
    on(window, "keydown", () => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        recomputeFocus();
      }, 0);
      timers.add(id);
    });
    on(document, "visibilitychange", sync);
  }

  bindFrameInput();
  bindButtons();
  bindEnvironment();
  const io = new IntersectionObserver((entries) => {
    const last = entries[entries.length - 1];
    if (last) inView = last.isIntersecting;
    sync();
  });
  io.observe(group);
  const offStart = ctx.controller.signals.onSlideStart(sync);
  const offLanded = ctx.controller.signals.onLanded(sync);

  group.dataset.walk = "ready";
  void show(0, true);

  return () => {
    seq += 1;
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    if (anim) anim.onfinish = null;
    anim?.cancel();
    io.disconnect();
    disposers.forEach((d) => d());
    offStart();
    offLanded();
    group.dataset.walk = "";
    group.removeAttribute("data-colour");
  };
};
