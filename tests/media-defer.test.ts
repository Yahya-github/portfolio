import { afterEach, describe, expect, it } from "vitest";
import { DEFER_ATTR, loadDeferred } from "@/lib/media/defer";

function make(html: string): HTMLImageElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  return host.querySelector("img") as HTMLImageElement;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("loadDeferred", () => {
  it("exposes the defer attribute name", () => {
    expect(DEFER_ATTR).toBe("data-defer");
  });

  it("promotes data-* to real attributes and removes them", () => {
    const img = make(
      '<img data-defer data-src="a.webp" data-srcset="a.webp 480w" data-sizes="50vw" alt="">',
    );
    expect(loadDeferred(img)).toBe(true);
    expect(img.getAttribute("src")).toBe("a.webp");
    expect(img.getAttribute("srcset")).toBe("a.webp 480w");
    expect(img.getAttribute("sizes")).toBe("50vw");
    expect(img.hasAttribute("data-src")).toBe(false);
    expect(img.hasAttribute("data-srcset")).toBe(false);
    expect(img.hasAttribute("data-sizes")).toBe(false);
  });

  it("is a no-op the second time", () => {
    const img = make('<img data-src="a.webp" alt="">');
    loadDeferred(img);
    const before = img.outerHTML;
    expect(loadDeferred(img)).toBe(false);
    expect(img.outerHTML).toBe(before);
  });

  it("returns false for an img without data-src", () => {
    const img = make('<img src="a.webp" alt="">');
    expect(loadDeferred(img)).toBe(false);
  });
});
