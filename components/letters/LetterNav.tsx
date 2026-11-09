"use client";

import { site } from "@/content/site";
import type { Slug } from "@/content/types";
import { usePagerState } from "@/components/shell/PagerContext";
import { lettersInert } from "@/lib/pager/state";
import {
  indexOfSlug,
  letterSections,
  sectionBySlug,
  slugAt,
} from "@/lib/sections";
import styles from "./letters.module.css";

interface LetterNavProps {
  /** Initial route; keeps first-paint HTML identical to the server render. */
  readonly current: Slug;
}

/**
 * One set of five letter links for the whole site: a hero wordmark on /,
 * a vertical rail elsewhere. Phase 5 FLIPs these exact elements.
 *
 * D-09 stand-in: hero while the target is 00 or while the row rides out
 * with page 00 (inert); rail after a landing off 00. Phase 5 replaces this
 * with the FLIP glide.
 */
export function LetterNav({ current }: LetterNavProps) {
  const state = usePagerState(indexOfSlug(current));
  const targetSlug = slugAt(state.target);
  const mode = state.lettersMode;
  const now = mode === "rail" ? sectionBySlug(targetSlug) : null;
  return (
    <nav
      aria-label={site.navLabel}
      data-mode={mode}
      data-pager="letters"
      data-enter={state.railEnter ? "" : undefined}
      inert={lettersInert(state)}
      className={styles.nav}
    >
      {letterSections().map((s) => (
        <a
          key={s.slug}
          href={s.route}
          data-glyph={s.letter ?? undefined}
          className={styles.letter}
          aria-current={s.slug === targetSlug ? "page" : undefined}
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
