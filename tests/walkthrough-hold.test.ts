import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { contains, visibleBox } from "@/lib/walkthrough/geometry";
import { engaged, running, showColour } from "@/lib/walkthrough/hold";
import type { HoldInputs } from "@/lib/walkthrough/hold";
import { counterText, statusText } from "@/lib/walkthrough/text";

const KEYS = [
  "onFrame",
  "onControl",
  "touchHold",
  "keyFocus",
  "userPaused",
  "isCurrentPage",
  "inView",
  "tabHidden",
  "reduced",
] as const;

function inputs(bits: number): HoldInputs {
  const o = Object.fromEntries(
    KEYS.map((k, i) => [k, (bits & (1 << i)) !== 0]),
  );
  return o as unknown as HoldInputs;
}

const BASE: HoldInputs = {
  onFrame: false,
  onControl: false,
  touchHold: false,
  keyFocus: false,
  userPaused: false,
  isCurrentPage: true,
  inView: true,
  tabHidden: false,
  reduced: false,
};

describe("hold derivation", () => {
  it("matches the three formulas for all 512 combinations", () => {
    for (let bits = 0; bits < 1 << 9; bits++) {
      const i = inputs(bits);
      const eng = i.onFrame || i.onControl || i.touchHold || i.keyFocus;
      expect(engaged(i)).toBe(eng);
      expect(running(i)).toBe(
        !i.reduced &&
          !i.userPaused &&
          !eng &&
          i.inView &&
          i.isCurrentPage &&
          !i.tabHidden,
      );
      expect(showColour(i)).toBe(eng && i.isCurrentPage);
    }
  });

  it("resumes after a mouse-clicked control is left", () => {
    expect(running({ ...BASE, onControl: false, keyFocus: false })).toBe(true);
  });

  it("Pause alone stops the clock without colour", () => {
    const i = { ...BASE, userPaused: true };
    expect(running(i)).toBe(false);
    expect(showColour(i)).toBe(false);
  });

  it("hover pauses and shows colour", () => {
    const i = { ...BASE, onFrame: true };
    expect(running(i)).toBe(false);
    expect(showColour(i)).toBe(true);
  });

  it("off-page hover shows no colour", () => {
    expect(showColour({ ...BASE, onFrame: true, isCurrentPage: false })).toBe(
      false,
    );
  });
});

describe("visibleBox", () => {
  const frame = { left: 100, top: 50, width: 800, height: 400 };
  const natural = { width: 390, height: 844 };

  it("centres the contain rect for a tall frame", () => {
    const b = visibleBox(frame, natural, 1, true);
    const w = (390 * 400) / 844;
    expect(b.height).toBeCloseTo(400);
    expect(b.width).toBeCloseTo(w);
    expect(b.left).toBeCloseTo(100 + (800 - w) / 2);
    expect(b.top).toBeCloseTo(50);
  });

  it("grows about the centre when scaled", () => {
    const a = visibleBox(frame, natural, 1, true);
    const b = visibleBox(frame, natural, 1.06, true);
    expect(b.width).toBeCloseTo(a.width * 1.06);
    expect(b.left + b.width / 2).toBeCloseTo(a.left + a.width / 2);
    expect(b.top + b.height / 2).toBeCloseTo(a.top + a.height / 2);
  });

  it("returns the frame rect for a landscape frame", () => {
    expect(visibleBox(frame, natural, 1.06, false)).toEqual(frame);
  });

  it("contains is inclusive of edges and rejects outside", () => {
    expect(contains(frame, 100, 50)).toBe(true);
    expect(contains(frame, 900, 450)).toBe(true);
    expect(contains(frame, 99, 50)).toBe(false);
    expect(contains(frame, 500, 451)).toBe(false);
  });
});

describe("counter text", () => {
  const frames = projects.flagship.walkthrough.frames;
  it("formats counter and status", () => {
    expect(counterText(0, frames)).toBe("01 / 10, Home");
    expect(statusText(1, frames)).toBe("02 of 10, History");
  });
});
