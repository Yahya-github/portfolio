import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

/** SEO-01 / D-10: allow all crawlers and point to the sitemap (launch plan). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.origin}/sitemap.xml`,
  };
}
