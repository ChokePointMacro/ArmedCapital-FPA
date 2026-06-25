import { SITE, PLATFORMS } from "@/lib/content";

// f05 — JSON-LD structured data (Organization + ProfessionalService).
// Rendered server-side in the root layout so it's present for crawlers.
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        url: SITE.url,
        email: SITE.email,
        description: SITE.description,
        slogan: "Arm your capital decisions.",
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE.url}/#service`,
        name: `${SITE.name} — FP&A & Demand Forecasting`,
        url: SITE.url,
        parentOrganization: { "@id": `${SITE.url}/#organization` },
        description: SITE.description,
        serviceType: [
          "FP&A consulting",
          "Demand forecasting",
          "Inventory & supply-chain financial modeling",
        ],
        areaServed: ["US", "CA", "Global"],
        knowsAbout: PLATFORMS,
        audience: {
          "@type": "BusinessAudience",
          audienceType: "Physical-product companies, $10M–$500M revenue",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // schema markup is static, author-controlled content
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
