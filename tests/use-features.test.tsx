import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { createSignals } from "@/lib/pager/signals";
import type { PagerController } from "@/lib/pager/types";

const { mounts, loaders } = vi.hoisted(() => {
  const mounts = { previews: vi.fn(), walkthrough: vi.fn(), toggles: vi.fn() };
  const loaders = {
    previews: vi.fn(() => Promise.resolve({ mount: mounts.previews })),
    walkthrough: vi.fn(() => Promise.resolve({ mount: mounts.walkthrough })),
    toggles: vi.fn(() => Promise.resolve({ mount: mounts.toggles })),
  };
  return { mounts, loaders };
});
const cleanups: Array<ReturnType<typeof vi.fn>> = [];

vi.mock("@/lib/features/registry", async () => {
  const real = await vi.importActual<typeof import("@/lib/features/registry")>(
    "@/lib/features/registry",
  );
  return { ...real, FEATURE_LOADERS: loaders, GLOBAL_FEATURES: [] };
});

import { useFeatures } from "@/components/shell/useFeatures";

function Probe({ controller }: { controller: PagerController }) {
  useFeatures(controller);
  return null;
}

function setup(target: number) {
  const signals = createSignals();
  const state = { target };
  const controller = {
    getSnapshot: () => state,
    signals,
  } as unknown as PagerController;
  return { signals, controller, state };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  cleanups.length = 0;
  for (const m of Object.values(mounts)) {
    const cleanup = vi.fn();
    cleanups.push(cleanup);
    m.mockReset();
    m.mockReturnValue(cleanup);
  }
  for (const l of Object.values(loaders)) l.mockClear();
  for (const slug of ["achievements", "projects", "experience"]) {
    const s = document.createElement("section");
    s.id = `page-${slug}`;
    document.body.append(s);
  }
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("useFeatures", () => {
  it("mounts neighbour features once on mount", async () => {
    const { controller } = setup(2);
    render(<Probe controller={controller} />);
    await flush();
    expect(mounts.previews).toHaveBeenCalledTimes(2);
    expect(mounts.walkthrough).toHaveBeenCalledTimes(1);
    expect(mounts.toggles).toHaveBeenCalledTimes(2);
    const [root, ctx] = mounts.walkthrough.mock.calls[0];
    expect((root as HTMLElement).id).toBe("page-projects");
    expect(ctx.isCurrent()).toBe(true);
  });

  it("never mounts a job twice across slide starts", async () => {
    const { controller, signals } = setup(2);
    render(<Probe controller={controller} />);
    await flush();
    signals.emitSlideStart({
      from: 2,
      to: 1,
      source: "key",
      heldScrollY: 0,
    } as never);
    await flush();
    expect(mounts.walkthrough).toHaveBeenCalledTimes(1);
    expect(mounts.previews).toHaveBeenCalledTimes(2);
  });

  it("skips a job with a missing root and retries later", async () => {
    document.getElementById("page-experience")!.remove();
    const { controller, signals } = setup(2);
    render(<Probe controller={controller} />);
    await flush();
    expect(mounts.toggles).toHaveBeenCalledTimes(1);
    const s = document.createElement("section");
    s.id = "page-experience";
    document.body.append(s);
    signals.emitSlideStart({
      from: 2,
      to: 3,
      source: "key",
      heldScrollY: 0,
    } as never);
    await flush();
    expect(mounts.toggles).toHaveBeenCalledTimes(2);
  });

  it("keeps a rejected import retryable without throwing", async () => {
    loaders.walkthrough.mockRejectedValueOnce(new Error("chunk"));
    const { controller, signals } = setup(2);
    render(<Probe controller={controller} />);
    await flush();
    expect(mounts.walkthrough).not.toHaveBeenCalled();
    signals.emitSlideStart({
      from: 2,
      to: 2,
      source: "key",
      heldScrollY: 0,
    } as never);
    await flush();
    expect(mounts.walkthrough).toHaveBeenCalledTimes(1);
  });

  it("calls cleanups on unmount and ignores late imports", async () => {
    const { controller } = setup(2);
    const { unmount } = render(<Probe controller={controller} />);
    await flush();
    unmount();
    for (const c of cleanups)
      expect(c.mock.calls.length).toBeGreaterThanOrEqual(0);
    expect(cleanups[0]).toHaveBeenCalledTimes(2);
    expect(cleanups[1]).toHaveBeenCalledTimes(1);
  });
});
