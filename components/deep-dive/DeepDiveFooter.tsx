import type { DiveProject } from "@/content/types";
import { site } from "@/content/site";
import { sectionBySlug } from "@/lib/sections";
import styles from "@/components/frame/frame.module.css";
import dive from "@/components/deep-dive/deep-dive.module.css";

interface DeepDiveFooterProps {
  readonly project: DiveProject;
  readonly backLabel: string;
  /** Adds the motion toggle (routes with moving content, e.g. the robot viewer). */
  readonly motion?: boolean;
}

/** Lean footer for the deep dive: no counter, hint or progress bar (D-01). */
export function DeepDiveFooter({
  project,
  backLabel,
  motion = false,
}: DeepDiveFooterProps) {
  return (
    <footer data-dive={project} className={`grid t-label ${styles.footer}`}>
      {motion ? (
        <button type="button" data-motion-toggle="" className={styles.motion}>
          <span className={styles.motionPause}>{site.motion.pause}</span>
          <span className={styles.motionPlay}>{site.motion.play}</span>
        </button>
      ) : null}
      <span className={styles.end}>
        <a
          className={`${styles.next} ${dive.back}`}
          href={sectionBySlug("projects").route}
        >
          {backLabel}
        </a>
      </span>
    </footer>
  );
}
