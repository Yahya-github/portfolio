export interface MeshInput {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  /** One palette index per vertex. */
  colors: Uint8Array;
  /** sRGB RGB bytes, 3 per entry, at most 64 entries. */
  palette: Uint8Array;
}
export function encodeMesh(mesh: MeshInput): Uint8Array;
export function placeholderMesh(): MeshInput;
