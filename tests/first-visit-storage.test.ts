// D-04 / D-09: first-visit storage never throws and never parses values.
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HINT_KEY,
  OPENING_KEY,
  SEEN_VALUE,
  markSeen,
  safeGet,
  safeSet,
  seenState,
} from "../lib/first-visit/storage";

const blockGet = () =>
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
const blockSet = () =>
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("first-visit storage", () => {
  it("exposes fixed keys with separate opening and hint flags", () => {
    expect(OPENING_KEY).toBe("yh-opening-seen");
    expect(HINT_KEY).toBe("yh-hint-seen");
    expect(SEEN_VALUE).toBe("1");
    expect(OPENING_KEY).not.toBe(HINT_KEY);
  });

  it("safeGet returns the value, null when absent, undefined when blocked", () => {
    expect(safeGet("k")).toBeNull();
    localStorage.setItem("k", "v");
    expect(safeGet("k")).toBe("v");
    blockGet();
    expect(safeGet("k")).toBeUndefined();
  });

  it("safeSet returns true on success and false when blocked", () => {
    expect(safeSet("k", "v")).toBe(true);
    expect(localStorage.getItem("k")).toBe("v");
    blockSet();
    expect(safeSet("k", "v")).toBe(false);
  });

  it("seenState reports unseen, seen (any value) and unavailable", () => {
    expect(seenState(OPENING_KEY)).toBe("unseen");
    localStorage.setItem(OPENING_KEY, "garbage");
    expect(seenState(OPENING_KEY)).toBe("seen");
    blockGet();
    expect(seenState(OPENING_KEY)).toBe("unavailable");
  });

  it("markSeen writes SEEN_VALUE and reports failure without throwing", () => {
    expect(markSeen(HINT_KEY)).toBe(true);
    expect(localStorage.getItem(HINT_KEY)).toBe(SEEN_VALUE);
    blockSet();
    expect(markSeen(HINT_KEY)).toBe(false);
  });
});
