import styles from "./quarter-rings.module.css";

export const RING_COUNT = 14;
export const RING_OUTER = 91.75;
export const RING_RATIO = 0.8;
export const RING_THICKNESS = 16.5 / 91.75;

const round2 = (n: number) => Number(n.toFixed(2));

const RINGS = Array.from({ length: RING_COUNT }, (_, i) => {
  const r = round2(RING_OUTER * RING_RATIO ** i);
  return { r, width: round2(r * RING_THICKNESS) };
});

/**
 * Quarter rings centred on the top-right corner of col 12 (design doc 4.2 item 5,
 * D-04 device 3). Decorative: aria-hidden, no pointer events, hidden on phones.
 * D-05: remove the single `<QuarterRings />` line in AboutPage.tsx to cut it.
 */
export function QuarterRings() {
  return (
    <div aria-hidden="true" className={styles.shape}>
      <svg
        className={styles.rings}
        data-quarter-rings=""
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        focusable="false"
      >
        {RINGS.map(({ r, width }) => (
          <circle key={r} cx="100" cy="0" r={r} strokeWidth={width} />
        ))}
      </svg>
    </div>
  );
}
