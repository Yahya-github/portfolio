import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AchievementsPage } from "@/components/pages/AchievementsPage";
import { IndexPage } from "@/components/pages/IndexPage";
import { achievements } from "@/content/achievements";
import { indexPage } from "@/content/index";
import { site } from "@/content/site";
import { letterSections } from "@/lib/sections";

afterEach(cleanup);

describe("IndexPage", () => {
  it("renders an h1 named after the site with the role line as plain text", () => {
    const { container } = render(<IndexPage headingLevel={1} isCurrent />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "title-index");
    expect(h1).toHaveAccessibleName(indexPage.title);
    expect(screen.getByText(site.roleLine).tagName).toBe("P");
    expect(container.firstElementChild).toHaveClass("grid");
  });

  it("renders the three meta labels", () => {
    render(<IndexPage headingLevel={1} isCurrent />);
    for (const label of indexPage.metaLabels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("lists the five letter sections as links to their routes", () => {
    render(<IndexPage headingLevel={1} isCurrent />);
    const links = screen.getAllByRole("link");
    const expected = letterSections();
    expect(links).toHaveLength(5);
    links.forEach((link, i) => {
      expect(link).toHaveAttribute("href", expected[i].route);
      expect(link).toHaveTextContent(
        `${expected[i].number} ${expected[i].name}`,
      );
    });
    expect(links[0]).toHaveTextContent("01 Achievements");
    expect(links[4]).toHaveTextContent("05 Say hi");
  });

  it("renders an h2 when headingLevel is 2", () => {
    render(<IndexPage headingLevel={2} isCurrent={false} />);
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "title-index",
    );
  });

  it("renders no svg and no img", () => {
    const { container } = render(<IndexPage headingLevel={1} isCurrent />);
    expect(container.querySelector("svg, img")).toBeNull();
  });
});

describe("AchievementsPage", () => {
  it("renders the title with the six letter rows aria-hidden", () => {
    render(<AchievementsPage headingLevel={1} isCurrent />);
    const h = screen.getByRole("heading", { level: 1 });
    expect(h).toHaveAttribute("id", "title-achievements");
    expect(h).toHaveAccessibleName(achievements.title);
    const hidden = h.querySelector('[aria-hidden="true"]');
    expect(hidden).not.toBeNull();
    for (const row of achievements.titleRows) {
      expect(within(hidden as HTMLElement).getByText(row)).toBeInTheDocument();
    }
  });

  it("renders 75/75 as accent tabular plain text outside any link", () => {
    render(<AchievementsPage headingLevel={1} isCurrent />);
    const rank = screen.getByText("75/75");
    expect(rank).toHaveClass("c-accent");
    expect(rank).toHaveClass("tnum");
    expect(rank.closest("a")).toBeNull();
  });

  it("renders exactly four external source links in new tabs", () => {
    render(<AchievementsPage headingLevel={1} isCurrent />);
    const links = screen.getAllByRole("link");
    const linked = achievements.lines.filter((l) => l.href !== null);
    expect(links).toHaveLength(4);
    links.forEach((link, i) => {
      expect(link).toHaveAttribute("href", linked[i].href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.textContent).toContain(linked[i].result);
    });
  });

  it("renders an h2 when headingLevel is 2", () => {
    render(<AchievementsPage headingLevel={2} isCurrent={false} />);
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "title-achievements",
    );
  });

  it("renders no svg and no img", () => {
    const { container } = render(
      <AchievementsPage headingLevel={1} isCurrent />,
    );
    expect(container.querySelector("svg, img")).toBeNull();
  });
});
