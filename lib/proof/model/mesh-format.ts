/**
 * RBT1 binary mesh decoder (PROOF-02; threat T-08-09).
 * Little-endian. Header 40 bytes:
 *   0 magic "RBT1" | 4 vertexCount u32 | 8 indexCount u32 | 12 indexType u8 (2|4)
 *   13-15 zero | 16..39 bboxMin xyz, bboxMax xyz (f32)
 * Body: positions Int16 x4 (w = 0), normals Int8 x4, indices (indexType bytes).
 * Every length is checked before any typed-array view is created.
 */
export const MESH_MAGIC = "RBT1";
export const HEADER_BYTES = 40;

const POSITION_BYTES = 8;
const NORMAL_BYTES = 4;
const MAX_U16_VERTICES = 65536;

export interface ParsedMesh {
  readonly vertexCount: number;
  readonly indexCount: number;
  readonly indexType: 2 | 4;
  readonly bboxMin: readonly [number, number, number];
  readonly bboxMax: readonly [number, number, number];
  readonly positions: Int16Array;
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

  const expected =
    HEADER_BYTES +
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

  const posOffset = HEADER_BYTES;
  const nrmOffset = posOffset + POSITION_BYTES * vertexCount;
  const idxOffset = nrmOffset + NORMAL_BYTES * vertexCount;
  const indices =
    indexType === 2
      ? new Uint16Array(buf, idxOffset, indexCount)
      : new Uint32Array(buf, idxOffset, indexCount);
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] >= vertexCount) return null;
  }

  return {
    vertexCount,
    indexCount,
    indexType,
    bboxMin,
    bboxMax,
    positions: new Int16Array(buf, posOffset, vertexCount * 4),
    normals: new Int8Array(buf, nrmOffset, vertexCount * 4),
    indices,
  };
}
