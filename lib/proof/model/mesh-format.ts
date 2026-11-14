/**
 * RBT2 binary mesh decoder (PROOF-02; threat T-08-09).
 * Little-endian. Header 40 bytes:
 *   0 magic "RBT2" | 4 vertexCount u32 | 8 indexCount u32 | 12 indexType u8 (2|4)
 *   13 paletteCount u8 (1..64) | 14-15 zero | 16..39 bboxMin xyz, bboxMax xyz (f32)
 * Body: palette (3 sRGB bytes per entry, padded to 4), positions Int16 x4 (w = 0),
 * normals Int8 x4 (w = palette index, u8), indices (indexType bytes).
 * RBT1 files (no colour) are rejected by the magic check.
 * Every length is checked before any typed-array view is created.
 */
export const MESH_MAGIC = "RBT2";
export const HEADER_BYTES = 40;

const POSITION_BYTES = 8;
const NORMAL_BYTES = 4;
const MAX_U16_VERTICES = 65536;
export const MAX_PALETTE = 64;

export interface ParsedMesh {
  readonly vertexCount: number;
  readonly indexCount: number;
  readonly indexType: 2 | 4;
  readonly bboxMin: readonly [number, number, number];
  readonly bboxMax: readonly [number, number, number];
  /** sRGB bytes, 3 per palette entry. */
  readonly palette: Uint8Array;
  readonly paletteCount: number;
  readonly positions: Int16Array;
  /** Int8 x4 per vertex: xyz normal, then the palette index byte (read as u8). */
  readonly normals: Int8Array;
  readonly indices: Uint16Array | Uint32Array;
}

function readVec3(dv: DataView, offset: number): [number, number, number] {
  return [
    dv.getFloat32(offset, true),
    dv.getFloat32(offset + 4, true),
    dv.getFloat32(offset + 8, true),
  ];
}

/** Returns the decoded mesh, or null for anything malformed. */
export function parseMesh(buf: ArrayBuffer): ParsedMesh | null {
  if (buf.byteLength < HEADER_BYTES) return null;
  const dv = new DataView(buf);
  for (let i = 0; i < MESH_MAGIC.length; i++) {
    if (dv.getUint8(i) !== MESH_MAGIC.charCodeAt(i)) return null;
  }
  const vertexCount = dv.getUint32(4, true);
  const indexCount = dv.getUint32(8, true);
  const indexType = dv.getUint8(12);
  if (indexType !== 2 && indexType !== 4) return null;
  if (vertexCount === 0 || indexCount === 0 || indexCount % 3 !== 0) {
    return null;
  }
  if (indexType === 2 && vertexCount > MAX_U16_VERTICES) return null;

  const paletteCount = dv.getUint8(13);
  if (paletteCount < 1 || paletteCount > MAX_PALETTE) return null;
  const paletteBytes = Math.ceil((paletteCount * 3) / 4) * 4;

  const expected =
    HEADER_BYTES +
    paletteBytes +
    (POSITION_BYTES + NORMAL_BYTES) * vertexCount +
    indexType * indexCount;
  if (buf.byteLength !== expected) return null;

  const bboxMin = readVec3(dv, 16);
  const bboxMax = readVec3(dv, 28);
  for (let a = 0; a < 3; a++) {
    if (!Number.isFinite(bboxMin[a]) || !Number.isFinite(bboxMax[a])) {
      return null;
    }
    if (bboxMin[a] > bboxMax[a]) return null;
  }

  const posOffset = HEADER_BYTES + paletteBytes;
  const nrmOffset = posOffset + POSITION_BYTES * vertexCount;
  const idxOffset = nrmOffset + NORMAL_BYTES * vertexCount;
  const indices =
    indexType === 2
      ? new Uint16Array(buf, idxOffset, indexCount)
      : new Uint32Array(buf, idxOffset, indexCount);
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] >= vertexCount) return null;
  }

  const colorIndex = new Uint8Array(buf, nrmOffset, vertexCount * 4);
  for (let i = 3; i < colorIndex.length; i += 4) {
    if (colorIndex[i] >= paletteCount) return null;
  }

  return {
    vertexCount,
    indexCount,
    indexType,
    bboxMin,
    bboxMax,
    palette: new Uint8Array(buf, HEADER_BYTES, paletteCount * 3),
    paletteCount,
    positions: new Int16Array(buf, posOffset, vertexCount * 4),
    normals: new Int8Array(buf, nrmOffset, vertexCount * 4),
    indices,
  };
}
