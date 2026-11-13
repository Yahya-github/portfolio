export interface MeshInput {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}
export function encodeMesh(mesh: MeshInput): Uint8Array;
export function placeholderMesh(): MeshInput;
