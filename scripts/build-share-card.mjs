// scripts/build-share-card.mjs: renders scripts/share-card/card.html to public/share-card.png, 1200x630 (D-04..D-06).
// Usage: pnpm card:build (local only, never CI)
import { statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const TEMPLATE = "scripts/share-card/card.html";
const OUT = "public/share-card.png";
const CSS_WIDTH = 600;
const CSS_HEIGHT = 315;
const DPR = 2;
const MAX_YAHYA_WIDTH = 552;
const MIN_GAP = 32;
const MAX_BYTES = 300 * 1024;

function fail(message) {
  throw new Error(`share-card: ${message}`);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: CSS_WIDTH, height: CSS_HEIGHT },
    deviceScaleFactor: DPR,
  });
  const problems = [];
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  page.on("requestfailed", (r) => problems.push(`request failed: ${r.url()}`));
  page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));

  await page.goto(pathToFileURL(TEMPLATE).href);
  await page.evaluate(() => document.fonts.ready);

  const report = await page.evaluate(() => {
    const yahya = document.querySelector(".yahya").getBoundingClientRect();
    const row = document.querySelector(".row").getBoundingClientRect();
    return {
      statuses: [...document.fonts].map((f) => f.status),
      fontOk: document.fonts.check('700 252px "Instrument Sans"'),
      yahyaWidth: yahya.width,
      gap: row.top - yahya.bottom,
    };
  });

  if (report.statuses.length === 0) fail("no font faces registered");
  if (!report.statuses.every((s) => s === "loaded")) {
    fail(`fonts not loaded: ${report.statuses.join(",")}`);
  }
  if (!report.fontOk) fail("Instrument Sans 700 not available");
  if (report.yahyaWidth > MAX_YAHYA_WIDTH) {
    fail(`YAHYA is ${report.yahyaWidth}px wide, max ${MAX_YAHYA_WIDTH}`);
  }
  if (report.gap < MIN_GAP) fail(`gap ${report.gap}px, min ${MIN_GAP}`);
  if (problems.length > 0) fail(problems.join("; "));

  await page.screenshot({ path: OUT });
  console.log(
    `share-card: YAHYA width ${report.yahyaWidth}px, gap ${report.gap}px`,
  );
} finally {
  await browser.close();
}

const meta = await sharp(OUT).metadata();
if (meta.format !== "png") fail(`format ${meta.format}`);
if (meta.width !== CSS_WIDTH * DPR || meta.height !== CSS_HEIGHT * DPR) {
  fail(`size ${meta.width}x${meta.height}, expected 1200x630`);
}
const bytes = statSync(OUT).size;
if (bytes >= MAX_BYTES) fail(`${bytes} bytes, limit ${MAX_BYTES}`);
console.log(`share-card: wrote ${OUT} (${bytes} bytes)`);
