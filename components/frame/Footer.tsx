import type { CSSProperties } from "react";
import type { Slug } from "@/content/types";
import { counterLabel, indexOfSlug, nextLink } from "@/lib/sections";
import styles from "./frame.module.css";

interface FooterProps {
  readonly current: Slug;
}

export function Footer({ current }: FooterProps) {
  const next = nextLink(current);
  const barStyle = { "--page-index": indexOfSlug(current) } as CSSProperties;
  return (
    <footer className={`grid t-label ${styles.footer}`}>
      <span className={`tnum ${styles.counter}`}>{counterLabel(current)}</span>
      <a className={styles.next} href={next.href}>
        {next.label}
      </a>
      <span aria-hidden="true" className={styles.bar} style={barStyle} />
    </footer>
  );
}
