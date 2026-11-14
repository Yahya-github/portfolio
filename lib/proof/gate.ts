// PROOF-01 / PROOF-02: pure clearance gate. Decides from the clearance status
// (content/proof-gate.ts) plus build data whether Atlantis is playable and
// whether the robot viewer runs. No DOM, no side effects.
import type { AtlantisBuild, ProofGate, RobotModel } from "@/content/types";

/** Playable only when not withheld, embed is on and a build exists. */
export function atlantisPlayable(
  g: ProofGate,
  b: AtlantisBuild | null,
): boolean {
  return g.atlantis.clearance !== "withheld" && g.atlantis.embed && b !== null;
}

/** The viewer runs with a model unless withheld; a cleared robot needs a real model. */
export function robotViewerOn(g: ProofGate, m: RobotModel | null): boolean {
  if (m === null || g.robot.clearance === "withheld") return false;
  if (g.robot.clearance === "cleared") return !m.placeholder;
  return true;
}

/** Readable reasons the gate is not ready to publish; empty means ready. */
export function publishProblems(
  g: ProofGate,
  m: RobotModel | null,
): readonly string[] {
  const problems: string[] = [];
  if (g.atlantis.clearance === "pending") {
    problems.push("atlantis clearance is pending");
  }
  if (g.robot.clearance === "pending") {
    problems.push("robot clearance is pending");
  }
  if (g.robot.clearance === "cleared" && (m === null || m.placeholder)) {
    problems.push("robot is cleared but the model is a placeholder");
  }
  return problems;
}
