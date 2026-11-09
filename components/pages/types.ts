/**
 * Props every page component takes. Headings inside a page use
 * `headingLevel + 1`.
 */
export interface PageProps {
  readonly headingLevel: 1 | 2;
  readonly isCurrent: boolean;
}
