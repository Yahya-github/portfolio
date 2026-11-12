/**
 * Props every page component takes. `isCurrent` is the route the HTML was
 * exported for: a load hint for eager photos, not live pager state. Heading
 * levels come from PageLevel context.
 */
export interface PageProps {
  readonly isCurrent: boolean;
}
