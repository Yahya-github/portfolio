import { describe, expect, it } from "vitest";
import { HEADER_BYTES, parseMesh } from "@/lib/proof/model/mesh-format";
import { encodeMesh, placeholderMesh } from "../scripts/lib/robot-mesh.mjs";

const encoded = (): Uint8Array => encodeMesh(placeholderMesh());
const copy = (u: Uint8Array): ArrayBuffer => u.slice().buffer as ArrayBuffer;

describe("RBT1 round trip", () => {
  it("parses the placeholder", () => {
    const m = placeholderMesh();
    const parsed = parseMesh(copy(encoded()));
    expect(parsed).not.toBeNull();
    if (!parsed) return;
    const v = m.positions.length / 3;
    expect(parsed.vertexCount).toBe(v);
    expect(parsed.indexCount).toBe(m.indices.length);
    expect(parsed.indexType).toBe(2);
    expect(parsed.positions.length).toBe(v * 4);
    expect(parsed.normals.length).toBe(v * 4);
    expect(parsed.indices.length).toBe(m.indices.length);
  });

  it("is 40 + 12v + 2i bytes for the placeholder", () => {
    const m = placeholderMesh();
    const v = m.positions.length / 3;
    expect(encoded().byteLength).toBe(HEADER_BYTES + 12 * v + 2 * m.indices.length);
    expect(HEADER_BYTES).toBe(40);
  });

  it("de-quantizes within (max - min) / 32767 on every axis", () => {
    const m = placeholderMesh();
    const parsed = parseMesh(copy(encoded()));
    expect(parsed).not.toBeNull();
    if (!parsed) return;
    const v = m.positions.length / 3;
    for (let i = 0; i < v; i++) {
      for (let a = 0; a < 3; a++) {
        const lo = parsed.bboxMin[a];
        const hi = parsed.bboxMax[a];
        const q = parsed.positions[i * 4 + a];
        const back = lo + ((q / 32767 + 1) / 2) * (hi - lo);
        expect(Math.abs(back - m.positions[i * 3 + a])).toBeLessThanOrEqual(
          (hi - lo) / 32767 + 1e-6,
        );
      }
    }
  });

  it("uses 32-bit indices above 65536 vertices", () => {
    const v = 70000;
    const positions = new Float32Array(v * 3).map((_, i) => i % 97);
    const normals = new Float32Array(v * 3).fill(0.5);
    const indices = new Uint32Array([0, 1, v - 1]);
    const bytes = encodeMesh({ positions, normals, indices });
    const parsed = parseMesh(copy(bytes));
    expect(parsed?.indexType).toBe(4);
    expect(parsed?.indices[2]).toBe(v - 1);
  });
});

describe("RBT1 rejects corrupt input", () => {
  const view = (b: Uint8Array): DataView =>
    new DataView(b.buffer, b.byteOffset, b.byteLength);

  it("rejects a buffer shorter than the header", () => {
    expect(parseMesh(new ArrayBuffer(10))).toBeNull();
  });
  it("rejects a wrong magic", () => {
    const b = encoded();
    b[0] = 0x58;
    expect(parseMesh(copy(b))).toBeNull();
  });
  it("rejects a truncated file", () => {
    const b = encoded();
    expect(parseMesh(copy(b.subarray(0, b.length - 1)))).toBeNull();
  });
  it("rejects an extra trailing byte", () => {
    const b = encoded();
    const longer = new Uint8Array(b.length + 1);
    longer.set(b);
    expect(parseMesh(copy(longer))).toBeNull();
  });
  it("rejects an unsupported index type", () => {
    const b = encoded();
    b[12] = 3;
    expect(parseMesh(copy(b))).toBeNull();
  });
  it("rejects an index equal to the vertex count", () => {
    const b = encoded();
    const dv = view(b);
    const v = dv.getUint32(4, true);
    dv.setUint16(HEADER_BYTES + 12 * v, v, true);
    expect(parseMesh(copy(b))).toBeNull();
  });
  it("rejects a non-finite bbox", () => {
    const b = encoded();
    view(b).setFloat32(16, NaN, true);
    expect(parseMesh(copy(b))).toBeNull();
  });
  it("rejects bbox min above max", () => {
    const b = encoded();
    view(b).setFloat32(16, 1e6, true);
    expect(parseMesh(copy(b))).toBeNull();
  });
  it("rejects zero vertices and an index count not divisible by 3", () => {
    const a = encoded();
    view(a).setUint32(4, 0, true);
    expect(parseMesh(copy(a))).toBeNull();
    const b = encoded();
    view(b).setUint32(8, 4, true);
    expect(parseMesh(copy(b))).toBeNull();
  });
});
