"use client";

import { site } from "@/content/site";
import type { Slug } from "@/content/types";
import { usePagerState } from "@/components/shell/PagerContext";
import {
  headerLabel,
  indexOfSlug,
  sectionBySlug,
  slugAt,
} from "@/lib/sections";
import styles from "./frame.module.css";

interface HeaderProps {
  /** Initial route; keeps first-paint HTML identical to the server render. */
  readonly current: Slug;
  /** Overrides the section label (the deep dive shows "02.1 Facturo", D-01). */
  readonly label?: string;
}

/** D-10: the label and Say hi aria-current follow the pager target at slide start. */
export function Header({ current, label }: HeaderProps) {
  const state = usePagerState(indexOfSlug(current));
  const slug = slugAt(state.target);
  const sayHi = sectionBySlug("say-hi");
  return (
    <header className={`grid t-label ${styles.header}`}>
      <span className={styles.who}>{site.name}</span>
      <span className={`c-dim ${styles.where}`}>{label ?? headerLabel(slug)}</span>
      <nav aria-label={site.headerNavLabel} className={styles.links}>
        <a href={site.resume.href} data-cursor-tag={site.resume.label}>
          {site.resume.label}
        </a>
        <a
          href={sayHi.route}
          aria-current={slug === "say-hi" ? "page" : undefined}
        >
          {sayHi.name}
        </a>
      </nav>
    </header>
  );
}
