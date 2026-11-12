import { describe, expect, it } from "vitest";
import { facturo } from "@/content/facturo";
import { sections, site } from "@/content/site";
import {
  SHARE_IMAGE,
  deepDiveMetadata,
  notFoundMetadata,
  pageMetadata,
  rootMetadata,
} from "@/lib/metadata";
import { sectionBySlug } from "@/lib/sections";

describe("rootMetadata", () => {
  it("sets the canonical origin", () => {
    expect(rootMetadata.metadataBase).toBeInstanceOf(URL);
    expect(String(rootMetadata.metadataBase)).toBe(
      "https://yahya-hallani.dev/",
    );
  });

  it("keeps the site out of search indexes until launch", () => {
    expect(rootMetadata.robots).toEqual({ index: false, follow: false });
  });

  it("carries the share card on openGraph and twitter", () => {
    expect(rootMetadata.openGraph).toMatchObject({
      type: "website",
      siteName: "Yahya Hallani",
      url: "/",
      images: [SHARE_IMAGE],
    });
    expect(rootMetadata.twitter).toEqual({
      card: "summary_large_image",
      images: [SHARE_IMAGE],
    });
  });
});

describe("SHARE_IMAGE", () => {
  it("is a 1200x630 card with alt text", () => {
    expect(SHARE_IMAGE).toEqual({
      url: "/share-card.png",
      width: 1200,
      height: 630,
      alt: site.shareCardAlt,
    });
  });
});

describe("pageMetadata", () => {
  it("builds title, description, canonical and openGraph", () => {
    const s = sectionBySlug("achievements");
    expect(pageMetadata("achievements")).toEqual({
      title: s.title,
      description: s.description,
      alternates: { canonical: "/achievements/" },
      openGraph: {
        type: "website",
        siteName: "Yahya Hallani",
        images: [SHARE_IMAGE],
        title: s.title,
        description: s.description,
        url: "/achievements/",
      },
    });
  });

  it("uses the root canonical for the index", () => {
    expect(pageMetadata("index").alternates).toEqual({ canonical: "/" });
  });

  it.each(sections.map((s) => [s.slug, s] as const))(
    "%s keeps the card in its own openGraph",
    (slug, s) => {
      const og = pageMetadata(slug).openGraph;
      expect(og).toMatchObject({
        type: "website",
        siteName: "Yahya Hallani",
        images: [SHARE_IMAGE],
        title: s.title,
        description: s.description,
        url: s.route,
      });
    },
  );
});

describe("deepDiveMetadata", () => {
  it("builds the Facturo title and canonical", () => {
    const m = deepDiveMetadata();
    expect(m.title).toBe(facturo.metaTitle);
    expect(m.alternates).toEqual({ canonical: "/projects/facturo/" });
  });

  it("keeps the card and og:url", () => {
    expect(deepDiveMetadata().openGraph).toMatchObject({
      url: "/projects/facturo/",
      images: [SHARE_IMAGE],
    });
  });
});

describe("notFoundMetadata", () => {
  it("is noindex,follow with no canonical and still has the card", () => {
    const m = notFoundMetadata();
    expect(m.title).toBe("Page not found, Yahya Hallani");
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.alternates).toBeUndefined();
    expect(m.openGraph).toMatchObject({ images: [SHARE_IMAGE] });
  });
});
