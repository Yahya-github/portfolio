import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GameStage } from "@/components/proof/GameStage";
import { ProofRoute } from "@/components/proof/ProofRoute";
import { ModelStage } from "@/components/proof/ModelStage";
import { atlantis } from "@/content/atlantis";
import { robot } from "@/content/robot";
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
      const href = el.getAttribute("href") ?? "";
      // The Credits link is a user navigation to the licence text, not a request.
      if (href.endsWith("/LICENSES.txt")) continue;
      expect(href).not.toContain("/games/");
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

function renderRobot(viewerOn: boolean) {
  return render(
    <ProofRoute
      content={robot}
      stage={
        <ModelStage
          content={robot}
          viewerOn={viewerOn}
          src={viewerOn ? "/models/robot/x/robot.bin" : null}
        />
      }
    />,
  );
}

describe("Robot route, viewer on", () => {
  it("renders the model hooks, still, hint, reset button and description", () => {
    const { container } = renderRobot(true);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const figures = container.querySelectorAll("figure[data-model]");
    expect(figures).toHaveLength(1);
    expect(figures[0]).toHaveAttribute(
      "data-model-src",
      "/models/robot/x/robot.bin",
    );
    const img = container.querySelector("[data-model-still] img");
    expect(img).toHaveAttribute("width");
    expect(img).toHaveAttribute("height");
    expect(img).toHaveAttribute("alt", robot.still.alt);
    expect(container.querySelector("[data-model-hint]")).toHaveTextContent(
      "Drag to rotate",
    );
    expect(
      screen.getByRole("button", { name: "Reset view" }),
    ).toBeInTheDocument();
    expect(container.querySelector("#robot-viewer-desc")).toHaveTextContent(
      robot.viewer.description,
    );
  });

  it("splits the title into two fitted spans", () => {
    const { container } = renderRobot(true);
    const spans = container.querySelectorAll("h1 span");
    expect(spans).toHaveLength(2);
    expect(spans[0]).toHaveTextContent("Robot");
    expect(spans[1]).toHaveTextContent("firmware");
  });
});

describe("Robot route, viewer off", () => {
  it("keeps the still and caption with no viewer source or buttons", () => {
    const { container } = renderRobot(false);
    expect(container.querySelector("[data-model-still] img")).not.toBeNull();
    expect(screen.getAllByText(robot.still.caption).length).toBeGreaterThan(0);
    expect(container.querySelector("[data-model]")).not.toHaveAttribute(
      "data-model-src",
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("generated build", () => {
  it("has a one-decimal size when present", () => {
    if (atlantisBuild) expect(atlantisBuild.totalMB).toMatch(/^\d+\.\d$/);
  });
});
