import { describe, expect, it } from "vitest";
import {
  HINT_DELAY_AFTER_OPENING_MS,
  HINT_DELAY_NO_OPENING_MS,
  HINT_VISIBLE_MS,
  initialHint,
  nextWakeAt,
  stepHint,
  type HintState,
} from "@/lib/first-visit/hint";

const frozen = (s: HintState): HintState => Object.freeze({ ...s });
const waiting = (showAt: number | null): HintState =>
  frozen({ phase: "waiting", showAt, hideAt: null });

describe("hint constants", () => {
  it("match the locked timings", () => {
    expect(HINT_DELAY_AFTER_OPENING_MS).toBe(1000);
    expect(HINT_DELAY_NO_OPENING_MS).toBe(1500);
    expect(HINT_VISIBLE_MS).toBe(8000);
  });
});

describe("stepHint", () => {
  it("starts idle", () => {
    expect(initialHint()).toEqual({ phase: "idle", showAt: null, hideAt: null });
  });

  it("load without an opening schedules the show", () => {
    const s = stepHint(frozen(initialHint()), {
      type: "load",
      at: 0,
      openingPending: false,
    });
    expect(s).toEqual({ phase: "waiting", showAt: 1500, hideAt: null });
  });

  it("load with an opening waits for opening-done", () => {
    const s = stepHint(frozen(initialHint()), {
      type: "load",
      at: 0,
      openingPending: true,
    });
    expect(s).toEqual({ phase: "waiting", showAt: null, hideAt: null });
  });

  it("opening-done schedules the show 1000ms later", () => {
    const s = stepHint(waiting(null), { type: "opening-done", at: 900 });
    expect(s.showAt).toBe(1900);
    expect(s.phase).toBe("waiting");
  });

  it("opening-done is a no-op when scheduled or not waiting", () => {
    const w = waiting(1500);
    expect(stepHint(w, { type: "opening-done", at: 900 })).toBe(w);
    const i = frozen(initialHint());
    expect(stepHint(i, { type: "opening-done", at: 900 })).toBe(i);
  });

  it("tick shows the hint at showAt and not before", () => {
    const w = waiting(1500);
    expect(stepHint(w, { type: "tick", at: 1499 })).toBe(w);
    expect(stepHint(w, { type: "tick", at: 1500 })).toEqual({
      phase: "shown",
      showAt: 1500,
      hideAt: 9500,
    });
  });

  it("tick does nothing while waiting without a showAt", () => {
    const w = waiting(null);
    expect(stepHint(w, { type: "tick", at: 99999 })).toBe(w);
  });

  it("tick at hideAt finishes the hint", () => {
    const shown = frozen({ phase: "shown", showAt: 1500, hideAt: 9500 });
    expect(stepHint(shown, { type: "tick", at: 9499 })).toBe(shown);
    expect(stepHint(shown, { type: "tick", at: 9500 }).phase).toBe("done");
  });

  it("page-change ends it from waiting or shown", () => {
    const shown = frozen({ phase: "shown", showAt: 1500, hideAt: 9500 });
    expect(stepHint(waiting(1500), { type: "page-change", at: 5 }).phase).toBe("done");
    expect(stepHint(shown, { type: "page-change", at: 5 }).phase).toBe("done");
  });

  it("any event after done returns the same object", () => {
    const done = frozen({ phase: "done", showAt: null, hideAt: null });
    expect(stepHint(done, { type: "tick", at: 1 })).toBe(done);
    expect(stepHint(done, { type: "page-change", at: 1 })).toBe(done);
    expect(stepHint(done, { type: "load", at: 1, openingPending: false })).toBe(done);
  });

  it("returns new objects and never mutates input", () => {
    const w = waiting(1500);
    const next = stepHint(w, { type: "tick", at: 1500 });
    expect(next).not.toBe(w);
    expect(w.phase).toBe("waiting");
  });
});

describe("nextWakeAt", () => {
  it("reports the next timer or null", () => {
    expect(nextWakeAt(waiting(1500))).toBe(1500);
    expect(nextWakeAt(waiting(null))).toBeNull();
    expect(nextWakeAt({ phase: "shown", showAt: 1, hideAt: 9500 })).toBe(9500);
    expect(nextWakeAt(initialHint())).toBeNull();
    expect(nextWakeAt({ phase: "done", showAt: null, hideAt: null })).toBeNull();
  });
});
