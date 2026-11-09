import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Heading, PageTitle } from "@/components/pages/Heading";

afterEach(cleanup);

describe("Heading", () => {
  it.each([1, 2, 3, 4] as const)("level %i renders h%i", (level) => {
    const { container } = render(
      <Heading level={level} id="x" className="c">
        {"Text"}
      </Heading>,
    );
    const el = container.querySelector(`h${level}`);
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute("id", "x");
    expect(el).toHaveClass("c");
  });
});

describe("PageTitle", () => {
  it("renders an h1 with title-{slug} id and a visually hidden text", () => {
    const { container } = render(
      <PageTitle slug="about" level={1} text="Two habits" />,
    );
    const h1 = container.querySelector("h1");
    expect(h1).toHaveAttribute("id", "title-about");
    const hidden = h1?.querySelector(".visually-hidden");
    expect(hidden).toHaveTextContent("Two habits");
    expect(h1?.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("wraps children in an aria-hidden span and keeps the accessible name", () => {
    render(
      <PageTitle slug="about" level={1} text="Two habits">
        <span>{"TWO"}</span>
      </PageTitle>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAccessibleName("Two habits");
    const decorative = heading.querySelector('[aria-hidden="true"]');
    expect(decorative).toHaveTextContent("TWO");
  });

  it("renders h2 for level 2", () => {
    const { container } = render(
      <PageTitle slug="work" level={2} text="Work" />,
    );
    expect(container.querySelector("h2")).toHaveAttribute("id", "title-work");
    expect(container.querySelector("h1")).toBeNull();
  });
});
