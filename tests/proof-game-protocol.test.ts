import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readGameMsg } from "@/lib/proof/game/protocol";

let frame: HTMLIFrameElement;

beforeEach(() => {
  frame = document.createElement("iframe");
  document.body.appendChild(frame);
});

afterEach(() => {
  frame.remove();
});

function msg(
  data: unknown,
  over: { origin?: string; source?: MessageEventSource | null } = {},
): MessageEvent {
  return new MessageEvent("message", {
    data,
    origin: over.origin ?? window.location.origin,
    source: "source" in over ? over.source : frame.contentWindow,
  });
}

describe("readGameMsg trust checks", () => {
  it("returns null when the frame is null", () => {
    expect(readGameMsg(msg({ type: "ready" }), null)).toBeNull();
  });

  it("ignores a foreign origin", () => {
    const e = msg({ type: "ready" }, { origin: "https://evil.example" });
    expect(readGameMsg(e, frame)).toBeNull();
  });

  it("ignores a message from another window", () => {
    const e = msg({ type: "ready" }, { source: window });
    expect(readGameMsg(e, frame)).toBeNull();
  });

  it("ignores a message with no source", () => {
    const e = msg({ type: "ready" }, { source: null });
    expect(readGameMsg(e, frame)).toBeNull();
  });
});

describe("readGameMsg payload shape", () => {
  it.each([
    ["null", null],
    ["a string", "ready"],
    ["a number", 7],
    ["an unknown type", { type: "hack" }],
    ["a missing type", {}],
  ])("rejects %s", (_label, data) => {
    expect(readGameMsg(msg(data), frame)).toBeNull();
  });

  it.each([
    ["NaN cur", { type: "progress", cur: Number.NaN, total: 10 }],
    ["Infinity total", { type: "progress", cur: 1, total: Infinity }],
    ["zero total", { type: "progress", cur: 1, total: 0 }],
    ["negative cur", { type: "progress", cur: -1, total: 10 }],
    ["string cur", { type: "progress", cur: "1", total: 10 }],
    ["missing total", { type: "progress", cur: 1 }],
  ])("rejects progress with %s", (_label, data) => {
    expect(readGameMsg(msg(data), frame)).toBeNull();
  });
});

describe("readGameMsg valid messages", () => {
  it("returns a fresh progress object with known fields only", () => {
    const data = { type: "progress", cur: 3, total: 10, extra: "x" };
    const out = readGameMsg(msg(data), frame);
    expect(out).toEqual({ type: "progress", cur: 3, total: 10 });
    expect(out).not.toBe(data);
  });

  it.each(["ready", "exit", "error", "escape"] as const)(
    "accepts %s and drops extra keys",
    (type) => {
      const data = { type, extra: "x" };
      const out = readGameMsg(msg(data), frame);
      expect(out).toEqual({ type });
      expect(out).not.toBe(data);
    },
  );
});
