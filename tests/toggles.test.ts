import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@/lib/toggles/mount";
import type { FeatureContext } from "@/lib/features/types";

const ctx = {} as FeatureContext;

class TestPointerEvent extends MouseEvent {
  readonly pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string }) {
    super(type, init);
    this.pointerType = init.pointerType ?? "mouse";
  }
}

function pointer(type: string, pointerType: string): Event {
  return new TestPointerEvent(type, { bubbles: true, pointerType });
}

function make(): HTMLElement {
  const root = document.createElement("section");
  root.innerHTML = `
    <ul><li data-tap-colour id="row"><span id="inner">x</span></li></ul>
    <button type="button" aria-pressed="false" disabled data-portrait-toggle>
      <img data-twin="grey" src="/g.webp" alt="p" />
      <img data-twin="colour" data-src="/c.webp" alt="" />
    </button>`;
  document.body.append(root);
  return root;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("toggles mount", () => {
  it("enables the portrait button on mount", () => {
    const root = make();
    mount(root, ctx);
    expect(root.querySelector("button")).not.toHaveAttribute("disabled");
  });

  it("toggles data-colour on touch pointerdown only", () => {
    const root = make();
    mount(root, ctx);
    const inner = root.querySelector("#inner")!;
    const row = root.querySelector("#row")!;
    inner.dispatchEvent(pointer("pointerdown", "mouse"));
    expect(row.hasAttribute("data-colour")).toBe(false);
    inner.dispatchEvent(pointer("pointerdown", "touch"));
    expect(row.hasAttribute("data-colour")).toBe(true);
    inner.dispatchEvent(pointer("pointerdown", "touch"));
    expect(row.hasAttribute("data-colour")).toBe(false);
  });

  it("click toggles aria-pressed and loads the twin", () => {
    const root = make();
    mount(root, ctx);
    const button = root.querySelector("button")!;
    const colour = root.querySelector<HTMLImageElement>(
      'img[data-twin="colour"]',
    )!;
    button.click();
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(colour.getAttribute("src")).toBe("/c.webp");
    button.click();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("loads the twin on pointerenter and on focus", () => {
    for (const evt of ["pointerenter", "focus"]) {
      document.body.replaceChildren();
      const root = make();
      mount(root, ctx);
      const colour = root.querySelector('img[data-twin="colour"]')!;
      root.querySelector("button")!.dispatchEvent(new Event(evt));
      expect(colour.getAttribute("src")).toBe("/c.webp");
    }
  });

  it("cleanup removes listeners and state", () => {
    const root = make();
    const cleanup = mount(root, ctx);
    const row = root.querySelector("#row")!;
    const button = root.querySelector("button")!;
    row.dispatchEvent(pointer("pointerdown", "touch"));
    cleanup();
    expect(row.hasAttribute("data-colour")).toBe(false);
    expect(button).toHaveAttribute("disabled");
    row.dispatchEvent(pointer("pointerdown", "touch"));
    expect(row.hasAttribute("data-colour")).toBe(false);
    button.click();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });
});
