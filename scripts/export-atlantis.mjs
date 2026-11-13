// Local-only export of the Atlantis fork's `web` branch (never run in CI).
// Usage: pnpm game:export [--fork <dir>] [--godot <binary>]
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { measureBuild, renderBuildModule } from "./lib/atlantis-build.mjs";

const HOME = homedir();
const ROOT = resolve(import.meta.dirname, "..");
// `--variant demo` exports the fork's `web-demo` branch (level 1 only) next to the full build.
const IS_DEMO = process.argv.includes("--variant")
  ? process.argv[process.argv.indexOf("--variant") + 1] === "demo"
  : false;
const SLUG = IS_DEMO ? "atlantis-demo" : "atlantis";
const BRANCH = IS_DEMO ? "web-demo" : "web";
const GAMES_ROOT = join(ROOT, "public", "games");
const GAMES_DIR = join(GAMES_ROOT, SLUG);
const SHELL_DIR = join(ROOT, "godot", "shell");
const MODULE_PATH = join(ROOT, "content", "generated", `${SLUG}-build.ts`);
const TEMPLATE_VERSION = "4.5.1.stable";
const TEMPLATE_ZIP = "web_nothreads_release.zip";
const PRESET = "Web";

function fail(message) {
  console.error(`export-atlantis: ${message}`);
  process.exit(1);
}

function flag(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const fork = resolve(flag("fork", join(HOME, "dev", "forks", "atlantis")));
const godot = resolve(flag("godot", join(HOME, "apps", "godot-4.5.1")));

const git = (...args) =>
  execFileSync("git", args, { cwd: fork, encoding: "utf8" }).trim();

if (git("rev-parse", "--abbrev-ref", "HEAD") !== BRANCH) {
  fail(`the fork must be on branch \`${BRANCH}\`.`);
}
if (git("status", "--porcelain") !== "")
  fail("the fork working tree is dirty.");

const forkShell = join(fork, "web", "play.html");
const portfolioShell = join(SHELL_DIR, "play.html");
if (
  !existsSync(forkShell) ||
  !readFileSync(forkShell).equals(readFileSync(portfolioShell))
) {
  fail("<fork>/web/play.html must be byte-identical to godot/shell/play.html.");
}

const xdg = join(HOME, ".cache", "portfolio-godot", "xdg");
const template = join(
  xdg,
  "data",
  "godot",
  "export_templates",
  TEMPLATE_VERSION,
  TEMPLATE_ZIP,
);
if (!existsSync(template)) {
  fail(
    `missing export template ${template}.\n` +
      "Download Godot_v4.5.1-stable_export_templates.tpz from the 4.5.1-stable release at " +
      "github.com/godotengine/godot-builds into a scratch folder, then run:\n" +
      `  mkdir -p "$(dirname ${template})" && unzip -p <tpz> templates/${TEMPLATE_ZIP} > ${template}\n` +
      "(also copy templates/version.txt next to it if Godot asks).",
  );
}

const version = git("rev-parse", "--short=12", "HEAD");
const outDir = join(GAMES_DIR, version);
if (existsSync(GAMES_DIR)) {
  for (const entry of readdirSync(GAMES_DIR)) {
    if (entry !== version) rmSync(join(GAMES_DIR, entry), { recursive: true });
  }
}
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const env = {
  ...process.env,
  XDG_CONFIG_HOME: join(xdg, "config"),
  XDG_DATA_HOME: join(xdg, "data"),
  XDG_CACHE_HOME: join(xdg, "cache"),
};
for (const dir of [env.XDG_CONFIG_HOME, env.XDG_CACHE_HOME]) {
  mkdirSync(dir, { recursive: true });
}
const run = (args) =>
  execFileSync(godot, ["--headless", "--path", fork, ...args], {
    env,
    stdio: "inherit",
  });

run(["--import"]);
run(["--export-release", PRESET, join(outDir, "play.html")]);
copyFileSync(join(SHELL_DIR, "shell.js"), join(outDir, "shell.js"));

const stray = existsSync(join(ROOT, "public", "games"))
  ? readdirSync(join(ROOT, "public", "games"), { recursive: true }).filter(
      (p) => String(p).endsWith("index.html"),
    )
  : [];
if (stray.length > 0) fail(`index.html must not exist: ${stray.join(", ")}`);

const measured = measureBuild(outDir, version);
const build = {
  ...measured,
  path: `/games/${SLUG}/${version}/play.html`,
};
const moduleSource = renderBuildModule(build);
writeFileSync(
  MODULE_PATH,
  IS_DEMO
    ? moduleSource.replace(
        "export const atlantisBuild",
        "export const atlantisDemoBuild",
      )
    : moduleSource,
);

console.table({
  "wasm raw": build.wasmRaw,
  "wasm gzip -9": build.wasmGzip,
  "wasm brotli q5": build.wasmBrotli5,
  pck: build.pck,
  "js gzip -9": build.jsGzip,
  "total (bytes)": build.totalBytes,
  "total (MB)": build.totalMB,
});
