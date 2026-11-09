import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Heading, PageTitle } from "@/components/pages/Heading";
import { PageLevelProvider } from "@/components/pages/PageLevel";

afterEach(cleanup);

describe("Heading", () => {
  it.each([
    [1, 0, 1],
    [1, 1, 2],
    [1, 2, 3],
    [2, 0, 2],
    [2, 1, 3],
    [2, 2, 4],
  ] as const)(
    "page level %i with offset %i renders h%i",
    (pageLevel, offset, expected) => {
      const { container } = render(
        <PageLevelProvider level={pageLevel}>
          <Heading offset={offset} id="x" className="c">
            {"Text"}
          </Heading>
        </PageLevelProvider>,
      );
      const el = container.querySelector(`h${expected}`);
      expect(el).not.toBeNull();
      expect(el).toHaveAttribute("id", "x");
      expect(el).toHaveClass("c");
    },
  );

  it("defaults the offset to 0", () => {
    const { container } = render(
      <PageLevelProvider level={2}>
        <Heading>{"Text"}</Heading>
      </PageLevelProvider>,
    );
    expect(container.querySelector("h2")).not.toBeNull();
  });

  it("defaults to page level 1 without a provider", () => {
    const { container } = render(<Heading offset={1}>{"Text"}</Heading>);
    expect(container.querySelector("h2")).not.toBeNull();
  });

  it("has no tabindex unless one is passed", () => {
    const { container } = render(<Heading>{"Text"}</Heading>);
    expect(container.querySelector("h1")).not.toHaveAttribute("tabindex");
  });
});

describe("PageTitle", () => {
  it("renders an h1 under level 1 with title-{slug} id, tabindex -1 and a visually hidden text", () => {
    const { container } = render(
      <PageLevelProvider level={1}>
        <PageTitle slug="projects" text="Projects" />
      </PageLevelProvider>,
    );
    const h1 = container.querySelector("h1");
    expect(h1).toHaveAttribute("id", "title-projects");
    expect(h1).toHaveAttribute("tabindex", "-1");
    const hidden = h1?.querySelector(".visually-hidden");
    expect(hidden).toHaveTextContent("Projects");
    expect(h1?.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("wraps children in an aria-hidden span and keeps the accessible name", () => {
    render(
      <PageLevelProvider level={1}>
        <PageTitle slug="about" text="Two habits">
          <span>{"TWO"}</span>
        </PageTitle>
      </PageLevelProvider>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAccessibleName("Two habits");
    const decorative = heading.querySelector('[aria-hidden="true"]');
    expect(decorative).toHaveTextContent("TWO");
  });

  it("renders h2 under level 2", () => {
    const { container } = render(
      <PageLevelProvider level={2}>
        <PageTitle slug="projects" text="Projects" />
      </PageLevelProvider>,
    );
    const h2 = container.querySelector("h2");
    expect(h2).toHaveAttribute("id", "title-projects");
    expect(h2).toHaveAttribute("tabindex", "-1");
    expect(container.querySelector("h1")).toBeNull();
  });

  it("renders h1 without a provider", () => {
    const { container } = render(<PageTitle slug="index" text="Index" />);
    expect(container.querySelector("h1")).toHaveAttribute("id", "title-index");
  });

  it("stays out of the Tab order (only script focus reaches it)", () => {
    render(<PageTitle slug="index" text="Index" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.tabIndex).toBe(-1);
    heading.focus();
    expect(heading).toHaveFocus();
  });
});
