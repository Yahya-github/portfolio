"use client";

import type { ReactNode } from "react";
import { usePageLevel } from "./PageLevel";

export type HeadingLevel = 1 | 2 | 3 | 4;

const TAGS = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;

const MAX_LEVEL = 4;

export interface HeadingProps {
  /** Levels below the page title: 0 is the title itself. */
  readonly offset?: 0 | 1 | 2;
  readonly id?: string;
  readonly tabIndex?: number;
  readonly className?: string;
  readonly children: ReactNode;
}

/** Heading whose level is the page level (from PageLevel context) plus `offset`. */
export function Heading({
  offset = 0,
  id,
  tabIndex,
  className,
  children,
}: HeadingProps) {
  const level = Math.min(usePageLevel() + offset, MAX_LEVEL) as HeadingLevel;
  const Tag = TAGS[level];
  return (
    <Tag id={id} tabIndex={tabIndex} className={className}>
      {children}
    </Tag>
  );
}

export interface PageTitleProps {
  readonly slug: string;
  readonly text: string;
  readonly className?: string;
  readonly children?: ReactNode;
}

/**
 * Page heading whose accessible name is exactly `text`. Visual children are
 * aria-hidden. Sections point `aria-labelledby` at `title-${slug}`, and the
 * pager moves focus here after a page change (tabIndex -1 keeps it out of the
 * Tab order).
 */
export function PageTitle({ slug, text, className, children }: PageTitleProps) {
  return (
    <Heading id={`title-${slug}`} tabIndex={-1} className={className}>
      <span className="visually-hidden">{text}</span>
      {children ? <span aria-hidden="true">{children}</span> : null}
    </Heading>
  );
}
