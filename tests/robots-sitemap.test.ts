// SEO-01 / D-10: robots and sitemap list the seven launch routes.
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { facturo } from "@/content/facturo";
import { sections, site } from "@/content/site";

describe("sitemap", () => {
  const entries = sitemap();

  it("lists exactly the seven launch URLs in source order", () => {
    const expected = [...sections.map((s) => s.route), facturo.route].map(
      (r) => `${site.origin}${r}`,
    );
    expect(entries).toHaveLength(7);
    expect(entries.map((e) => e.url)).toEqual(expected);
  });

  it("never lists the 404", () => {
    for (const e of entries) {
      expect(e.url).not.toMatch(/404|not-found/);
    }
  });

  it("carries no fake freshness", () => {
    for (const e of entries) {
      expect(e).not.toHaveProperty("lastModified");
    }
  });
});

describe("robots", () => {
  it("allows all and points to the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://yahya-hallani.dev/sitemap.xml",
    });
  });
});
