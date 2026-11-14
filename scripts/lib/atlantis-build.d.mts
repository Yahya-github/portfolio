export interface MeasuredBuild {
  version: string;
  path: string;
  wasmRaw: number;
  wasmGzip: number;
  wasmBrotli5: number;
  pck: number;
  jsGzip: number;
  totalBytes: number;
  totalMB: string;
}
export function measureBuild(dir: string, version: string): MeasuredBuild;
export function formatMB(bytes: number): string;
export function renderBuildModule(build: MeasuredBuild | null): string;
