import { describe, expect, it } from "vitest";
import {
  AXIS_LOCK_PX,
  AXIS_RATIO,
  INITIAL_SWIPE,
  SWIPE_COMMIT_PX,
  SWIPE_EDGE_PX,
  SWIPE_FAST_PX,
  SWIPE_VELOCITY,
  VELOCITY_WINDOW_MS,
  stepSwipe,
  swipeVelocity,
  type PointerSample,
  type SwipeState,
} from "@/lib/pager/input/swipe";
import type { Direction } from "@/lib/pager/types";

type Kind = PointerSample["kind"];

function s(
  kind: Kind,
  x: number,
  y: number,
  t: number,
  extra: Partial<PointerSample> = {},
): PointerSample {
  return {
    kind,
    x,
    y,
    t,
    pointerType: "touch",
    id: 1,
    zoomed: false,
    ...extra,
  };
}

interface RunResult {
  readonly state: SwipeState;
  readonly intents: readonly (Direction | null)[];
  readonly committed: readonly Direction[];
}

function run(samples: readonly PointerSample[]): RunResult {
  let state = INITIAL_SWIPE;
  const intents: (Direction | null)[] = [];
  for (const sample of samples) {
    const step = stepSwipe(state, sample);
    state = step.state;
    intents.push(step.intent);
  }
  const committed = intents.filter((i): i is Direction => i !== null);
  return { state, intents, committed };
}

/** A straight drag from (x0, y0) by (dx, dy) over `ms`, in `steps` moves. */
function drag(
  x0: number,
  dx: number,
  ms: number,
  { dy = 0, steps = 4, y0 = 400, extra = {} as Partial<PointerSample> } = {},
): PointerSample[] {
  const out: PointerSample[] = [s("down", x0, y0, 0, extra)];
  for (let i = 1; i <= steps; i += 1) {
    const f = i / steps;
    out.push(s("move", x0 + dx * f, y0 + dy * f, ms * f, extra));
  }
  out.push(s("up", x0 + dx, y0 + dy, ms, extra));
  return out;
}

describe("swipe constants (UI-SPEC Phone swipe)", () => {
  it("match the spec", () => {
    expect(SWIPE_EDGE_PX).toBe(20);
    expect(AXIS_LOCK_PX).toBe(12);
    expect(AXIS_RATIO).toBe(1.5);
    expect(SWIPE_COMMIT_PX).toBe(48);
    expect(SWIPE_FAST_PX).toBe(24);
    expect(SWIPE_VELOCITY).toBe(0.3);
    expect(VELOCITY_WINDOW_MS).toBe(100);
  });

  it("INITIAL_SWIPE is inactive", () => {
    expect(INITIAL_SWIPE).toEqual({
      active: false,
      id: -1,
      x0: 0,
      y0: 0,
      lock: "none",
      samples: [],
    });
  });
});

describe("stepSwipe (NAV-03, D-08)", () => {
  it("finger right-to-left -> next", () => {
    expect(run(drag(300, -100, 200, { dy: 5 })).committed).toEqual(["next"]);
  });

  it("finger left-to-right -> prev", () => {
    expect(run(drag(100, 100, 200)).committed).toEqual(["prev"]);
  });

  it("only the up sample carries the intent", () => {
    const { intents } = run(drag(300, -100, 200));
    expect(intents.slice(0, -1).every((i) => i === null)).toBe(true);
    expect(intents.at(-1)).toBe("next");
  });

  it("a touch starting within 20px of the left edge never pages", () => {
    const r = run(drag(10, 200, 200));
    expect(r.committed).toEqual([]);
    expect(r.state.active).toBe(false);
  });

  it("a touch starting exactly at 20px is tracked", () => {
    expect(run(drag(20, 200, 200)).committed).toEqual(["prev"]);
  });

  it.each(["mouse", "pen"])("pointerType %s is ignored", (pointerType) => {
    expect(
      run(drag(300, -200, 200, { extra: { pointerType } })).committed,
    ).toEqual([]);
  });

  it("a down while pinch-zoomed never starts a swipe (Pitfall 7)", () => {
    const samples = drag(300, -200, 200);
    const zoomedDown = { ...samples[0], zoomed: true };
    expect(run([zoomedDown, ...samples.slice(1)]).committed).toEqual([]);
  });

  it("an early vertical move locks v and never pages", () => {
    const r = run([
      s("down", 300, 400, 0),
      s("move", 305, 420, 30),
      s("move", 100, 430, 100),
      s("up", 50, 430, 120),
    ]);
    expect(r.committed).toEqual([]);
  });

  it("locks h when |dx| > 1.5 * |dy| after 12px", () => {
    const { state } = stepSwipe(
      stepSwipe(INITIAL_SWIPE, s("down", 300, 400, 0)).state,
      s("move", 285, 405, 20),
    );
    expect(state.lock).toBe("h");
  });

  it("locks v when |dx| <= 1.5 * |dy| after 12px", () => {
    const { state } = stepSwipe(
      stepSwipe(INITIAL_SWIPE, s("down", 300, 400, 0)).state,
      s("move", 285, 410, 20),
    );
    expect(state.lock).toBe("v");
  });

  it("stays unlocked below 12px", () => {
    const { state } = stepSwipe(
      stepSwipe(INITIAL_SWIPE, s("down", 300, 400, 0)).state,
      s("move", 290, 405, 20),
    );
    expect(state.lock).toBe("none");
  });

  it("a fast short swipe (30px over 50ms) -> next", () => {
    expect(run(drag(300, -30, 50)).committed).toEqual(["next"]);
  });

  it("a slow short swipe (30px over 400ms) -> null", () => {
    expect(run(drag(300, -30, 400, { steps: 8 })).committed).toEqual([]);
  });

  it("47px slow -> null; 48px slow -> next", () => {
    expect(run(drag(300, -47, 1000, { steps: 10 })).committed).toEqual([]);
    expect(run(drag(300, -48, 1000, { steps: 10 })).committed).toEqual([
      "next",
    ]);
  });

  it("an up with no moves still resolves the lock by ratio", () => {
    const r = run([s("down", 300, 400, 0), s("up", 200, 405, 100)]);
    expect(r.committed).toEqual(["next"]);
  });

  it("cancel mid-swipe aborts and resets", () => {
    const r = run([
      s("down", 300, 400, 0),
      s("move", 100, 400, 50),
      s("cancel", 100, 400, 60),
      s("up", 100, 400, 70),
    ]);
    expect(r.committed).toEqual([]);
    expect(r.state).toEqual(INITIAL_SWIPE);
  });

  it("samples from a different pointer id are ignored", () => {
    const r = run([
      s("down", 300, 400, 0),
      s("move", 100, 400, 50, { id: 2 }),
      s("up", 100, 400, 60, { id: 2 }),
    ]);
    expect(r.committed).toEqual([]);
    expect(r.state.active).toBe(true);
    const done = stepSwipe(r.state, s("up", 200, 400, 100));
    expect(done.intent).toBe("next");
  });

  it("a second down while tracking is ignored", () => {
    const r = run([
      s("down", 300, 400, 0),
      s("down", 50, 400, 10, { id: 2 }),
      s("up", 200, 400, 100),
    ]);
    expect(r.committed).toEqual(["next"]);
  });

  it("returns to INITIAL_SWIPE after up", () => {
    expect(run(drag(300, -100, 200)).state).toEqual(INITIAL_SWIPE);
  });

  it("prunes samples to the velocity window (T-04-10)", () => {
    const samples = drag(300, -400, 2000, { steps: 200 });
    let state = INITIAL_SWIPE;
    for (const sample of samples.slice(0, -1)) {
      state = stepSwipe(state, sample).state;
    }
    const last = state.samples.at(-1);
    expect(last).toBeDefined();
    for (const p of state.samples) {
      expect((last?.t ?? 0) - p.t).toBeLessThanOrEqual(VELOCITY_WINDOW_MS);
    }
  });

  it("does not mutate the input state", () => {
    const start = stepSwipe(INITIAL_SWIPE, s("down", 300, 400, 0)).state;
    const snapshot = JSON.stringify(start);
    stepSwipe(start, s("move", 250, 400, 20));
    expect(JSON.stringify(start)).toBe(snapshot);
  });
});

describe("swipeVelocity", () => {
  it("is 0 with fewer than two samples", () => {
    expect(swipeVelocity([], 0)).toBe(0);
    expect(swipeVelocity([{ x: 10, t: 5 }], 5)).toBe(0);
  });

  it("is 0 with zero elapsed time", () => {
    expect(
      swipeVelocity(
        [
          { x: 10, t: 5 },
          { x: 40, t: 5 },
        ],
        5,
      ),
    ).toBe(0);
  });

  it("is the absolute px/ms over the last 100ms", () => {
    const samples = [
      { x: 0, t: 0 },
      { x: 100, t: 100 },
      { x: 130, t: 200 },
    ];
    expect(swipeVelocity(samples, 200)).toBeCloseTo(0.3);
    expect(
      swipeVelocity(
        [
          { x: 100, t: 0 },
          { x: 70, t: 50 },
        ],
        50,
      ),
    ).toBeCloseTo(0.6);
  });
});
