export type Point = [number, number];
export interface Glyph {
  d: string;
}
export interface FitOptions {
  size: number;
  top: number;
  height: number;
}
export function parsePath(d: string): Point[][];
export function pathBounds(d: string): [number, number, number, number];
export function fitPath(glyph: Glyph, options: FitOptions): string;
