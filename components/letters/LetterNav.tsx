import { site } from "@/content/site";
import type { Slug } from "@/content/types";
import { letterSections, sectionBySlug } from "@/lib/sections";
import styles from "./letters.module.css";

interface LetterNavProps {
  readonly current: Slug;
}

/**
 * One set of five letter links for the whole site: a hero wordmark on /,
 * a vertical rail elsewhere. Phase 5 FLIPs these exact elements.
 */
export function LetterNav({ current }: LetterNavProps) {
  const mode = current === "index" ? "hero" : "rail";
  const now = mode === "rail" ? sectionBySlug(current) : null;
  return (
    <nav aria-label={site.navLabel} data-mode={mode} className={styles.nav}>
      {letterSections().map((s) => (
        <a
          key={s.slug}
          href={s.route}
          data-glyph={s.letter ?? undefined}
          className={styles.letter}
          aria-current={s.slug === current ? "page" : undefined}
        >
          <span aria-hidden="true" className={styles.glyph}>
            {s.letter}
          </span>
          <span className={`t-label ${styles.caption}`}>
            <span className={`c-dim ${styles.num}`}>{s.number}</span> {s.name}
          </span>
        </a>
      ))}
      {now ? (
        <span aria-hidden="true" className={`t-label ${styles.now}`}>
          <span className="c-dim">{now.number}</span> {now.name}
        </span>
      ) : null}
    </nav>
  );
}
