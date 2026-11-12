import { describe, expect, it } from "vitest";
import {
  KEY_LINE_PX,
  KEY_PAGE_RATIO,
  keyIntent,
  resolveScrollKey,
  targetKindOf,
  type KeyEventLike,
  type KeyIntent,
} from "@/lib/pager/input/keys";
import type { EdgeInfo } from "@/lib/pager/types";

function ev(overrides: Partial<KeyEventLike> & { key: string }): KeyEventLike {
  return {
    shiftKey: false,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    repeat: false,
    defaultPrevented: false,
    targetKind: "none",
    ...overrides,
  };
}

describe("key constants", () => {
  it("line step is 40px and page step is 87.5% of the viewport", () => {
    expect(KEY_LINE_PX).toBe(40);
    expect(KEY_PAGE_RATIO).toBe(0.875);
  });
});

describe("keyIntent table (NAV-02)", () => {
  it.each([
    ["ArrowRight", false, "next", false, null],
    ["ArrowLeft", false, "prev", false, null],
    ["PageDown", false, "next", true, "page"],
    ["PageUp", false, "prev", true, "page"],
    [" ", false, "next", true, "page"],
    [" ", true, "prev", true, "page"],
    ["ArrowDown", false, "next", true, "line"],
    ["ArrowUp", false, "prev", true, "line"],
    ["Home", false, "first", false, null],
    ["End", false, "last", false, null],
  ] as const)(
    "%j (shift %s) -> %s, scrollFirst %s, scrollBy %s",
    (key, shiftKey, action, scrollFirst, scrollBy) => {
      expect(keyIntent(ev({ key, shiftKey }))).toEqual({
        action,
        scrollFirst,
        scrollBy,
        repeat: false,
      });
    },
  );

  it.each(["a", "Enter", "Tab", "Escape", "Shift", "F5"])(
    "%j -> null",
    (key) => {
      expect(keyIntent(ev({ key }))).toBeNull();
    },
  );

  it("copies repeat from the event", () => {
    expect(keyIntent(ev({ key: "ArrowRight", repeat: true }))?.repeat).toBe(
      true,
    );
  });
});

describe("keyIntent guards", () => {
  it.each([
    ["altKey", { altKey: true }],
    ["ctrlKey", { ctrlKey: true }],
    ["metaKey", { metaKey: true }],
    ["defaultPrevented", { defaultPrevented: true }],
  ] as const)("%s -> null", (_name, extra) => {
    expect(keyIntent(ev({ key: "ArrowLeft", ...extra }))).toBeNull();
    expect(keyIntent(ev({ key: " ", ...extra }))).toBeNull();
  });

  it.each(["ArrowRight", "ArrowDown", "PageDown", " ", "Home", "End"])(
    "%j from a text field -> null",
    (key) => {
      expect(keyIntent(ev({ key, targetKind: "text" }))).toBeNull();
    },
  );

  it("Space on a focused control never pages (WR-04)", () => {
    expect(keyIntent(ev({ key: " ", targetKind: "control" }))).toBeNull();
    expect(
      keyIntent(ev({ key: " ", shiftKey: true, targetKind: "control" })),
    ).toBeNull();
  });

  it.each(["ArrowRight", "ArrowLeft", "Home", "End", "PageDown"])(
    "%j on a focused control still pages",
    (key) => {
      expect(keyIntent(ev({ key, targetKind: "control" }))).not.toBeNull();
    },
  );
});

describe("targetKindOf", () => {
  function make(html: string): Element {
    const host = document.createElement("div");
    host.innerHTML = html;
    const el = host.firstElementChild;
    if (!el) throw new Error("no element");
    return el;
  }

  it("null -> none", () => {
    expect(targetKindOf(null)).toBe("none");
  });

  it.each([
    ['<a href="/projects">Projects</a>', "control"],
    ["<button>Go</button>", "control"],
    ["<summary>More</summary>", "control"],
    ['<div role="button">x</div>', "control"],
    ['<span role="link">x</span>', "control"],
    ["<a>no href</a>", "none"],
    ["<input />", "text"],
    ["<textarea></textarea>", "text"],
    ["<select></select>", "text"],
    ['<div contenteditable="true">x</div>', "text"],
    ["<h1>Title</h1>", "none"],
    ["<main>x</main>", "none"],
  ] as const)("%s -> %s", (html, kind) => {
    expect(targetKindOf(make(html))).toBe(kind);
  });

  it("body -> none", () => {
    expect(targetKindOf(document.body)).toBe("none");
  });

  it("Space on a real <a href> and <button> resolves to null (WR-04)", () => {
    for (const html of ['<a href="/about">About</a>', "<button>x</button>"]) {
      const targetKind = targetKindOf(make(html));
      expect(keyIntent(ev({ key: " ", targetKind }))).toBeNull();
    }
  });
});

describe("resolveScrollKey (NAV-07)", () => {
  const edge = (
    overflowing: boolean,
    atStart: boolean,
    atEnd: boolean,
  ): EdgeInfo => ({ overflowing, atStart, atEnd });
  const intent = (
    action: KeyIntent["action"],
    scrollFirst: boolean,
    repeat = false,
  ): KeyIntent => ({
    action,
    scrollFirst,
    scrollBy: scrollFirst ? "page" : null,
    repeat,
  });

  it.each([
    [
      "no scrollFirst pages even on overflow",
      intent("next", false),
      edge(true, true, false),
      "page",
    ],
    [
      "fitting page pages",
      intent("next", true),
      edge(false, true, true),
      "page",
    ],
    [
      "next mid-scroll scrolls",
      intent("next", true),
      edge(true, true, false),
      "scroll",
    ],
    [
      "next at end (fresh) pages",
      intent("next", true),
      edge(true, false, true),
      "page",
    ],
    [
      "next at end (held) stops",
      intent("next", true, true),
      edge(true, false, true),
      "stop",
    ],
    [
      "prev mid-scroll scrolls",
      intent("prev", true),
      edge(true, false, true),
      "scroll",
    ],
    [
      "prev at start (fresh) pages",
      intent("prev", true),
      edge(true, true, false),
      "page",
    ],
    [
      "prev at start (held) stops",
      intent("prev", true, true),
      edge(true, true, false),
      "stop",
    ],
    [
      "first always pages",
      intent("first", true),
      edge(true, false, false),
      "page",
    ],
    [
      "last always pages",
      intent("last", true),
      edge(true, false, false),
      "page",
    ],
  ] as const)("%s", (_name, i, e, expected) => {
    expect(resolveScrollKey(i, e)).toBe(expected);
  });
});
