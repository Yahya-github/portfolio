import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageLevelProvider } from "@/components/pages/PageLevel";
import { AboutPage } from "@/components/pages/AboutPage";
import { about } from "@/content/about";

afterEach(cleanup);

const SIZES = "(max-width: 820px) 100vw, calc((100vh - 128px) * 1.22)";

function renderAbout(isCurrent: boolean) {
  const view = render(
    <PageLevelProvider level={1}>
      <AboutPage isCurrent={isCurrent} />
    </PageLevelProvider>,
  );
  const img = view.container.querySelector<HTMLImageElement>(
    'img[data-twin="grey"]',
  )!;
  expect(img).not.toBeNull();
  return { ...view, img };
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
      "/media/portrait/portrait-devfest-2026-grey-800.webp 800w",
      "/media/portrait/portrait-devfest-2026-grey-1200.webp 1200w",
      "/media/portrait/portrait-devfest-2026-grey-1512.webp 1512w",
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

  it("renders the portrait as a disabled pressed-state button with a colour twin", () => {
    const { container } = renderAbout(true);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toBeDisabled();
    expect(button.textContent).toContain(", show in colour");
    const grey = container.querySelector('img[data-twin="grey"]')!;
    const colour = container.querySelector('img[data-twin="colour"]')!;
    expect(grey.getAttribute("src")).toBeTruthy();
    expect(grey.getAttribute("alt")).toBe(about.portraitAlt);
    expect(colour.getAttribute("src")).toBeNull();
    expect(colour.getAttribute("data-src")).toContain(
      "portrait-devfest-2026-color",
    );
    // The title is script-focusable (tabindex -1, A11Y-01); nothing else is Tab-reachable.
    expect(
      container.querySelector('[tabindex]:not([tabindex="-1"])'),
    ).toBeNull();
  });
});
