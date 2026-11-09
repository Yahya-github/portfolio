import type { ReactNode } from "react";

export type HeadingLevel = 1 | 2 | 3 | 4;

const TAGS = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;

export interface HeadingProps {
  readonly level: HeadingLevel;
  readonly id?: string;
  readonly className?: string;
  readonly children: ReactNode;
}

export function Heading({ level, id, className, children }: HeadingProps) {
  const Tag = TAGS[level];
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
}

export interface PageTitleProps {
  readonly slug: string;
  readonly level: 1 | 2;
  readonly text: string;
  readonly className?: string;
  readonly children?: ReactNode;
}

/**
 * Page heading whose accessible name is exactly `text`. Visual children are
 * aria-hidden. Sections point `aria-labelledby` at `title-${slug}`.
 */
export function PageTitle({
  slug,
  level,
  text,
  className,
  children,
}: PageTitleProps) {
  return (
    <Heading level={level} id={`title-${slug}`} className={className}>
      <span className="visually-hidden">{text}</span>
      {children ? <span aria-hidden="true">{children}</span> : null}
    </Heading>
  );
}
