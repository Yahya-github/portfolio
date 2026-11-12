import { describe, expect, it } from "vitest";
import {
  deltaOnto,
  destinationOf,
  IDENTITY,
  LETTER_COUNT,
  LETTERS_MS,
  lastLetterEndMs,
  letterTiming,
  planGlide,
  shiftBox,
  STAGGER_MS,
  Y_LAG_MS,
} from "@/lib/letters/geometry";
import { FALLBACK_EASE, readEase } from "@/lib/motion/waapi";
import { SLIDE_MS } from "@/lib/pager/animator";

describe("glide constants (D-11, D-12, D-13)", () => {
  it("match the spec", () => {
    expect(STAGGER_MS).toBe(30);
    expect(Y_LAG_MS).toBe(100);
    expect(LETTER_COUNT).toBe(5);
    expect(LETTERS_MS).toBe(SLIDE_MS);
    expect(lastLetterEndMs()).toBe(820);
  });
});

describe("deltaOnto", () => {
  it("maps the hero box onto the rail box", () => {
    const d = deltaOnto(
      { left: 100, top: 500, height: 300 },
      { left: 24, top: 96, height: 30 },
    );
    expect(d.dx).toBe(-76);
    expect(d.dy).toBe(-404);
    expect(d.s).toBeCloseTo(0.1);
  });

  it("is identity for the same box", () => {
    const hero = { left: 10, top: 20, height: 300 };
    expect(deltaOnto(hero, hero)).toEqual(IDENTITY);
  });

  it("is identity for non-finite or zero-height input", () => {
    const ok = { left: 1, top: 2, height: 3 };
    expect(deltaOnto({ left: NaN, top: 0, height: 10 }, ok)).toEqual(IDENTITY);
    expect(deltaOnto(ok, { left: 0, top: Infinity, height: 1 })).toEqual(
      IDENTITY,
    );
    expect(deltaOnto({ left: 0, top: 0, height: 0 }, ok)).toEqual(IDENTITY);
  });
});

describe("planGlide", () => {
  it("maps indices to destinations", () => {
    expect(destinationOf(0)).toBe("hero");
    for (const i of [1, 2, 3, 4, 5]) expect(destinationOf(i)).toBe("rail");
  });

  it("does nothing rail to rail or hero to hero", () => {
    expect(planGlide("rail", 3)).toEqual({ kind: "none" });
    expect(planGlide("hero", 0)).toEqual({ kind: "none" });
  });

  it("flies between hero and rail", () => {
    expect(planGlide("hero", 2)).toEqual({ kind: "fly", dest: "rail" });
    expect(planGlide("rail", 0)).toEqual({ kind: "fly", dest: "hero" });
  });
});

describe("letterTiming and shiftBox", () => {
  it("staggers Y first", () => {
    expect(letterTiming(0)).toEqual({ xDelay: 0, yDelay: 100 });
    expect(letterTiming(4)).toEqual({ xDelay: 120, yDelay: 220 });
  });

  it("shifts boxes up by the held scroll", () => {
    expect(shiftBox({ left: 1, top: 500, height: 10 }, 200)).toEqual({
      left: 1,
      top: 300,
      height: 10,
    });
    const b = { left: 1, top: 5, height: 10 };
    expect(shiftBox(b, 0)).toEqual(b);
  });
});

describe("readEase", () => {
  it("falls back when the token is empty", () => {
    expect(FALLBACK_EASE.settle).toBe("cubic-bezier(0.5, 0, 0.2, 1)");
    expect(readEase("--ease-settle", FALLBACK_EASE.settle)).toBe(
      FALLBACK_EASE.settle,
    );
  });
});
