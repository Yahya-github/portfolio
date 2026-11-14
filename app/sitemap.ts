import type { MetadataRoute } from "next";
import { atlantis } from "@/content/atlantis";
import { facturo } from "@/content/facturo";
import { robot } from "@/content/robot";
import { sections, site } from "@/content/site";

export const dynamic = "force-static";

/** SEO-01 / D-10: the nine launch routes, no 404, no fake lastModified (launch plan). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...sections.map((s) => s.route),
    facturo.route,
    atlantis.route,
    robot.route,
  ].map((route) => ({
    url: `${site.origin}${route}`,
  }));
}
