import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeatureContext } from "@/lib/features/types";
import { mount } from "@/lib/motion/devices";
import { NAMES_PER_STRIP, stripDuration } from "@/lib/motion/names";

describe("stripDuration", () => {
  it("divides the half height by the speed", () => {
    expect(stripDuration(900, 30)).toBe("30.00s");
  });
  it("returns null when it cannot be sized", () => {
    expect(stripDuration(0, 30)).toBeNull();
    expect(stripDuration(900, 0)).toBeNull();
    expect(stripDuration(Number.NaN, 30)).toBeNull();
  });
  it("uses two halves of 16", () => {
    expect(NAMES_PER_STRIP).toBe(32);
  });
});

describe("motion mount", () => {
  const html = document.documentElement;
  const ctx = {} as FeatureContext;
  let strip: HTMLElement;
  let toggle: HTMLButtonElement;

  beforeEach(() => {
    document.body.innerHTML =
      '<span data-names-strip=""></span><button data-motion-toggle=""><span>x</span></button>';
    strip = document.querySelector<HTMLElement>("[data-names-strip]")!;
    toggle = document.querySelector<HTMLButtonElement>("button")!;
    strip.getBoundingClientRect = () => ({ height: 1800 }) as DOMRect;
    html.style.setProperty("--names-speed", "30");
  });
  afterEach(() => {
    document.body.innerHTML = "";
    html.style.removeProperty("--names-speed");
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
  });

  it("sets motionReady and sizes every strip from half its height", () => {
    const off = mount(html, ctx);
    expect(html.dataset.motionReady).toBe("");
    expect(strip.style.getPropertyValue("--names-d")).toBe("30.00s");
    off();
  });

  it("toggles data-motion on clicks of the toggle only", () => {
    const off = mount(html, ctx);
    toggle.querySelector("span")!.click();
    expect(html.dataset.motion).toBe("off");
    document.body.click();
    expect(html.dataset.motion).toBe("off");
    toggle.click();
    expect(html.dataset.motion).toBeUndefined();
    off();
  });

  it("mirrors document.hidden into data-tab-hidden", () => {
    const off = mount(html, ctx);
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(html.dataset.tabHidden).toBe("");
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(html.dataset.tabHidden).toBeUndefined();
    off();
  });

  it("cleanup removes flags and listeners", () => {
    const off = mount(html, ctx);
    toggle.click();
    off();
    expect(html.dataset.motionReady).toBeUndefined();
    expect(html.dataset.motion).toBeUndefined();
    toggle.click();
    expect(html.dataset.motion).toBeUndefined();
  });

  it("re-sizes once per frame after a resize", () => {
    const raf = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb) => {
        cb(0);
        return 1;
      });
    const off = mount(html, ctx);
    strip.getBoundingClientRect = () => ({ height: 900 }) as DOMRect;
    window.dispatchEvent(new Event("resize"));
    expect(strip.style.getPropertyValue("--names-d")).toBe("15.00s");
    off();
    raf.mockRestore();
  });
});
