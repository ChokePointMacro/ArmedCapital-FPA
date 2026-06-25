import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { CookieConsent } from "@/components/CookieConsent";
import { JsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Armed Capital — FP&A & Demand Forecasting",
    template: "%s · Armed Capital",
  },
  description: SITE.description,
  keywords: [
    "FP&A",
    "demand forecasting",
    "inventory forecasting",
    "supply chain finance",
    "rolling forecast",
    "order recommendations",
    "ABC classification",
    "days on hand",
  ],
  openGraph: {
    title: "Armed Capital — FP&A & Demand Forecasting",
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Armed Capital — FP&A & Demand Forecasting",
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0e16",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        {/* Parser-blocking inline script — runs before body paint. Enables the
            scroll-reveal hidden state, and force-reveals everything after a
            timeout so a hydration failure can never leave the page blank. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('reveal-all')},2600);",
          }}
        />
        <JsonLd />
        <div className="grid-backdrop" aria-hidden />
        <div className="grid-glow" aria-hidden />
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <CookieConsent />
      </body>
    </html>
  );
}
