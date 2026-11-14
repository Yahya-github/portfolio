// scripts/render-robot-still.mjs: renders the robot viewer's start pose to docs/material/photos/robot-still.png (08-16).
// The still comes from the viewer's own shader, so the still-to-live handoff shows no jump.
// Usage: pnpm model:still [--skip-build]  (local only, never CI; GPU-less hosts use swiftshader WebGL2)
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "@playwright/test";

const OUT = "docs/material/photos/robot-still.png";
const PORT = 4175;
const ROUTE = `http://localhost:${PORT}/projects/robot/`;
const VIEWPORT = { width: 1440, height: 900 };
const SETTLE_MS = 900;
const LIVE_TIMEOUT_MS = 30000;
const SERVER_TIMEOUT_MS = 15000;

function fail(message) {
  throw new Error(`robot-still: ${message}`);
}

async function waitForServer() {
  const deadline = Date.now() + SERVER_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(ROUTE);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  fail(`server on ${PORT} did not start`);
}

if (!process.argv.includes("--skip-build")) {
  execFileSync("pnpm", ["build"], { stdio: "inherit" });
}

const server = spawn(
  "pnpm",
  ["exec", "serve", "out", "-l", String(PORT), "--no-clipboard"],
  { stdio: "ignore" },
);
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--ignore-gpu-blocklist",
    ],
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(ROUTE);
  const figure = page.locator("[data-model]");
  await page.waitForSelector('[data-model-state="live"]', {
    timeout: LIVE_TIMEOUT_MS,
  });
  await figure.focus();
  await page.keyboard.press("Home");
  await page.waitForTimeout(SETTLE_MS);
  const canvas = page.locator("[data-model-slot] canvas");
  await canvas.evaluate((el) => {
    el.scrollIntoView({ block: "center", behavior: "instant" });
  });
  mkdirSync(dirname(OUT), { recursive: true });
  await canvas.screenshot({ path: OUT, animations: "disabled" });
  if (errors.length > 0) fail(errors.join("; "));
  console.log(`robot-still: wrote ${OUT}`);
} finally {
  await browser?.close();
  server.kill();
}
