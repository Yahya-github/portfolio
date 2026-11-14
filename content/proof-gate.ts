import type { ProofGate } from "@/content/types";

/**
 * Clearance per proof piece (08-CONTEXT plan-time gate). "pending" is local-only;
 * plans 08-15/08-16 set "cleared" or "withheld" before anything is pushed.
 * `embed` is set by plan 08-07 after measuring (D-08).
 */
export const proofGate: ProofGate = {
  atlantis: { clearance: "cleared", embed: true },
  robot: { clearance: "cleared" },
} satisfies ProofGate;
