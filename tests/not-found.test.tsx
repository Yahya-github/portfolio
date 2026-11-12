import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  NotFoundFooter,
  NotFoundPage,
} from "@/components/not-found/NotFoundPage";
import { notFound } from "@/content/not-found";
import { site } from "@/content/site";

afterEach(cleanup);

describe("NotFoundPage", () => {
  it("renders one h1 named 404 Page not found", () => {
    render(<NotFoundPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveAccessibleName("404 Page not found");
  });

  it("renders the five section links in order with numbered names", () => {
    render(<NotFoundPage />);
    const nav = screen.getByRole("navigation", { name: site.navLabel });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/achievements/",
      "/projects/",
      "/experience/",
      "/about/",
      "/say-hi/",
    ]);
    expect(links.map((a) => a.getAttribute("href")).length).toBe(5);
    const names = [
      "01 Achievements",
      "02 Projects",
      "03 Experience",
      "04 About",
      "05 Say hi",
    ];
    links.forEach((a, i) => expect(a).toHaveAccessibleName(names[i]));
  });

  it("renders the plain line from content", () => {
    render(<NotFoundPage />);
    expect(screen.getByText(notFound.line)).toBeInTheDocument();
  });

  it("has no pager markers", () => {
    const { container } = render(<NotFoundPage />);
    expect(container.querySelector("[data-pager]")).toBeNull();
  });
});

describe("NotFoundFooter", () => {
  it("links back to the start", () => {
    render(<NotFoundFooter />);
    expect(
      screen.getByRole("link", { name: "Back to the start" }),
    ).toHaveAttribute("href", "/");
  });
});
