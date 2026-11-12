import type { CSSProperties } from "react";
import { sayHi } from "@/content/say-hi";
import styles from "./say-hi-spiral.module.css";

export const SPIRAL_WORDS = 22;
// Measured path, copied verbatim from v7 line 567 (a logarithmic spiral, r = r0 * 0.45^turns).
export const SPIRAL_PATH =
  "M92.78 -52.92L93.48 -51.18L94.15 -49.43L94.79 -47.67L95.39 -45.91L95.97 -44.14L96.51 -42.36L97.02 -40.58L97.49 -38.80L97.94 -37.01L98.35 -35.22L98.73 -33.42L99.08 -31.62L99.40 -29.82L99.68 -28.02L99.93 -26.22L100.15 -24.41L100.34 -22.61L100.50 -20.81L100.62 -19.01L100.71 -17.22L100.78 -15.42L100.81 -13.63L100.80 -11.84L100.77 -10.06L100.71 -8.28L100.61 -6.51L100.49 -4.74L100.33 -2.98L100.15 -1.22L99.93 0.52L99.69 2.26L99.41 3.99L99.11 5.71L98.77 7.43L98.41 9.13L98.02 10.82L97.60 12.50L97.15 14.17L96.67 15.83L96.17 17.48L95.63 19.11L95.07 20.73L94.49 22.34L93.88 23.93L93.24 25.51L92.57 27.07L91.88 28.62L91.17 30.15L90.43 31.67L89.66 33.17L88.87 34.65L88.06 36.11L87.22 37.56L86.36 38.99L85.47 40.40L84.57 41.80L83.64 43.17L82.69 44.52L81.72 45.86L80.73 47.17L79.71 48.47L78.68 49.74L77.63 50.99L76.56 52.22L75.47 53.43L74.36 54.62L73.23 55.79L72.09 56.93L70.92 58.05L69.75 59.15L68.55 60.22L67.34 61.27L66.11 62.30L64.87 63.31L63.62 64.29L62.35 65.24L61.06 66.17L59.76 67.08L58.46 67.96L57.13 68.82L55.80 69.65L54.45 70.46L53.10 71.24L51.73 71.99L50.36 72.72L48.97 73.43L47.58 74.11L46.17 74.76L44.76 75.39";
const WORD_BOX = "72.7 -67 71.5 133.7";

/**
 * The "say hi" spiral on Say hi (design doc 4.2 item 2, v7 lines 304-333, D-04 device 5).
 * Server-rendered SVG words animated by CSS keyframes only (compositor), gated by the shared
 * motion flags (D-06). Still under reduced motion and with JS off. Aria-hidden, decorative.
 * D-05 first cut: remove the single `<SayHiSpiral />` line in SayHiPage.tsx and the phone
 * footer rule in frame.module.css.
 */
export function SayHiSpiral() {
  return (
    <div
      aria-hidden="true"
      className={styles.layer}
      data-say-hi-spiral-layer=""
    >
      <svg
        width="0"
        height="0"
        className={styles.defs}
        data-say-hi-spiral=""
        focusable="false"
      >
        <defs>
          <path id="say-hi-path" d={SPIRAL_PATH} />
          <g id="say-hi-word">
            <text fontSize="42" letterSpacing="-1.26">
              <textPath href="#say-hi-path">{sayHi.spiralWord}</textPath>
            </text>
          </g>
        </defs>
      </svg>
      <div className={styles.centre}>
        {Array.from({ length: SPIRAL_WORDS }, (_, i) => (
          <svg
            key={i}
            className={styles.w}
            viewBox={WORD_BOX}
            style={{ "--i": i } as CSSProperties}
            data-say-hi-spiral=""
            focusable="false"
          >
            <use href="#say-hi-word" />
          </svg>
        ))}
      </div>
    </div>
  );
}
