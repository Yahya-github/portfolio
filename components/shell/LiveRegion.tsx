"use client";

/**
 * The pager's only announcement (UI-SPEC Accessibility Contract): set at
 * landing, empty on first load. Replaces Next's route announcer (Pitfall 1).
 */
import { liveRegionText } from "@/lib/sections";
import { usePagerState } from "./PagerContext";

export function LiveRegion() {
  const { announced } = usePagerState(0);
  return (
    <p aria-live="polite" aria-atomic="true" className="visually-hidden">
      {announced === null ? "" : liveRegionText(announced)}
    </p>
  );
}
