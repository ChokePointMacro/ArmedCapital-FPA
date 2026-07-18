import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";
import { getAllPostMeta } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/services",
    "/pricing",
    "/calculator",
    "/assessment",
    "/demo",
    "/dashboard",
    "/reports",
    "/pipeline",
    "/case-studies",
    "/insights",
    "/about",
    "/investors",
    "/trust",
    "/contact",
    "/privacy",
    "/terms",
  ];
  const legal = new Set(["/privacy", "/terms"]);

  const staticEntries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${SITE.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : legal.has(path) ? 0.3 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = getAllPostMeta().map((p) => ({
    url: `${SITE.url}/insights/${p.slug}`,
    lastModified: p.date || undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries];
}
