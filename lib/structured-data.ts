import { site } from "@/content/site";

/** SEO-01 / D-09: Person structured data from verified facts only (no contact details, phone, address or image). */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: `${site.origin}/`,
  jobTitle: site.person.jobTitle,
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: site.person.affiliation,
  },
  sameAs: [site.contact.linkedin, site.contact.github],
} as const;

export function serialiseJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
