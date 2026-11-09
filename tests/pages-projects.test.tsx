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

  it("renders the Facturo still eagerly on its own route", () => {
    const { container } = renderPage(1, true);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(1);
    const img = imgs[0];
    expect(img).toHaveAttribute("alt", projects.flagship.imageAlt);
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("sizes", "(max-width: 820px) 100vw, 60vw");
    expect(img.getAttribute("srcset")?.split(", ")).toHaveLength(2);
  });

  it("loads lazily when not current and shifts heading levels down", () => {
    const { container } = renderPage(2, false);
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy");
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

  it("has no deep-dive link, no controls and no svg", () => {
    const { container } = renderPage();
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(container.textContent ?? "").not.toMatch(/deep dive/i);
    expect(container.querySelector("button, svg")).toBeNull();
  });
});
