/**
 * The ONLY place components should read site-wide information from (brand, contact, locations, navigation, SEO, URLs).
 * Server-side module: it validates env. Client components receive what they need as props from a server parent,
 * and use the pure helpers in lib/contact-links.ts.
 *
 * Swapping to a CMS later means changing where these accessors read from — call sites stay the same.
 */
import { brandConfig } from "@/config/brand.config";
import { contactConfig } from "@/config/contact.config";
import { locationsConfig } from "@/config/locations.config";
import { navigationConfig } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import type { BrandConfig, ContactConfig, LocationConfig, NavigationConfig, PhoneConfig, SiteConfig } from "@/config/schema";
import { getEnv } from "@/env";

export type { BrandConfig, ContactConfig, LocationConfig, NavigationConfig, PhoneConfig, SiteConfig };

/** Public origin without a trailing slash. Production requires NEXT_PUBLIC_SITE_URL (validated in env.ts). */
export function getSiteUrl(): string {
  const url = getEnv().NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}
export const absoluteUrl = (path = "/") => `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`.replace(/\/$/, "") || getSiteUrl();

export const getBrand = (): BrandConfig => brandConfig;
export const getSite = (): SiteConfig => siteConfig;
export const getContact = (): ContactConfig => contactConfig;
export const getNavigation = (): NavigationConfig => navigationConfig;
export const getLocations = (): readonly LocationConfig[] => locationsConfig;
export const getPrimaryLocation = (): LocationConfig => locationsConfig.find((l) => l.primary) ?? locationsConfig[0];
export const getPrimaryPhone = (): PhoneConfig => contactConfig.phones[0];
export const getPhone = (id?: string): PhoneConfig => contactConfig.phones.find((p) => p.id === id) ?? getPrimaryPhone();

/** Where contact-form messages go: env override, otherwise the configured primary email. */
export const getContactDestination = (): string => getEnv().CONTACT_TO_EMAIL ?? contactConfig.emails.primary;

/** Everything flagged as placeholder data — a launch checklist (also asserted in tests). */
export function getMockInventory(): string[] {
  return [
    ...(contactConfig.isMock ? ["contact.config: email and phone are placeholders"] : []),
    ...(contactConfig.form.isMock ? ["contact.config: form budget ranges are placeholders"] : []),
    ...locationsConfig.filter((l) => l.isMock).map((l) => `locations.config: "${l.name}" is mock data`),
  ];
}
