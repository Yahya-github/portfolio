"use client";

import { useRef, type CSSProperties } from "react";
import { site } from "@/content/site";
import type { Slug } from "@/content/types";
import { usePagerState } from "@/components/shell/PagerContext";
import { counterLabel, indexOfSlug, nextLink, slugAt } from "@/lib/sections";
import styles from "./frame.module.css";
import { useHint } from "./useHint";

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
  const hintRef = useRef<HTMLSpanElement>(null);
  const nextRef = useRef<HTMLAnchorElement>(null);
  useHint(hintRef, nextRef);
  const barStyle = { "--page-index": indexOfSlug(current) } as CSSProperties;
  return (
    <footer className={`grid t-label ${styles.footer}`}>
      <span className={`tnum ${styles.counter}`}>{counterLabel(slug)}</span>
      <span ref={hintRef} data-hint="" className={styles.hint} />
      <button type="button" data-motion-toggle="" className={styles.motion}>
        <span className={styles.motionPause}>{site.motion.pause}</span>
        <span className={styles.motionPlay}>{site.motion.play}</span>
      </button>
      <span className={styles.end}>
        <a ref={nextRef} className={styles.next} href={next.href}>
          {next.label}
        </a>
      </span>
      <span
        aria-hidden="true"
        data-pager="bar"
        className={styles.bar}
        style={barStyle}
      />
    </footer>
  );
}
