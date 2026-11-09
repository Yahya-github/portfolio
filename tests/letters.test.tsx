import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LetterNav } from "@/components/letters/LetterNav";
import { PagerContext } from "@/components/shell/PagerContext";
import type { Slug } from "@/content/types";
import { createPagerController } from "@/lib/pager/controller";
import type { PagerController } from "@/lib/pager/types";
import { slugAt } from "@/lib/sections";
import { createStubDeps, type StubDeps } from "./helpers/stub-ports";

afterEach(cleanup);

const ALL_SLUGS: readonly Slug[] = [
  "index",
  "achievements",
  "projects",
  "experience",
  "about",
  "say-hi",
];
const HREFS = [
  "/achievements/",
  "/projects/",
  "/experience/",
  "/about/",
  "/say-hi/",
];
const GLYPHS = ["Y", "A", "H", "Y", "A"];
const NAMES = [
  "01 Achievements",
  "02 Projects",
  "03 Experience",
  "04 About",
  "05 Say hi",
];

const navOf = (container: HTMLElement): HTMLElement => {
  const nav = container.querySelector("nav");
  if (!nav) throw new Error("no nav");
  return nav;
};

describe("LetterNav hero (index)", () => {
  it("renders the Sections nav in hero mode with five letter links", () => {
    const { container } = render(<LetterNav current="index" />);
    const nav = screen.getByRole("navigation", { name: "Sections" });
    expect(nav).toHaveAttribute("data-mode", "hero");
    const links = [...navOf(container).querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(HREFS);
    expect(links.map((a) => a.getAttribute("data-glyph"))).toEqual(GLYPHS);
    links.forEach((a) => expect(a).not.toHaveAttribute("aria-current"));
  });

  it("gives each link its numbered caption as accessible name", () => {
    render(<LetterNav current="index" />);
    NAMES.forEach((name, i) =>
      expect(screen.getByRole("link", { name })).toHaveAttribute(
        "href",
        HREFS[i],
      ),
    );
  });

  it("hides each glyph from assistive tech and shows the content letter", () => {
    const { container } = render(<LetterNav current="index" />);
    const links = [...navOf(container).querySelectorAll("a")];
    links.forEach((a, i) => {
      const glyph = a.querySelector('[aria-hidden="true"]');
      expect(glyph).toHaveTextContent(GLYPHS[i]);
    });
  });

  it("renders no current-name element", () => {
    const { container } = render(<LetterNav current="index" />);
    expect(
      navOf(container).querySelector(':scope > [aria-hidden="true"]'),
    ).toBeNull();
  });
});

describe("LetterNav rail", () => {
  it("marks only the current section and shows its name", () => {
    const { container } = render(<LetterNav current="experience" />);
    const nav = navOf(container);
    expect(nav).toHaveAttribute("data-mode", "rail");
    const current = nav.querySelectorAll('a[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(screen.getByRole("link", { name: "03 Experience" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const now = nav.querySelector(':scope > [aria-hidden="true"]');
    expect(now).toHaveTextContent("03");
    expect(now).toHaveTextContent("Experience");
  });

  it.each(ALL_SLUGS)("keeps the same five links in order for %s", (s) => {
    const { container } = render(<LetterNav current={s} />);
    const links = [...navOf(container).querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(HREFS);
    expect(links.map((a) => a.getAttribute("data-glyph"))).toEqual(GLYPHS);
  });

  it("is tagged for the pager", () => {
    const { container } = render(<LetterNav current="projects" />);
    expect(navOf(container)).toHaveAttribute("data-pager", "letters");
    expect(navOf(container)).not.toHaveAttribute("inert");
    expect(navOf(container)).not.toHaveAttribute("data-enter");
  });
});

describe("LetterNav stand-in follows the pager (D-09, D-10)", () => {
  interface Rig {
    readonly stub: StubDeps;
    readonly controller: PagerController;
    readonly nav: HTMLElement;
  }

  const rig = (initial: number): Rig => {
    const stub = createStubDeps();
    const controller = createPagerController(stub.deps, initial);
    const { container } = render(
      <PagerContext value={controller}>
        <LetterNav current={slugAt(initial)} />
      </PagerContext>,
    );
    return { stub, controller, nav: navOf(container) };
  };

  const currentLinks = (nav: HTMLElement) =>
    nav.querySelectorAll('a[aria-current="page"]');
  const nowOf = (nav: HTMLElement) =>
    nav.querySelector(':scope > [aria-hidden="true"]');

  it("leaving Index: hero row rides out inert, rail fades in on landing", async () => {
    const { stub, controller, nav } = rig(0);
    act(() => {
      controller.intent({ type: "next", source: "key" });
    });
    expect(nav).toHaveAttribute("data-mode", "hero");
    expect(nav).toHaveAttribute("inert");
    expect(nav).not.toHaveAttribute("data-enter");

    stub.slides[0].resolve(true);
    await act(async () => {});
    expect(nav).toHaveAttribute("data-mode", "rail");
    expect(nav).not.toHaveAttribute("inert");
    expect(nav).toHaveAttribute("data-enter");
    expect(
      screen.getByRole("link", { name: "01 Achievements" }),
    ).toHaveAttribute("aria-current", "page");
    expect(nowOf(nav)).toHaveTextContent("01 Achievements");
  });

  it("returning to Index switches to hero at slide start, live", () => {
    const { controller, nav } = rig(2);
    act(() => {
      controller.intent({ type: "goto", index: 0, source: "link" });
    });
    expect(nav).toHaveAttribute("data-mode", "hero");
    expect(nav).not.toHaveAttribute("inert");
    expect(currentLinks(nav)).toHaveLength(0);
    expect(nowOf(nav)).toBeNull();
  });

  it("rail to rail: aria-current and name move at slide start, no fade", () => {
    const { controller, nav } = rig(1);
    act(() => {
      controller.intent({ type: "next", source: "key" });
    });
    expect(nav).toHaveAttribute("data-mode", "rail");
    expect(currentLinks(nav)).toHaveLength(1);
    expect(screen.getByRole("link", { name: "02 Projects" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(nowOf(nav)).toHaveTextContent("02 Projects");
    expect(nav).not.toHaveAttribute("data-enter");
  });
});
