import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Shell } from "@/components/shell/Shell";
import type { Slug } from "@/content/types";

afterEach(cleanup);

const ALL_SLUGS: readonly Slug[] = [
  "index",
  "achievements",
  "projects",
  "experience",
  "about",
  "say-hi",
];

const SECTION_IDS = ALL_SLUGS.map((s) => `page-${s}`);

function sectionsOf(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("main > section"));
}

function lettersNav(): HTMLElement {
  return screen.getByRole("navigation", { name: "Sections" });
}

describe("Shell on /about/", () => {
  it("has exactly one h1, named after the current page", () => {
    render(<Shell current="about" />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveAccessibleName("Two habits");
  });

  it("renders six sections, five of them inert", () => {
    const { container } = render(<Shell current="about" />);
    const sections = sectionsOf(container);
    expect(sections).toHaveLength(6);
    expect(sections.filter((s) => s.hasAttribute("inert"))).toHaveLength(5);
    expect(container.querySelector("#page-about")).not.toHaveAttribute("inert");
  });

  it("labels each section with its own title", () => {
    const { container } = render(<Shell current="about" />);
    for (const section of sectionsOf(container)) {
      const slug = section.getAttribute("data-page");
      expect(section.id).toBe(`page-${slug}`);
      expect(section).toHaveAttribute("aria-labelledby", `title-${slug}`);
      expect(section.querySelector(`#title-${slug}`)).not.toBeNull();
    }
  });

  it("marks main as the skip target with the current slug", () => {
    const { container } = render(<Shell current="about" />);
    const main = container.querySelector("main");
    expect(main).toHaveAttribute("id", "content");
    expect(main).toHaveAttribute("tabindex", "-1");
    expect(main).toHaveAttribute("data-current", "about");
  });

  it("keeps the binding top-level DOM order", () => {
    const { container } = render(<Shell current="about" />);
    const tags = Array.from(container.children).map((el) =>
      el.tagName === "NAV"
        ? `nav:${el.getAttribute("aria-label")}`
        : el.tagName === "A"
          ? `a:${el.getAttribute("href")}`
          : el.tagName.toLowerCase(),
    );
    expect(tags).toEqual([
      "a:#content",
      "header",
      "nav:Sections",
      "main",
      "footer",
      "p",
    ]);
  });

  it("marks only the About letter as current and shows its labels", () => {
    const { container } = render(<Shell current="about" />);
    const current = lettersNav().querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName("04 About");
    const header = container.querySelector("header") as HTMLElement;
    expect(within(header).getByText("04 About")).toBeInTheDocument();
    const footer = container.querySelector("footer") as HTMLElement;
    expect(within(footer).getByText("04 / 05")).toBeInTheDocument();
    expect(
      within(footer).getByRole("link", { name: "Next, Say hi" }),
    ).toBeInTheDocument();
  });
});

describe("Shell on /", () => {
  it("shows the hero wordmark with no current letter", () => {
    render(<Shell current="index" />);
    const nav = lettersNav();
    expect(nav).toHaveAttribute("data-mode", "hero");
    expect(nav.querySelector("[aria-current]")).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Yahya Hallani",
    );
  });
});

describe("Shell on /say-hi/", () => {
  it("loops back to the start and marks the header Say hi link", () => {
    const { container } = render(<Shell current="say-hi" />);
    const footer = container.querySelector("footer") as HTMLElement;
    expect(
      within(footer).getByRole("link", { name: "Back to the start" }),
    ).toHaveAttribute("href", "/");
    const header = container.querySelector("header") as HTMLElement;
    expect(
      within(header).getByRole("link", { name: "Say hi" }),
    ).toHaveAttribute("aria-current", "page");
  });
});

describe.each(ALL_SLUGS)("Shell current=%s", (slug) => {
  it("renders the six sections in order with only its own page live", () => {
    const { container } = render(<Shell current={slug} />);
    const sections = sectionsOf(container);
    expect(sections.map((s) => s.id)).toEqual(SECTION_IDS);
    const live = sections.filter((s) => !s.hasAttribute("inert"));
    expect(live.map((s) => s.id)).toEqual([`page-${slug}`]);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
