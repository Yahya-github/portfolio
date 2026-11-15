import { site } from "@/content/site";

const HOME = `${site.origin}/`;
const PERSON_ID = `${HOME}#person`;

/** SEO-01 / D-09: Person structured data from verified facts only (no contact details, phone or address). */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: site.name,
  url: HOME,
  mainEntityOfPage: HOME,
  image: `${site.origin}/share-card.png`,
  description: `${site.person.jobTitle} at ${site.person.affiliation}. Competition results, projects and experience.`,
  jobTitle: site.person.jobTitle,
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: site.person.affiliation,
  },
  sameAs: [site.contact.linkedin, site.contact.github],
} as const;

/** WebSite entity so the name query ties the domain to the Person. */
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${HOME}#website`,
  name: site.name,
  url: HOME,
  inLanguage: "en",
  author: { "@id": PERSON_ID },
} as const;

export function serialiseJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
