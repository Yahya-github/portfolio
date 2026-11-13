"use client";

import { useEffect } from "react";
import { autoloadCursor } from "@/lib/cursor/autoload";
import { createSignals } from "@/lib/pager/signals";

interface ProofClientProps {
  readonly feature: "game" | "model";
}

/** The one client island for proof routes: cursor plus the lazy feature. */
export function ProofClient({ feature }: ProofClientProps): null {
  useEffect(() => {
    let alive = true;
    let cleanup: (() => void) | null = null;
    const offCursor = autoloadCursor(createSignals());
    if (feature === "game") {
      import("@/lib/proof/game/mount")
        .then((m) => {
          if (alive) cleanup = m.mount();
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
      cleanup?.();
      offCursor();
    };
  }, [feature]);
  return null;
}
