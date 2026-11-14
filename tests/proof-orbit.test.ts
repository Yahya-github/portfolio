import { describe, expect, it } from "vitest";
import {
  PITCH_LIMIT,
  START_POSE,
  autoRotateYaw,
  dragTo,
  keyStep,
  shouldAutoRotate,
  touchIntent,
} from "@/lib/proof/model/orbit";
import type { AutoRotateInputs } from "@/lib/proof/model/orbit";
import { cubicBezier, parseCubicBezier } from "@/lib/proof/model/ease";

const KEYS = [
  "reducedMotion",
  "motionOn",
  "inView",
  "visible",
  "touched",
] as const;

function inputs(bits: number): AutoRotateInputs {
  const o = Object.fromEntries(
    KEYS.map((k, i) => [k, (bits & (1 << i)) !== 0]),
  );
  return o as unknown as AutoRotateInputs;
}

describe("auto-rotate gate", () => {
  it("matches the formula for all 32 combinations", () => {
    for (let bits = 0; bits < 1 << 5; bits++) {
      const i = inputs(bits);
      expect(shouldAutoRotate(i)).toBe(
        !i.reducedMotion && i.motionOn && i.inView && i.visible && !i.touched,
      );
    }
  });
});

describe("dragTo", () => {
  const p = { yaw: 0, pitch: 0 };
  it("maps a full stage width to a full turn", () => {
    expect(dragTo(p, 400, 0, 400, true).yaw).toBeCloseTo(2 * Math.PI);
  });
  it("clamps pitch both ways", () => {
    expect(dragTo(p, 0, 10000, 400, true).pitch).toBe(PITCH_LIMIT);
    expect(dragTo(p, 0, -10000, 400, true).pitch).toBe(-PITCH_LIMIT);
  });
  it("keeps pitch when pitch is disallowed", () => {
    const q = { yaw: 0, pitch: 0.2 };
    expect(dragTo(q, 100, 300, 400, false).pitch).toBe(0.2);
  });
  it("does not mutate the input", () => {
    const q = Object.freeze({ yaw: 0, pitch: 0 });
    expect(() => dragTo(q, 10, 10, 400, true)).not.toThrow();
  });
});

describe("keyStep", () => {
  const p = { yaw: 0, pitch: 0 };
  it("steps yaw with left and right", () => {
    expect(keyStep(p, "ArrowLeft")?.yaw).toBeCloseTo(-Math.PI / 12);
    expect(keyStep(p, "ArrowRight")?.yaw).toBeCloseTo(Math.PI / 12);
  });
  it("steps and clamps pitch with up and down", () => {
    expect(keyStep(p, "ArrowUp")?.pitch).toBeCloseTo(Math.PI / 18);
    expect(keyStep(p, "ArrowDown")?.pitch).toBeCloseTo(-Math.PI / 18);
    expect(keyStep({ yaw: 0, pitch: PITCH_LIMIT }, "ArrowUp")?.pitch).toBe(
      PITCH_LIMIT,
    );
    expect(keyStep({ yaw: 0, pitch: -PITCH_LIMIT }, "ArrowDown")?.pitch).toBe(
      -PITCH_LIMIT,
    );
  });
  it("Home resets and other keys return null", () => {
    expect(keyStep({ yaw: 3, pitch: 0.1 }, "Home")).toEqual(START_POSE);
    expect(keyStep(p, "a")).toBeNull();
    expect(keyStep(p, "Enter")).toBeNull();
  });
});

describe("touchIntent", () => {
  it("is null below the threshold, decided at it", () => {
    expect(touchIntent(7, 0)).toBeNull();
    expect(touchIntent(8, 0)).toBe("orbit");
    expect(touchIntent(9, 0)).toBe("orbit");
    expect(touchIntent(0, 9)).toBe("scroll");
    expect(touchIntent(5, 5)).toBeNull();
    expect(touchIntent(6, 6)).toBe("scroll");
  });
});

describe("autoRotateYaw", () => {
  it("turns once per turnMs", () => {
    const p = { yaw: 0, pitch: 0.1 };
    expect(autoRotateYaw(p, 24000, 24000).yaw).toBeCloseTo(2 * Math.PI);
    expect(autoRotateYaw(p, 6000, 24000).pitch).toBe(0.1);
  });
  it("returns the pose unchanged for turnMs <= 0", () => {
    const p = { yaw: 1, pitch: 0 };
    expect(autoRotateYaw(p, 100, 0)).toBe(p);
  });
});

describe("cubicBezier", () => {
  const page = cubicBezier(0.77, 0, 0.18, 1);
  const ui = cubicBezier(0.16, 1, 0.3, 1);
  it("hits the endpoints and clamps", () => {
    for (const f of [page, ui]) {
      expect(f(0)).toBe(0);
      expect(f(1)).toBe(1);
      expect(f(-1)).toBe(0);
      expect(f(2)).toBe(1);
    }
  });
  it("is monotone", () => {
    for (const f of [page, ui]) {
      let prev = 0;
      for (let i = 1; i <= 100; i++) {
        const y = f(i / 100);
        expect(y).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = y;
      }
    }
  });
  it("matches reference values at t = 0.5", () => {
    // Reference values from an independent bisection solve (ease-page is not symmetric).
    expect(page(0.5)).toBeCloseTo(0.58714, 3);
    expect(ui(0.5)).toBeCloseTo(0.97178, 3);
  });
  it("parses css strings", () => {
    expect(parseCubicBezier("cubic-bezier(0.77, 0, 0.18, 1)")).toEqual([
      0.77, 0, 0.18, 1,
    ]);
    expect(parseCubicBezier("ease")).toBeNull();
    expect(parseCubicBezier("cubic-bezier(1,2,3)")).toBeNull();
  });
});
