// scripts/build-robot-mesh.mjs: turns the owner's glTF (or a placeholder) into a quantized, per-vertex-coloured RBT2 file under public/models/robot/<hash>/ and writes content/generated/robot-model.ts (D-15, D-16).
// Parts are simplified one by one at one shared triangle density: small parts keep their triangles, dense parts shrink most, tiny parts are dropped.
// Usage: pnpm model:build -- --placeholder | --input <path> [--target <tris> --max-raw-kb <kB> --min-part <tris> --exponent <p>]   (dev only, never CI; gltf-transform and meshoptimizer stay in devDependencies)
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { encodeMesh, placeholderMesh } from "./lib/robot-mesh.mjs";

const OUT_ROOT = "public/models/robot";
const MODULE = "content/generated/robot-model.ts";
const DEFAULT_INPUTS = ["docs/material/robot.glb", "docs/material/robot.gltf"];
const BYTES_PER_KB = 1024;
const HASH_CHARS = 12;
const GZIP_LEVEL = 9;
const MAX_SIMPLIFY_PASSES = 30;
const SIMPLIFY_ERROR = 1;
const RATIO_STEP = 0.93;
const TRIANGLES_MODE = 4;
const MAX_PALETTE = 64;
const DEFAULT_COLOR = [0.6, 0.6, 0.6, 1];
const MAX_U16_VERTICES = 65536;
const HEADER_BYTES_ESTIMATE = 40 + 192;
const DEFAULT_MIN_PART_TRIANGLES = 8;
const DEFAULT_EXPONENT = 1;

const DEFAULT_TARGET_TRIANGLES = 46000;
const DEFAULT_MAX_RAW_KB = 700;
const MAX_TRIANGLES_FACTOR = 1.25;

const fail = (message) => {
  console.error(`model:build: ${message}`);
  process.exit(1);
};

const args = process.argv.slice(2);
const isPlaceholder = args.includes("--placeholder");
const inputIdx = args.indexOf("--input");
const inputArg = inputIdx === -1 ? null : args[inputIdx + 1];
if (inputIdx !== -1 && !inputArg) fail("--input needs a path");
function numberArg(name, fallback) {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const n = Number(args[i + 1]);
  if (!Number.isFinite(n) || n <= 0) fail(`${name} needs a positive number`);
  return n;
}
const TARGET_TRIANGLES = numberArg("--target", DEFAULT_TARGET_TRIANGLES);
const MAX_RAW_KB = numberArg("--max-raw-kb", DEFAULT_MAX_RAW_KB);
const DENSITY_EXPONENT = numberArg("--exponent", DEFAULT_EXPONENT);
const MIN_PART_TRIANGLES = numberArg("--min-part", DEFAULT_MIN_PART_TRIANGLES);
const MAX_TRIANGLES = Math.round(TARGET_TRIANGLES * MAX_TRIANGLES_FACTOR);

/** Angle-weighted vertex normals for an indexed triangle list. */
function computeNormals(positions, indices) {
  const normals = new Float32Array(positions.length);
  const at = (i) => [
    positions[i * 3],
    positions[i * 3 + 1],
    positions[i * 3 + 2],
  ];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  for (let t = 0; t < indices.length; t += 3) {
    const ids = [indices[t], indices[t + 1], indices[t + 2]];
    const p = ids.map(at);
    const face = cross(sub(p[1], p[0]), sub(p[2], p[0]));
    const faceLen = len(face);
    if (faceLen === 0) continue;
    for (let k = 0; k < 3; k++) {
      const e1 = sub(p[(k + 1) % 3], p[k]);
      const e2 = sub(p[(k + 2) % 3], p[k]);
      const denom = len(e1) * len(e2);
      if (denom === 0) continue;
      const dot = (e1[0] * e2[0] + e1[1] * e2[1] + e1[2] * e2[2]) / denom;
      const angle = Math.acos(Math.min(1, Math.max(-1, dot)));
      for (let a = 0; a < 3; a++) {
        normals[ids[k] * 3 + a] += (face[a] / faceLen) * angle;
      }
    }
  }
  for (let i = 0; i < normals.length; i += 3) {
    const l = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    for (let a = 0; a < 3; a++) normals[i + a] /= l;
  }
  return normals;
}

const srgbByte = (linear) => {
  const c = Math.min(1, Math.max(0, linear));
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(v * 255);
};

/** Palette index per distinct baseColorFactor (glTF linear to sRGB bytes); textures are ignored. */
function paletteFor(prim, palette, lookup) {
  const factor = prim.getMaterial()?.getBaseColorFactor() ?? DEFAULT_COLOR;
  const rgb = [0, 1, 2].map((i) => srgbByte(factor[i]));
  const key = rgb.join(",");
  if (!lookup.has(key)) {
    lookup.set(key, palette.length / 3);
    palette.push(...rgb);
  }
  return lookup.get(key);
}

/** Bounding-box diagonal of a flat xyz array. */
function diagonal(positions) {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      lo[a] = Math.min(lo[a], positions[i + a]);
      hi[a] = Math.max(hi[a], positions[i + a]);
    }
  }
  return Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
}

/** Every distinct primitive (a part) once, with the matrices of the nodes that instance it. */
function collectParts(root) {
  const palette = [];
  const lookup = new Map();
  const parts = new Map();
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const m = node.getWorldMatrix();
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== TRIANGLES_MODE) continue;
      const pAcc = prim.getAttribute("POSITION");
      const iAcc = prim.getIndices();
      if (!pAcc || !iAcc) continue;
      let part = parts.get(prim);
      if (!part) {
        part = {
          colour: paletteFor(prim, palette, lookup),
          positions: Float32Array.from(pAcc.getArray()),
          indices: Uint32Array.from(iAcc.getArray()),
          extent: 0,
          matrices: [],
        };
        parts.set(prim, part);
      }
      if (part.matrices.length === 0) {
        part.extent = diagonal(part.positions) * Math.hypot(m[0], m[1], m[2]);
      }
      part.matrices.push(m);
    }
  }
  if (parts.size === 0) fail("the glTF has no triangle geometry");
  if (palette.length / 3 > MAX_PALETTE) {
    fail(
      `${palette.length / 3} distinct colours, over the ${MAX_PALETTE} palette limit`,
    );
  }
  return { palette: Uint8Array.from(palette), parts: [...parts.values()] };
}

/**
 * Triangle goal for one part at a given density (triangles per metre of part extent ** DENSITY_EXPONENT, 2 = equal area density, lower favours small parts).
 * Parts already sparser than the density stay untouched; parts that would get fewer than
 * MIN_PART_TRIANGLES are dropped (screws and washers far below visible size).
 */
function goalFor(part, density) {
  const tris = part.indices.length / 3;
  const goal = density * part.extent ** DENSITY_EXPONENT;
  if (goal >= tris) return tris;
  return goal < MIN_PART_TRIANGLES ? 0 : Math.round(goal);
}

/** One density for the whole robot so the instanced total hits the target. */
function solveDensity(parts, target) {
  const total = (d) =>
    parts.reduce((n, p) => n + p.matrices.length * goalFor(p, d), 0);
  let lo = 0;
  let hi = 1e9;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (total(mid) > target) hi = mid;
    else lo = mid;
  }
  return lo;
}

/** Drop unused vertices and renumber. */
function compact(positions, indices) {
  const remap = new Map();
  const outPos = [];
  const outIdx = new Uint32Array(indices.length);
  for (let i = 0; i < indices.length; i++) {
    const old = indices[i];
    let id = remap.get(old);
    if (id === undefined) {
      id = outPos.length / 3;
      remap.set(old, id);
      outPos.push(
        positions[old * 3],
        positions[old * 3 + 1],
        positions[old * 3 + 2],
      );
    }
    outIdx[i] = id;
  }
  return { positions: Float32Array.from(outPos), indices: outIdx };
}

/** Raw RBT2 size for the instanced parts: 12 bytes per vertex plus 2 or 4 bytes per index. */
function estimateBytes(parts, tris) {
  const vertices = parts.reduce(
    (n, p) => n + p.matrices.length * (p.positions.length / 3),
    0,
  );
  const indexBytes = vertices <= MAX_U16_VERTICES ? 2 : 4;
  return HEADER_BYTES_ESTIMATE + 12 * vertices + indexBytes * 3 * tris;
}

/**
 * Simplify each part on its own: every part gets the same triangle density, so
 * small parts keep their original triangles, dense parts are reduced most, and
 * parts too small to see are dropped. Meshopt error is relative to the part.
 */
function simplifyParts(parts, simplifier) {
  let target = TARGET_TRIANGLES;
  for (let attempt = 0; attempt < MAX_SIMPLIFY_PASSES; attempt++) {
    const density = solveDensity(parts, target);
    const stats = { untouched: 0, reduced: 0, culled: 0, culledParts: 0 };
    const out = [];
    for (const p of parts) {
      const tris = p.indices.length / 3;
      const goal = goalFor(p, density);
      const k = p.matrices.length;
      if (goal === 0) {
        stats.culled += k * tris;
        stats.culledParts += k;
        continue;
      }
      if (goal >= tris) {
        stats.untouched += k * tris;
        out.push({ ...p, ...compact(p.positions, p.indices) });
        continue;
      }
      const [simplified] = simplifier.simplify(
        p.indices,
        p.positions,
        3,
        goal * 3,
        SIMPLIFY_ERROR,
        [],
      );
      const part = { ...p, ...compact(p.positions, simplified) };
      stats.reduced += (k * part.indices.length) / 3;
      out.push(part);
    }
    const tris = stats.untouched + stats.reduced;
    const bytes = estimateBytes(out, tris);
    console.log(
      `simplify pass ${attempt}: ${tris} triangles (${stats.untouched} from untouched parts, ${stats.reduced} from reduced parts; dropped ${stats.culledParts} tiny part instances = ${stats.culled} source triangles), density ${density.toFixed(0)}, about ${(bytes / BYTES_PER_KB).toFixed(0)} kB raw`,
    );
    if (tris <= MAX_TRIANGLES && bytes <= MAX_RAW_KB * BYTES_PER_KB) return out;
    target *= RATIO_STEP;
  }
  fail(`could not simplify below ${MAX_TRIANGLES} triangles`);
}

/** Bake instance matrices, compute normals per part, and join into one buffer set. */
function joinParts(parts) {
  const geoms = [];
  for (const part of parts) {
    for (const m of part.matrices) {
      const pos = new Float32Array(part.positions.length);
      for (let v = 0; v < pos.length; v += 3) {
        const x = part.positions[v];
        const y = part.positions[v + 1];
        const z = part.positions[v + 2];
        pos[v] = m[0] * x + m[4] * y + m[8] * z + m[12];
        pos[v + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
        pos[v + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      }
      geoms.push({ pos, idx: part.indices, colour: part.colour });
    }
  }
  const verts = geoms.reduce((n, g) => n + g.pos.length / 3, 0);
  const indexCount = geoms.reduce((n, g) => n + g.idx.length, 0);
  const positions = new Float32Array(verts * 3);
  const normals = new Float32Array(verts * 3);
  const colors = new Uint8Array(verts);
  const indices = new Uint32Array(indexCount);
  let vOff = 0;
  let iOff = 0;
  for (const g of geoms) {
    const count = g.pos.length / 3;
    positions.set(g.pos, vOff * 3);
    normals.set(computeNormals(g.pos, g.idx), vOff * 3);
    colors.fill(g.colour, vOff, vOff + count);
    for (let i = 0; i < g.idx.length; i++) indices[iOff + i] = g.idx[i] + vOff;
    vOff += count;
    iOff += g.idx.length;
  }
  return { positions, normals, indices, colors };
}

async function loadGltfMesh(path) {
  const { NodeIO } = await import("@gltf-transform/core");
  const { ALL_EXTENSIONS } = await import("@gltf-transform/extensions");
  const { weld } = await import("@gltf-transform/functions");
  const { MeshoptSimplifier } = await import("meshoptimizer");
  await MeshoptSimplifier.ready;

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(path);
  const root = doc.getRoot();
  // Only POSITION is kept (normals are recomputed below; other attributes differ
  // at hard edges and stop the simplifier). Materials stay: their baseColorFactor
  // becomes the per-vertex colour.
  for (const meshNode of root.listMeshes()) {
    for (const prim of meshNode.listPrimitives()) {
      for (const semantic of prim.listSemantics()) {
        if (semantic !== "POSITION") prim.setAttribute(semantic, null);
      }
    }
  }
  await doc.transform(weld());
  const { palette, parts } = collectParts(root);
  const simplified = simplifyParts(parts, MeshoptSimplifier);
  return { ...joinParts(simplified), palette };
}

async function resolveMesh() {
  if (isPlaceholder) return { mesh: placeholderMesh(), placeholder: true };
  const input = inputArg ?? DEFAULT_INPUTS.find((p) => existsSync(p));
  if (!input || !existsSync(input)) {
    fail(
      `no glTF found (looked for ${inputArg ?? DEFAULT_INPUTS.join(", ")}); pass --input <path> or --placeholder`,
    );
  }
  return { mesh: await loadGltfMesh(input), placeholder: false };
}

const { mesh, placeholder } = await resolveMesh();
const bytes = encodeMesh(mesh);
const version = createHash("sha256")
  .update(bytes)
  .digest("hex")
  .slice(0, HASH_CHARS);
const triangles = mesh.indices.length / 3;
const vertices = mesh.positions.length / 3;
const gzipBytes = gzipSync(bytes, { level: GZIP_LEVEL }).length;

if (bytes.length > MAX_RAW_KB * BYTES_PER_KB) {
  fail(
    `robot.bin is ${(bytes.length / BYTES_PER_KB).toFixed(1)} kB raw, over the ${MAX_RAW_KB} kB gate`,
  );
}

mkdirSync(OUT_ROOT, { recursive: true });
for (const dir of readdirSync(OUT_ROOT)) {
  if (dir !== version)
    rmSync(join(OUT_ROOT, dir), { recursive: true, force: true });
}
mkdirSync(join(OUT_ROOT, version), { recursive: true });
writeFileSync(join(OUT_ROOT, version, "robot.bin"), bytes);

writeFileSync(
  MODULE,
  `// GENERATED by scripts/build-robot-mesh.mjs (pnpm model:build). Do not edit by hand.
import type { RobotModel } from "@/content/types";

export const robotModel: RobotModel | null = {
  version: "${version}",
  src: "/models/robot/${version}/robot.bin",
  placeholder: ${placeholder},
  triangles: ${triangles},
  vertices: ${vertices},
  bytes: ${bytes.length},
  gzipBytes: ${gzipBytes},
};
`,
);

console.log(
  `robot model ${version}${placeholder ? " (placeholder)" : ""}: ${triangles} triangles, ${vertices} vertices, ${bytes.length} B raw, ${gzipBytes} B gzip`,
);
