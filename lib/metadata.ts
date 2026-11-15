import type { Metadata } from "next";
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

type Verification = NonNullable<Metadata["verification"]>;

/** Search Console / Bing tokens come from env vars so they can be set without code changes; nothing renders when unset. */
export function verificationFromEnv(
  env: Readonly<Record<string, string | undefined>>,
): Verification | undefined {
  const google = env.NEXT_PUBLIC_GSC_VERIFICATION?.trim();
  const bing = env.NEXT_PUBLIC_BING_VERIFICATION?.trim();
  if (!google && !bing) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: site.seoTitle,
  verification: verificationFromEnv(process.env),
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

export function deepDiveMetadata(
  c: Readonly<{ route: string; metaTitle: string; metaDescription: string }>,
): Metadata {
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: c.route },
    openGraph: {
      ...OG_BASE,
      title: c.metaTitle,
      description: c.metaDescription,
      url: c.route,
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
