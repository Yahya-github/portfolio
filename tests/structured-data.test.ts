// SEO-01 / D-09: Person JSON-LD shape, no PII, script breakout escaped.
import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { personJsonLd, serialiseJsonLd } from "@/lib/structured-data";

describe("personJsonLd", () => {
  it("serialises to the verified Person shape", () => {
    expect(JSON.parse(serialiseJsonLd(personJsonLd))).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Yahya Hallani",
      url: "https://yahya-hallani.dev/",
      jobTitle: "Software Engineering student",
      affiliation: {
        "@type": "CollegeOrUniversity",
        name: "McGill University",
      },
      sameAs: [site.contact.linkedin, site.contact.github],
    });
  });

  it("carries no email, phone or address", () => {
    expect(serialiseJsonLd(personJsonLd)).not.toMatch(
      /telephone|address|email|@gmail/,
    );
  });
});

describe("serialiseJsonLd", () => {
  it("escapes script breakout and round-trips", () => {
    const value = { x: "</script><script>" };
    const out = serialiseJsonLd(value);
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual(value);
  });
});
