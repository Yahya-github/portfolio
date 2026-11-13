/**
 * Atlantis stage controller (Phase 8, PROOF-01). React-free, mounted lazily.
 *
 * - D-05: nothing under /games/ is requested until Play; only an intent
 *   signal on Play (hover, focus, touchstart) warms the heavy files.
 * - D-10: Esc moves focus to Exit, Exit returns focus to Play, no key trap.
 * - T-08-31/32: the only inbound path is readGameMsg; outbound mute uses
 *   location.origin as the target origin.
 */
import { atlantis } from "@/content/atlantis";
import { createPrefetch, readSaveData } from "@/lib/proof/game/prefetch";
import { readGameMsg } from "@/lib/proof/game/protocol";
import {
  initialState,
  reduce,
  type GameIntent,
  type GameState,
} from "@/lib/proof/game/state";

const LOAD_STALL_MS = 20000;
const PCT_FULL = 100;
const { game } = atlantis;

function canRunWebGL2(): boolean {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) return false;
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return true;
}

function part<T extends HTMLElement>(root: HTMLElement, sel: string): T | null {
  return root.querySelector<T>(sel);
}

export function mount(root: ParentNode = document): () => void {
  const stage = root.querySelector<HTMLElement>("[data-game]");
  const src = stage?.dataset.gameSrc;
  if (!stage || !src) return () => {};
  const el = {
    play: part<HTMLButtonElement>(stage, '[data-game-action="play"]'),
    exit: part<HTMLButtonElement>(stage, '[data-game-action="exit"]'),
    mute: part<HTMLButtonElement>(stage, '[data-game-action="mute"]'),
    retry: part<HTMLButtonElement>(stage, '[data-game-action="retry"]'),
    status: part(stage, "[data-game-status]"),
    line: part(stage, "[data-game-line]"),
    poster: part(stage, "[data-game-poster]"),
    slot: part(stage, "[data-game-slot]"),
    bar: part(stage, "[data-game-bar]"),
    announce: part(stage, "[data-game-announce]"),
  };
  const fine = matchMedia("(any-pointer: fine)").matches;
  const webgl = fine && canRunWebGL2();
  let state: GameState = initialState(webgl);
  if (!webgl) {
    render();
    if (el.line) {
      el.line.textContent = fine ? game.cannotRun : game.touchFallback;
    }
    if (el.play) el.play.tabIndex = -1;
    return () => {};
  }

  let frame: HTMLIFrameElement | null = null;
  let stall = 0;
  const disposers: Array<() => void> = [];
  const warm = createPrefetch(src, {
    fetch: window.fetch.bind(window),
    saveData: readSaveData(navigator),
  });

  function on(t: EventTarget, type: string, h: (e: Event) => void): void {
    t.addEventListener(type, h);
    disposers.push(() => t.removeEventListener(type, h));
  }

  function render(): void {
    stage!.dataset.gameState = state.phase;
    if (el.status) {
      el.status.textContent =
        state.phase !== "loading"
          ? ""
          : state.pct === null
            ? game.loading
            : game.loadingPct.replace("{nn}", String(state.pct));
    }
    el.bar?.style.setProperty(
      "--game-pct",
      String((state.pct ?? 0) / PCT_FULL),
    );
    if (el.mute) {
      el.mute.textContent = state.muted ? game.unmute : game.mute;
      el.mute.setAttribute(
        "aria-label",
        state.muted ? game.unmuteName : game.muteName,
      );
    }
  }

  function dispatch(intent: GameIntent): void {
    state = reduce(state, intent);
    render();
  }

  function armStall(): void {
    window.clearTimeout(stall);
    stall = window.setTimeout(() => {
      teardown();
      dispatch({ type: "error" });
      el.retry?.focus();
    }, LOAD_STALL_MS);
  }

  function teardown(): void {
    window.clearTimeout(stall);
    frame?.remove();
    frame = null;
  }

  function start(): void {
    if (frame) return;
    const f = document.createElement("iframe");
    f.src = src!;
    f.title = game.frameTitle;
    f.allow = "autoplay; fullscreen";
    f.setAttribute("data-game-frame", "");
    frame = f;
    el.slot?.append(f);
    dispatch({ type: "play" });
    dispatch({ type: "retry" });
    armStall();
  }

  function onMessage(e: MessageEvent): void {
    const m = readGameMsg(e, frame);
    if (!m) return;
    if (m.type === "progress") {
      dispatch(m);
      armStall();
    } else if (m.type === "ready") {
      window.clearTimeout(stall);
      dispatch(m);
      frame?.focus();
      if (el.announce) el.announce.textContent = game.running;
    } else if (m.type === "escape") {
      el.exit?.focus();
    } else if (m.type === "exit") {
      leave();
    } else {
      teardown();
      dispatch({ type: "error" });
      el.retry?.focus();
    }
  }

  function leave(): void {
    teardown();
    dispatch({ type: "exit" });
    if (el.announce) el.announce.textContent = "";
    el.play?.focus();
  }

  function toggleMute(): void {
    dispatch({ type: "mute" });
    frame?.contentWindow?.postMessage(
      { type: "mute", value: state.muted },
      location.origin,
    );
  }

  render();
  for (const type of ["pointerenter", "focus", "touchstart"]) {
    if (el.play) on(el.play, type, warm);
  }
  if (el.play) on(el.play, "click", start);
  if (el.poster) on(el.poster, "click", start);
  if (el.retry) on(el.retry, "click", start);
  if (el.exit) on(el.exit, "click", leave);
  if (el.mute) on(el.mute, "click", toggleMute);
  on(window, "message", (e) => onMessage(e as MessageEvent));

  return () => {
    teardown();
    disposers.forEach((d) => d());
  };
}
