// scripts/measure-js.mjs: initial JS per exported route and every lazy chunk (gzip -9 + brotli q11), with --max-gzip-kb (per route) and --max-chunk-kb (per lazy chunk) gates (D-08).
// Usage: node scripts/measure-js.mjs out [--max-gzip-kb 150] [--max-chunk-kb 12]
import { readFileSync, readdirSync } from "node:fs";
import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import { join } from "node:path";
import {
  lazyChunks,
  moduleHint,
  referencedChunks,
  routeOf,
  scriptsOf,
} from "./lib/measure.mjs";

const GZIP_LEVEL = 9;
const BROTLI_QUALITY = 11;
const BYTES_PER_KB = 1024;
const CHUNK_DIR = "_next/static/chunks";

const args = process.argv.slice(2);

const flagValue = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return { idx, value: null };
  const value = Number(args[idx + 1]);
  if (!Number.isFinite(value)) {
    console.error(`${name} needs a number`);
    process.exit(2);
  }
  return { idx, value };
};

const maxGzip = flagValue("--max-gzip-kb");
const maxChunk = flagValue("--max-chunk-kb");
const valueIdx = new Set([maxGzip.idx + 1, maxChunk.idx + 1]);
const outDir =
  args.find((a, i) => !a.startsWith("--") && !valueIdx.has(i)) ?? "out";

const kb = (n) => Number((n / BYTES_PER_KB).toFixed(1));
const gzipLen = (buf) => gzipSync(buf, { level: GZIP_LEVEL }).length;
const brotliLen = (buf) =>
  brotliCompressSync(buf, {
    params: { [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY },
  }).length;

const listFiles = (dir, suffix) =>
  readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith(suffix))
    .map((name) => name.split("\\").join("/"))
    .sort();

const readText = (rel) => readFileSync(join(outDir, rel), "utf8");
const failures = [];

// Initial JS per route.
const routeRows = listFiles(outDir, "index.html").map((file) => {
  const srcs = scriptsOf(readText(file));
  const bufs = srcs.map((src) =>
    readFileSync(join(outDir, src.replace(/^\//, ""))),
  );
  return {
    route: routeOf(file),
    files: srcs.length,
    rawKB: kb(bufs.reduce((n, b) => n + b.length, 0)),
    gzipKB: kb(bufs.reduce((n, b) => n + gzipLen(b), 0)),
    brotliKB: kb(bufs.reduce((n, b) => n + brotliLen(b), 0)),
  };
});
for (const row of routeRows.sort((a, b) => a.route.localeCompare(b.route))) {
  console.log(JSON.stringify(row));
  if (maxGzip.value !== null && row.gzipKB > maxGzip.value) {
    failures.push(
      `JS budget exceeded on ${row.route}: ${row.gzipKB} kB gzip > ${maxGzip.value} kB`,
    );
  }
}

// Lazy chunks: in the chunk dir but referenced by no HTML page.
const referenced = new Set(
  listFiles(outDir, ".html").flatMap((file) =>
    referencedChunks(readText(file)),
  ),
);
const allChunks = listFiles(join(outDir, CHUNK_DIR), ".js").map(
  (rel) => `/${CHUNK_DIR}/${rel}`,
);
for (const chunk of lazyChunks(allChunks, referenced)) {
  const buf = readFileSync(join(outDir, chunk.replace(/^\//, "")));
  const row = {
    chunk,
    module: moduleHint(buf.toString("utf8")),
    gzipKB: kb(gzipLen(buf)),
    brotliKB: kb(brotliLen(buf)),
  };
  console.log(JSON.stringify(row));
  if (maxChunk.value !== null && row.gzipKB > maxChunk.value) {
    failures.push(
      `Lazy chunk over budget: ${chunk} (${row.module}) ${row.gzipKB} kB gzip > ${maxChunk.value} kB`,
    );
  }
}

if (failures.length > 0) {
  for (const f of failures) console.error(f);
  process.exit(1);
}
