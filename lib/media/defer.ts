/**
 * D-09 on-demand twins: lazy modules call this on first hover, focus or tap.
 * PagerProvider's decodeImages skips img[data-defer] (plan 06-04).
 */
export const DEFER_ATTR = "data-defer";

/** Promotes data-src/data-srcset/data-sizes to real attributes. Returns false when there is nothing to load. */
export function loadDeferred(img: HTMLImageElement): boolean {
  const src = img.getAttribute("data-src");
  if (src === null) return false;
  const srcset = img.getAttribute("data-srcset");
  const sizes = img.getAttribute("data-sizes");
  if (sizes !== null) img.setAttribute("sizes", sizes);
  if (srcset !== null) img.setAttribute("srcset", srcset);
  img.setAttribute("src", src);
  img.removeAttribute("data-src");
  img.removeAttribute("data-srcset");
  img.removeAttribute("data-sizes");
  return true;
}
