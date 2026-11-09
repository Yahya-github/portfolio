import { describe, expect, it } from "vitest";
import {
  DECAY_RATIO,
  DISCRETE_NOTCH,
  FRESH_FLICK_MIN_PX,
  FRESH_FLICK_RATIO,
  GESTURE_GAP_MS,
  INITIAL_WHEEL,
  stepWheel,
  WHEEL_THRESHOLD_PX,
  type WheelSample,
} from "@/lib/pager/input/wheel";
import { LINE_PX, normalizeDelta } from "@/lib/pager/input/normalize";
import type { EdgeInfo } from "@/lib/pager/types";
import { loadJsonTraces, loadTraces, replay } from "./traces/load";
import { macFlick, type TraceSample } from "./traces/synthetic";

const FLAT: EdgeInfo = { overflowing: false, atStart: true, atEnd: false };
const MID: EdgeInfo = { overflowing: true, atStart: true, atEnd: false };
const AT_END: EdgeInfo = { overflowing: true, atStart: false, atEnd: true };

const wheel = (over: Partial<WheelSample> = {}): WheelSample => ({
  dx: 0,
  dy: 0,
  mode: 0,
  t: 1000,
  ctrl: false,
  vh: 900,
  ...over,
});

const notches = (gapMs: number, count = 3): { samples: TraceSample[] } => ({
  samples: Array.from({ length: count }, (_, i) => ({
    t: 1000 + i * gapMs,
    dx: 0,
    dy: 100,
    mode: 0 as const,
  })),
});

describe("constants (UI-SPEC Input Contract)", () => {
  it("match the spec", () => {
    expect(WHEEL_THRESHOLD_PX).toBe(48);
    expect(GESTURE_GAP_MS).toBe(160);
    expect(FRESH_FLICK_MIN_PX).toBe(16);
    expect(FRESH_FLICK_RATIO).toBe(2);
    expect(DECAY_RATIO).toBe(0.5);
    expect(DISCRETE_NOTCH).toBe(120);
    expect(LINE_PX).toBe(16);
  });

  it("INITIAL_WHEEL is idle and empty", () => {
    expect(INITIAL_WHEEL).toEqual({
      phase: "idle",
      sumX: 0,
      sumY: 0,
      lastT: -Infinity,
      recent: [],
      peak: 0,
      decayed: false,
      gestureId: 0,
    });
  });
});

describe("normalizeDelta", () => {
  it.each([
    [0, 3, -7, 900, { x: 3, y: -7 }],
    [1, 2, 3, 900, { x: 32, y: 48 }],
    [2, 0, 1, 800, { x: 0, y: 800 }],
  ] as const)("mode %i (%d, %d) vh %i", (mode, dx, dy, vh, expected) => {
    expect(normalizeDelta(dx, dy, mode, vh)).toEqual(expected);
  });
});

describe("trace replay (D-13)", () => {
  it("has five recorded-style JSON fixtures with the documented keys", () => {
    const traces = loadJsonTraces();
    expect(traces).toHaveLength(5);
    for (const t of traces) {
      expect(Object.keys(t).sort()).toEqual(
        ["browser", "device", "expectPages", "os", "samples"].sort(),
      );
    }
  });

  it.each(loadTraces().map((t) => [t.device, t.expectPages, t] as const))(
    "%s pages %i times",
    (_device, expectPages, trace) => {
      expect(replay(trace).intents).toHaveLength(expectPages);
    },
  );
});

describe("stepWheel gestures (NAV-01)", () => {
  it("fast spin of three notches 40ms apart is one gesture", () => {
    expect(replay(notches(40)).intents).toEqual(["next"]);
  });

  it("slow notches 250ms apart page once each", () => {
    expect(replay(notches(250)).intents).toEqual(["next", "next", "next"]);
  });

  it("a flick with a long momentum tail pages exactly once", () => {
    const flick = macFlick();
    const span = flick.samples.at(-1)!.t - flick.samples[0].t;
    expect(span).toBeGreaterThan(900);
    expect(replay(flick).intents).toEqual(["next"]);
  });

  it("a vertical flick the other way pages prev", () => {
    expect(replay(macFlick({ sign: -1 })).intents).toEqual(["prev"]);
  });

  it("a right-to-left horizontal swipe pages next and prevents every event", () => {
    const r = replay(macFlick({ axis: "x" }));
    expect(r.intents).toEqual(["next"]);
    expect(r.prevented.every(Boolean)).toBe(true);
  });

  it("the 48px threshold is inclusive (Pitfall 5)", () => {
    const step = stepWheel(INITIAL_WHEEL, wheel({ dy: 48 }), FLAT);
    expect(step.intent).toBe("next");
    const below = stepWheel(INITIAL_WHEEL, wheel({ dy: 47 }), FLAT);
    expect(below.intent).toBeNull();
  });

  it("a legacy wheelDelta multiple of 120 is one discrete notch (Pitfall 4)", () => {
    const step = stepWheel(INITIAL_WHEEL, wheel({ dy: 4, legacy: -240 }), FLAT);
    expect(step.intent).toBe("next");
  });

  it("mode 2 with vh 800: dy 1 pages", () => {
    const step = stepWheel(
      INITIAL_WHEEL,
      wheel({ dy: 1, mode: 2, vh: 800 }),
      FLAT,
    );
    expect(step.intent).toBe("next");
  });

  it("never mutates the incoming state", () => {
    const frozen = Object.freeze({ ...INITIAL_WHEEL, recent: [] });
    const step = stepWheel(frozen, wheel({ dy: 100 }), FLAT);
    expect(frozen).toEqual(INITIAL_WHEEL);
    expect(step.state).not.toBe(frozen);
  });
});

describe("pinch and idle gap", () => {
  it("ctrl (pinch) events never page and never preventDefault", () => {
    const pinch = loadJsonTraces().find((t) => t.device.includes("ctrl"))!;
    const r = replay(pinch);
    expect(pinch.samples).toHaveLength(20);
    expect(r.intents).toEqual([]);
    expect(r.prevented.every((p) => p === false)).toBe(true);
  });

  it("resets the accumulator after an idle gap (IN-01)", () => {
    const apart = replay({
      samples: [
        { t: 1000, dx: 0, dy: 30, mode: 0 },
        { t: 1200, dx: 0, dy: 30, mode: 0 },
      ],
    });
    expect(apart.intents).toEqual([]);
    const close = replay({
      samples: [
        { t: 1000, dx: 0, dy: 30, mode: 0 },
        { t: 1050, dx: 0, dy: 30, mode: 0 },
      ],
    });
    expect(close.intents).toEqual(["next"]);
  });

  it("ignores non-finite deltas (T-04-07)", () => {
    const step = stepWheel(INITIAL_WHEEL, wheel({ dy: Number.NaN }), FLAT);
    expect(step.intent).toBeNull();
    expect(step.preventDefault).toBe(false);
    const inf = stepWheel(INITIAL_WHEEL, wheel({ dy: Infinity }), FLAT);
    expect(inf.intent).toBeNull();
  });
});

describe("overflowing pages (D-05, D-07a, NAV-07)", () => {
  const flick = macFlick();
  const n = flick.samples.length;

  it("a vertical gesture started mid-scroll never pages, even when its tail reaches the edge", () => {
    const r = replay(flick, (i) => (i >= n - 20 ? AT_END : MID));
    expect(r.intents).toEqual([]);
    expect(r.prevented.every((p) => p === false)).toBe(true);
  });

  it("a fresh gesture that starts at the edge pages", () => {
    const lastT = flick.samples.at(-1)!.t;
    const second = macFlick({ t0: lastT + 200 });
    const samples = [...flick.samples, ...second.samples];
    // Tail reaches the end for its last 20 events; the new flick starts there.
    const r = replay({ samples }, (i) => (i >= n - 20 ? AT_END : MID));
    expect(r.intents).toEqual(["next"]);
    expect(r.prevented.slice(n).every(Boolean)).toBe(true);
  });

  it("a horizontal gesture mid-scroll pages at once", () => {
    const r = replay(macFlick({ axis: "x" }), () => MID);
    expect(r.intents).toEqual(["next"]);
    expect(r.prevented.every(Boolean)).toBe(true);
  });

  it("at the ends stepWheel still returns the intent and prevents (Pitfall 6)", () => {
    const end: EdgeInfo = { overflowing: false, atStart: false, atEnd: true };
    const r = replay(macFlick({ axis: "x" }), () => end);
    expect(r.intents).toEqual(["next"]);
    expect(r.prevented.every(Boolean)).toBe(true);
    const start: EdgeInfo = { overflowing: false, atStart: true, atEnd: false };
    const back = replay(macFlick({ axis: "x", sign: -1 }), () => start);
    expect(back.intents).toEqual(["prev"]);
    expect(back.prevented.every(Boolean)).toBe(true);
  });
});
