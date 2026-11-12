import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageLevelProvider } from "@/components/pages/PageLevel";
import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { projects } from "@/content/projects";

afterEach(cleanup);

function renderPage(headingLevel: 1 | 2 = 1, isCurrent = true) {
  return render(
    <PageLevelProvider level={headingLevel}>
      <ProjectsPage isCurrent={isCurrent} />
    </PageLevelProvider>,
  );
}

describe("ProjectsPage", () => {
  it("renders the visually hidden title and the Facturo lead", () => {
    const { container } = renderPage();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "title-projects");
    expect(h1).toHaveAccessibleName(projects.title);
    expect(
      screen.getByRole("heading", { level: 2, name: projects.flagship.name }),
    ).toBeInTheDocument();
    for (const line of projects.flagship.lines) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
    expect(container.firstElementChild).toHaveClass("grid");
  });

  it("renders ten frames, only frame 1 grey loaded eagerly", () => {
    const { container } = renderPage(1, true);
    const frames = container.querySelectorAll("[data-frame]");
    expect(frames).toHaveLength(10);
    frames.forEach((fr, i) => {
      const grey = fr.querySelector('img[data-twin="grey"]');
      const colour = fr.querySelector('img[data-twin="colour"]');
      expect(colour).toHaveAttribute("alt", "");
      expect(colour).toHaveAttribute("data-src");
      expect(colour).toHaveAttribute("data-defer");
      expect(colour).not.toHaveAttribute("src");
      if (i === 0) {
        expect(grey).toHaveAttribute("src");
        expect(grey).toHaveAttribute("loading", "eager");
        expect(grey).toHaveAttribute("alt", expect.stringMatching(/Facturo/));
      } else {
        expect(grey).not.toHaveAttribute("src");
        expect(grey).toHaveAttribute("data-src");
        expect(grey).toHaveAttribute("data-defer");
        expect(fr).toHaveAttribute("aria-hidden", "true");
      }
    });
  });

  it("exposes the walkthrough group, three named controls and the counter", () => {
    const { container } = renderPage();
    const group = container.querySelector("[data-walk]");
    expect(group).toHaveAttribute("role", "group");
    expect(group).toHaveAttribute("aria-roledescription", "walkthrough");
    expect(group).toHaveAttribute("tabindex", "0");
    const c = projects.flagship.walkthrough.controls;
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(3);
    expect(
      Array.from(buttons).map((b) => b.getAttribute("aria-label")),
    ).toEqual([c.pauseName, c.previousName, c.nextName]);
    expect(container.querySelector("[data-walk-counter]")).toHaveTextContent(
      "01 / 10, Home",
    );
  });

  it("loads lazily when not current and shifts heading levels down", () => {
    const { container } = renderPage(2, false);
    expect(
      container.querySelector('[data-frame="0"] img[data-twin="grey"]'),
    ).toHaveAttribute("loading", "lazy");
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "title-projects",
    );
    expect(
      screen.getByRole("heading", { level: 3, name: projects.flagship.name }),
    ).toBeInTheDocument();
  });

  it("renders five rows with number, sub-level name and three lines", () => {
    const { container } = renderPage();
    const items = container.querySelectorAll("ol > li");
    expect(items).toHaveLength(5);
    items.forEach((li, i) => {
      const row = projects.rows[i];
      const scope = within(li as HTMLElement);
      expect(scope.getByText(row.number)).toBeInTheDocument();
      expect(
        scope.getByRole("heading", { level: 2, name: row.name }),
      ).toBeInTheDocument();
      const ps = li.querySelectorAll("p");
      expect(ps).toHaveLength(3);
      ps.forEach((p, j) => expect(p).toHaveTextContent(row.lines[j]));
      expect(ps[1].className).toMatch(/mid/);
    });
    expect(items[0]).toHaveTextContent("02.2");
    expect(items[4]).toHaveTextContent("02.6");
  });

  it("links rows with a link in a new tab and leaves the others unlinked", () => {
    const { container } = renderPage();
    const items = container.querySelectorAll("ol > li");
    const labels: string[] = [];
    items.forEach((li, i) => {
      const row = projects.rows[i];
      const links = li.querySelectorAll("a");
      if (row.link === null) {
        expect(links).toHaveLength(0);
        return;
      }
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute("href", row.link.href);
      expect(links[0]).toHaveAttribute("target", "_blank");
      expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
      labels.push(links[0].textContent ?? "");
    });
    expect(labels).toEqual(["Live site", "Code", "Team site"]);
    expect(within(items[2] as HTMLElement).queryByRole("link")).toBeNull(); // CRC problems
    expect(within(items[4] as HTMLElement).queryByRole("link")).toBeNull(); // Showdown AI
  });

  it("has no deep-dive link and no svg", () => {
    const { container } = renderPage();
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(container.textContent ?? "").not.toMatch(/deep dive/i);
    expect(container.querySelector("svg")).toBeNull();
  });
});
