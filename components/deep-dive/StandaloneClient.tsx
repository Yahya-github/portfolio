"use client";

import { useEffect } from "react";
import { autoloadCursor } from "@/lib/cursor/autoload";
import { createSignals } from "@/lib/pager/signals";

/** Cursor for routes outside the pager (deep dive). No pager, no hint. */
export function StandaloneClient(): null {
  useEffect(() => autoloadCursor(createSignals()), []);
  return null;
}
