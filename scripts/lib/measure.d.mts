export function scriptsOf(html: string): string[];
export function referencedChunks(html: string): string[];
export function routeOf(htmlPath: string): string;
export function lazyChunks(
  all: readonly string[],
  referenced: ReadonlySet<string>,
): string[];
export function moduleHint(text: string): string;
