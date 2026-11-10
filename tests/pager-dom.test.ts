import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SLIDE_MS,
  createWaapiAnimator,
  restingOffsetPx,
  translateXOf,
} from "@/lib/pager/animator";
import { createFocusPort } from "@/lib/pager/focus";
import {
  createHistoryPort,
  indexFromLocation,
  setManualScrollRestoration,
  silenceNextAnnouncer,
} from "@/lib/pager/history";
import { createScrollPort } from "@/lib/pager/scroll";
import {
  edgeInfo,
  pageElement,
  pageScrolls,
  scrollerFor,
} from "@/lib/pager/input/edge";

interface FakeAnimation {
  readonly finished: Promise<unknown>;
  readonly cancel: ReturnType<typeof vi.fn>;
}

function fakeAnimation(outcome: "finish" | "cancel" = "finish"): FakeAnimation {
  const finished =
    outcome === "finish"
      ? Promise.resolve(undefined)
      : Promise.reject(new DOMException("cancelled", "AbortError"));
  // Avoid unhandled-rejection noise when a test never awaits it.
  finished.catch(() => {});
  return { finished, cancel: vi.fn() };
}

interface Animatable {
  readonly el: HTMLElement;
  readonly animate: ReturnType<typeof vi.fn>;
  readonly getAnimations: ReturnType<typeof vi.fn>;
  readonly running: FakeAnimation;
}

function animatable(
  tag: string,
  transform: string,
  outcome: "finish" | "cancel" = "finish",
): Animatable {
  const el = document.createElement(tag);
  el.style.transform = transform;
  document.body.appendChild(el);
  const running = fakeAnimation();
  const animate = vi.fn(() => fakeAnimation(outcome));
  const getAnimations = vi.fn(() => [running]);
  Object.assign(el, { animate, getAnimations });
  return { el, animate, getAnimations, running };
}

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.style.removeProperty("--ease-page");
  document.documentElement.style.removeProperty("--ease-retarget");
  vi.restoreAllMocks();
});

describe("translateXOf", () => {
  it("returns 0 for none and empty", () => {
    expect(translateXOf("none")).toBe(0);
    expect(translateXOf("")).toBe(0);
  });

  it("reads e from a 2D matrix", () => {
    expect(translateXOf("matrix(1, 0, 0, 1, -1440, 0)")).toBe(-1440);
  });

  it("reads the 13th value from a matrix3d", () => {
    expect(translateXOf("matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,-720.5,0,0,1)")).toBe(
      -720.5,
    );
  });

  it("returns 0 for a malformed matrix", () => {
    expect(translateXOf("matrix(1, 0)")).toBe(0);
    expect(translateXOf("matrix(a, b, c, d, e, f)")).toBe(0);
  });
});

describe("restingOffsetPx", () => {
  it("is -index * viewport width", () => {
    expect(restingOffsetPx(3, 1000)).toBe(-3000);
    expect(restingOffsetPx(0, 1000)).toBe(-0);
  });
});

describe("createWaapiAnimator", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      value: 1000,
      configurable: true,
    });
  });

  function setup(
    options: {
      outcome?: "finish" | "cancel";
    } = {},
  ) {
    const track = animatable(
      "main",
      "matrix(1, 0, 0, 1, -1000, 0)",
      options.outcome,
    );
    const bar = animatable("div", "matrix(1, 0, 0, 1, 200, 0)");
    Object.defineProperty(bar.el, "offsetWidth", {
      value: 200,
      configurable: true,
    });
    const animator = createWaapiAnimator({
      track: () => track.el,
      bar: () => bar.el,
    });
    return { track, bar, animator };
  }

  it("animates the track from its rendered position with the page ease", async () => {
    const { track, animator } = setup();
    document.documentElement.style.setProperty("--ease-page", "linear");

    const done = await animator.slideTo(3, { retarget: false, reduced: false });

    expect(done).toBe(true);
    expect(track.animate).toHaveBeenCalledWith(
      [
        { transform: "translate3d(-1000px, 0, 0)" },
        { transform: "translate3d(-3000px, 0, 0)" },
      ],
      { duration: SLIDE_MS, easing: "linear", fill: "forwards" },
    );
    expect(SLIDE_MS).toBe(600);
  });

  it("reads the rendered transform before cancelling running animations", async () => {
    const { track, animator } = setup();
    const order: string[] = [];
    const spy = vi
      .spyOn(window, "getComputedStyle")
      .mockImplementation((el: Element) => {
        if (el === track.el) order.push("read");
        return {
          transform: (el as HTMLElement).style.transform,
          getPropertyValue: () => "",
        } as unknown as CSSStyleDeclaration;
      });
    track.running.cancel.mockImplementation(() => order.push("cancel"));

    await animator.slideTo(2, { retarget: false, reduced: false });

    expect(order[0]).toBe("read");
    expect(order).toContain("cancel");
    expect(order.indexOf("read")).toBeLessThan(order.indexOf("cancel"));
    spy.mockRestore();
  });

  it("uses the retarget ease, falling back when the property is empty", async () => {
    const { track, animator } = setup();
    await animator.slideTo(1, { retarget: true, reduced: false });
    expect(track.animate.mock.calls[0][1]).toEqual({
      duration: 600,
      easing: "cubic-bezier(0.3, 0.6, 0.18, 1)",
      fill: "forwards",
    });

    document.documentElement.style.setProperty("--ease-retarget", "ease-in");
    await animator.slideTo(2, { retarget: true, reduced: false });
    expect(track.animate.mock.calls[1][1].easing).toBe("ease-in");
  });

  it("falls back to the page ease when --ease-page is empty", async () => {
    const { track, animator } = setup();
    await animator.slideTo(1, { retarget: false, reduced: false });
    expect(track.animate.mock.calls[0][1].easing).toBe(
      "cubic-bezier(0.77, 0, 0.18, 1)",
    );
  });

  it("animates the bar from its px to index * offsetWidth", async () => {
    const { bar, animator } = setup();
    await animator.slideTo(4, { retarget: false, reduced: false });
    expect(bar.animate).toHaveBeenCalledWith(
      [{ transform: "translateX(200px)" }, { transform: "translateX(800px)" }],
      expect.objectContaining({ duration: 600, fill: "forwards" }),
    );
  });

  it("settles instantly under reduced motion", async () => {
    const { track, bar, animator } = setup();
    const done = await animator.slideTo(2, { retarget: false, reduced: true });
    expect(done).toBe(true);
    expect(track.animate).not.toHaveBeenCalled();
    expect(bar.animate).not.toHaveBeenCalled();
    expect(track.el.style.getPropertyValue("--track-index")).toBe("2");
  });

  it("settles instantly when Element.animate is missing", async () => {
    const track = document.createElement("main");
    document.body.appendChild(track);
    Object.defineProperty(track, "animate", {
      value: undefined,
      configurable: true,
    });
    const animator = createWaapiAnimator({
      track: () => track,
      bar: () => null,
    });
    const done = await animator.slideTo(5, { retarget: false, reduced: false });
    expect(done).toBe(true);
    expect(track.style.getPropertyValue("--track-index")).toBe("5");
  });

  it("resolves true when there is no track", async () => {
    const animator = createWaapiAnimator({
      track: () => null,
      bar: () => null,
    });
    await expect(
      animator.slideTo(1, { retarget: false, reduced: false }),
    ).resolves.toBe(true);
  });

  it("resolves false when the slide is cancelled", async () => {
    const { animator } = setup({ outcome: "cancel" });
    await expect(
      animator.slideTo(1, { retarget: false, reduced: false }),
    ).resolves.toBe(false);
  });

  it("settle writes the resting indices then cancels every animation", () => {
    const { track, bar, animator } = setup();
    animator.settle(4);
    expect(track.el.style.getPropertyValue("--track-index")).toBe("4");
    expect(bar.el.style.getPropertyValue("--page-index")).toBe("4");
    expect(track.running.cancel).toHaveBeenCalled();
    expect(bar.running.cancel).toHaveBeenCalled();
  });

  it("settle leaves CSS animations and transitions running (WR-01)", () => {
    class FakeCssAnimation {
      readonly cancel = vi.fn();
    }
    class FakeCssTransition {
      readonly cancel = vi.fn();
    }
    vi.stubGlobal("CSSAnimation", FakeCssAnimation);
    vi.stubGlobal("CSSTransition", FakeCssTransition);
    try {
      const { bar, animator } = setup();
      const railIn = new FakeCssAnimation();
      const fade = new FakeCssTransition();
      bar.getAnimations.mockReturnValue([railIn, fade, bar.running]);

      animator.settle(2);

      expect(railIn.cancel).not.toHaveBeenCalled();
      expect(fade.cancel).not.toHaveBeenCalled();
      expect(bar.running.cancel).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

function sized(
  el: HTMLElement,
  dims: { scrollHeight: number; clientHeight: number; scrollTop?: number },
): HTMLElement {
  Object.defineProperty(el, "scrollHeight", {
    value: dims.scrollHeight,
    configurable: true,
  });
  Object.defineProperty(el, "clientHeight", {
    value: dims.clientHeight,
    configurable: true,
  });
  el.scrollTop = dims.scrollTop ?? 0;
  Object.defineProperty(el, "scrollTop", {
    value: dims.scrollTop ?? 0,
    configurable: true,
    writable: true,
  });
  return el;
}

describe("edge probe", () => {
  it("pageElement finds section#page-{slug}", () => {
    const page = document.createElement("section");
    page.id = "page-projects";
    document.body.appendChild(page);
    expect(pageElement(2)).toBe(page);
    expect(pageElement(1)).toBeNull();
  });

  it("pageScrolls is true for overflow-y auto or scroll", () => {
    const el = document.createElement("section");
    document.body.appendChild(el);
    expect(pageScrolls(el)).toBe(false);
    el.style.overflowY = "auto";
    expect(pageScrolls(el)).toBe(true);
    el.style.overflowY = "scroll";
    expect(pageScrolls(el)).toBe(true);
    el.style.overflowY = "hidden";
    expect(pageScrolls(el)).toBe(false);
  });

  it("scrollerFor picks the page when it scrolls and overflows", () => {
    const page = sized(document.createElement("section"), {
      scrollHeight: 2000,
      clientHeight: 800,
    });
    page.style.overflowY = "auto";
    document.body.appendChild(page);
    expect(scrollerFor(page)).toBe(page);
  });

  it("scrollerFor falls back to the document scroller", () => {
    const flat = sized(document.createElement("section"), {
      scrollHeight: 800,
      clientHeight: 800,
    });
    flat.style.overflowY = "auto";
    document.body.appendChild(flat);
    const doc = document.scrollingElement ?? document.documentElement;
    expect(scrollerFor(flat)).toBe(doc);

    const unscrolled = sized(document.createElement("section"), {
      scrollHeight: 2000,
      clientHeight: 800,
    });
    document.body.appendChild(unscrolled);
    expect(scrollerFor(unscrolled)).toBe(doc);
    expect(scrollerFor(null)).toBe(doc);
  });

  it("edgeInfo reports overflow and both edges with 1px tolerance", () => {
    const el = document.createElement("section");
    expect(
      edgeInfo(sized(el, { scrollHeight: 800, clientHeight: 799 })),
    ).toEqual({ overflowing: false, atStart: true, atEnd: true });
    expect(
      edgeInfo(sized(el, { scrollHeight: 2000, clientHeight: 800 })),
    ).toEqual({ overflowing: true, atStart: true, atEnd: false });
    expect(
      edgeInfo(
        sized(el, { scrollHeight: 2000, clientHeight: 800, scrollTop: 500 }),
      ),
    ).toEqual({ overflowing: true, atStart: false, atEnd: false });
    expect(
      edgeInfo(
        sized(el, { scrollHeight: 2000, clientHeight: 800, scrollTop: 1199 }),
      ),
    ).toEqual({ overflowing: true, atStart: false, atEnd: true });
  });
});

describe("focus port", () => {
  it("focuses the title with preventScroll and a focusVisible hint", () => {
    const title = document.createElement("h1");
    title.id = "title-projects";
    title.tabIndex = -1;
    document.body.appendChild(title);
    const focus = vi.spyOn(title, "focus");

    createFocusPort().focusTitle(2, true);

    expect(focus).toHaveBeenCalledWith({
      preventScroll: true,
      focusVisible: true,
    });
  });

  it("is a no-op when the title is missing", () => {
    expect(() => createFocusPort().focusTitle(3, false)).not.toThrow();
  });
});

function setWindowNumber(key: "scrollX" | "scrollY", value: number): void {
  Object.defineProperty(window, key, { value, configurable: true });
}

describe("history port", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("pushes the landed route, keeps the query and silences Next's announcer first", () => {
    window.history.replaceState(null, "", "/?debug");
    const announcer = document.createElement("next-route-announcer");
    document.body.appendChild(announcer);
    let announcerPresentAtPush = true;
    const push = vi
      .spyOn(window.history, "pushState")
      .mockImplementation(() => {
        announcerPresentAtPush = document.body.contains(announcer);
      });

    createHistoryPort().push(2);

    expect(push).toHaveBeenCalledWith(null, "", "/projects/?debug");
    expect(announcerPresentAtPush).toBe(false);
  });

  it("does not push the URL that is already current", () => {
    window.history.replaceState(null, "", "/projects/");
    const push = vi.spyOn(window.history, "pushState");
    createHistoryPort().push(2);
    expect(push).not.toHaveBeenCalled();
  });

  it("swallows pushState errors without logging", () => {
    const error = vi.spyOn(console, "error");
    const warn = vi.spyOn(console, "warn");
    vi.spyOn(window.history, "pushState").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(() => createHistoryPort().push(3)).not.toThrow();
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("silenceNextAnnouncer is safe without an announcer", () => {
    expect(() => silenceNextAnnouncer()).not.toThrow();
  });

  it("indexFromLocation matches exact routes only", () => {
    window.history.replaceState(null, "", "/experience/");
    expect(indexFromLocation()).toBe(3);
    window.history.replaceState(null, "", "/unknown/");
    expect(indexFromLocation()).toBeNull();
  });

  it("sets manual scroll restoration", () => {
    setManualScrollRestoration();
    expect(window.history.scrollRestoration).toBe("manual");
  });
});

function page(slug: string, options: { scrolls: boolean; scrollTop?: number }) {
  const el = document.createElement("section");
  el.id = `page-${slug}`;
  if (options.scrolls) el.style.overflowY = "auto";
  Object.defineProperty(el, "scrollTop", {
    value: options.scrollTop ?? 0,
    configurable: true,
    writable: true,
  });
  document.body.appendChild(el);
  return el;
}

describe("scroll port", () => {
  afterEach(() => {
    setWindowNumber("scrollX", 0);
    setWindowNumber("scrollY", 0);
  });

  it("resets the target page to its top on desktop (D-06)", () => {
    const target = page("projects", { scrolls: true, scrollTop: 300 });
    page("achievements", { scrolls: true });
    createScrollPort().beforeSlide(1, 2, true);
    expect(target.scrollTop).toBe(0);
  });

  it("keeps the origin page's scroll on a cancelled leave", () => {
    const origin = page("achievements", { scrolls: true, scrollTop: 250 });
    page("projects", { scrolls: true, scrollTop: 300 });
    const port = createScrollPort();
    port.beforeSlide(1, 2, true);
    port.beforeSlide(2, 1, false);
    expect(origin.scrollTop).toBe(250);
  });

  it("holds the outgoing page and resets the window scroll on phones", () => {
    const from = page("achievements", { scrolls: false });
    page("projects", { scrolls: false });
    setWindowNumber("scrollY", 400);
    const scrollTo = vi.spyOn(window, "scrollTo");
    const port = createScrollPort();

    port.beforeSlide(1, 2, true);
    expect(from.style.transform).toBe("translateY(-400px)");
    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    setWindowNumber("scrollY", 0);
    scrollTo.mockClear();
    port.afterLand(2);
    expect(from.style.transform).toBe("");
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("restores the origin scroll when the leave is cancelled on phones", () => {
    const from = page("achievements", { scrolls: false });
    page("projects", { scrolls: false });
    setWindowNumber("scrollY", 400);
    const scrollTo = vi.spyOn(window, "scrollTo");
    const port = createScrollPort();

    port.beforeSlide(1, 2, true);
    setWindowNumber("scrollY", 0);
    port.beforeSlide(2, 1, false);
    port.afterLand(1);

    expect(from.style.transform).toBe("");
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: 400,
      left: 0,
      behavior: "instant",
    });
  });

  it("does not hold or scroll when the window is at the top", () => {
    const from = page("achievements", { scrolls: false });
    page("projects", { scrolls: false });
    const scrollTo = vi.spyOn(window, "scrollTo");
    const port = createScrollPort();
    port.beforeSlide(1, 2, true);
    port.afterLand(2);
    expect(from.style.transform).toBe("");
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("afterLand resets a horizontal window scroll (Pitfall 11)", () => {
    setWindowNumber("scrollX", 30);
    setWindowNumber("scrollY", 120);
    const scrollTo = vi.spyOn(window, "scrollTo");
    createScrollPort().afterLand(0);
    expect(scrollTo).toHaveBeenCalledWith({
      top: 120,
      left: 0,
      behavior: "instant",
    });
  });
});
