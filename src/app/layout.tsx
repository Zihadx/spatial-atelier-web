import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE } from "@/lib/constants";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website", siteName: SITE.name, title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description,
    images: [{ url: "/images/hero/living-room.jpg", width: 1600, height: 1000, alt: "A 3D-rendered luxury living room with travertine, walnut and a curved boucle sofa" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { viewportFit: "cover", themeColor: "#332B24", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} ${manrope.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "Organization", name: SITE.name, url: SITE.url, description: SITE.description, logo: `${SITE.url}/icon.svg` }, { "@type": "WebSite", name: SITE.name, url: SITE.url }] }) }} />
        <noscript><style>{`[data-reveal],[data-split]{opacity:1!important}`}</style></noscript>
        {children}
      </body>
    </html>
  );
}
