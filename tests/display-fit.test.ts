import { describe, expect, it } from "vitest";
import {
  DEFAULT_WORD_EM,
  DISPLAY_WORD_EM,
  displayFitStyle,
} from "@/lib/display-fit";

describe("displayFitStyle", () => {
  it.each([
    ["Achievements", 4.53],
    ["Resume (PDF)", 4.49],
    ["Involvement", 3.98],
    ["TWO", 1.49],
  ])("%s -> %d em", (word, em) => {
    expect(displayFitStyle(word)).toEqual({ "--word-em": em });
  });

  it("falls back to DEFAULT_WORD_EM for unmeasured words", () => {
    expect(DEFAULT_WORD_EM).toBe(4.6);
    expect(displayFitStyle("Unmeasured")).toEqual({ "--word-em": 4.6 });
  });

  it("default is at least as wide as every measured word", () => {
    for (const em of Object.values(DISPLAY_WORD_EM)) {
      expect(em).toBeLessThanOrEqual(DEFAULT_WORD_EM);
    }
  });

  it("fits Achievements in the 252px content width at 320px", () => {
    // font-size = min(64, (320 - 68) / em)
    const size = Math.min(64, (320 - 68) / DISPLAY_WORD_EM.Achievements);
    expect(size * DISPLAY_WORD_EM.Achievements).toBeLessThanOrEqual(252);
  });
});
