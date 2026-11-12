/**
 * D-14 / D-13 (plan 04-11): the ?debug overlay is read-only, mirrors debug
 * frames and pager state, and records wheel samples on window.__pagerTrace.
 */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DebugOverlay } from "@/components/shell/DebugOverlay";
import { PagerContext } from "@/components/shell/PagerContext";
import { site } from "@/content/site";
import { createPagerController } from "@/lib/pager/controller";
import { emitDebug } from "@/lib/pager/debug";
import { createStubDeps } from "./helpers/stub-ports";

type TraceWindow = Window & { __pagerTrace?: unknown[] };

afterEach(() => {
  cleanup();
  delete (window as TraceWindow).__pagerTrace;
});

function mount(reduced = false) {
  const stub = createStubDeps();
  const controller = createPagerController(stub.deps, 0);
  controller.setReducedMotion(reduced);
  const view = render(
    <PagerContext value={controller}>
      <DebugOverlay />
    </PagerContext>,
  );
  return { ...view, controller, stub };
}

function row(container: HTMLElement, name: string): string {
  const dt = Array.from(container.querySelectorAll("dt")).find(
    (d) => d.textContent === name,
  );
  if (!dt) throw new Error(`no row ${name}`);
  return dt.nextElementSibling?.textContent ?? "";
}

const WHEEL = { t: 1, dx: 0, dy: 40, mode: 0 };

describe("DebugOverlay", () => {
  it("is aria-hidden and lists the nine fields in UI-SPEC order", () => {
    const { container } = mount();
    const dl = container.querySelector("dl");
    expect(dl?.getAttribute("aria-hidden")).toBe("true");
    const names = Array.from(container.querySelectorAll("dt")).map(
      (d) => d.textContent,
    );
    expect(names).toEqual([
      site.debug.index,
      site.debug.phase,
      site.debug.source,
      site.debug.wheel,
      site.debug.accum,
      site.debug.gesture,
      site.debug.edge,
      site.debug.swipe,
      site.debug.motion,
    ]);
  });

  it("shows pager state and motion mode", () => {
    const { container } = mount();
    expect(row(container, site.debug.index)).toBe("0 → 0");
    expect(row(container, site.debug.phase)).toBe("idle");
    expect(row(container, site.debug.source)).toBe("none");
    expect(row(container, site.debug.motion)).toBe("full");
  });

  it("shows reduced motion", () => {
    const { container } = mount(true);
    expect(row(container, site.debug.motion)).toBe("reduced");
  });

  it("updates rows from debug frames", () => {
    const { container } = mount();
    act(() => {
      emitDebug({
        wheel: WHEEL,
        accum: 40,
        gesture: { id: 3, open: true },
        edge: "none",
      });
    });
    expect(row(container, site.debug.wheel)).toBe("dx 0 dy 40 mode 0");
    expect(row(container, site.debug.accum)).toBe("40 / 48");
    expect(row(container, site.debug.gesture)).toBe("#3 open");
    expect(row(container, site.debug.edge)).toBe("none");
    act(() => {
      emitDebug({ swipe: { dx: 12.4, v: 0.5, lock: "h" } });
    });
    expect(row(container, site.debug.swipe)).toBe("dx 12 v 0.50 h");
    expect(row(container, site.debug.wheel)).toBe("dx 0 dy 40 mode 0");
  });

  it("records wheel samples on window.__pagerTrace, capped at 600", () => {
    mount();
    act(() => {
      for (let t = 0; t < 605; t += 1) emitDebug({ wheel: { ...WHEEL, t } });
      emitDebug({ swipe: { dx: 1, v: 0, lock: "none" } });
    });
    const trace = (window as TraceWindow).__pagerTrace as { t: number }[];
    expect(trace).toHaveLength(600);
    expect(trace[0]).toEqual({ ...WHEEL, t: 5 });
    expect(trace[599]).toEqual({ ...WHEEL, t: 604 });
  });

  it("clears the sink on unmount", () => {
    const { unmount } = mount();
    unmount();
    emitDebug({ wheel: WHEEL });
    expect((window as TraceWindow).__pagerTrace).toBeUndefined();
  });
});
