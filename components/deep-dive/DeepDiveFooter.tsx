import { facturo } from "@/content/facturo";
import { sectionBySlug } from "@/lib/sections";
import styles from "@/components/frame/frame.module.css";

/** Lean footer for the deep dive: no counter, hint or progress bar (D-01). */
export function DeepDiveFooter() {
  return (
    <footer className={`grid t-label ${styles.footer}`}>
      <span className={styles.end}>
        <a className={styles.next} href={sectionBySlug("projects").route}>
          {facturo.backLabel}
        </a>
      </span>
    </footer>
  );
}
