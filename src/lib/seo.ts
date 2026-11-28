import type { Metadata } from "next";
import { absoluteUrl, getBrand, getContact, getLocations, getPhone, getSite } from "@/lib/site";

interface PageMeta {
  /** Page title. Combined with the site title template, unless `absoluteTitle` is true. */
  title: string;
  description: string;
  /** Path of the page, e.g. "/projects/quiet-gallery". Used for canonical and og:url. */
  path: string;
  image?: { src: string; width?: number; height?: number; alt: string };
  absoluteTitle?: boolean;
  noindex?: boolean;
  type?: "website" | "article";
}

/** Complete, consistent metadata for a page: title, description, canonical, Open Graph, Twitter. */
export function buildMetadata({ title, description, path, image, absoluteTitle, noindex, type = "website" }: PageMeta): Metadata {
  const site = getSite();
  const fullTitle = absoluteTitle ? title : site.seo.titleTemplate.replace("%s", title);
  const img = image ?? site.seo.defaultOgImage;
  const images = [{ url: img.src, width: "width" in img ? img.width : undefined, height: "height" in img ? img.height : undefined, alt: img.alt }];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: { type, siteName: getBrand().name, locale: site.locale, title: fullTitle, description, url: absoluteUrl(path), images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [img.src] },
  };
}

/**
 * Serialises structured data for a <script type="application/ld+json"> tag. Escapes characters that could close the
 * script element or be misread by parsers, so content from a CMS can never break out of the tag.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

/**
 * Site-wide structured data. Policy: placeholder data is never published as structured data — contact details are
 * included only when `contact.isMock` is false, and a location only when its own `isMock` is false.
 */
export function buildSiteJsonLd() {
  const brand = getBrand(), contact = getContact(), url = absoluteUrl("/");
  const organization: Record<string, unknown> = {
    "@type": "Organization", "@id": `${url}#organization`, name: brand.name, url, description: brand.description, logo: absoluteUrl(brand.logo.src),
  };
  if (!contact.isMock) {
    organization.email = contact.emails.primary;
    organization.contactPoint = contact.phones.map((p) => ({ "@type": "ContactPoint", contactType: "customer service", telephone: p.e164, email: contact.emails.primary, availableLanguage: ["en"] }));
    if (contact.social.length) organization.sameAs = contact.social.map((s) => s.url);
  }
  const places = getLocations().filter((l) => !l.isMock).map((l) => ({
    "@type": "LocalBusiness", "@id": `${url}#location-${l.id}`, name: `${brand.name} — ${l.name}`, url, parentOrganization: { "@id": `${url}#organization` },
    telephone: getPhone(l.phoneId).e164, email: l.email ?? contact.emails.primary,
    address: { "@type": "PostalAddress", streetAddress: l.addressLines.join(", ") || undefined, addressLocality: l.city, addressRegion: l.region, postalCode: l.postalCode, addressCountry: l.countryCode },
    ...(l.geo ? { geo: { "@type": "GeoCoordinates", latitude: l.geo.lat, longitude: l.geo.lng } } : {}),
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [organization, { "@type": "WebSite", "@id": `${url}#website`, url, name: brand.name, inLanguage: getSite().language, publisher: { "@id": `${url}#organization` } }, ...places],
  };
}
