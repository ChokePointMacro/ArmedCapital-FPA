import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/services",
    "/about",
    "/investors",
    "/contact",
    "/privacy",
    "/terms",
  ];
  const legal = new Set(["/privacy", "/terms"]);
  return routes.map((path) => ({
    url: `${SITE.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : legal.has(path) ? 0.3 : 0.7,
  }));
}
