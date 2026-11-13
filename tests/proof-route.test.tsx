import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GameStage } from "@/components/proof/GameStage";
import { ProofRoute } from "@/components/proof/ProofRoute";
import { atlantis } from "@/content/atlantis";
import { atlantisBuild } from "@/content/generated/atlantis-build";

afterEach(cleanup);

const SIZE = "14.3";
const SRC = "/games/atlantis/x/play.html";

function renderRoute(playable: boolean) {
  return render(
    <ProofRoute
      content={atlantis}
      stage={
        <GameStage
          content={atlantis}
          playable={playable}
          sizeMB={playable ? SIZE : null}
          src={playable ? SRC : null}
        />
      }
    />,
  );
}

describe("Atlantis route, playable", () => {
  it("renders one h1, the stage and the play controls", () => {
    const { container } = renderRoute(true);
    expect(
      screen.getAllByRole("heading", { level: 1, name: "Atlantis" }),
    ).toHaveLength(1);
    const stage = container.querySelector("[data-game]");
    expect(stage).toHaveAttribute("data-game-state", "ready");
    expect(
      screen.getByRole("button", { name: "Play Atlantis" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Loads 14.3 MB of game files")).toBeInTheDocument();
    expect(
      container.querySelector('[data-game-action="exit"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-game-action="mute"]'),
    ).not.toBeNull();
    expect(container.querySelector("noscript")).not.toBeNull();
  });

  it("gives the poster explicit dimensions", () => {
    const { container } = renderRoute(true);
    const img = container.querySelector("[data-game-poster] img");
    expect(img).toHaveAttribute("width");
    expect(img).toHaveAttribute("height");
  });

  it("opens external links safely and has exactly one rule", () => {
    const { container } = renderRoute(true);
    const link = screen.getByRole("link", { name: "Code" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(container.querySelectorAll("hr")).toHaveLength(1);
  });

  it("makes no request to /games/ from src or href", () => {
    const { container } = renderRoute(true);
    for (const el of container.querySelectorAll("[src], [href]")) {
      expect(el.getAttribute("src") ?? "").not.toContain("/games/");
      expect(el.getAttribute("href") ?? "").not.toContain("/games/");
    }
  });
});

describe("Atlantis route, not playable", () => {
  it("shows no controls or size line but keeps poster and links", () => {
    const { container } = renderRoute(false);
    expect(container.querySelector("[data-game-action]")).toBeNull();
    expect(screen.queryByText(/Loads .* MB/)).toBeNull();
    expect(container.querySelector("[data-game-poster] img")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Article" })).toBeInTheDocument();
  });
});

describe("generated build", () => {
  it("has a one-decimal size when present", () => {
    if (atlantisBuild) expect(atlantisBuild.totalMB).toMatch(/^\d+\.\d$/);
  });
});
