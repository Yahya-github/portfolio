# Performance baseline (Phase 2)

Date: 2026-11-07
Next.js 16.4.5 (Turbopack), React 19.3.1, output: 'export'

## Method

`scripts/measure-js.mjs` adds up every `<script src>` without `noModule`, plus the `.js` preload and modulepreload links in `out/index.html`, compressed with gzip -9 and brotli q11. The noModule polyfill (about 38.6 kB gzip) is left out because modern browsers skip it. 1 kB = 1024 bytes. The CI gate is `pnpm measure:js -- --max-gzip-kb 150` in the e2e job.

The live number is a separate check: every non-noModule `<script src>` on https://yahya-hallani.dev/ is fetched with `Accept-Encoding: br` and the bytes on the wire (`curl -w '%{size_download}'`) are summed.

## Results

| Build | Files | Raw kB | gzip kB | brotli kB |
|-------|-------|--------|---------|-----------|
| Placeholder `/` (this repo, `pnpm measure:js`, plan 02-03) | 5 | 447 | 132.1 | 112.5 |
| Research spike: empty page | 5 | 447 | 132.1 | 112.6 |
| Research spike: `next/image` variant | 6 | 462 | 137.8 | 117.7 |

Live brotli transfer on https://yahya-hallani.dev/: 134.7 kB (5 files, deploy of `5d42303`).

The live files are the same bytes as the local build: re-compressing the 5 downloaded chunks gives 447.4 kB raw, 132.3 kB gzip -9 and 112.7 kB brotli q11. Vercel compresses them on the wire at a lower brotli level than q11, so the brotli transfer (134.7 kB) is about the same as gzip (live gzip transfer: 133.4 kB), not the 112.6 kB that q11 would give.

## Headroom

The design doc's landing budget is about 150 kB gzip. That leaves about 150 − 132.1 ≈ 18 kB for everything Phases 4-5 add (GSAP, Flip, pager, cursor). So load the motion layer with a dynamic import after first paint, and keep `next/image` (+5.7 kB gzip) off `/`.

## Open question (decide in Phase 4/5 planning)

Is the budget meant as gzip or brotli? Vercel serves brotli. At q11 the baseline would be about 112.6 kB, but the measured live brotli transfer is 134.7 kB, because Vercel does not compress at q11. A brotli budget therefore buys less headroom than the q11 number suggests. Yahya decides whether to restate the budget; Phase 2 does not decide it.
