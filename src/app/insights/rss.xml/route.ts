import { getAllPostMeta } from "@/lib/posts";
import { SITE } from "@/lib/content";

// f11 — RSS 2.0 feed for the insights blog.
export function GET() {
  const posts = getAllPostMeta();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE.url}/insights/${p.slug}</link>
      <guid>${SITE.url}/insights/${p.slug}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      <category>${escapeXml(p.category)}</category>
      ${p.date ? `<pubDate>${new Date(p.date).toUTCString()}</pubDate>` : ""}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE.name} — Insights</title>
    <link>${SITE.url}/insights</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
