import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DeepDiveFooter } from "@/components/deep-dive/DeepDiveFooter";
import { FacturoDeepDive } from "@/components/deep-dive/FacturoDeepDive";
import { facturo } from "@/content/facturo";

afterEach(cleanup);

describe("FacturoDeepDive", () => {
  it("renders one h1 and the four section headings in order", () => {
    render(<FacturoDeepDive />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: "Facturo" }),
    ).toBeInTheDocument();
    const h2s = screen
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent);
    expect(h2s).toEqual(["Problem", "What I built", "Result", "Links"]);
  });

  it("renders five images with alts from content", () => {
    render(<FacturoDeepDive />);
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(5);
    const alts = facturo.sections.flatMap((s) => s.images.map((i) => i.alt));
    expect(imgs.map((i) => i.getAttribute("alt")).sort()).toEqual(
      [...alts].sort(),
    );
  });

  it("opens the demo repo safely in a new tab", () => {
    render(<FacturoDeepDive />);
    const link = screen.getByRole("link", { name: "Demo repo" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("DeepDiveFooter", () => {
  it("has only a Back to Projects link and no pager chrome", () => {
    const { container } = render(<DeepDiveFooter />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent("Back to Projects");
    expect(links[0]).toHaveAttribute("href", "/projects/");
    expect(container.querySelector("[data-pager]")).toBeNull();
    expect(container.querySelector("[data-hint]")).toBeNull();
  });
});
