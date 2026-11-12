import { Twin } from "@/components/media/Twin";
import { about } from "@/content/about";
import { media } from "@/lib/media/manifest";
import styles from "./portrait-toggle.module.css";

// Pitfall 3 / user decision 2026-11-08: describe the drawn width
// (object-fit: cover in a tall column), not the slot width.
const PORTRAIT_SIZES = "(max-width: 820px) 100vw, calc((100vh - 128px) * 1.22)";

export interface PortraitToggleProps {
  readonly eager: boolean;
  readonly className?: string;
}

/** Pressed-state portrait (DSGN-05): disabled until the toggles module mounts. */
export function PortraitToggle({ eager, className }: PortraitToggleProps) {
  return (
    <button
      type="button"
      aria-pressed="false"
      disabled
      data-portrait-toggle=""
      className={[styles.toggle, className].filter(Boolean).join(" ")}
    >
      <Twin
        grey={media["portrait/portrait-devfest-2026-grey"]}
        colour={media["portrait/portrait-devfest-2026-color"]}
        sizes={PORTRAIT_SIZES}
        alt={about.portraitAlt}
        eager={eager}
        colourOnDemand
        greyClassName={styles.img}
        colourClassName={`${styles.img} ${styles.colour}`}
      />
      <span className={`visually-hidden ${styles.suffix}`}>
        {about.portraitToggleSuffix}
      </span>
    </button>
  );
}
