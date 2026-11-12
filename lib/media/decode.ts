/** Deferred twins and later walkthrough frames opt out with data-defer. */
export const DECODE_SELECTOR = "img:not([data-defer])";

/**
 * Pitfall 13: target page images decode before they slide into view.
 * Phase 6 Pitfall 1: deferred twins and later frames stay lazy.
 */
export function decodeImages(page: HTMLElement | null): void {
  if (!page) return;
  for (const img of Array.from(
    page.querySelectorAll<HTMLImageElement>(DECODE_SELECTOR),
  )) {
    img.loading = "eager";
    img.decode?.().catch(() => {});
  }
}
