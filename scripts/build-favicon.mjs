// scripts/build-favicon.mjs: builds app/icon.svg and app/apple-icon.png from the real Y glyph path (D-07).
// Usage: pnpm favicon:build (local only, never CI)
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { fitPath } from "./lib/glyph-path.mjs";

const GLYPH = "scripts/favicon/y-path.json";
const TOKENS = "styles/tokens.css";
const ICON_SVG = "app/icon.svg";
const APPLE_PNG = "app/apple-icon.png";
const ICON = { size: 32, top: 4, height: 24 };
const APPLE = { size: 180, top: 36, height: 108 };

function token(css, name) {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
  if (!m) throw new Error(`Token --${name} not found in ${TOKENS}`);
  return m[1];
}

function svgFor(glyph, fit, ground, ink) {
  const { size } = fit;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${ground}"/><path fill="${ink}" d="${fitPath(glyph, fit)}"/></svg>\n`;
}

const glyph = JSON.parse(readFileSync(GLYPH, "utf8"));
const css = readFileSync(TOKENS, "utf8");
const ground = token(css, "color-ground");
const ink = token(css, "color-ink");

writeFileSync(ICON_SVG, svgFor(glyph, ICON, ground, ink));

const png = await sharp(Buffer.from(svgFor(glyph, APPLE, ground, ink)))
  .png({ compressionLevel: 9 })
  .toBuffer();
const meta = await sharp(png).metadata();
if (meta.width !== APPLE.size || meta.height !== APPLE.size) {
  throw new Error(
    `apple icon is ${meta.width}x${meta.height}, expected 180x180`,
  );
}
writeFileSync(APPLE_PNG, png);
console.log(
  `favicon: wrote ${ICON_SVG} and ${APPLE_PNG} (${png.length} bytes)`,
);
