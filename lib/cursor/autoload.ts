/**
 * EXP-03: the cursor chunk loads only for a fine hovering pointer outside
 * forced colours; a failed load keeps the native cursor (WR-07). Provider-
 * independent so the standalone deep dive can use it too.
 */
import type { PagerSignals } from "@/lib/pager/types";

export function autoloadCursor(signals: PagerSignals): () => void {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const forced = window.matchMedia("(forced-colors: active)");
  let alive = true;
  let loading = false;
  let unmount: (() => void) | null = null;
  const wanted = () => fine.matches && !forced.matches;
  const sync = () => {
    if (wanted() && !unmount && !loading) {
      loading = true;
      import("@/lib/cursor/mount")
        .then((m) => {
          loading = false;
          if (alive && wanted() && !unmount) {
            unmount = m.mountCursor(signals);
          }
        })
        .catch(() => {
          loading = false;
        });
    } else if (!wanted() && unmount) {
      unmount();
      unmount = null;
    }
  };
  sync();
  fine.addEventListener("change", sync);
  forced.addEventListener("change", sync);
  return () => {
    alive = false;
    fine.removeEventListener("change", sync);
    forced.removeEventListener("change", sync);
    unmount?.();
  };
}
