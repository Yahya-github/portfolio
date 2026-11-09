import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ExperiencePage } from "@/components/pages/ExperiencePage";
import { SayHiPage } from "@/components/pages/SayHiPage";

afterEach(cleanup);

const EMAIL = "yahya.hallani.email@gmail.com";

describe("ExperiencePage", () => {
  it("renders a visually hidden h1 and two h2 heads at level 1", () => {
    const { container } = render(
      <ExperiencePage headingLevel={1} isCurrent={true} />,
    );
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "title-experience");
    expect(h1).toHaveAccessibleName("Experience");
    expect(h1.querySelector(".visually-hidden")).not.toBeNull();
    const h2s = screen.getAllByRole("heading", { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual(["Work", "Involvement"]);
    expect(container.firstElementChild).toHaveClass("grid");
  });

  it("drops the sub heads to h3 at level 2", () => {
    render(<ExperiencePage headingLevel={2} isCurrent={false} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAccessibleName(
      "Experience",
    );
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(["Work", "Involvement"]);
  });

  it("lists five work rows in content order with date, role and organisation", () => {
    const { container } = render(
      <ExperiencePage headingLevel={1} isCurrent={true} />,
    );
    const rows = container.querySelectorAll("ol > li");
    expect(rows).toHaveLength(5);
    const first = within(rows[0] as HTMLElement);
    expect(first.getByText("Since Nov 2026")).toBeInTheDocument();
    expect(first.getByText("Developer")).toBeInTheDocument();
    expect(
      first.getByText(
        "MAME Tool Rental, McGill Association of Mechanical Engineers",
      ),
    ).toBeInTheDocument();
    expect(rows[2].textContent).toContain("Jun 2026 to Oct 2026");
    expect(rows[2].textContent).toContain("Facturo");
  });

  it("lists three involvement rows with no date element", () => {
    const { container } = render(
      <ExperiencePage headingLevel={1} isCurrent={true} />,
    );
    const rows = container.querySelectorAll("ul > li");
    expect(rows).toHaveLength(3);
    rows.forEach((row) => {
      expect(row.querySelectorAll("p")).toHaveLength(2);
      expect(row.querySelector(".tnum")).toBeNull();
    });
    expect(rows[0].textContent).toContain("McGill Robotics");
  });

  it("sets the per-word fit variable on each head word", () => {
    render(<ExperiencePage headingLevel={1} isCurrent={true} />);
    expect(screen.getByText("Work").style.getPropertyValue("--word-em")).toBe(
      "1.67",
    );
    expect(
      screen.getByText("Involvement").style.getPropertyValue("--word-em"),
    ).toBe("3.98");
  });
});

describe("SayHiPage", () => {
  it("renders a visually hidden h1 named Say hi", () => {
    render(<SayHiPage headingLevel={1} isCurrent={true} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "title-say-hi");
    expect(h1).toHaveAccessibleName("Say hi");
  });

  it("renders the four Display links in order", () => {
    const { container } = render(
      <SayHiPage headingLevel={1} isCurrent={true} />,
    );
    const lines = [...container.querySelectorAll("a.t-display")];
    expect(lines.map((a) => a.textContent)).toEqual([
      "Email",
      "LinkedIn",
      "GitHub",
      "Resume (PDF)",
    ]);
    expect(lines[0]).toHaveAttribute("href", `mailto:${EMAIL}`);
    expect(lines[3]).toHaveAttribute("href", "/yahya-hallani-resume.pdf");
  });

  it("opens external links in a new tab with noopener noreferrer (T-03-20)", () => {
    render(<SayHiPage headingLevel={1} isCurrent={true} />);
    for (const name of ["LinkedIn", "GitHub"]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    for (const name of ["Email", "Resume (PDF)"]) {
      const link = screen.getByRole("link", { name });
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    }
  });

  it("renders the underlined address mailto link", () => {
    render(<SayHiPage headingLevel={1} isCurrent={true} />);
    const addr = screen.getByRole("link", { name: EMAIL });
    expect(addr).toHaveAttribute("href", `mailto:${EMAIL}`);
    expect(addr).toHaveClass("ulink");
  });
});
