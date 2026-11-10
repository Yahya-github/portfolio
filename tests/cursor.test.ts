import { afterEach, describe, expect, it } from "vitest";
import {
  IDLE_SIZE_PX,
  SNAP_INFLATE_PX,
  SNAP_SELECTOR,
  hairlineTransforms,
  idleBox,
  inflate,
  snapTargetOf,
  tagTextOf,
} from "@/lib/cursor/targets";
import { TAG_EDGE_PAD, TAG_GAP, placeTag } from "@/lib/cursor/place-tag";

function make(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  return host;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("cursor constants", () => {
  it("exposes the agreed values", () => {
    expect(SNAP_SELECTOR).toBe("a, button, [data-cursor-snap]");
    expect(SNAP_INFLATE_PX).toBe(4);
    expect(IDLE_SIZE_PX).toBe(16);
    expect(TAG_EDGE_PAD).toBe(8);
    expect(TAG_GAP).toBe(12);
  });
});

describe("snapTargetOf", () => {
  it("returns null for null", () => {
    expect(snapTargetOf(null)).toBeNull();
  });
  it("resolves a span inside an anchor to the anchor", () => {
    const host = make('<a href="/x"><span id="s">hi</span></a>');
    expect(snapTargetOf(host.querySelector("#s"))).toBe(host.querySelector("a"));
  });
  it("returns a button itself", () => {
    const host = make("<button>go</button>");
    const b = host.querySelector("button");
    expect(snapTargetOf(b)).toBe(b);
  });
  it("returns a data-cursor-snap element itself", () => {
    const host = make("<div data-cursor-snap>x</div>");
    const d = host.querySelector("div[data-cursor-snap]");
    expect(snapTargetOf(d)).toBe(d);
  });
  it("returns null for a plain paragraph", () => {
    const host = make("<p>text</p>");
    expect(snapTargetOf(host.querySelector("p"))).toBeNull();
  });
  it("never snaps to the cursor itself", () => {
    const host = make(
      '<div data-cursor-part><a href="/x"><i id="i"></i></a></div>',
    );
    expect(snapTargetOf(host.querySelector("#i"))).toBeNull();
  });
});

describe("tagTextOf", () => {
  it("reads data-cursor-tag", () => {
    const host = make('<a data-cursor-tag="01 Achievements">x</a>');
    const a = host.querySelector("a");
    expect(a && tagTextOf(a)).toBe("01 Achievements");
  });
  it("has no textContent fallback", () => {
    const host = make("<a>Say hi</a>");
    const a = host.querySelector("a");
    expect(a && tagTextOf(a)).toBeNull();
  });
  it("treats a whitespace-only attribute as absent", () => {
    const host = make('<a data-cursor-tag="   ">x</a>');
    const a = host.querySelector("a");
    expect(a && tagTextOf(a)).toBeNull();
  });
});

describe("box maths", () => {
  it("inflates a rect by the snap padding", () => {
    expect(inflate({ left: 10, top: 20, width: 30, height: 40 })).toEqual({
      x: 6,
      y: 16,
      w: 38,
      h: 48,
    });
  });
  it("centres the idle box on the pointer", () => {
    expect(idleBox(100, 200)).toEqual({ x: 92, y: 192, w: 16, h: 16 });
  });
  it("builds four transform-only hairlines", () => {
    expect(hairlineTransforms({ x: 6, y: 16, w: 38, h: 48 })).toEqual([
      "translate(6px, 16px) scaleX(38)",
      "translate(43px, 16px) scaleY(48)",
      "translate(6px, 63px) scaleX(38)",
      "translate(6px, 16px) scaleY(48)",
    ]);
  });
});

function rect(left: number, top: number, width: number, height: number) {
  return { left, top, right: left + width, bottom: top + height };
}

describe("placeTag", () => {
  const vw = 1000;
  const vh = 800;
  it("prefers the right spot", () => {
    const b = rect(100, 300, 80, 40);
    expect(placeTag(b, 120, 20, vw, vh)).toEqual({
      x: b.right + 12,
      y: b.top - 4,
    });
  });
  it("falls back to above at the right edge", () => {
    const b = rect(890, 300, 90, 40);
    expect(placeTag(b, 120, 20, vw, vh)).toEqual({
      x: b.right + 4 - 120,
      y: b.top - 12 - 20,
    });
  });
  it("falls back to below in the top-right corner", () => {
    const b = rect(890, 10, 90, 40);
    expect(placeTag(b, 120, 20, vw, vh)).toEqual({
      x: b.right + 4 - 120,
      y: b.bottom + 12,
    });
  });
  it("falls back to the left when right, above and below do not fit", () => {
    const b = rect(700, 20, 290, 760);
    expect(placeTag(b, 120, 20, vw, vh)).toEqual({
      x: 700 - 12 - 120,
      y: 20 - 4,
    });
  });
  it("clamps an oversized tag inside the viewport", () => {
    const b = rect(10, 10, 980, 780);
    const p = placeTag(b, 900, 700, vw, vh);
    expect(p.x).toBeGreaterThanOrEqual(8);
    expect(p.y).toBeGreaterThanOrEqual(8);
    expect(p.x + 900).toBeLessThanOrEqual(vw - 8);
    expect(p.y + 700).toBeLessThanOrEqual(vh - 8);
  });
});
