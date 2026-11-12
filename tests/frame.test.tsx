import { act, cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { Footer } from "@/components/frame/Footer";
import { Header } from "@/components/frame/Header";
import { SkipLink } from "@/components/frame/SkipLink";
import { PagerContext } from "@/components/shell/PagerContext";
import type { Slug } from "@/content/types";
import { createPagerController } from "@/lib/pager/controller";
import type { PagerController } from "@/lib/pager/types";
import { indexOfSlug } from "@/lib/sections";
import { createStubDeps } from "./helpers/stub-ports";

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
  it("shows an overridden label and keeps both nav links", () => {
    render(<Header current="projects" label="02.1 Facturo" />);
    expect(screen.getByText("02.1 Facturo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Resume (PDF)" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Say hi" })).toBeInTheDocument();
  });

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

  it("server HTML carries neither hint string and an empty inert hint span", () => {
    const html = renderToString(<Footer current="index" />);
    expect(html).not.toContain("Scroll or use the arrow keys");
    expect(html).not.toContain("Swipe sideways");
    const { container } = render(<Footer current="index" />);
    const hint = container.querySelector("[data-hint]");
    expect(hint).not.toBeNull();
    expect(hint?.textContent).toBe("");
    expect(hint?.hasAttribute("role")).toBe(false);
    expect(hint?.hasAttribute("aria-live")).toBe(false);
  });

  it("holds the hint wording in typed content", () => {
    expect(site.hint.fine).toBe("Scroll or use the arrow keys");
    expect(site.hint.coarse).toBe("Swipe sideways");
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

describe("chrome follows the pager target (D-10)", () => {
  const setup = (initial: number): PagerController =>
    createPagerController(createStubDeps().deps, initial);

  const withPager = (controller: PagerController, ui: ReactNode) => (
    <PagerContext value={controller}>{ui}</PagerContext>
  );

  const renderChrome = (controller: PagerController, current: Slug) =>
    render(
      withPager(
        controller,
        <>
          <Header current={current} />
          <Footer current={current} />
        </>,
      ),
    );

  it("switches label, counter and Next link at slide start", () => {
    const controller = setup(0);
    renderChrome(controller, "index");
    act(() => {
      controller.intent({ type: "next", source: "key" });
    });
    expect(screen.getByText("01 Achievements")).toBeInTheDocument();
    expect(screen.getByText("01 / 05")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Next, Projects" }),
    ).toHaveAttribute("href", "/projects/");
  });

  it("follows a retarget before landing", () => {
    const controller = setup(0);
    renderChrome(controller, "index");
    act(() => {
      controller.intent({ type: "next", source: "key" });
    });
    act(() => {
      controller.intent({ type: "next", source: "key" });
    });
    expect(screen.getByText("02 Projects")).toBeInTheDocument();
    expect(screen.getByText("02 / 05")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Next, Experience" }),
    ).toBeInTheDocument();
  });

  it("marks Say hi current and links back to the start when targeting 05", () => {
    const controller = setup(0);
    renderChrome(controller, "index");
    act(() => {
      controller.intent({ type: "goto", index: 5, source: "link" });
    });
    expect(screen.getByRole("link", { name: "Say hi" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Back to the start" }),
    ).toHaveAttribute("href", "/");
  });

  it("never rewrites the bar's initial --page-index (D-11)", () => {
    const controller = setup(2);
    const { container } = renderChrome(controller, "projects");
    const bar = container.querySelector('[data-pager="bar"]');
    expect(bar).not.toBeNull();
    act(() => {
      controller.intent({ type: "goto", index: 4, source: "link" });
    });
    expect((bar as HTMLElement).style.getPropertyValue("--page-index")).toBe(
      "2",
    );
  });
});
