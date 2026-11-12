/**
 * NAV-04 / A11Y-01 (plan 04-08): the mounted shell pages on link clicks and
 * popstate, projects inert / h1 / focus / title / live region, and leaves
 * hash links, modifier clicks and non-route links to the browser (T-04-21).
 * jsdom has no Element.animate, so the real animator lands instantly.
 */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Shell } from "@/components/shell/Shell";
import { site } from "@/content/site";

const extras: HTMLElement[] = [];

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.title = "";
});

afterEach(() => {
  for (const el of extras.splice(0)) el.remove();
  cleanup();
  vi.restoreAllMocks();
});

function liveIds(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>("main > section:not([inert])"),
  ).map((s) => s.id);
}

function main(container: HTMLElement): HTMLElement {
  return container.querySelector("main#content") as HTMLElement;
}

function liveRegion(container: HTMLElement): HTMLElement {
  return container.querySelector('p[aria-live="polite"]') as HTMLElement;
}

function indexLink(container: HTMLElement, href: string): HTMLAnchorElement {
  const a = container.querySelector<HTMLAnchorElement>(
    `#page-index a[href="${href}"]`,
  );
  if (!a) throw new Error(`no index link to ${href}`);
  return a;
}

function extraLink(href: string, attrs: Record<string, string> = {}) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = "extra";
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
  document.body.append(a);
  extras.push(a);
  return a;
}

async function settle(): Promise<void> {
  await act(async () => {});
}

/**
 * Clicks and reports whether the pager (a document listener) cancelled it.
 * A window listener runs after the document one; it records the outcome and
 * then cancels so jsdom does not attempt a real navigation.
 */
function pagerCancelled(a: HTMLElement, init: MouseEventInit = {}): boolean {
  let cancelled = false;
  const record = (e: Event) => {
    cancelled = e.defaultPrevented;
    e.preventDefault();
  };
  window.addEventListener("click", record);
  try {
    fireEvent.click(a, init);
  } finally {
    window.removeEventListener("click", record);
  }
  return cancelled;
}

describe("pager shell on first render", () => {
  it("has one live page, one h1 and an empty live region", () => {
    const { container } = render(<Shell current="index" />);
    expect(liveIds(container)).toEqual(["page-index"]);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveAttribute("id", "title-index");
    expect(liveRegion(container)).toHaveTextContent("");
    expect(liveRegion(container)).toHaveAttribute("aria-atomic", "true");
  });

  it("collapses every page but the current one", () => {
    const { container } = render(<Shell current="index" />);
    const collapsed = Array.from(
      container.querySelectorAll("main > section[data-collapsed]"),
    ).map((s) => s.id);
    expect(collapsed).toHaveLength(5);
    expect(collapsed).not.toContain("page-index");
  });
});

describe("link paging", () => {
  it("slides to Achievements and projects the landing", async () => {
    const { container } = render(<Shell current="index" />);
    const notCancelled = fireEvent.click(
      indexLink(container, "/achievements/"),
    );
    await settle();
    expect(notCancelled).toBe(false);
    expect(liveIds(container)).toEqual(["page-achievements"]);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveAttribute("id", "title-achievements");
    expect(document.activeElement?.id).toBe("title-achievements");
    expect(liveRegion(container)).toHaveTextContent(
      "Achievements, page 2 of 6",
    );
    expect(window.location.pathname).toBe("/achievements/");
    expect(document.title).toBe("Achievements, Yahya Hallani");
    expect(main(container)).toHaveAttribute("data-phase", "idle");
    expect(main(container)).toHaveAttribute("data-land", "1");
  });

  it("does nothing when the current page's link is clicked again", async () => {
    const { container } = render(<Shell current="index" />);
    fireEvent.click(indexLink(container, "/achievements/"));
    await settle();
    const length = window.history.length;
    fireEvent.click(extraLink("/achievements/"));
    await settle();
    expect(main(container)).toHaveAttribute("data-land", "1");
    expect(window.history.length).toBe(length);
  });

  it.each([
    ["ctrlKey", { ctrlKey: true }],
    ["metaKey", { metaKey: true }],
    ["shiftKey", { shiftKey: true }],
    ["altKey", { altKey: true }],
    ["middle button", { button: 1 }],
  ])("leaves a %s click to the browser", async (_name, init) => {
    const { container } = render(<Shell current="index" />);
    const cancelled = pagerCancelled(
      indexLink(container, "/achievements/"),
      init,
    );
    await settle();
    expect(cancelled).toBe(false);
    expect(liveIds(container)).toEqual(["page-index"]);
    expect(main(container)).toHaveAttribute("data-land", "0");
  });

  it.each([
    ["a target", "/achievements/", { target: "_blank" }],
    ["a download", "/achievements/", { download: "" }],
    ["the resume PDF", site.resume.href, {}],
    ["an external origin", "https://example.com/achievements/", {}],
  ])("does not intercept %s link", async (_name, href, attrs) => {
    const { container } = render(<Shell current="index" />);
    const cancelled = pagerCancelled(extraLink(href, attrs));
    await settle();
    expect(cancelled).toBe(false);
    expect(liveIds(container)).toEqual(["page-index"]);
    expect(main(container)).toHaveAttribute("data-land", "0");
  });

  it("intercepts a plain click on a route link (control)", async () => {
    const { container } = render(<Shell current="index" />);
    expect(pagerCancelled(indexLink(container, "/achievements/"))).toBe(true);
    await settle();
  });
});

describe("hash links (UI-SPEC: skip link unchanged)", () => {
  it("never intercepts the skip link", async () => {
    const { container } = render(<Shell current="index" />);
    const before = main(container).getAttribute("data-land");
    const notCancelled = fireEvent.click(
      screen.getByRole("link", { name: site.skipLabel }),
    );
    await settle();
    expect(notCancelled).toBe(true);
    expect(main(container).getAttribute("data-land")).toBe(before);
    expect(window.location.pathname).toBe("/");
    expect(liveIds(container)).toEqual(["page-index"]);
  });

  it("never intercepts a route link that carries a fragment", async () => {
    const { container } = render(<Shell current="index" />);
    const cancelled = pagerCancelled(extraLink("/achievements/#x"));
    await settle();
    expect(cancelled).toBe(false);
    expect(liveIds(container)).toEqual(["page-index"]);
    expect(main(container)).toHaveAttribute("data-land", "0");
  });
});

describe("popstate", () => {
  it("lands on the URL's page without pushing history", async () => {
    const { container } = render(<Shell current="index" />);
    const push = vi.spyOn(window.history, "pushState");
    window.history.replaceState(null, "", "/projects/");
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(liveIds(container)).toEqual(["page-projects"]);
    expect(liveRegion(container)).toHaveTextContent("Projects, page 3 of 6");
    expect(push).not.toHaveBeenCalled();
  });

  it("ignores popstate for the page already shown", async () => {
    const { container } = render(<Shell current="index" />);
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(main(container)).toHaveAttribute("data-land", "0");
    expect(liveIds(container)).toEqual(["page-index"]);
  });

  it("does not reverse a slide when a fragment navigation fires popstate mid-slide (WR-04)", async () => {
    const { container } = render(<Shell current="index" />);
    // The URL only changes at landing, so it still reads "/" while sliding.
    expect(pagerCancelled(indexLink(container, "/achievements/"))).toBe(true);
    window.history.replaceState(null, "", "/#content");
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await settle();
    expect(liveIds(container)).toEqual(["page-achievements"]);
    expect(window.location.pathname).toBe("/achievements/");
  });

  it("still follows Back to the origin page mid-slide", async () => {
    const { container } = render(<Shell current="index" />);
    await act(async () => {
      window.history.replaceState(null, "", "/projects/");
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.history.replaceState(null, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await settle();
    expect(liveIds(container)).toEqual(["page-index"]);
  });

  it("ignores unknown paths", async () => {
    const { container } = render(<Shell current="index" />);
    window.history.replaceState(null, "", "/nope/");
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(main(container)).toHaveAttribute("data-land", "0");
    expect(liveIds(container)).toEqual(["page-index"]);
  });
});
