import type { Metadata } from "next";
import { facturo } from "@/content/facturo";
import { site } from "@/content/site";
import type { Slug } from "@/content/types";
import { sectionBySlug } from "@/lib/sections";

// Phase 2 D-12: stay out of search indexes until launch.
export const rootMetadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: site.name,
  robots: { index: false, follow: false },
};

// The canonical is relative; metadataBase makes it absolute with the trailing slash.
export function pageMetadata(slug: Slug): Metadata {
  const s = sectionBySlug(slug);
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: s.route },
  };
}

export function deepDiveMetadata(): Metadata {
  return {
    title: facturo.metaTitle,
    description: facturo.metaDescription,
    alternates: { canonical: facturo.route },
  };
}
