import { afterEach, describe, expect, it, vi } from "vitest";
import { DECODE_SELECTOR, decodeImages } from "@/lib/media/decode";

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("decodeImages", () => {
  it("eagerly decodes normal images and leaves data-defer images lazy", () => {
    const decode = vi.fn(() => Promise.resolve());
    HTMLImageElement.prototype.decode = decode;
    const page = document.createElement("section");
    page.innerHTML =
      '<img id="a" loading="lazy" alt=""><img id="b" data-defer loading="lazy" alt="">';
    document.body.append(page);

    decodeImages(page);

    expect(page.querySelector<HTMLImageElement>("#a")!.loading).toBe("eager");
    expect(page.querySelector<HTMLImageElement>("#b")!.getAttribute("loading")).toBe("lazy");
    expect(decode).toHaveBeenCalledTimes(1);
  });

  it("is a no-op for a null page", () => {
    expect(() => decodeImages(null)).not.toThrow();
  });

  it("exposes the selector", () => {
    expect(DECODE_SELECTOR).toBe("img:not([data-defer])");
  });
});
