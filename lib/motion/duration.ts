/**
 * Parse a CSS time token into milliseconds. The production CSS minifier rewrites
 * `5000ms` to `5s` and `900ms` to `.9s`, so a bare parseFloat reads 5 ms instead
 * of 5000 ms. Unitless numbers are taken as milliseconds. NaN when unparseable.
 */
export function parseDurationMs(raw: string): number {
  const m = /^\s*(-?(?:\d+\.?\d*|\.\d+))(ms|s)?\s*$/i.exec(raw);
  if (!m) return Number.NaN;
  const n = parseFloat(m[1]);
  return m[2]?.toLowerCase() === "s" ? n * 1000 : n;
}
