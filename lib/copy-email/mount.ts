/**
 * Copy-email feature (CONT-07, RESEARCH Pattern 6). A plain left click on the
 * Email line copies the address and shows a polite status; modifier clicks,
 * middle clicks and JS-off visitors keep the native mailto: link. Status text
 * is written with textContent only (T-05-13 precedent, T-06-23) and the only
 * string ever copied is the typed address constant (T-06-22).
 */
import { sayHi } from "@/content/say-hi";
import type { FeatureMount } from "@/lib/features/types";

export const COPIED_RESET_MS = 4000;

const DESCRIPTION_ID = "copy-email-description";

const fill = (template: string, address: string): string =>
  template.replace("{address}", address);

export const mount: FeatureMount = (root) => {
  const link = root.querySelector<HTMLAnchorElement>("a[data-copy-email]");
  const status = root.querySelector<HTMLElement>("[data-copy-status]");
  const line = root.querySelector<HTMLElement>("[data-copy-line]");
  if (!link || !status || !line) return () => {};

  const address = link.dataset.copyEmail ?? "";
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  const reset = () => {
    clearTimer();
    status.textContent = "";
    delete line.dataset.copy;
  };

  link.setAttribute("aria-describedby", DESCRIPTION_ID);
  link.dataset.cursorTag = sayHi.copy.cursorTag;

  const onClick = (e: MouseEvent) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    clearTimer();
    const fail = () => {
      status.textContent = fill(sayHi.copy.failed, address);
      line.dataset.copy = "failed";
    };
    const clipboard = navigator.clipboard as Clipboard | undefined;
    if (!clipboard) return fail();
    clipboard.writeText(address).then(() => {
      status.textContent = fill(sayHi.copy.copied, address);
      line.dataset.copy = "copied";
      clearTimer();
      timer = setTimeout(reset, COPIED_RESET_MS);
    }, fail);
  };

  link.addEventListener("click", onClick);
  return () => {
    link.removeEventListener("click", onClick);
    reset();
    link.removeAttribute("aria-describedby");
    delete link.dataset.cursorTag;
  };
};
