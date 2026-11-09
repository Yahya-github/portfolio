import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AboutPage } from "@/components/pages/AboutPage";
import { about } from "@/content/about";

// The test image loader stubs every asset at 1000x800; give the portraits
// their real dimensions so srcset and the intrinsic size can be asserted.
vi.mock("@/assets/portrait-800.webp", () => ({
  default: { src: "/_test/portrait-800.webp", width: 800, height: 656 },
}));
vi.mock("@/assets/portrait-1200.webp", () => ({
  default: { src: "/_test/portrait-1200.webp", width: 1200, height: 984 },
}));
vi.mock("@/assets/portrait-1512.webp", () => ({
  default: { src: "/_test/portrait-1512.webp", width: 1512, height: 1240 },
}));

afterEach(cleanup);

const SIZES = "(max-width: 820px) 100vw, calc((100vh - 128px) * 1.22)";

function renderAbout(isCurrent: boolean) {
  const view = render(<AboutPage headingLevel={1} isCurrent={isCurrent} />);
  const imgs = view.container.querySelectorAll("img");
  expect(imgs).toHaveLength(1);
  return { ...view, img: imgs[0] };
}

describe("AboutPage", () => {
  it("renders a visually hidden h1 named Two habits with aria-hidden letter rows", () => {
    const { container } = renderAbout(true);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "title-about");
    expect(h1).toHaveAccessibleName("Two habits");
    const hidden = h1.querySelector('[aria-hidden="true"]');
    expect(hidden).not.toBeNull();
    expect([...(hidden as Element).children].map((c) => c.textContent)).toEqual(
      ["TWO", "HAB", "ITS"],
    );
    expect(container.firstElementChild).toHaveClass("grid");
  });

  it("serves the portrait with three sources and the approved sizes", () => {
    const { img } = renderAbout(true);
    expect(img).toHaveAttribute(
      "alt",
      "Yahya Hallani at DevFest Montreal 2026",
    );
    const candidates = (img.getAttribute("srcset") ?? "").split(", ");
    expect(candidates).toEqual([
      "/_test/portrait-800.webp 800w",
      "/_test/portrait-1200.webp 1200w",
      "/_test/portrait-1512.webp 1512w",
    ]);
    expect(img).toHaveAttribute("width", "1512");
    expect(img).toHaveAttribute("height", "1240");
    expect(img).toHaveAttribute("sizes", SIZES);
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("loads the portrait lazily when the page is not current", () => {
    const { img } = renderAbout(false);
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("renders the lead and paragraph from content as two paragraphs", () => {
    renderAbout(true);
    expect(screen.getByText(about.lead).tagName).toBe("P");
    expect(screen.getByText(about.paragraph).tagName).toBe("P");
  });

  it("does not make the portrait interactive (colour twin is Phase 6)", () => {
    const { container, img } = renderAbout(true);
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("[tabindex]")).toBeNull();
    expect(img.closest("button, a")).toBeNull();
  });
});
