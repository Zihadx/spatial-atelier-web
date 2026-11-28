import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { buildSiteJsonLd, serializeJsonLd } from "@/lib/seo";
import { getBrand, getSite, getSiteUrl } from "@/lib/site";
import "./globals.css";

const instrument = localFont({
  src: [
    { path: "../fonts/InstrumentSerif-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/InstrumentSerif-Italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});
const manrope = localFont({ src: "../fonts/Manrope.ttf", variable: "--font-manrope", weight: "200 800", display: "swap" });

const brand = getBrand();
const site = getSite();
const ogImage = site.seo.defaultOgImage;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: `${brand.name} — ${brand.tagline}`, template: site.seo.titleTemplate },
  description: brand.description,
  applicationName: brand.name,
  openGraph: { type: "website", siteName: brand.name, locale: site.locale, title: `${brand.name} — ${brand.tagline}`, description: brand.description, images: [{ url: ogImage.src, width: ogImage.width, height: ogImage.height, alt: ogImage.alt }] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { viewportFit: "cover", themeColor: brand.themeColor, width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.language} className={`${instrument.variable} ${manrope.variable}`}>
      {/* suppressHydrationWarning: browser extensions (Grammarly, password managers…) inject attributes on <body> before React hydrates */}
      <body suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildSiteJsonLd()) }} />
        <noscript><style>{`[data-reveal],[data-split]{opacity:1!important}`}</style></noscript>
        {children}
      </body>
    </html>
  );
}
