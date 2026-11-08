// scripts/measure-js.mjs: baseline JS for "/" (gzip -9 + brotli q11), with an optional --max-gzip-kb gate.
// Usage: node scripts/measure-js.mjs out [--max-gzip-kb 150]
import { readFileSync } from "node:fs";
import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import { join } from "node:path";

const GZIP_LEVEL = 9;
const BROTLI_QUALITY = 11;
const BYTES_PER_KB = 1024;

const args = process.argv.slice(2);
const maxIdx = args.indexOf("--max-gzip-kb");
const maxGzipKb = maxIdx === -1 ? null : Number(args[maxIdx + 1]);
const outDir =
  args.find(
    (a, i) => !a.startsWith("--") && (maxIdx === -1 || i !== maxIdx + 1),
  ) ?? "out";

if (maxGzipKb !== null && !Number.isFinite(maxGzipKb)) {
  console.error("--max-gzip-kb needs a number");
  process.exit(2);
}

const html = readFileSync(join(outDir, "index.html"), "utf8");
const files = new Set();
for (const [tag, src] of html.matchAll(
  /<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>/g,
)) {
  if (!/\bnoModule\b/i.test(tag)) files.add(src); // modern browsers skip noModule polyfills
}
for (const [link] of html.matchAll(
  /<link\b[^>]*rel="(?:preload|modulepreload)"[^>]*>/g,
)) {
  const href = link.match(/href="([^"]+\.js)"/)?.[1];
  if (href) files.add(href);
}

const totals = [...files].reduce(
  (acc, src) => {
    const buf = readFileSync(join(outDir, src.replace(/^\//, "")));
    return {
      raw: acc.raw + buf.length,
      gzip: acc.gzip + gzipSync(buf, { level: GZIP_LEVEL }).length,
      brotli:
        acc.brotli +
        brotliCompressSync(buf, {
          params: { [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY },
        }).length,
    };
  },
  { raw: 0, gzip: 0, brotli: 0 },
);

const kb = (n) => Number((n / BYTES_PER_KB).toFixed(1));
const result = {
  route: "/",
  files: files.size,
  rawKB: kb(totals.raw),
  gzipKB: kb(totals.gzip),
  brotliKB: kb(totals.brotli),
};
console.log(JSON.stringify(result));

if (maxGzipKb !== null && result.gzipKB > maxGzipKb) {
  console.error(
    `JS budget exceeded: ${result.gzipKB} kB gzip > ${maxGzipKb} kB`,
  );
  process.exit(1);
}
