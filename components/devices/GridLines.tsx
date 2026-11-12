import styles from "./grid-lines.module.css";

const COLUMNS = 12;

/**
 * Index grid lines: the 12 page columns drawn as 1px hairlines behind the
 * type (design doc 4.2 item 4b, D-04 device 1). Decorative, aria-hidden, no
 * pointer events, pure CSS. D-05: first built, last cut; remove the single
 * `<GridLines />` line in IndexPage.tsx to drop the device.
 */
export function GridLines() {
  return (
    <div aria-hidden="true" className={styles.lines}>
      {Array.from({ length: COLUMNS }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
