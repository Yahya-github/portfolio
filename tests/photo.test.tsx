import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Photo } from "@/components/media/Photo";
import type { MediaVariant } from "@/lib/media/types";

const SOURCES: readonly MediaVariant[] = [
  { src: "a.webp", width: 800, height: 656 },
  { src: "b.webp", width: 1200, height: 984 },
  { src: "c.webp", width: 1512, height: 1240 },
];

function renderImg(props: Partial<Parameters<typeof Photo>[0]> = {}) {
  const { container } = render(
    <Photo
      sources={SOURCES}
      sizes="(max-width: 820px) 100vw, 50vw"
      alt="Portrait"
      eager={false}
      {...props}
    />,
  );
  const imgs = container.querySelectorAll("img");
  expect(imgs).toHaveLength(1);
  return imgs[0];
}

describe("Photo", () => {
  it("builds srcset from every source and uses the widest as src", () => {
    const img = renderImg();
    expect(img.getAttribute("srcset")).toBe(
      "a.webp 800w, b.webp 1200w, c.webp 1512w",
    );
    expect(img.getAttribute("src")).toBe("c.webp");
    expect(img.getAttribute("width")).toBe("1512");
    expect(img.getAttribute("height")).toBe("1240");
  });

  it("picks the widest source regardless of order", () => {
    const img = renderImg({ sources: [SOURCES[2], SOURCES[0], SOURCES[1]] });
    expect(img.getAttribute("src")).toBe("c.webp");
  });

  it("loads eagerly when eager is true", () => {
    const img = renderImg({ eager: true });
    expect(img.getAttribute("loading")).toBe("eager");
    expect(img.getAttribute("decoding")).toBe("async");
  });

  it("loads lazily when eager is false", () => {
    const img = renderImg({ eager: false });
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("decoding")).toBe("async");
  });

  it("passes alt, sizes and className through unchanged", () => {
    const img = renderImg({
      alt: "Yahya, greyscale",
      sizes: "100vw",
      className: "photo",
    });
    expect(img.getAttribute("alt")).toBe("Yahya, greyscale");
    expect(img.getAttribute("sizes")).toBe("100vw");
    expect(img).toHaveClass("photo");
  });

  it("marks deferred images with data-defer", () => {
    const img = renderImg({ defer: true });
    expect(img).toHaveAttribute("data-defer", "");
    expect(img.getAttribute("src")).toBe("c.webp");
  });

  it("renders no src, srcset or sizes when on demand", () => {
    const img = renderImg({ onDemand: true, sizes: "50vw" });
    expect(img.hasAttribute("src")).toBe(false);
    expect(img.hasAttribute("srcset")).toBe(false);
    expect(img.hasAttribute("sizes")).toBe(false);
    expect(img.getAttribute("data-src")).toBe("c.webp");
    expect(img.getAttribute("data-srcset")).toBe(
      "a.webp 800w, b.webp 1200w, c.webp 1512w",
    );
    expect(img.getAttribute("data-sizes")).toBe("50vw");
    expect(img).toHaveAttribute("data-defer", "");
  });
});
