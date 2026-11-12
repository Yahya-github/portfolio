import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageLevelProvider } from "@/components/pages/PageLevel";
import { ExperiencePage } from "@/components/pages/ExperiencePage";

afterEach(cleanup);

function renderExperience() {
  return render(
    <PageLevelProvider level={1}>
      <ExperiencePage isCurrent />
    </PageLevelProvider>,
  );
}

describe("OrgMark in ExperiencePage", () => {
  it("renders seven decorative marks in row order", () => {
    const { container } = renderExperience();
    const marks = [...container.querySelectorAll("[data-mark]")];
    expect(marks.map((m) => m.getAttribute("data-mark"))).toEqual([
      "mame",
      "mercor",
      "facturo",
      "crc",
      "mcgill-robotics",
      "gdg",
      "icpc",
    ]);
    for (const m of marks) {
      expect(m).toHaveAttribute("aria-hidden", "true");
      const imgs = m.querySelectorAll("img");
      expect(imgs).toHaveLength(2);
      for (const img of imgs) expect(img).toHaveAttribute("alt", "");
    }
  });

  it("gives the Freelance row no mark", () => {
    const { container } = renderExperience();
    const row = [...container.querySelectorAll("li")].find((li) =>
      li.textContent?.includes("Freelance"),
    );
    expect(row).toBeDefined();
    expect(row!.querySelector("[data-mark]")).toBeNull();
    expect(row!.hasAttribute("data-tap-colour")).toBe(false);
  });

  it("leads with the MAME role since Nov 2026", () => {
    const { container } = renderExperience();
    const first = container.querySelector("li")!;
    expect(first.textContent).toContain("Since Nov 2026");
    expect(first.textContent).toContain("MAME");
  });
});
