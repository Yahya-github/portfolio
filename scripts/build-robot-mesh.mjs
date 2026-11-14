// scripts/build-robot-mesh.mjs: turns the owner's glTF (or a placeholder) into a quantized RBT1 file under public/models/robot/<hash>/ and writes content/generated/robot-model.ts (D-15, D-16).
// Usage: pnpm model:build -- --placeholder | --input <path>   (dev only, never CI; gltf-transform and meshoptimizer stay in devDependencies)
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

const MAX_TRIANGLES = 60000;
const TARGET_TRIANGLES = 48000;
const MAX_RAW_KB = 700;
const OUT_ROOT = "public/models/robot";
const MODULE = "content/generated/robot-model.ts";
const DEFAULT_INPUTS = ["docs/material/robot.glb", "docs/material/robot.gltf"];
const BYTES_PER_KB = 1024;
const HASH_CHARS = 12;
const GZIP_LEVEL = 9;
const MAX_SIMPLIFY_PASSES = 30;
const SIMPLIFY_ERROR = 0.001;
const RATIO_STEP = 0.85;
const ERROR_GROWTH = 1.35;
const TRIANGLES_MODE = 4;

const fail = (message) => {
  console.error(`model:build: ${message}`);
  process.exit(1);
};

const args = process.argv.slice(2);
const isPlaceholder = args.includes("--placeholder");
const inputIdx = args.indexOf("--input");
const inputArg = inputIdx === -1 ? null : args[inputIdx + 1];
if (inputIdx !== -1 && !inputArg) fail("--input needs a path");

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

const triangleCount = (root) =>
  root
    .listMeshes()
    .flatMap((m) => m.listPrimitives())
    .reduce((n, p) => n + (p.getIndices()?.getCount() ?? 0) / 3, 0);

/** Gather world-space geometry from every remaining primitive into one buffer. */
function gather(root) {
  const pos = [];
  const nor = [];
  const idx = [];
  let base = 0;
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const m = node.getWorldMatrix();
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== TRIANGLES_MODE) continue;
      const pAcc = prim.getAttribute("POSITION");
      const iAcc = prim.getIndices();
      if (!pAcc || !iAcc) continue;
      const p = pAcc.getArray();
      const local = Uint32Array.from(iAcc.getArray());
      const nAcc = prim.getAttribute("NORMAL");
      const n = nAcc ? nAcc.getArray() : computeNormals(p, local);
      const count = p.length / 3;
      for (let v = 0; v < count; v++) {
        const x = p[v * 3];
        const y = p[v * 3 + 1];
        const z = p[v * 3 + 2];
        pos.push(
          m[0] * x + m[4] * y + m[8] * z + m[12],
          m[1] * x + m[5] * y + m[9] * z + m[13],
          m[2] * x + m[6] * y + m[10] * z + m[14],
        );
        const nx = n[v * 3];
        const ny = n[v * 3 + 1];
        const nz = n[v * 3 + 2];
        const wx = m[0] * nx + m[4] * ny + m[8] * nz;
        const wy = m[1] * nx + m[5] * ny + m[9] * nz;
        const wz = m[2] * nx + m[6] * ny + m[10] * nz;
        const l = Math.hypot(wx, wy, wz) || 1;
        nor.push(wx / l, wy / l, wz / l);
      }
      for (const i of local) idx.push(base + i);
      base += count;
    }
  }
  if (idx.length === 0) fail("the glTF has no triangle geometry");
  return {
    positions: Float32Array.from(pos),
    normals: Float32Array.from(nor),
    indices: Uint32Array.from(idx),
  };
}

async function loadGltfMesh(path) {
  const { NodeIO } = await import("@gltf-transform/core");
  const { ALL_EXTENSIONS } = await import("@gltf-transform/extensions");
  const {
    dedup,
    flatten,
    join: joinPrims,
    weld,
    simplify,
    prune,
  } = await import("@gltf-transform/functions");
  const { MeshoptSimplifier } = await import("meshoptimizer");
  await MeshoptSimplifier.ready;

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(path);
  const root = doc.getRoot();
  // Only POSITION matters here (normals are recomputed below); other attributes
  // differ at hard edges and stop the simplifier from collapsing anything.
  for (const meshNode of root.listMeshes()) {
    for (const prim of meshNode.listPrimitives()) {
      for (const semantic of prim.listSemantics()) {
        if (semantic !== "POSITION") prim.setAttribute(semantic, null);
      }
    }
  }
  await doc.transform(dedup(), flatten(), joinPrims(), weld());

  let ratio = Math.min(1, TARGET_TRIANGLES / (triangleCount(root) || 1));
  for (let pass = 0; pass < MAX_SIMPLIFY_PASSES; pass++) {
    if (ratio < 1) {
      await doc.transform(
        simplify({
          simplifier: MeshoptSimplifier,
          ratio,
          error: SIMPLIFY_ERROR * ERROR_GROWTH ** pass,
        }),
      );
    }
    console.log(`simplify pass ${pass}: ${triangleCount(root)} triangles`);
    if (triangleCount(root) <= MAX_TRIANGLES) break;
    ratio = (ratio < 1 ? ratio : 1) * RATIO_STEP;
  }
  await doc.transform(prune());
  if (triangleCount(root) > MAX_TRIANGLES) {
    fail(`could not simplify below ${MAX_TRIANGLES} triangles`);
  }
  return gather(root);
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
