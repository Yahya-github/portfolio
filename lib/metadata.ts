import type { Metadata } from "next";
import { facturo } from "@/content/facturo";
import { notFound } from "@/content/not-found";
import { site } from "@/content/site";
import type { Slug } from "@/content/types";
import { sectionBySlug } from "@/lib/sections";

export const SHARE_IMAGE = {
  url: "/share-card.png",
  width: 1200,
  height: 630,
  alt: site.shareCardAlt,
} as const;

// Next merges openGraph shallowly: every builder must spread OG_BASE or the card disappears on that route.
const OG_BASE = {
  type: "website" as const,
  siteName: site.name,
  images: [SHARE_IMAGE],
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: site.name,
  openGraph: { ...OG_BASE, url: "/" },
  twitter: { card: "summary_large_image", images: [SHARE_IMAGE] },
};

// The canonical is relative; metadataBase makes it absolute with the trailing slash.
export function pageMetadata(slug: Slug): Metadata {
  const s = sectionBySlug(slug);
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: s.route },
    openGraph: {
      ...OG_BASE,
      title: s.title,
      description: s.description,
      url: s.route,
    },
  };
}

export function deepDiveMetadata(): Metadata {
  return {
    title: facturo.metaTitle,
    description: facturo.metaDescription,
    alternates: { canonical: facturo.route },
    openGraph: {
      ...OG_BASE,
      title: facturo.metaTitle,
      description: facturo.metaDescription,
      url: facturo.route,
    },
  };
}

// UI-SPEC: noindex, follow forever; no canonical; not in the sitemap (D-10).
export function notFoundMetadata(): Metadata {
  return {
    title: notFound.metaTitle,
    robots: { index: false, follow: true },
    openGraph: { ...OG_BASE, title: notFound.metaTitle },
  };
}
