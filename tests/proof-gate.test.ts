import { describe, expect, it } from "vitest";
import type {
  AtlantisBuild,
  ProofClearance,
  ProofGate,
  RobotModel,
} from "@/content/types";
import { proofGate } from "@/content/proof-gate";
import { robotModel } from "@/content/generated/robot-model";
import {
  atlantisPlayable,
  publishProblems,
  robotViewerOn,
} from "@/lib/proof/gate";

const BUILD: AtlantisBuild = {
  version: "abcdef123456",
  path: "/games/atlantis/abcdef123456/",
  wasmRaw: 1,
  wasmGzip: 1,
  wasmBrotli5: 1,
  pck: 1,
  jsGzip: 1,
  totalBytes: 1,
  totalMB: "0.0",
};

const MODEL = (placeholder: boolean): RobotModel => ({
  version: "v1",
  src: "/models/robot.glb",
  placeholder,
  triangles: 1,
  vertices: 1,
  bytes: 1,
  gzipBytes: 1,
});

const gate = (
  atlantis: ProofClearance,
  embed: boolean,
  robot: ProofClearance,
): ProofGate => ({
  atlantis: { clearance: atlantis, embed },
  robot: { clearance: robot },
});

describe("atlantisPlayable", () => {
  it("is true when pending, embedded and a build exists", () => {
    expect(atlantisPlayable(gate("pending", true, "pending"), BUILD)).toBe(
      true,
    );
  });

  it("is false when withheld", () => {
    expect(atlantisPlayable(gate("withheld", true, "pending"), BUILD)).toBe(
      false,
    );
  });

  it("is false when embed is off", () => {
    expect(atlantisPlayable(gate("pending", false, "pending"), BUILD)).toBe(
      false,
    );
  });

  it("is false without a build", () => {
    expect(atlantisPlayable(gate("pending", true, "pending"), null)).toBe(
      false,
    );
  });

  const clearances: readonly ProofClearance[] = [
    "pending",
    "cleared",
    "withheld",
  ];
  const table = clearances.flatMap((c) =>
    [true, false].flatMap((embed) =>
      [true, false].map((hasBuild) => ({
        c,
        embed,
        hasBuild,
        want: c !== "withheld" && embed && hasBuild,
      })),
    ),
  );
  it.each(table)(
    "clearance $c, embed $embed, build $hasBuild gives $want",
    ({ c, embed, hasBuild, want }) => {
      expect(
        atlantisPlayable(gate(c, embed, "pending"), hasBuild ? BUILD : null),
      ).toBe(want);
    },
  );
});

describe("robotViewerOn", () => {
  it("runs pending with a placeholder model", () => {
    expect(robotViewerOn(gate("pending", false, "pending"), MODEL(true))).toBe(
      true,
    );
  });

  it("stays off for cleared with a placeholder model", () => {
    expect(robotViewerOn(gate("pending", false, "cleared"), MODEL(true))).toBe(
      false,
    );
  });

  it("runs cleared with a real model", () => {
    expect(robotViewerOn(gate("pending", false, "cleared"), MODEL(false))).toBe(
      true,
    );
  });

  it("stays off when withheld", () => {
    expect(
      robotViewerOn(gate("pending", false, "withheld"), MODEL(false)),
    ).toBe(false);
  });

  it("stays off without a model", () => {
    expect(robotViewerOn(gate("pending", false, "pending"), null)).toBe(false);
  });
});

describe("publishProblems", () => {
  it("is empty when both are cleared and the model is real", () => {
    expect(
      publishProblems(gate("cleared", true, "cleared"), MODEL(false)),
    ).toEqual([]);
  });

  it("is empty when both are withheld", () => {
    expect(publishProblems(gate("withheld", false, "withheld"), null)).toEqual(
      [],
    );
  });

  it("lists pending states", () => {
    expect(
      publishProblems(gate("pending", true, "pending"), MODEL(false)),
    ).toEqual(["atlantis clearance is pending", "robot clearance is pending"]);
  });

  it("flags a cleared robot with a placeholder model", () => {
    expect(
      publishProblems(gate("cleared", true, "cleared"), MODEL(true)),
    ).toEqual(["robot is cleared but the model is a placeholder"]);
  });
});

describe("publish guard", () => {
  it("is ready to publish", () => {
    expect(publishProblems(proofGate, robotModel)).toEqual([]);
  });
});
