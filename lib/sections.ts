import { sections, site } from "@/content/site";
import type { Route, Section, Slug } from "@/content/types";

const ALL: readonly Section[] = sections;

export interface NextLink {
  readonly href: Route;
  readonly label: string;
}

export function sectionBySlug(slug: Slug): Section {
  const found = ALL.find((s) => s.slug === slug);
  if (!found) throw new Error(`unknown section: ${slug}`);
  return found;
}

export function indexOfSlug(slug: Slug): number {
  return ALL.indexOf(sectionBySlug(slug));
}

export function nextLink(slug: Slug): NextLink {
  const next = ALL[indexOfSlug(slug) + 1];
  if (!next) return { href: "/", label: site.footer.backToStart };
  return { href: next.route, label: `${site.footer.nextPrefix}${next.name}` };
}

export function counterLabel(slug: Slug): string {
  const last = ALL[ALL.length - 1];
  return `${sectionBySlug(slug).number}${site.footer.counterSeparator}${last.number}`;
}

export function headerLabel(slug: Slug): string {
  if (slug === "index") return site.indexHeaderLabel;
  const s = sectionBySlug(slug);
  return `${s.number} ${s.name}`;
}

export function letterSections(): readonly Section[] {
  return ALL.filter((s) => s.letter !== null);
}
