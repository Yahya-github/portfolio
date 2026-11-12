// Pure helpers for scripts/measure-js.mjs: HTML parsing and the lazy-chunk rule (D-08).

const SCRIPT_TAG = /<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>/g;
const PRELOAD_LINK = /<link\b[^>]*rel="(?:preload|modulepreload)"[^>]*>/g;
const CHUNK_PATH = /\/_next\/static\/[^"'\s\\<>()]*?\.js/g;
const MODULE_ID = /\[project\]\/((?:lib|components|app)\/[^\s"'\]]+)/;

/** Initial JS paths of a page: script srcs (minus noModule) plus preload links. */
export function scriptsOf(html) {
  const files = new Set();
  for (const [tag, src] of html.matchAll(SCRIPT_TAG)) {
    if (!/\bnoModule\b/i.test(tag)) files.add(src); // modern browsers skip noModule polyfills
  }
  for (const [link] of html.matchAll(PRELOAD_LINK)) {
    const href = link.match(/href="([^"]+\.js)"/)?.[1];
    if (href) files.add(href);
  }
  return [...files];
}

/** Every chunk path mentioned anywhere in the HTML text (tags, RSC payload, noModule). */
export function referencedChunks(html) {
  return [...new Set(html.match(CHUNK_PATH) ?? [])];
}

/** "projects/x/index.html" -> "/projects/x/". */
export function routeOf(htmlPath) {
  const parts = htmlPath.replaceAll("\\", "/").split("/");
  parts.pop();
  return parts.length === 0 ? "/" : `/${parts.join("/")}/`;
}

/** Chunks that no HTML page references. */
export function lazyChunks(all, referenced) {
  return all.filter((chunk) => !referenced.has(chunk));
}

/** First source module id found in a chunk's text, for readable failures. */
export function moduleHint(text) {
  return text.match(MODULE_ID)?.[1] ?? "unknown";
}
