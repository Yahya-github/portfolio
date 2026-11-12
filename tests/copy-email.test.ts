import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COPIED_RESET_MS, mount } from "@/lib/copy-email/mount";
import type { FeatureContext } from "@/lib/features/types";

const ADDRESS = "yahya.hallani.email@gmail.com";
const ctx = {} as FeatureContext;

function setup() {
  const root = document.createElement("section");
  root.innerHTML = `<a data-copy-email="${ADDRESS}" href="mailto:${ADDRESS}">Email</a>
  <p data-copy-line=""><span data-copy-status="" aria-live="polite"></span><a class="addr" href="mailto:${ADDRESS}">${ADDRESS}</a></p>
  <span id="copy-email-description" hidden>Copies the address</span>`;
  document.body.append(root);
  const link = root.querySelector<HTMLAnchorElement>("a[data-copy-email]")!;
  const status = root.querySelector<HTMLElement>("[data-copy-status]")!;
  const line = root.querySelector<HTMLElement>("[data-copy-line]")!;
  return { root, link, status, line, cleanup: mount(root, ctx) };
}

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, "clipboard", { value, configurable: true });
}

const click = (el: Element, init: MouseEventInit = {}) => {
  const ev = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: 0,
    ...init,
  });
  el.dispatchEvent(ev);
  return ev;
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
  setClipboard(undefined);
});

describe("copy-email mount", () => {
  it("sets aria-describedby and the cursor tag", () => {
    const { link } = setup();
    expect(link).toHaveAttribute("aria-describedby", "copy-email-description");
    expect(link.dataset.cursorTag).toBe("Copy the address");
  });

  it("copies the address, announces it, then resets after 4s", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    const { link, status, line } = setup();
    const ev = click(link);
    expect(ev.defaultPrevented).toBe(true);
    expect(writeText).toHaveBeenCalledWith(ADDRESS);
    await vi.advanceTimersByTimeAsync(0);
    expect(status.textContent).toBe(`Copied ${ADDRESS}`);
    expect(line.dataset.copy).toBe("copied");
    await vi.advanceTimersByTimeAsync(COPIED_RESET_MS);
    expect(status.textContent).toBe("");
    expect(line.dataset.copy).toBeUndefined();
  });

  it("restarts the timer on a second click", async () => {
    setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    const { link, status } = setup();
    click(link);
    await vi.advanceTimersByTimeAsync(3000);
    click(link);
    await vi.advanceTimersByTimeAsync(3000);
    expect(status.textContent).toBe(`Copied ${ADDRESS}`);
    await vi.advanceTimersByTimeAsync(1000);
    expect(status.textContent).toBe("");
  });

  it("shows the failure copy when writeText rejects, with no reset", async () => {
    setClipboard({
      writeText: vi
        .fn()
        .mockRejectedValue(new DOMException("blocked", "NotAllowedError")),
    });
    const { link, status, line } = setup();
    click(link);
    await vi.advanceTimersByTimeAsync(COPIED_RESET_MS * 2);
    expect(status.textContent).toBe(
      `Copy didn't work. The address is ${ADDRESS}, select it to copy.`,
    );
    expect(line.dataset.copy).toBe("failed");
  });

  it("shows the failure copy when navigator.clipboard is undefined", () => {
    setClipboard(undefined);
    const { link, status, line } = setup();
    click(link);
    expect(status.textContent).toContain("Copy didn't work");
    expect(line.dataset.copy).toBe("failed");
  });

  it.each([
    ["metaKey", { metaKey: true }],
    ["ctrlKey", { ctrlKey: true }],
    ["shiftKey", { shiftKey: true }],
    ["altKey", { altKey: true }],
    ["middle button", { button: 1 }],
  ])("passes through on %s", (_n, init) => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    const { link } = setup();
    const ev = click(link, init);
    expect(ev.defaultPrevented).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("passes through when already defaultPrevented", () => {
    const writeText = vi.fn();
    setClipboard({ writeText });
    const { link } = setup();
    link.addEventListener("click", (e) => e.preventDefault(), {
      capture: true,
    });
    click(link);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("cleanup removes listener, attributes and status", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    const { link, status, cleanup } = setup();
    click(link);
    await vi.advanceTimersByTimeAsync(0);
    cleanup();
    expect(status.textContent).toBe("");
    expect(link).not.toHaveAttribute("aria-describedby");
    expect(link.dataset.cursorTag).toBeUndefined();
    writeText.mockClear();
    const ev = click(link);
    expect(ev.defaultPrevented).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });
});
