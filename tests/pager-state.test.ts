import { describe, expect, it } from "vitest";
import {
  PAGE_COUNT,
  headingLevelOf,
  initialState,
  isCollapsed,
  isLive,
  land,
  reduce,
} from "@/lib/pager/state";
import type { Intent, PagerState } from "@/lib/pager/types";

const NEXT: Intent = { type: "next", source: "wheel" };
const PREV: Intent = { type: "prev", source: "key" };
const goto = (index: number): Intent => ({
  type: "goto",
  index,
  source: "link",
});

function landedAt(index: number): PagerState {
  return index === 0
    ? initialState(0)
    : land(reduce(initialState(0), goto(index)));
}

describe("PAGE_COUNT", () => {
  it("matches the six sections", () => {
    expect(PAGE_COUNT).toBe(6);
  });
});

describe("initialState", () => {
  it("rests on the given index with rail letters off the index", () => {
    expect(initialState(2)).toEqual({
      current: 2,
      target: 2,
      phase: "idle",
      source: null,
      slideId: 0,
      retarget: false,
      focusHolder: 2,
      announced: null,
      landId: 0,
    });
  });

  it("carries no letters stand-in state", () => {
    expect(Object.keys(initialState(0)).sort()).toEqual(
      [
        "announced",
        "current",
        "focusHolder",
        "landId",
        "phase",
        "retarget",
        "slideId",
        "source",
        "target",
      ].sort(),
    );
  });
});

describe("reduce", () => {
  it("starts a slide on next from rest", () => {
    const s = reduce(initialState(0), NEXT);
    expect(s).toMatchObject({
      current: 0,
      target: 1,
      phase: "sliding",
      retarget: false,
      slideId: 1,
      focusHolder: 1,
      source: "wheel",
    });
  });

  it("applies relative intents to the in-flight target (D-01)", () => {
    const s = reduce(reduce(initialState(0), NEXT), NEXT);
    expect(s).toMatchObject({
      target: 2,
      retarget: true,
      focusHolder: 1,
      slideId: 2,
    });
  });

  it("does not mutate the input state", () => {
    const start = initialState(0);
    const snapshot = { ...start };
    reduce(start, NEXT);
    expect(start).toEqual(snapshot);
  });

  it("returns the same object at the last page on next (D-02)", () => {
    const state = initialState(5);
    expect(reduce(state, NEXT)).toBe(state);
  });

  it("returns the same object at the first page on prev (D-02)", () => {
    const state = initialState(0);
    expect(reduce(state, PREV)).toBe(state);
  });

  it("stops at the end even when retargeting", () => {
    const state = reduce(initialState(4), NEXT);
    expect(reduce(state, NEXT)).toBe(state);
  });

  it("jumps straight to a goto index (D-03)", () => {
    const s = reduce(initialState(1), goto(4));
    expect(s.target).toBe(4);
    expect(s.source).toBe("link");
  });

  it("ignores a goto to the in-flight target", () => {
    const state = reduce(initialState(1), goto(4));
    expect(reduce(state, goto(4))).toBe(state);
  });

  it("ignores a goto to the resting page", () => {
    const state = initialState(1);
    expect(reduce(state, goto(1))).toBe(state);
  });

  it.each([-1, 6, 1.5, Number.NaN])("rejects goto(%s)", (index) => {
    const state = initialState(1);
    expect(reduce(state, goto(index))).toBe(state);
  });
});

describe("land", () => {
  it("lands on the target and hands focus over", () => {
    const sliding = reduce(reduce(initialState(0), NEXT), goto(3));
    expect(sliding.focusHolder).toBe(1);
    const s = land(sliding);
    expect(s).toMatchObject({
      current: 3,
      target: 3,
      phase: "idle",
      focusHolder: 3,
      announced: 3,
      landId: sliding.landId + 1,
      retarget: false,
    });
  });

  it("returns the same object when idle", () => {
    const state = initialState(2);
    expect(land(state)).toBe(state);
  });
});

describe("isLive", () => {
  it("is true only for the target and the focus holder while sliding", () => {
    const s = reduce(reduce(initialState(0), NEXT), goto(4));
    const live = [0, 1, 2, 3, 4, 5].filter((i) => isLive(s, i));
    expect(live).toEqual([1, 4]);
  });

  it.each([0, 3, 5])("has exactly one live page at rest on %i", (index) => {
    const s = landedAt(index);
    const live = [0, 1, 2, 3, 4, 5].filter((i) => isLive(s, i));
    expect(live).toEqual([index]);
  });
});

describe("headingLevelOf", () => {
  it("gives level 1 only to the target", () => {
    const s = reduce(initialState(1), goto(4));
    expect(headingLevelOf(s, 4)).toBe(1);
    expect(headingLevelOf(s, 1)).toBe(2);
    expect(headingLevelOf(s, 0)).toBe(2);
  });
});

describe("isCollapsed", () => {
  it("collapses every page but the current one at rest", () => {
    const s = initialState(2);
    expect(isCollapsed(s, 2)).toBe(false);
    expect(isCollapsed(s, 1)).toBe(true);
    expect(isCollapsed(s, 5)).toBe(true);
  });

  it("collapses nothing while sliding", () => {
    const s = reduce(initialState(2), NEXT);
    expect([0, 1, 2, 3, 4, 5].some((i) => isCollapsed(s, i))).toBe(false);
  });
});
