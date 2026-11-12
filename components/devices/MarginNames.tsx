import type { Slug } from "@/content/types";
import { NAMES_PER_STRIP } from "@/lib/motion/names";
import { sectionBySlug } from "@/lib/sections";
import styles from "./margin-names.module.css";

/**
 * Margin section names (design doc 4.2 item 4a, D-04 device 4): the page's own
 * "NN Name" repeated as a dim vertical label in the right margin, scrolling up
 * as a seamless loop. Decorative, aria-hidden; CSS owns the motion and the
 * global motion module only sizes the strip. D-05: remove the single
 * `<MarginNames />` line in Track.tsx to cut it.
 */
export function MarginNames({ slug }: { readonly slug: Slug }) {
  const s = sectionBySlug(slug);
  const label = `${s.number} ${s.name}`;
  return (
    <div aria-hidden="true" className={`t-label ${styles.edge}`}>
      <span data-names-strip="" className={styles.strip}>
        {Array.from({ length: NAMES_PER_STRIP }, (_, i) => (
          <span key={i}>{label}</span>
        ))}
      </span>
    </div>
  );
}
