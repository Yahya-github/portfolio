import type { MetadataRoute } from "next";
import { atlantis } from "@/content/atlantis";
import { facturo } from "@/content/facturo";
import { robot } from "@/content/robot";
import { sections, site } from "@/content/site";

export const dynamic = "force-static";

/** SEO-01 / D-10: the nine launch routes, no 404. lastModified is the build date (static export, so it moves on every deploy). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...sections.map((s) => s.route),
    facturo.route,
    atlantis.route,
    robot.route,
  ].map((route) => ({
    url: `${site.origin}${route}`,
    lastModified,
  }));
}
