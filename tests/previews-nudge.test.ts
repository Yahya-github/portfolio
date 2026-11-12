import { describe, expect, it } from "vitest";
import { PREVIEW_INSET_PX, previewOffset } from "@/lib/previews/nudge";

describe("previewOffset", () => {
  it("returns 0 when the preview fits above the limit", () => {
    expect(
      previewOffset({ top: 500, bottom: 700, viewportTop: 80, limit: 800 }),
    ).toBe(0);
  });

  it("lifts the preview by the overflow", () => {
    expect(
      previewOffset({ top: 500, bottom: 900, viewportTop: 80, limit: 800 }),
    ).toBe(-100);
  });

  it("never rises above the viewport top", () => {
    expect(
      previewOffset({ top: 100, bottom: 900, viewportTop: 80, limit: 800 }),
    ).toBe(-20);
  });

  it("insets by 8px", () => {
    expect(PREVIEW_INSET_PX).toBe(8);
  });
});
