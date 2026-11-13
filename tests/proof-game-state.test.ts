import { describe, expect, it } from "vitest";
import {
  initialState,
  progressPct,
  reduce,
  type GameIntent,
  type GameState,
} from "@/lib/proof/game/state";

const PLAY: GameIntent = { type: "play" };
const READY: GameIntent = { type: "ready" };
const EXIT: GameIntent = { type: "exit" };
const ERROR: GameIntent = { type: "error" };
const RETRY: GameIntent = { type: "retry" };
const MUTE: GameIntent = { type: "mute" };
const ESCAPE: GameIntent = { type: "escape" };
const progress = (cur: number, total: number): GameIntent => ({
  type: "progress",
  cur,
  total,
});

const ALL: readonly GameIntent[] = [
  PLAY,
  READY,
  EXIT,
  ERROR,
  RETRY,
  MUTE,
  ESCAPE,
  progress(1, 2),
];

const loading = (): GameState => reduce(initialState(true), PLAY);
const playing = (): GameState => reduce(loading(), READY);

describe("initialState", () => {
  it("starts ready when the game is supported", () => {
    expect(initialState(true)).toEqual({
      phase: "ready",
      pct: null,
      muted: false,
    });
  });

  it("starts in fallback when the game is unsupported", () => {
    expect(initialState(false).phase).toBe("fallback");
  });
});

describe("progressPct", () => {
  it("floors to 10 percent steps", () => {
    expect(progressPct(37, 100)).toBe(30);
    expect(progressPct(39, 100)).toBe(30);
    expect(progressPct(40, 100)).toBe(40);
  });

  it("clamps to 0..100", () => {
    expect(progressPct(250, 100)).toBe(100);
    expect(progressPct(-5, 100)).toBe(0);
  });

  it("returns null for a bad total or non-finite input", () => {
    expect(progressPct(1, 0)).toBeNull();
    expect(progressPct(1, -3)).toBeNull();
    expect(progressPct(Number.NaN, 10)).toBeNull();
    expect(progressPct(1, Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("play", () => {
  it("moves ready to loading with no pct", () => {
    expect(loading()).toEqual({ phase: "loading", pct: null, muted: false });
  });

  it("moves exited to loading", () => {
    const exited = reduce(playing(), EXIT);
    expect(reduce(exited, PLAY).phase).toBe("loading");
  });

  it("is rejected while loading or playing", () => {
    const l = loading();
    const p = playing();
    expect(reduce(l, PLAY)).toBe(l);
    expect(reduce(p, PLAY)).toBe(p);
  });
});

describe("progress", () => {
  it("records a floored pct while loading", () => {
    expect(reduce(loading(), progress(37, 100)).pct).toBe(30);
  });

  it("returns the same object when the pct step is unchanged", () => {
    const first = reduce(loading(), progress(37, 100));
    expect(reduce(first, progress(39, 100))).toBe(first);
  });

  it("rejects an invalid payload", () => {
    const l = loading();
    expect(reduce(l, progress(1, 0))).toBe(l);
  });

  it("is rejected outside loading", () => {
    const r = initialState(true);
    const p = playing();
    expect(reduce(r, progress(10, 100))).toBe(r);
    expect(reduce(p, progress(10, 100))).toBe(p);
  });
});

describe("ready and mute", () => {
  it("moves loading to playing and keeps pct", () => {
    const l = reduce(loading(), progress(50, 100));
    const p = reduce(l, READY);
    expect(p.phase).toBe("playing");
    expect(p.pct).toBe(50);
  });

  it("toggles mute while playing", () => {
    const on = reduce(playing(), MUTE);
    expect(on.muted).toBe(true);
    expect(reduce(on, MUTE).muted).toBe(false);
  });

  it("rejects mute outside playing", () => {
    const l = loading();
    expect(reduce(l, MUTE)).toBe(l);
  });
});

describe("exit", () => {
  it("moves loading to exited", () => {
    expect(reduce(loading(), EXIT).phase).toBe("exited");
  });

  it("moves playing to exited, clears pct and keeps muted", () => {
    const muted = reduce(playing(), MUTE);
    const out = reduce(muted, EXIT);
    expect(out.phase).toBe("exited");
    expect(out.pct).toBeNull();
    expect(out.muted).toBe(true);
  });
});

describe("error and retry", () => {
  it("moves loading and playing to error", () => {
    expect(reduce(loading(), ERROR).phase).toBe("error");
    expect(reduce(playing(), ERROR).phase).toBe("error");
  });

  it("retries from error back to loading with no pct", () => {
    const e = reduce(reduce(loading(), progress(50, 100)), ERROR);
    const r = reduce(e, RETRY);
    expect(r.phase).toBe("loading");
    expect(r.pct).toBeNull();
  });

  it("rejects retry outside error", () => {
    const p = playing();
    expect(reduce(p, RETRY)).toBe(p);
  });
});

describe("rejected intents return the same object", () => {
  it("escape never changes state in any phase", () => {
    const states = [
      initialState(true),
      loading(),
      playing(),
      reduce(playing(), EXIT),
      reduce(loading(), ERROR),
      initialState(false),
    ];
    for (const s of states) expect(reduce(s, ESCAPE)).toBe(s);
  });

  it("fallback ignores every intent", () => {
    const f = initialState(false);
    for (const intent of ALL) expect(reduce(f, intent)).toBe(f);
  });

  it("ready ignores exit, ready, progress and mute", () => {
    const r = initialState(true);
    for (const intent of [EXIT, READY, progress(5, 10), MUTE]) {
      expect(reduce(r, intent)).toBe(r);
    }
  });
});
