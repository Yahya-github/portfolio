import { describe, expect, it } from "vitest";
import {
  DIVE_ROUTES,
  PROJECTS_ROUTE,
  shouldSkipTransition,
  type TransitionContext,
} from "@/lib/transition/rules";
import { TRANSITION_SCRIPT } from "@/lib/transition/script";

const play: TransitionContext = {
  reducedMotion: false,
  motionPaused: false,
  sourceInView: true,
  fromPath: PROJECTS_ROUTE,
  toPath: DIVE_ROUTES[0],
};

describe("shouldSkipTransition", () => {
  it.each(DIVE_ROUTES)("plays Projects -> %s", (dive) => {
    expect(shouldSkipTransition({ ...play, toPath: dive })).toBe(false);
  });

  it.each(DIVE_ROUTES)("plays %s -> Projects", (dive) => {
    expect(
      shouldSkipTransition({ ...play, fromPath: dive, toPath: PROJECTS_ROUTE }),
    ).toBe(false);
  });

  it.each(["reducedMotion", "motionPaused"] as const)("skips when %s", (k) => {
    expect(shouldSkipTransition({ ...play, [k]: true })).toBe(true);
  });

  it("skips when the source is off-screen", () => {
    expect(shouldSkipTransition({ ...play, sourceInView: false })).toBe(true);
  });

  it.each([
    ["/", "/projects/"],
    ["/projects/", "/experience/"],
    ["/projects/", "/projects/"],
    ["/projects/facturo/", "/projects/atlantis/"],
    ["/projects/facturo/", "/"],
    ["/about/", "/projects/robot/"],
    ["/projects/", "/projects/other/"],
  ])("skips the pair %s -> %s", (fromPath, toPath) => {
    expect(shouldSkipTransition({ ...play, fromPath, toPath })).toBe(true);
  });
});

describe("TRANSITION_SCRIPT", () => {
  it("is under 1024 bytes of try-wrapped inline script", () => {
    expect(new TextEncoder().encode(TRANSITION_SCRIPT).length).toBeLessThan(
      1024,
    );
    expect(TRANSITION_SCRIPT.startsWith("try{")).toBe(true);
    expect(TRANSITION_SCRIPT.endsWith("}catch(e){}")).toBe(true);
  });

  it("handles pageswap, pagereveal and skipTransition", () => {
    for (const word of ["pageswap", "pagereveal", "skipTransition"]) {
      expect(TRANSITION_SCRIPT).toContain(word);
    }
  });

  it("is valid JavaScript that registers both listeners", () => {
    const seen: string[] = [];
    const orig = window.addEventListener;
    window.addEventListener = ((name: string) => {
      seen.push(name);
    }) as typeof window.addEventListener;
    try {
      new Function(TRANSITION_SCRIPT)();
    } finally {
      window.addEventListener = orig;
    }
    expect(seen).toEqual(["pageswap", "pagereveal"]);
  });
});
