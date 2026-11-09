"use client";

import type { CSSProperties } from "react";
import type { Slug } from "@/content/types";
import { usePagerState } from "@/components/shell/PagerContext";
import { counterLabel, indexOfSlug, nextLink, slugAt } from "@/lib/sections";
import styles from "./frame.module.css";

interface FooterProps {
  /** Initial route; keeps first-paint HTML identical to the server render. */
  readonly current: Slug;
}

/** D-10: the counter and Next link follow the pager target at slide start. */
export function Footer({ current }: FooterProps) {
  const state = usePagerState(indexOfSlug(current));
  const slug = slugAt(state.target);
  const next = nextLink(slug);
  // The animator owns --page-index after hydration (D-11); React keeps the
  // initial value so it never overwrites the animator's inline write.
  const barStyle = { "--page-index": indexOfSlug(current) } as CSSProperties;
  return (
    <footer className={`grid t-label ${styles.footer}`}>
      <span className={`tnum ${styles.counter}`}>{counterLabel(slug)}</span>
      <a className={styles.next} href={next.href}>
        {next.label}
      </a>
      <span
        aria-hidden="true"
        data-pager="bar"
        className={styles.bar}
        style={barStyle}
      />
    </footer>
  );
}
