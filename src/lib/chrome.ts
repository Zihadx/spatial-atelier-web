/** Serializable site-wide data for the client-side shell (navbar, menu, footer, preloader). Built on the server. */
import { formatAddress, formatHours, mailtoHref, telHref, whatsappHref } from "@/lib/contact-links";
import { getBrand, getContact, getLocations, getNavigation, getPhone, getPrimaryPhone } from "@/lib/site";
import type { NavigationConfig, SocialConfig } from "@/config/schema";

export interface ChromeData {
  brand: { name: string; tagline: string; wordmark: { lead: string; accent: string } };
  nav: NavigationConfig;
  contact: { email: string; emailHref: string; phoneDisplay: string; phoneHref: string; whatsappHref: string | null; social: SocialConfig[] };
  locations: { id: string; name: string; address: string[]; hours: string[]; phoneDisplay: string }[];
  year: number;
}

export function getChromeData(): ChromeData {
  const brand = getBrand(), contact = getContact(), phone = getPrimaryPhone();
  return {
    brand: { name: brand.name, tagline: brand.tagline, wordmark: brand.wordmark },
    nav: getNavigation(),
    contact: {
      email: contact.emails.primary, emailHref: mailtoHref(contact.emails.primary), phoneDisplay: phone.display, phoneHref: telHref(phone.e164),
      whatsappHref: contact.whatsapp ? whatsappHref(contact.whatsapp.e164, contact.whatsapp.defaultMessage) : null, social: contact.social,
    },
    locations: getLocations().map((l) => ({ id: l.id, name: l.name, address: formatAddress(l), hours: l.hours.map(formatHours), phoneDisplay: getPhone(l.phoneId).display })),
    year: new Date().getFullYear(),
  };
}
