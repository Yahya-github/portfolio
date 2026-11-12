import { describe, expect, it } from "vitest";
import { parseDurationMs } from "@/lib/motion/duration";

describe("parseDurationMs", () => {
  it.each([
    ["5000ms", 5000],
    ["5s", 5000],
    [".9s", 900],
    ["0.15s", 150],
    [" 900ms ", 900],
    ["0s", 0],
    ["0ms", 0],
    ["120", 120],
  ])("reads %s as %d ms", (raw, ms) => {
    expect(parseDurationMs(raw)).toBe(ms);
  });

  it.each(["", "auto", "5px", "calc(1s)"])("returns NaN for %j", (raw) => {
    expect(parseDurationMs(raw)).toBeNaN();
  });
});
