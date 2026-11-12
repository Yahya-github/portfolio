import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OPENING_FAILSAFE_MS, OPENING_SCRIPT } from "@/lib/first-visit/script";
import {
  OPENING_CHROME_DELAY_MS,
  OPENING_TOTAL_MS,
  isSkipKey,
  openingStartX,
} from "@/lib/first-visit/opening-rules";
import { OPENING_KEY } from "@/lib/first-visit/storage";

const html = () => document.documentElement;
const runScript = () => new Function(OPENING_SCRIPT)();

function stubReduced(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

describe("OPENING_SCRIPT", () => {
  beforeEach(() => {
    delete html().dataset.opening;
    window.localStorage.clear();
    history.replaceState(null, "", "/");
    stubReduced(false);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete html().dataset.opening;
    window.localStorage.clear();
    history.replaceState(null, "", "/");
  });

  it("marks pending on / with empty storage and no reduced motion", () => {
    runScript();
    expect(html().dataset.opening).toBe("pending");
  });

  it("hides nothing when the opening flag is set", () => {
    window.localStorage.setItem(OPENING_KEY, "1");
    runScript();
    expect(html().dataset.opening).toBeUndefined();
  });

  it("hides nothing off the Index (D-02)", () => {
    history.replaceState(null, "", "/projects/");
    runScript();
    expect(html().dataset.opening).toBeUndefined();
  });

  it("hides nothing under reduced motion", () => {
    stubReduced(true);
    runScript();
    expect(html().dataset.opening).toBeUndefined();
  });

  it("does not throw and hides nothing when storage throws (D-05)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(runScript).not.toThrow();
    expect(html().dataset.opening).toBeUndefined();
  });

  it("removes a still-pending mark after the failsafe", () => {
    vi.useFakeTimers();
    runScript();
    vi.advanceTimersByTime(OPENING_FAILSAFE_MS - 1);
    expect(html().dataset.opening).toBe("pending");
    vi.advanceTimersByTime(1);
    expect(html().dataset.opening).toBeUndefined();
  });

  it("keeps the mark when it moved on to running", () => {
    vi.useFakeTimers();
    runScript();
    html().dataset.opening = "running";
    vi.advanceTimersByTime(OPENING_FAILSAFE_MS + 10);
    expect(html().dataset.opening).toBe("running");
  });

  it("interpolates only the storage key and the failsafe constant", () => {
    expect(OPENING_FAILSAFE_MS).toBe(3000);
    expect(OPENING_SCRIPT).toContain(JSON.stringify(OPENING_KEY));
    expect(OPENING_SCRIPT).toContain(",3000)");
  });
});

describe("isSkipKey", () => {
  const k = (
    key: string,
    mods: Partial<Record<"altKey" | "ctrlKey" | "metaKey", boolean>> = {},
  ) => ({ key, altKey: false, ctrlKey: false, metaKey: false, ...mods });

  it.each(["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock"])(
    "never skips on %s",
    (key) => expect(isSkipKey(k(key))).toBe(false),
  );
  it("ignores Ctrl, Meta and Alt chords", () => {
    expect(isSkipKey(k("r", { ctrlKey: true }))).toBe(false);
    expect(isSkipKey(k("l", { metaKey: true }))).toBe(false);
    expect(isSkipKey(k("ArrowLeft", { altKey: true }))).toBe(false);
  });
  it.each(["Enter", " ", "Escape", "ArrowRight", "ArrowLeft", "PageDown", "a"])(
    "skips on %s",
    (key) => expect(isSkipKey(k(key))).toBe(true),
  );
});

describe("opening timing", () => {
  it("totals 870ms, under one second", () => {
    expect(OPENING_CHROME_DELAY_MS).toBe(720);
    expect(OPENING_TOTAL_MS).toBe(870);
    expect(OPENING_TOTAL_MS).toBeLessThan(1000);
  });
  it("starts off screen by viewport plus 24px", () => {
    expect(openingStartX(1440, "right")).toBe(1464);
    expect(openingStartX(1440, "left")).toBe(-1464);
  });
});
