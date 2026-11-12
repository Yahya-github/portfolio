// scripts/lib/glyph-path.mjs: parse and fit a simple absolute SVG path (M/L/H/V/Z only) for the favicon (D-07).
const TOKEN = /([A-Za-z])|(-?\d*\.?\d+(?:e-?\d+)?)/g;
const ALLOWED = new Set(["M", "L", "H", "V", "Z"]);
const DECIMALS = 3;

/** Parse into a list of subpaths, each a list of [x, y] points. */
export function parsePath(d) {
  const subpaths = [];
  let current = null;
  let x = 0;
  let y = 0;
  let cmd = null;
  let nums = [];

  const flush = () => {
    if (cmd === null) return;
    if (cmd === "Z") {
      current = null;
      return;
    }
    const need = cmd === "H" || cmd === "V" ? 1 : 2;
    if (nums.length === 0 || nums.length % need !== 0) {
      throw new Error(`Bad argument count for ${cmd}`);
    }
    for (let i = 0; i < nums.length; i += need) {
      if (cmd === "H") x = nums[i];
      else if (cmd === "V") y = nums[i];
      else {
        x = nums[i];
        y = nums[i + 1];
      }
      if (cmd === "M" && i === 0) {
        current = [];
        subpaths.push(current);
      }
      if (!current) {
        current = [];
        subpaths.push(current);
      }
      current.push([x, y]);
    }
  };

  for (const m of d.matchAll(TOKEN)) {
    if (m[1] !== undefined) {
      const letter = m[1];
      if (!ALLOWED.has(letter)) {
        throw new Error(`Unsupported path command: ${letter}`);
      }
      flush();
      cmd = letter;
      nums = [];
    } else {
      if (cmd === null || cmd === "Z")
        throw new Error("Number without command");
      nums.push(Number(m[2]));
    }
  }
  flush();
  return subpaths;
}

export function pathBounds(d) {
  const pts = parsePath(d).flat();
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

const round = (n) => Number(n.toFixed(DECIMALS));

/** Scale the glyph to `height`, flip y, centre by bbox horizontally in `size`, top at `top`. */
export function fitPath(glyph, { size, top, height }) {
  const [xMin, yMin, xMax, yMax] = pathBounds(glyph.d);
  const s = height / (yMax - yMin);
  const x0 = (size - (xMax - xMin) * s) / 2;
  return parsePath(glyph.d)
    .map((pts) => {
      const body = pts
        .map(
          ([x, y]) =>
            `${round(x0 + (x - xMin) * s)} ${round(top + height - (y - yMin) * s)}`,
        )
        .join("L");
      return `M${body}Z`;
    })
    .join("");
}
