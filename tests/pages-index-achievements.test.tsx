import { readFileSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageLevelProvider } from "@/components/pages/PageLevel";
import { AchievementsPage } from "@/components/pages/AchievementsPage";
import { IndexPage } from "@/components/pages/IndexPage";
import { achievements } from "@/content/achievements";
import { indexPage } from "@/content/index";
import { site } from "@/content/site";
import { letterSections } from "@/lib/sections";

afterEach(cleanup);

describe("IndexPage", () => {
  it("renders an h1 named after the site with the role line as plain text", () => {
    const { container } = render(
      <PageLevelProvider level={1}>
        <IndexPage />
      </PageLevelProvider>,
    );
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "title-index");
    expect(h1).toHaveAccessibleName(indexPage.title);
    expect(screen.getByText(site.roleLine).tagName).toBe("P");
    expect(container.firstElementChild).toHaveClass("grid");
  });

  it("renders the three meta labels", () => {
    render(
      <PageLevelProvider level={1}>
        <IndexPage />
      </PageLevelProvider>,
    );
    for (const label of indexPage.metaLabels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("lists the five letter sections as links to their routes", () => {
    render(
      <PageLevelProvider level={1}>
        <IndexPage />
      </PageLevelProvider>,
    );
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

  it("renders an h2 under page level 2", () => {
    render(
      <PageLevelProvider level={2}>
        <IndexPage />
      </PageLevelProvider>,
    );
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "title-index",
    );
  });

  it("renders the landscape hint once as static text", () => {
    render(
      <PageLevelProvider level={1}>
        <IndexPage />
      </PageLevelProvider>,
    );
    expect(screen.getAllByText(indexPage.landscapeHint)).toHaveLength(1);
  });

  it("renders no svg and no img", () => {
    const { container } = render(
      <PageLevelProvider level={1}>
        <IndexPage />
      </PageLevelProvider>,
    );
    expect(container.querySelector("svg, img")).toBeNull();
  });
});

describe("AchievementsPage", () => {
  it("renders the title with the six letter rows aria-hidden", () => {
    render(
      <PageLevelProvider level={1}>
        <AchievementsPage />
      </PageLevelProvider>,
    );
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
    render(
      <PageLevelProvider level={1}>
        <AchievementsPage />
      </PageLevelProvider>,
    );
    const rank = screen.getByText("75/75");
    expect(rank).toHaveClass("c-accent");
    expect(rank).toHaveClass("tnum");
    expect(rank.closest("a")).toBeNull();
  });

  it("renders exactly four external source links in new tabs", () => {
    render(
      <PageLevelProvider level={1}>
        <AchievementsPage />
      </PageLevelProvider>,
    );
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

  it("renders an h2 under page level 2", () => {
    render(
      <PageLevelProvider level={2}>
        <AchievementsPage />
      </PageLevelProvider>,
    );
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "title-achievements",
    );
  });

  it("renders five preview items and no svg", () => {
    const { container } = render(
      <PageLevelProvider level={1}>
        <AchievementsPage />
      </PageLevelProvider>,
    );
    expect(container.querySelectorAll("li[data-preview-item]")).toHaveLength(5);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders the 75/75 line as a focusable non-link with a text-only preview", () => {
    const { container } = render(
      <PageLevelProvider level={1}>
        <AchievementsPage />
      </PageLevelProvider>,
    );
    const line = screen.getByText("75/75").closest("[data-preview-trigger]");
    expect(line?.tagName).toBe("DIV");
    expect(line).toHaveAttribute("tabindex", "0");
    expect(line).toHaveAttribute("data-cursor-snap");
    expect(line).not.toHaveAttribute("href");
    const text = container.querySelectorAll("figure[data-preview-text]");
    expect(text).toHaveLength(1);
    expect(text[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("renders one image per photo line with the content alt text", () => {
    const { container } = render(
      <PageLevelProvider level={1}>
        <AchievementsPage />
      </PageLevelProvider>,
    );
    const imgs = [...container.querySelectorAll("img")];
    const alts = achievements.lines.flatMap((l) =>
      l.preview.kind === "photo" ? [l.preview.alt] : [],
    );
    expect(imgs).toHaveLength(4);
    expect(imgs.map((i) => i.getAttribute("alt"))).toEqual(alts);
  });

  it("never uses :focus-within in the preview or page CSS", () => {
    for (const f of [
      "components/media/proof-preview.module.css",
      "components/pages/achievements-page.module.css",
    ]) {
      expect(readFileSync(f, "utf8")).not.toContain("focus-within");
    }
  });
});
