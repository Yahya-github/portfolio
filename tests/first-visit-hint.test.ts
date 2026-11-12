import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HINT_DONE_EVENT } from "@/lib/motion/events";
import {
  HINT_DELAY_AFTER_OPENING_MS,
  HINT_DELAY_NO_OPENING_MS,
  HINT_SEEN_AFTER_MS,
  HINT_VISIBLE_MS,
  NUDGE_DELAY_MS,
  NUDGE_PAUSE_MS,
  NUDGE_PULSE_MS,
  NUDGE_PX,
  NUDGE_TOTAL_MS,
  initialHint,
  nextWakeAt,
  nudgeKeyframes,
  stepHint,
  type HintState,
} from "@/lib/first-visit/hint";

const frozen = (s: HintState): HintState => Object.freeze({ ...s });
const waiting = (showAt: number | null): HintState =>
  frozen({ phase: "waiting", showAt, hideAt: null, seenAt: null, seen: false });
const shown = (seen = false): HintState =>
  frozen({ phase: "shown", showAt: 1500, hideAt: 9500, seenAt: 4500, seen });

describe("hint constants", () => {
  it("match the locked timings", () => {
    expect(HINT_DELAY_AFTER_OPENING_MS).toBe(1000);
    expect(HINT_DELAY_NO_OPENING_MS).toBe(1500);
    expect(HINT_VISIBLE_MS).toBe(8000);
    expect(HINT_SEEN_AFTER_MS).toBe(3000);
    expect(NUDGE_PX).toBe(12);
    expect(NUDGE_PULSE_MS).toBe(300);
    expect(NUDGE_PAUSE_MS).toBe(120);
    expect(NUDGE_DELAY_MS).toBe(200);
    expect(NUDGE_TOTAL_MS).toBe(720);
  });
});

describe("stepHint", () => {
  it("starts idle", () => {
    expect(initialHint()).toEqual({
      phase: "idle",
      showAt: null,
      hideAt: null,
      seenAt: null,
      seen: false,
    });
  });

  it("load without an opening schedules the show", () => {
    const s = stepHint(frozen(initialHint()), {
      type: "load",
      at: 0,
      openingPending: false,
    });
    expect(s).toEqual({
      phase: "waiting",
      showAt: 1500,
      hideAt: null,
      seenAt: null,
      seen: false,
    });
  });

  it("load with an opening waits for opening-done", () => {
    const s = stepHint(frozen(initialHint()), {
      type: "load",
      at: 0,
      openingPending: true,
    });
    expect(s).toEqual({
      phase: "waiting",
      showAt: null,
      hideAt: null,
      seenAt: null,
      seen: false,
    });
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
      seenAt: 4500,
      seen: false,
    });
  });

  it("tick does nothing while waiting without a showAt", () => {
    const w = waiting(null);
    expect(stepHint(w, { type: "tick", at: 99999 })).toBe(w);
  });

  it("tick at hideAt finishes the hint", () => {
    const s = shown(true);
    expect(stepHint(s, { type: "tick", at: 9499 })).toBe(s);
    const done = stepHint(s, { type: "tick", at: 9500 });
    expect(done.phase).toBe("done");
    expect(done.seen).toBe(true);
  });

  it("page-change ends it from waiting or shown", () => {
    expect(stepHint(waiting(1500), { type: "page-change", at: 5 }).phase).toBe(
      "done",
    );
    expect(stepHint(shown(), { type: "page-change", at: 5 }).phase).toBe(
      "done",
    );
  });

  it("any event after done returns the same object", () => {
    const done = frozen({
      phase: "done",
      showAt: null,
      hideAt: null,
      seenAt: null,
      seen: true,
    });
    expect(stepHint(done, { type: "tick", at: 1 })).toBe(done);
    expect(stepHint(done, { type: "page-change", at: 1 })).toBe(done);
    expect(stepHint(done, { type: "load", at: 1, openingPending: false })).toBe(
      done,
    );
  });

  it("returns new objects and never mutates input", () => {
    const w = waiting(1500);
    const next = stepHint(w, { type: "tick", at: 1500 });
    expect(next).not.toBe(w);
    expect(w.phase).toBe("waiting");
  });
});

describe("seen rule", () => {
  it("flips seen after 3000ms visible, not before", () => {
    const s = shown();
    expect(stepHint(s, { type: "tick", at: 4499 })).toBe(s);
    const seen = stepHint(s, { type: "tick", at: 4500 });
    expect(seen).toEqual({ ...s, seen: true });
  });

  it("a skipped timer still marks seen when the hint ends", () => {
    const done = stepHint(shown(), { type: "tick", at: 9500 });
    expect(done.phase).toBe("done");
    expect(done.seen).toBe(true);
  });

  it("page-change marks seen from waiting and from shown", () => {
    const a = stepHint(waiting(1500), { type: "page-change", at: 5 });
    expect(a.phase).toBe("done");
    expect(a.seen).toBe(true);
    const b = stepHint(shown(), { type: "page-change", at: 5 });
    expect(b.phase).toBe("done");
    expect(b.seen).toBe(true);
  });
});

describe("nextWakeAt", () => {
  it("reports the next timer or null", () => {
    expect(nextWakeAt(waiting(1500))).toBe(1500);
    expect(nextWakeAt(waiting(null))).toBeNull();
    expect(nextWakeAt(shown(false))).toBe(4500);
    expect(nextWakeAt(shown(true))).toBe(9500);
    expect(nextWakeAt(initialHint())).toBeNull();
    expect(
      nextWakeAt({
        phase: "done",
        showAt: null,
        hideAt: null,
        seenAt: null,
        seen: true,
      }),
    ).toBeNull();
  });
});

describe("nudgeKeyframes", () => {
  const frames = nudgeKeyframes("E");
  it("is two 12px pulses with a pause at rest", () => {
    expect(frames.map((f) => f.translate)).toEqual([
      "0px 0px",
      "12px 0px",
      "0px 0px",
      "0px 0px",
      "12px 0px",
      "0px 0px",
    ]);
    const want = [0, 150 / 720, 300 / 720, 420 / 720, 570 / 720, 1];
    frames.forEach((f, i) => expect(f.offset).toBeCloseTo(want[i]!, 6));
  });
  it("is monotonic, eased per segment, never outside 0..12", () => {
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i]!.offset!).toBeGreaterThan(frames[i - 1]!.offset!);
    }
    for (const f of frames) {
      expect(f.easing).toBe("E");
      const x = parseFloat(String(f.translate));
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(12);
    }
    expect(frames.filter((f) => f.translate === "12px 0px")).toHaveLength(2);
  });
  it("returns a fresh array each call", () => {
    expect(nudgeKeyframes("E")).not.toBe(nudgeKeyframes("E"));
  });
});

describe("useHint html[data-hint] flag", () => {
  const mountHint = async (): Promise<{ unmount: () => void }> => {
    const { renderHook } = await import("@testing-library/react");
    const { useHint } = await import("@/components/frame/useHint");
    const hint = document.createElement("span");
    const next = document.createElement("a");
    const { unmount } = renderHook(() =>
      useHint({ current: hint }, { current: next }),
    );
    return { unmount };
  };

  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
    delete document.documentElement.dataset.hint;
  });
  afterEach(() => {
    vi.useRealTimers();
    delete document.documentElement.dataset.hint;
  });

  it("never flags a seen visitor", async () => {
    window.localStorage.setItem("yh-hint-seen", "1");
    const { unmount } = await mountHint();
    expect(document.documentElement.dataset.hint).toBeUndefined();
    unmount();
  });

  it("flags a fresh visitor at mount and clears it with one done event", async () => {
    vi.useFakeTimers();
    const done = vi.fn();
    document.addEventListener(HINT_DONE_EVENT, done);
    const { unmount } = await mountHint();
    expect(document.documentElement.dataset.hint).toBe("pending");
    vi.advanceTimersByTime(1600);
    expect(document.documentElement.dataset.hint).toBe("pending");
    vi.advanceTimersByTime(9000);
    expect(document.documentElement.dataset.hint).toBeUndefined();
    expect(done).toHaveBeenCalledTimes(1);
    unmount();
    expect(done).toHaveBeenCalledTimes(1);
    document.removeEventListener(HINT_DONE_EVENT, done);
  });

  it("removes the flag on unmount while pending", async () => {
    const { unmount } = await mountHint();
    expect(document.documentElement.dataset.hint).toBe("pending");
    unmount();
    expect(document.documentElement.dataset.hint).toBeUndefined();
  });
});
