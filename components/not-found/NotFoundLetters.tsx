import { site } from "@/content/site";
import { letterSections } from "@/lib/sections";
import styles from "./not-found.module.css";

/** Five letter links, markup copied from LetterNav without pager state (D-08). */
export function NotFoundLetters() {
  return (
    <nav aria-label={site.navLabel} className={styles.nav}>
      <ul className={styles.list}>
        {letterSections().map((s) => (
          <li key={s.slug} className={styles.item}>
            <a
              href={s.route}
              data-cursor-tag={`${s.number} ${s.name}`}
              className={styles.letter}
            >
              <span aria-hidden="true" className={styles.glyph}>
                {s.letter}
              </span>
              <span className={`t-label ${styles.caption}`}>
                <span className={`c-dim ${styles.num}`}>{s.number}</span>{" "}
                {s.name}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
