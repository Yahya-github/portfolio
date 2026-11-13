// scripts/capture-atlantis.mjs: captures real Atlantis frames (colour + greyscale twins) and, with --timing,
// measures cold and warm boot under a throttled network. Local only, never CI.
// Usage: node scripts/capture-atlantis.mjs [--timing]
import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const PORT = 4174;
const ORIGIN = `http://localhost:${PORT}`;
const VIEWPORT = { width: 1280, height: 720 };
const SHOT_DIR = "docs/material/screenshots";
const BOOT_TIMEOUT_MS = 120_000;
const TITLE_SETTLE_MS = 3000;
const LEVEL_SETTLE_MS = 6000;
const INVENTORY_SETTLE_MS = 1000;
// Named so they are easy to retune after looking at atlantis-01.png.
const PLAY_BUTTON = { x: 885, y: 345 };
const INVENTORY_KEY = "Tab";
const THROTTLE = {
  offline: false,
  downloadThroughput: 25e6 / 8,
  uploadThroughput: 5e6 / 8,
  latency: 20,
};

const version = readdirSync("public/games/atlantis")[0];
const PLAY_URL = `${ORIGIN}/games/atlantis/${version}/play.html`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitReady(page) {
  await page.waitForFunction(() => window.__ready === true, null, {
    timeout: BOOT_TIMEOUT_MS,
    polling: 250,
  });
}

async function watch(context) {
  await context.addInitScript(() => {
    window.__ready = false;
    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === "ready") window.__ready = true;
    });
  });
}

async function save(page, name) {
  const colour = `${SHOT_DIR}/${name}.png`;
  await page.screenshot({ path: colour });
  await sharp(colour).greyscale().toFile(`${SHOT_DIR}/${name}-grey.png`);
  console.log(`saved ${colour} (+ grey twin)`);
}

async function capture(browser) {
  const context = await browser.newContext({ viewport: VIEWPORT });
  await watch(context);
  const page = await context.newPage();
  await page.goto(PLAY_URL);
  await waitReady(page);
  await sleep(TITLE_SETTLE_MS);
  await save(page, "atlantis-01");
  await page.mouse.click(PLAY_BUTTON.x, PLAY_BUTTON.y);
  await sleep(LEVEL_SETTLE_MS);
  await save(page, "atlantis-02");
  await page.keyboard.press(INVENTORY_KEY);
  await sleep(INVENTORY_SETTLE_MS);
  await save(page, "atlantis-03");
  await context.close();
}

async function timing(browser) {
  const context = await browser.newContext({ viewport: VIEWPORT });
  await watch(context);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", THROTTLE);
  let bytes = 0;
  const encodings = {};
  cdp.on("Network.loadingFinished", (e) => {
    bytes += e.encodedDataLength;
  });
  page.on("response", (r) => {
    if (/play\.(wasm|pck|js)$/.test(r.url())) {
      encodings[r.url().split("/").pop()] =
        r.headers()["content-encoding"] ?? "identity";
    }
  });
  const t0 = Date.now();
  await page.goto(PLAY_URL);
  await waitReady(page);
  const cold = Date.now() - t0;
  console.log(`cold ms=${cold} transferredBytes=${bytes}`);
  console.log(`content-encoding: ${JSON.stringify(encodings)}`);

  await cdp.send("Network.setCacheDisabled", { cacheDisabled: false });
  await page.evaluate(() => {
    window.__ready = false;
  });
  const t1 = Date.now();
  await page.reload();
  await waitReady(page);
  console.log(`warm ms=${Date.now() - t1}`);
  await context.close();
}

const server = spawn(
  "pnpm",
  ["exec", "serve", "public", "-l", String(PORT), "--no-clipboard"],
  { stdio: "ignore" },
);
try {
  await sleep(2000);
  const browser = await chromium.launch();
  try {
    if (process.argv.includes("--timing")) await timing(browser);
    else await capture(browser);
  } finally {
    await browser.close();
  }
} finally {
  server.kill();
}
