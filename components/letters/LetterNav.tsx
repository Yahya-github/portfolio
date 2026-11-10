"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import type { Slug } from "@/content/types";
import { usePagerState } from "@/components/shell/PagerContext";
import {
  indexOfSlug,
  letterSections,
  sectionBySlug,
  slugAt,
} from "@/lib/sections";
import styles from "./letters.module.css";
import { useGlide } from "./useGlide";

interface LetterNavProps {
  /** Initial route; keeps first-paint HTML identical to the server render. */
  readonly current: Slug;
}

/**
 * One set of five letter links for the whole site: a hero wordmark on /,
 * a vertical rail elsewhere, gliding between the two (LTR-03). Never inert.
 * The accent comes only from aria-current (the pager target).
 */
export function LetterNav({ current }: LetterNavProps) {
  const state = usePagerState(indexOfSlug(current));
  const navRef = useRef<HTMLElement>(null);
  useGlide(navRef);
  const targetSlug = slugAt(state.target);
  // The glide owns data-mode after hydration (Phase 5); React keeps the server value so it never overwrites the glide's writes.
  const initialMode = indexOfSlug(current) === 0 ? "hero" : "rail";
  const now = state.target !== 0 ? sectionBySlug(targetSlug) : null;
  return (
    <nav
      ref={navRef}
      aria-label={site.navLabel}
      data-mode={initialMode}
      data-pager="letters"
      className={styles.nav}
    >
      {letterSections().map((s) => (
        <a
          key={s.slug}
          href={s.route}
          data-glyph={s.letter ?? undefined}
          data-cursor-tag={`${s.number} ${s.name}`}
          className={styles.letter}
          aria-current={s.slug === targetSlug ? "page" : undefined}
        >
          <span aria-hidden="true" className={styles.glyph}>
            {s.letter}
          </span>
          <span data-tag="" className={`t-label ${styles.caption}`}>
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
