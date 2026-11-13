/**
 * Cross-frame message guard for the Atlantis stage (Phase 8, PROOF-01).
 *
 * - D-10: the parent trusts only same-origin messages from its own game
 *   frame (ASVS V5, threats T-08-07 and T-08-08).
 * - RESEARCH Pattern 2 "Message guard (parent)": a closed message union,
 *   finite-number checks, and fresh objects carrying known keys only.
 *
 * No React, no DOM access beyond the event and frame passed in.
 */
export type GameMsg =
  | { readonly type: "progress"; readonly cur: number; readonly total: number }
  | { readonly type: "ready" }
  | { readonly type: "exit" }
  | { readonly type: "error" }
  | { readonly type: "escape" };

export type ParentMsg = { readonly type: "mute"; readonly value: boolean };

function readProgress(data: Record<string, unknown>): GameMsg | null {
  const { cur, total } = data;
  if (typeof cur !== "number" || typeof total !== "number") return null;
  if (!Number.isFinite(cur) || !Number.isFinite(total)) return null;
  if (total <= 0 || cur < 0) return null;
  return { type: "progress", cur, total };
}

function readPayload(data: unknown): GameMsg | null {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;
  switch (record.type) {
    case "progress":
      return readProgress(record);
    case "ready":
      return { type: "ready" };
    case "exit":
      return { type: "exit" };
    case "error":
      return { type: "error" };
    case "escape":
      return { type: "escape" };
    default:
      return null;
  }
}

export function readGameMsg(
  e: MessageEvent,
  frame: HTMLIFrameElement | null,
): GameMsg | null {
  if (!frame) return null;
  if (e.origin !== window.location.origin) return null;
  if (e.source !== frame.contentWindow) return null;
  return readPayload(e.data);
}
