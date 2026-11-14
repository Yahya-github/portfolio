// Dev-time RBT2 mesh encoder and placeholder model (used by 08-08 and e2e).
// Layout is documented in lib/proof/model/mesh-format.ts.

const HEADER_BYTES = 40;
const MAX_U16_VERTICES = 65536;
const SEGMENTS = 16;
const MAX_PALETTE = 64;
const PALETTE_COUNT_OFFSET = 13;
const BODY = 0;
const WHEEL = 1;
const PLACEHOLDER_PALETTE = new Uint8Array([200, 160, 40, 70, 90, 150]);

/**
 * colors: one palette index per vertex; palette: sRGB RGB bytes, 3 per entry (at most 64 entries).
 * @typedef {{ positions: Float32Array, normals: Float32Array, indices: Uint32Array, colors: Uint8Array, palette: Uint8Array }} MeshInput
 */

/**
 * Encode a mesh to RBT1 bytes.
 * @param {MeshInput} mesh
 * @returns {Uint8Array}
 */
export function encodeMesh({ positions, normals, indices, colors, palette }) {
  const vertexCount = positions.length / 3;
  const paletteCount = palette.length / 3;
  if (
    !Number.isInteger(paletteCount) ||
    paletteCount < 1 ||
    paletteCount > MAX_PALETTE
  ) {
    throw new Error("palette must hold 1 to 64 RGB entries");
  }
  if (colors.length !== vertexCount)
    throw new Error("one colour index per vertex");
  const paletteBytes = Math.ceil((paletteCount * 3) / 4) * 4;
  const indexType = vertexCount <= MAX_U16_VERTICES ? 2 : 4;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < vertexCount; i++) {
    for (let a = 0; a < 3; a++) {
      const p = positions[i * 3 + a];
      if (p < min[a]) min[a] = p;
      if (p > max[a]) max[a] = p;
    }
  }

  const total =
    HEADER_BYTES + paletteBytes + 12 * vertexCount + indexType * indices.length;
  const out = new Uint8Array(total);
  const dv = new DataView(out.buffer);
  out.set([0x52, 0x42, 0x54, 0x32], 0); // "RBT2"
  dv.setUint32(4, vertexCount, true);
  dv.setUint32(8, indices.length, true);
  dv.setUint8(12, indexType);
  dv.setUint8(PALETTE_COUNT_OFFSET, paletteCount);
  for (let a = 0; a < 3; a++) {
    dv.setFloat32(16 + a * 4, min[a], true);
    dv.setFloat32(28 + a * 4, max[a], true);
  }

  out.set(palette, HEADER_BYTES);
  let off = HEADER_BYTES + paletteBytes;
  for (let i = 0; i < vertexCount; i++) {
    for (let a = 0; a < 3; a++) {
      const span = max[a] - min[a] || 1;
      const unit = ((positions[i * 3 + a] - min[a]) / span) * 2 - 1;
      dv.setInt16(off, Math.round(unit * 32767), true);
      off += 2;
    }
    dv.setInt16(off, 0, true);
    off += 2;
  }
  for (let i = 0; i < vertexCount; i++) {
    for (let a = 0; a < 3; a++) {
      dv.setInt8(off++, Math.round(normals[i * 3 + a] * 127));
    }
    if (colors[i] >= paletteCount) throw new Error("colour index out of range");
    dv.setUint8(off++, colors[i]);
  }
  for (let i = 0; i < indices.length; i++) {
    if (indexType === 2) dv.setUint16(off, indices[i], true);
    else dv.setUint32(off, indices[i], true);
    off += indexType;
  }
  return out;
}

/** Incremental geometry builder (arrays, flattened at the end). */
function builder() {
  const p = [];
  const n = [];
  const idx = [];
  const col = [];
  let colour = BODY;
  return {
    paint(c) {
      colour = c;
    },
    vertex(x, y, z, nx, ny, nz) {
      p.push(x, y, z);
      n.push(nx, ny, nz);
      col.push(colour);
      return p.length / 3 - 1;
    },
    tri(a, b, c) {
      idx.push(a, b, c);
    },
    done() {
      return {
        positions: new Float32Array(p),
        normals: new Float32Array(n),
        indices: new Uint32Array(idx),
        colors: Uint8Array.from(col),
        palette: PLACEHOLDER_PALETTE,
      };
    },
  };
}

function addBox(b, hx, hy, hz, cx, cy, cz) {
  const faces = [
    [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    [
      [-1, 0, 0],
      [0, 0, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ],
    [
      [0, -1, 0],
      [1, 0, 0],
      [0, 0, 1],
    ],
    [
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, -1],
      [0, 1, 0],
      [1, 0, 0],
    ],
  ];
  const half = [hx, hy, hz];
  for (const [nrm, u, v] of faces) {
    const base = [];
    for (const [su, sv] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      const pos = [0, 1, 2].map(
        (a) => nrm[a] * half[a] + u[a] * su * half[a] + v[a] * sv * half[a],
      );
      base.push(
        b.vertex(cx + pos[0], cy + pos[1], cz + pos[2], nrm[0], nrm[1], nrm[2]),
      );
    }
    b.tri(base[0], base[1], base[2]);
    b.tri(base[0], base[2], base[3]);
  }
}

/** Cylinder with its axis along z: radius r, half length h, centred at c. */
function addWheel(b, r, h, cx, cy, cz) {
  const ring = (z, nz, radial) => {
    const ids = [];
    for (let s = 0; s < SEGMENTS; s++) {
      const t = (s / SEGMENTS) * Math.PI * 2;
      const c = Math.cos(t);
      const sn = Math.sin(t);
      ids.push(
        radial
          ? b.vertex(cx + c * r, cy + sn * r, cz + z, c, sn, 0)
          : b.vertex(cx + c * r, cy + sn * r, cz + z, 0, 0, nz),
      );
    }
    return ids;
  };
  const a = ring(-h, 0, true);
  const c = ring(h, 0, true);
  for (let s = 0; s < SEGMENTS; s++) {
    const t = (s + 1) % SEGMENTS;
    b.tri(a[s], a[t], c[t]);
    b.tri(a[s], c[t], c[s]);
  }
  for (const [z, nz] of [
    [-h, -1],
    [h, 1],
  ]) {
    const centre = b.vertex(cx, cy, cz + z, 0, 0, nz);
    const rim = ring(z, nz, false);
    for (let s = 0; s < SEGMENTS; s++) {
      const t = (s + 1) % SEGMENTS;
      if (nz > 0) b.tri(centre, rim[s], rim[t]);
      else b.tri(centre, rim[t], rim[s]);
    }
  }
}

/**
 * A deterministic stand-in robot: a box body on four cylinder wheels.
 * @returns {MeshInput}
 */
export function placeholderMesh() {
  const b = builder();
  b.paint(BODY);
  addBox(b, 0.6, 0.25, 0.4, 0, 0.35, 0);
  b.paint(WHEEL);
  for (const x of [-0.45, 0.45]) {
    for (const z of [-0.5, 0.5]) addWheel(b, 0.2, 0.08, x, 0.2, z);
  }
  return b.done();
}
