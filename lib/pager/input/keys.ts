/**
 * Keyboard map for the pager (NAV-02, NAV-07, WR-04). Pure: the input hook
 * (plan 04-10) reduces a KeyboardEvent to KeyEventLike, and the controller
 * owns the 600ms repeat gate (plan 04-05).
 */
import type { EdgeInfo } from "@/lib/pager/types";

export type TargetKind = "control" | "text" | "none";

export interface KeyEventLike {
  readonly key: string;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly repeat: boolean;
  readonly defaultPrevented: boolean;
  readonly targetKind: TargetKind;
}

export type KeyAction = "next" | "prev" | "first" | "last";

export interface KeyIntent {
  readonly action: KeyAction;
  /** Scroll an overflowing page before paging (NAV-07). */
  readonly scrollFirst: boolean;
  readonly scrollBy: "page" | "line" | null;
  readonly repeat: boolean;
}

/** Arrow Up/Down scroll step on an overflowing page. */
export const KEY_LINE_PX = 40;
/** Page Up/Down and Space scroll step, as a share of the viewport height. */
export const KEY_PAGE_RATIO = 0.875;

type KeyEntry = Omit<KeyIntent, "repeat">;

const KEY_TABLE: Readonly<Record<string, KeyEntry>> = {
  ArrowRight: { action: "next", scrollFirst: false, scrollBy: null },
  ArrowLeft: { action: "prev", scrollFirst: false, scrollBy: null },
  PageDown: { action: "next", scrollFirst: true, scrollBy: "page" },
  PageUp: { action: "prev", scrollFirst: true, scrollBy: "page" },
  ArrowDown: { action: "next", scrollFirst: true, scrollBy: "line" },
  ArrowUp: { action: "prev", scrollFirst: true, scrollBy: "line" },
  Home: { action: "first", scrollFirst: false, scrollBy: null },
  End: { action: "last", scrollFirst: false, scrollBy: null },
};

const SPACE_NEXT: KeyEntry = {
  action: "next",
  scrollFirst: true,
  scrollBy: "page",
};
const SPACE_PREV: KeyEntry = {
  action: "prev",
  scrollFirst: true,
  scrollBy: "page",
};

/**
 * Maps a key event to a pager intent, or null when the key must be left to
 * the browser: Alt/Ctrl/Meta held (browser shortcuts such as Alt+Left),
 * already defaultPrevented, focus in a text field, or Space on a focused
 * control, which activates that control instead (WR-04).
 */
export function keyIntent(e: KeyEventLike): KeyIntent | null {
  if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return null;
  if (e.targetKind === "text") return null;
  const isSpace = e.key === " ";
  if (isSpace && e.targetKind === "control") return null; // WR-04
  const entry = isSpace
    ? e.shiftKey
      ? SPACE_PREV
      : SPACE_NEXT
    : Object.hasOwn(KEY_TABLE, e.key)
      ? KEY_TABLE[e.key]
      : undefined;
  if (!entry) return null;
  return { ...entry, repeat: e.repeat };
}

const CONTROL_TAGS: ReadonlySet<string> = new Set(["BUTTON", "SUMMARY"]);
const TEXT_TAGS: ReadonlySet<string> = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const CONTROL_ROLES: ReadonlySet<string> = new Set(["button", "link"]);

function isEditable(el: Element): boolean {
  if ((el as HTMLElement).isContentEditable === true) return true;
  return el.getAttribute("contenteditable") === "true";
}

/** Classifies the focused element for the keyIntent guards (WR-04). */
export function targetKindOf(el: Element | null): TargetKind {
  if (!el) return "none";
  const tag = el.tagName.toUpperCase();
  if (TEXT_TAGS.has(tag) || isEditable(el)) return "text";
  if (tag === "A" && el.hasAttribute("href")) return "control";
  if (CONTROL_TAGS.has(tag)) return "control";
  const role = el.getAttribute("role");
  if (role !== null && CONTROL_ROLES.has(role)) return "control";
  return "none";
}

/**
 * Decides whether a scroll-first key scrolls the page, pages, or stops
 * (NAV-07): it scrolls until the edge, then a fresh press pages and a held
 * key (repeat) stops at the edge.
 */
export function resolveScrollKey(
  intent: KeyIntent,
  edge: EdgeInfo,
): "page" | "scroll" | "stop" {
  if (!intent.scrollFirst || !edge.overflowing) return "page";
  let atEdge: boolean;
  if (intent.action === "next") atEdge = edge.atEnd;
  else if (intent.action === "prev") atEdge = edge.atStart;
  else return "page";
  if (!atEdge) return "scroll";
  return intent.repeat ? "stop" : "page";
}
