export function scriptsOf(html: string): string[];
export function referencedChunks(html: string): string[];
export function routeOf(htmlPath: string): string | null;
export function modelFiles(paths: readonly string[]): string[];
export function gameFiles(paths: readonly string[]): string[];
export function lazyChunks(
  all: readonly string[],
  referenced: ReadonlySet<string>,
): string[];
export function moduleHint(text: string): string;
