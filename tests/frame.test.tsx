import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Footer } from "@/components/frame/Footer";
import { Header } from "@/components/frame/Header";
import { SkipLink } from "@/components/frame/SkipLink";
import type { Slug } from "@/content/types";
import { indexOfSlug } from "@/lib/sections";

afterEach(cleanup);

const ALL_SLUGS: readonly Slug[] = [
  "index",
  "achievements",
  "projects",
  "experience",
  "about",
  "say-hi",
];

describe("SkipLink", () => {
  it("links to #content with the skip label", () => {
    render(<SkipLink />);
    expect(
      screen.getByRole("link", { name: "Skip to content" }),
    ).toHaveAttribute("href", "#content");
  });
});

describe("Header", () => {
  it("on index shows name, Index label, resume and Say hi links", () => {
    render(<Header current="index" />);
    expect(screen.getByText("Yahya Hallani")).toBeInTheDocument();
    expect(screen.getByText("Index")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Resume (PDF)" })).toHaveAttribute(
      "href",
      "/yahya-hallani-resume.pdf",
    );
    const sayHi = screen.getByRole("link", { name: "Say hi" });
    expect(sayHi).toHaveAttribute("href", "/say-hi/");
    expect(sayHi).not.toHaveAttribute("aria-current");
  });

  it("on say-hi shows 05 Say hi and marks the Say hi link current", () => {
    render(<Header current="say-hi" />);
    expect(screen.getByText("05 Say hi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Say hi" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("puts its links inside the Contact nav", () => {
    render(<Header current="projects" />);
    const nav = screen.getByRole("navigation", { name: "Contact" });
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
  });
});

describe("Footer", () => {
  it("on index shows 00 / 05 and Next, Achievements", () => {
    render(<Footer current="index" />);
    expect(screen.getByText("00 / 05")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Next, Achievements" }),
    ).toHaveAttribute("href", "/achievements/");
  });

  it("on say-hi shows 05 / 05 and Back to the start", () => {
    render(<Footer current="say-hi" />);
    expect(screen.getByText("05 / 05")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the start" }),
    ).toHaveAttribute("href", "/");
  });

  it.each(ALL_SLUGS)("progress bar for %s is aria-hidden at its index", (s) => {
    const { container } = render(<Footer current={s} />);
    const bar = container.querySelector('footer > [aria-hidden="true"]');
    expect(bar).not.toBeNull();
    expect((bar as HTMLElement).style.getPropertyValue("--page-index")).toBe(
      String(indexOfSlug(s)),
    );
  });
});
