"use client";

import { useEffect } from "react";
import { autoloadCursor } from "@/lib/cursor/autoload";
import { createSignals } from "@/lib/pager/signals";

interface ProofClientProps {
  readonly feature: "game" | "model";
}

const NEAR_VIEWPORT = "100% 0px";

/** Load the viewer and the motion control once the stage is within a viewport of view. */
function observeModel(
  isAlive: () => boolean,
  cleanups: Array<() => void>,
): (() => void) | null {
  const fig = document.querySelector<HTMLElement>(
    "[data-model][data-model-src]",
  );
  if (!fig) return null;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      Promise.all([
        import("@/lib/proof/model/viewer"),
        import("@/lib/motion/devices"),
      ])
        .then(async ([viewer, devices]) => {
          if (!isAlive()) return;
          cleanups.push(await viewer.mount(fig));
          // devices.mount ignores its arguments; it only reads the document.
          const motion = devices.mount as unknown as () => () => void;
          if (isAlive()) cleanups.push(motion());
        })
        .catch(() => {});
    },
    { rootMargin: NEAR_VIEWPORT },
  );
  io.observe(fig);
  return () => io.disconnect();
}

/** The one client island for proof routes: cursor plus the lazy feature. */
export function ProofClient({ feature }: ProofClientProps): null {
  useEffect(() => {
    let alive = true;
    const cleanups: Array<() => void> = [];
    let offObserver: (() => void) | null = null;
    const offCursor = autoloadCursor(createSignals());
    if (feature === "game") {
      import("@/lib/proof/game/mount")
        .then((m) => {
          if (alive) cleanups.push(m.mount());
        })
        .catch(() => {});
    } else {
      offObserver = observeModel(() => alive, cleanups);
    }
    return () => {
      alive = false;
      offObserver?.();
      for (const fn of cleanups) fn();
      offCursor();
    };
  }, [feature]);
  return null;
}
