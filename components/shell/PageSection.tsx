"use client";

/**
 * One page of the track (A11Y-01). Projects pager state live: inert,
 * data-collapsed and the title's heading level. The page body is a server
 * child passed through, so it never re-renders (RESEARCH Pattern 1).
 */
import type { ReactNode } from "react";
import { PageLevelProvider } from "@/components/pages/PageLevel";
import type { Slug } from "@/content/types";
import { headingLevelOf, isCollapsed, isLive } from "@/lib/pager/state";
import { usePagerState } from "./PagerContext";
import styles from "./shell.module.css";

interface PageSectionProps {
  readonly index: number;
  readonly slug: Slug;
  readonly initialIndex: number;
  readonly children: ReactNode;
}

export function PageSection({
  index,
  slug,
  initialIndex,
  children,
}: PageSectionProps) {
  const state = usePagerState(initialIndex);
  return (
    <section
      id={`page-${slug}`}
      data-page={slug}
      inert={!isLive(state, index)}
      data-collapsed={isCollapsed(state, index) ? "" : undefined}
      aria-labelledby={`title-${slug}`}
      className={styles.page}
    >
      <PageLevelProvider level={headingLevelOf(state, index)}>
        {children}
      </PageLevelProvider>
    </section>
  );
}
