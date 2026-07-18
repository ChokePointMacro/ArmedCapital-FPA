import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Client portal: private by definition, keep it out of search.
      disallow: ["/app", "/signin"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
