// scripts/build-media.mjs: converts docs/material sources into sized WebP under public/media and writes lib/media/manifest.ts (D-09).
// Usage: pnpm media:build (local only, never CI)
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import sharp from "sharp";

const SRC = "docs/material";
const OUT = "public/media";
const MANIFEST = "lib/media/manifest.ts";
const MARK_SVG_HEIGHT = 96;
const MAX_FILE_KB = 150;
const BYTES_PER_KB = 1024;
const WEBP_EFFORT = 6;

const ACHIEVEMENT_NAMES = [
  "club-of-the-year-award",
  "crc-2026-trophies",
  "diro-hackathon-2026-award",
  "game-competition-2026-team",
];
const PROJECT_PAGE_PHOTOS = ["crc-2026-trophies", "game-competition-2026-team"];
const FACTURO_FRAMES = [
  "01-accueil",
  "02-historique",
  "03-nouvelle-facture",
  "04-paiements",
  "05-parametres",
  "06-palette",
  "07-accueil-sombre",
  "08-menu-reduit",
  "09-mobile",
  "10-clients",
];
const ATLANTIS_FRAMES = ["01", "02", "03"];
const PNG_MARKS = ["gdg", "icpc", "mame", "mcgill-robotics", "mercor"];
const SVG_MARKS = ["crc", "facturo"];

/** @type {{key:string,input:string,widths?:(number|"native")[],quality?:number,lossless?:boolean,svg?:boolean}[]} */
const JOBS = [];
for (const n of ACHIEVEMENT_NAMES) {
  JOBS.push({
    key: `achievements/${n}-grey`,
    input: `photos/${n}-grey.jpg`,
    widths: [320],
    quality: 78,
  });
  JOBS.push({
    key: `achievements/${n}`,
    input: `photos/${n}.jpg`,
    // the two project-page photos (team, trophies) also render in colour at 25vw on desktop
    widths: PROJECT_PAGE_PHOTOS.includes(n) ? [480, 960] : [480],
    quality: 78,
  });
}
JOBS.push({
  key: "mame/mame-05-admin-overview-grey",
  input: "screenshots/mame-05-admin-overview-grey.jpg",
  widths: [320],
  quality: 82,
});
JOBS.push({
  key: "mame/mame-05-admin-overview",
  input: "screenshots/mame-05-admin-overview.jpg",
  widths: [480],
  quality: 82,
});
for (const f of FACTURO_FRAMES) {
  const widths = f === "09-mobile" ? [390] : [960, 1440];
  JOBS.push({
    key: `facturo/facturo-${f}-grey`,
    input: `screenshots/facturo-${f}-grey.png`,
    widths,
    quality: 82,
  });
  JOBS.push({
    key: `facturo/facturo-${f}`,
    input: `screenshots/facturo-${f}.png`,
    widths,
    quality: 82,
  });
}
for (const n of ATLANTIS_FRAMES) {
  for (const suffix of ["-grey", ""]) {
    JOBS.push({
      key: `atlantis/atlantis-${n}${suffix}`,
      input: `screenshots/atlantis-${n}${suffix}.png`,
      widths: [960, 1280],
      quality: 82,
    });
  }
}
// rendered by scripts/render-robot-still.mjs (pnpm model:still) from the viewer's own start pose
JOBS.push({
  key: "robot/robot-still-grey",
  input: "photos/robot-still.png",
  widths: [960, "native"],
  quality: 82,
});
for (const t of ["grey", "color"]) {
  JOBS.push({
    key: `portrait/portrait-devfest-2026-${t}`,
    input: `portrait-devfest-2026-${t}.jpg`,
    widths: [800, 1200, 1512],
    quality: 70,
  });
}
for (const n of PNG_MARKS) {
  JOBS.push({
    key: `marks/${n}-mark`,
    input: `logos/${n}-mark.png`,
    widths: ["native"],
    lossless: true,
  });
  JOBS.push({
    key: `marks/${n}-mark-mono`,
    input: `logos/${n}-mark-mono.png`,
    widths: ["native"],
    lossless: true,
  });
}
for (const n of SVG_MARKS) {
  JOBS.push({
    key: `marks/${n}-mark`,
    input: `logos/${n}-mark.svg`,
    svg: true,
  });
  JOBS.push({
    key: `marks/${n}-mark-mono`,
    input: `logos/${n}-mark-mono.svg`,
    svg: true,
  });
}
JOBS.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function buildRaster(job, input, group, name, produced) {
  const variants = [];
  for (const requested of job.widths) {
    const width =
      requested === "native"
        ? (await sharp(input).metadata()).width
        : requested;
    const out = `${OUT}/${group}/${name}-${width}.webp`;
    produced.add(out);
    mkdirSync(dirname(out), { recursive: true });
    const info = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp(
        job.lossless
          ? { lossless: true }
          : { quality: job.quality, effort: WEBP_EFFORT },
      )
      .toFile(out);
    const kb = statSync(out).size / BYTES_PER_KB;
    if (kb > MAX_FILE_KB) fail(`over budget: ${out} ${kb.toFixed(1)}`);
    variants.push({
      src: `/media/${group}/${name}-${info.width}.webp`,
      width: info.width,
      height: info.height,
    });
  }
  return variants;
}

function buildSvg(input, group, name, produced) {
  const out = `${OUT}/${group}/${name}.svg`;
  produced.add(out);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(input, out);
  const match = /viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/.exec(
    readFileSync(input, "utf8"),
  );
  if (!match) fail(`no viewBox: ${input}`);
  const [w, h] = [Number(match[1]), Number(match[2])];
  return [
    {
      src: `/media/${group}/${name}.svg`,
      width: Math.round((w / h) * MARK_SVG_HEIGHT),
      height: MARK_SVG_HEIGHT,
    },
  ];
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .map((f) => join(dir, f))
    .filter((f) => statSync(f).isFile());
}

const produced = new Set();
const manifest = {};
for (const job of JOBS) {
  const input = join(SRC, job.input);
  if (!existsSync(input)) fail("missing source: " + input);
  const [group, ...rest] = job.key.split("/");
  const name = rest.join("/");
  const variants = job.svg
    ? buildSvg(input, group, name, produced)
    : await buildRaster(job, input, group, name, produced);
  manifest[job.key] = variants.sort((a, b) => a.width - b.width);
}

for (const file of listFiles(OUT)) {
  if (!produced.has(file.split("\\").join("/"))) rmSync(file);
}

const body = JSON.stringify(manifest, null, 2);
writeFileSync(
  MANIFEST,
  `// GENERATED by scripts/build-media.mjs (pnpm media:build). Do not edit by hand.
import type { MediaVariant } from "./types";

export const media = ${body} as const satisfies Readonly<
  Record<string, readonly MediaVariant[]>
>;

export type MediaKey = keyof typeof media;
`,
);
execFileSync("pnpm", ["exec", "prettier", "--write", MANIFEST], {
  stdio: "inherit",
});
console.log(
  `media: ${produced.size} files, ${Object.keys(manifest).length} keys`,
);
