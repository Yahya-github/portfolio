import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@/lib/previews/mount";
import type { FeatureContext } from "@/lib/features/types";

const ctx = {} as FeatureContext;
let root: HTMLElement;
let item: HTMLElement;
let figure: HTMLElement;
let cleanup: () => void;

function rect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    left: 0,
    right: 0,
    width: 0,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON() {},
  } as DOMRect;
}

beforeEach(() => {
  document.body.innerHTML = `
    <section id="page-achievements">
      <ol><li data-preview-item><a href="#" data-preview-trigger>x</a><figure data-preview></figure></li></ol>
    </section>
    <footer></footer>`;
  root = document.getElementById("page-achievements") as HTMLElement;
  item = root.querySelector("[data-preview-item]") as HTMLElement;
  figure = root.querySelector("[data-preview]") as HTMLElement;
  document.documentElement.style.setProperty("--frame-top", "72px");
  (document.querySelector("footer") as HTMLElement).getBoundingClientRect =
    () => rect(808, 900);
  figure.getBoundingClientRect = () => rect(500, 900);
  cleanup = mount(root, ctx);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const move = (movementX: number, movementY: number) => {
  const e = new Event("pointermove", { bubbles: true });
  Object.assign(e, { movementX, movementY });
  window.dispatchEvent(e);
};

describe("previews mount", () => {
  it("sets quiet on window blur and clears it on real movement", () => {
    window.dispatchEvent(new Event("blur"));
    expect(root.dataset.quiet).toBeDefined();
    move(0, 0);
    expect(root.dataset.quiet).toBeDefined();
    move(1, 0);
    expect(root.dataset.quiet).toBeUndefined();
  });

  it("clears quiet on pointerleave of the root", () => {
    window.dispatchEvent(new Event("blur"));
    root.dispatchEvent(new Event("pointerleave"));
    expect(root.dataset.quiet).toBeUndefined();
  });

  it("sets quiet when the document becomes hidden", () => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(root.dataset.quiet).toBeDefined();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
  });

  it("nudges the figure inside the limit on pointerenter", () => {
    item.dispatchEvent(new Event("pointerenter"));
    // limit = 808 - 8 = 800; bottom 900 -> max(80 - 500, 800 - 900) = -100
    expect(figure.style.getPropertyValue("--pv-y")).toBe("-100px");
  });

  it("nudges on focusin too", () => {
    root
      .querySelector("a")!
      .dispatchEvent(new Event("focusin", { bubbles: true }));
    expect(figure.style.getPropertyValue("--pv-y")).toBe("-100px");
  });

  it("removes every listener and the quiet flag on cleanup", () => {
    window.dispatchEvent(new Event("blur"));
    cleanup();
    expect(root.dataset.quiet).toBeUndefined();
    window.dispatchEvent(new Event("blur"));
    expect(root.dataset.quiet).toBeUndefined();
    cleanup = mount(root, ctx);
  });
});
