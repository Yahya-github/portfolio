/**
 * WR-03: the ?debug overlay chunk is optional. When its dynamic import fails
 * (offline, blocked, stale deploy) the shell keeps working and no unhandled
 * rejection escapes.
 */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Shell } from "@/components/shell/Shell";

vi.mock("@/components/shell/DebugOverlay", () => {
  throw new Error("chunk failed to load");
});

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("PagerProvider debug overlay import", () => {
  it("swallows a failed overlay chunk load (WR-03)", async () => {
    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);
    try {
      window.history.replaceState(null, "", "/?debug");
      const { container } = render(<Shell current="index" />);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      expect(container.querySelector("main#content")).not.toBeNull();
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off("unhandledRejection", unhandled);
    }
  });
});
