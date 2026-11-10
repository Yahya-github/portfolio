import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { PagerContext, usePagerState } from "@/components/shell/PagerContext";
import { REPEAT_GATE_MS, createPagerController } from "@/lib/pager/controller";
import { createSignals } from "@/lib/pager/signals";
import { initialState } from "@/lib/pager/state";
import type { Intent, SlideStartEvent, Source } from "@/lib/pager/types";
import { createStubDeps } from "./helpers/stub-ports";

const NEXT: Intent = { type: "next", source: "wheel" };
const PREV: Intent = { type: "prev", source: "wheel" };
const nextFrom = (source: Source, repeat = false): Intent => ({
  type: "next",
  source,
  repeat,
});
const goto = (index: number, source: Source = "link"): Intent => ({
  type: "goto",
  index,
  source,
});

function setup(initialIndex = 0) {
  const stub = createStubDeps();
  const controller = createPagerController(stub.deps, initialIndex);
  const starts: SlideStartEvent[] = [];
  const landed: number[] = [];
  controller.signals.onSlideStart((e) => starts.push(e));
  controller.signals.onLanded((i) => landed.push(i));
  return { ...stub, controller, starts, landed };
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("createPagerController: accepted intent", () => {
  it("commits, scrolls, animates, focuses, then signals, in that order", () => {
    const { controller, log, starts } = setup();
    const notify = vi.fn();
    controller.subscribe(notify);

    expect(controller.intent(NEXT)).toBe(true);

    expect(log).toEqual([
      "commit",
      "scroll.beforeSlide(0,1,true)",
      "animator.slideTo(1,retarget=false,reduced=false)",
      "focus.focusTitle(1,false)",
    ]);
    expect(starts).toEqual([
      { from: 0, to: 1, source: "wheel", heldScrollY: 0 },
    ]);
    expect(controller.getSnapshot().target).toBe(1);
    expect(controller.getSnapshot().phase).toBe("sliding");
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("emits slideStart after the focus call", () => {
    const { controller, log } = setup();
    controller.signals.onSlideStart((e) =>
      log.push(`signal.slideStart(${e.from}->${e.to},${e.source})`),
    );
    controller.intent(NEXT);
    expect(log.slice(-2)).toEqual([
      "focus.focusTitle(1,false)",
      "signal.slideStart(0->1,wheel)",
    ]);
  });

  it("shows the focus ring only for keyboard input", () => {
    const sources: Source[] = ["key", "wheel", "swipe", "link", "history"];
    const results = sources.map((source) => {
      const { controller, log } = setup();
      controller.intent(nextFrom(source));
      return log.find((l) => l.startsWith("focus."));
    });
    expect(results).toEqual([
      "focus.focusTitle(1,true)",
      "focus.focusTitle(1,false)",
      "focus.focusTitle(1,false)",
      "focus.focusTitle(1,false)",
      "focus.focusTitle(1,false)",
    ]);
  });

  it("keeps getSnapshot stable between changes", () => {
    const { controller } = setup();
    const a = controller.getSnapshot();
    expect(controller.getSnapshot()).toBe(a);
    controller.intent(NEXT);
    expect(controller.getSnapshot()).not.toBe(a);
  });

  it("stops notifying after unsubscribe", () => {
    const { controller } = setup();
    const notify = vi.fn();
    const off = controller.subscribe(notify);
    off();
    controller.intent(NEXT);
    expect(notify).not.toHaveBeenCalled();
  });
});

describe("createPagerController: retarget and landing", () => {
  it("retargets without refocusing and restarts from the current position", () => {
    const { controller, log, starts } = setup();
    controller.intent(NEXT);
    log.length = 0;

    expect(controller.intent(NEXT)).toBe(true);

    expect(log).toEqual([
      "commit",
      "scroll.beforeSlide(0,2,false)",
      "animator.slideTo(2,retarget=true,reduced=false)",
    ]);
    expect(starts.map((s) => [s.from, s.to])).toEqual([
      [0, 1],
      [1, 2],
    ]);
  });

  it("ignores the stale slide and lands only on the final one", async () => {
    const { controller, log, slides, landed } = setup();
    controller.intent(NEXT);
    controller.intent(NEXT);
    log.length = 0;

    slides[0].resolve(true);
    await flush();
    expect(log).toEqual([]);
    expect(controller.getSnapshot().phase).toBe("sliding");

    slides[1].resolve(true);
    await flush();
    expect(log).toEqual([
      "focus.focusTitle(2,false)",
      "commit",
      "animator.settle(2)",
      "history.push(2)",
      "scroll.afterLand(2)",
    ]);
    expect(landed).toEqual([2]);
    const s = controller.getSnapshot();
    expect(s.phase).toBe("idle");
    expect(s.current).toBe(2);
    expect(s.announced).toBe(2);
    expect(log.filter((l) => l.startsWith("history."))).toHaveLength(1);
  });

  it("emits landed after scroll.afterLand", async () => {
    const { controller, log, slides } = setup();
    controller.signals.onLanded((i) => log.push(`signal.landed(${i})`));
    controller.intent(NEXT);
    slides[0].resolve(true);
    await flush();
    expect(log.slice(-2)).toEqual(["scroll.afterLand(1)", "signal.landed(1)"]);
  });

  it("does not refocus on landing when the focus holder is the target", async () => {
    const { controller, log, slides } = setup();
    controller.intent(nextFrom("key"));
    log.length = 0;
    slides[0].resolve(true);
    await flush();
    expect(log).toEqual([
      "commit",
      "animator.settle(1)",
      "history.push(1)",
      "scroll.afterLand(1)",
    ]);
  });

  it("never pushes history for a history-sourced change", async () => {
    const { controller, log, slides, landed } = setup();
    controller.intent(goto(4, "history"));
    slides[0].resolve(true);
    await flush();
    expect(landed).toEqual([4]);
    expect(log.some((l) => l.startsWith("history."))).toBe(false);
  });

  it("lands on the target when the slide is abandoned without a newer one (WR-02)", async () => {
    const { controller, slides, landed } = setup();
    controller.intent(NEXT);
    slides[0].resolve(false);
    await flush();
    expect(landed).toEqual([1]);
    expect(controller.getSnapshot().phase).toBe("idle");
  });

  it("ignores a cancelled slide that a newer slide superseded", async () => {
    const { controller, slides, landed } = setup();
    controller.intent(NEXT);
    controller.intent(NEXT);
    slides[0].resolve(false);
    await flush();
    expect(landed).toEqual([]);
    expect(controller.getSnapshot().phase).toBe("sliding");
  });

  it("lands when the animator promise rejects (WR-02)", async () => {
    const stub = createStubDeps();
    const controller = createPagerController(
      {
        ...stub.deps,
        animator: {
          ...stub.deps.animator,
          slideTo: () => Promise.reject(new Error("boom")),
        },
      },
      0,
    );
    controller.intent(NEXT);
    await flush();
    expect(controller.getSnapshot().phase).toBe("idle");
    expect(controller.getSnapshot().current).toBe(1);
  });

  it("lands without throwing when the animator throws synchronously (WR-02)", async () => {
    const stub = createStubDeps();
    const controller = createPagerController(
      {
        ...stub.deps,
        animator: {
          ...stub.deps.animator,
          slideTo: () => {
            throw new Error("detached track");
          },
        },
      },
      0,
    );
    expect(() => controller.intent(NEXT)).not.toThrow();
    await flush();
    expect(controller.getSnapshot().phase).toBe("idle");
    expect(controller.getSnapshot().current).toBe(1);
  });
});

describe("createPagerController: rejected intents", () => {
  it.each([
    ["next at the last page", 5, NEXT],
    ["prev at the first page", 0, PREV],
    ["goto the current target", 3, goto(3)],
  ] as const)("%s calls no port and does not notify", (_, start, intent) => {
    const { controller, log, starts } = setup(start);
    const notify = vi.fn();
    controller.subscribe(notify);
    expect(controller.intent(intent)).toBe(false);
    expect(log).toEqual([]);
    expect(starts).toEqual([]);
    expect(notify).not.toHaveBeenCalled();
  });
});

describe("createPagerController: repeat gate", () => {
  it("uses a fixed 600ms gate", () => {
    expect(REPEAT_GATE_MS).toBe(600);
  });

  it("rejects a repeat while sliding", () => {
    const { controller } = setup();
    controller.intent(nextFrom("key"));
    expect(controller.intent(nextFrom("key", true))).toBe(false);
  });

  it("accepts a repeat only after landing and 600ms after the last step", async () => {
    const { controller, slides, clock } = setup();
    clock.now = 0;
    controller.intent(nextFrom("key"));
    slides[0].resolve(true);
    await flush();

    clock.now = 500;
    expect(controller.intent(nextFrom("key", true))).toBe(false);
    clock.now = 600;
    expect(controller.intent(nextFrom("key", true))).toBe(true);
  });

  it("applies under reduced motion too", async () => {
    const { controller, slides, clock } = setup();
    controller.setReducedMotion(true);
    controller.intent(nextFrom("key"));
    slides[0].resolve(true);
    await flush();
    clock.now = 100;
    expect(controller.intent(nextFrom("key", true))).toBe(false);
  });

  it("never gates non-repeat intents", () => {
    const { controller } = setup();
    controller.intent(nextFrom("key"));
    expect(controller.intent(nextFrom("key"))).toBe(true);
  });

  it("ignores repeat on goto", () => {
    const { controller } = setup();
    controller.intent(nextFrom("key"));
    const repeatGoto = { ...goto(4), repeat: true } as unknown as Intent;
    expect(controller.intent(repeatGoto)).toBe(true);
  });
});

describe("createPagerController: reduced motion", () => {
  it("passes reduced to the animator and reports it", () => {
    const { controller, log } = setup();
    expect(controller.isReducedMotion()).toBe(false);
    controller.setReducedMotion(true);
    expect(controller.isReducedMotion()).toBe(true);
    controller.intent(NEXT);
    expect(log).toContain("animator.slideTo(1,retarget=false,reduced=true)");
  });
});

describe("createSignals", () => {
  it("delivers until unsubscribed", () => {
    const hub = createSignals();
    const starts: number[] = [];
    const landed: number[] = [];
    const offStart = hub.onSlideStart((e) => starts.push(e.to));
    const offLanded = hub.onLanded((i) => landed.push(i));
    hub.emitSlideStart({ from: 0, to: 1, source: "key", heldScrollY: 0 });
    hub.emitLanded(1);
    offStart();
    offLanded();
    hub.emitSlideStart({ from: 1, to: 2, source: "key", heldScrollY: 0 });
    hub.emitLanded(2);
    expect(starts).toEqual([1]);
    expect(landed).toEqual([1]);
  });

  it("tolerates listeners added during emit", () => {
    const hub = createSignals();
    const seen: number[] = [];
    hub.onLanded(() => {
      hub.onLanded((i) => seen.push(i));
    });
    expect(() => hub.emitLanded(1)).not.toThrow();
    hub.emitLanded(2);
    expect(seen).toEqual([2]);
  });
});

describe("usePagerState", () => {
  it("falls back to initialState outside a provider", () => {
    const { result } = renderHook(() => usePagerState(3));
    expect(result.current).toEqual(initialState(3));
  });

  it("re-renders on accepted intents inside the context", () => {
    const { controller } = setup();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(PagerContext, { value: controller }, children);
    const { result } = renderHook(() => usePagerState(0), { wrapper });
    expect(result.current.target).toBe(0);
    act(() => {
      controller.intent(NEXT);
    });
    expect(result.current.target).toBe(1);
    expect(result.current.phase).toBe("sliding");
  });
});
