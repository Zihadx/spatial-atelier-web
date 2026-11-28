/** Zod schemas for every configuration file. Config is validated when its module loads, so bad data fails fast. */
import { z } from "zod";

export const e164 = z.string().regex(/^\+[1-9]\d{7,14}$/, "must be E.164, e.g. +8801304610108");
const weekday = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM, 24h");
const path = z.string().regex(/^\/[A-Za-z0-9\-_/#?=&.]*$/, "internal path starting with /");

export const phoneSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  e164,
  /** Human-readable form shown in the UI. */
  display: z.string().min(5),
});

export const hoursSchema = z.object({
  days: z.array(weekday).min(1),
  opens: time,
  closes: time,
  note: z.string().optional(),
});

export const locationSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(["studio", "showroom", "office"]),
  name: z.string().min(1),
  area: z.string().min(1),
  city: z.string().min(1),
  region: z.string().optional(),
  country: z.string().min(1),
  countryCode: z.string().length(2),
  /** Street lines. Leave empty until a real address exists — never invent one. */
  addressLines: z.array(z.string()),
  /** Shown instead of a street address, e.g. "Exact address shared when you book a visit." */
  addressNote: z.string().optional(),
  postalCode: z.string().optional(),
  geo: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  timezone: z.string().min(1),
  hours: z.array(hoursSchema),
  phoneId: z.string().optional(),
  email: z.email().optional(),
  appointmentOnly: z.boolean().default(false),
  primary: z.boolean().default(false),
  /** Placeholder data that must be replaced before launch. Mock locations are excluded from structured data. */
  isMock: z.boolean(),
});

export const brandSchema = z.object({
  name: z.string().min(1),
  /** The wordmark is typeset as "lead <em>accent</em>". lead + accent must equal name. */
  wordmark: z.object({ lead: z.string().min(1), accent: z.string().min(1) }),
  tagline: z.string().min(1),
  description: z.string().min(20),
  logo: z.object({ src: path, alt: z.string().min(1) }),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fonts: z.object({ display: z.string(), body: z.string() }),
}).refine((b) => `${b.wordmark.lead} ${b.wordmark.accent}` === b.name, { message: "wordmark parts must spell the brand name" });

export const socialSchema = z.object({
  platform: z.enum(["instagram", "linkedin", "pinterest", "facebook", "youtube", "x", "behance"]),
  url: z.url(),
  label: z.string().min(1),
});

export const contactSchema = z.object({
  /** Contact details are placeholders supplied for the project; replace before launch. */
  isMock: z.boolean(),
  emails: z.object({ primary: z.email(), support: z.email() }),
  phones: z.array(phoneSchema).min(1),
  whatsapp: z.object({ e164, defaultMessage: z.string().min(1) }).optional(),
  social: z.array(socialSchema),
  form: z.object({
    /** Selectable budget bands in the enquiry form. */
    budgetRanges: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).min(2),
    isMock: z.boolean(),
  }),
});

export const navItemSchema = z.object({ label: z.string().min(1), href: path });
export const navigationSchema = z.object({ main: z.array(navItemSchema).min(1), footerServices: z.array(navItemSchema) });

export const siteSchema = z.object({
  locale: z.string().min(2),
  language: z.string().min(2),
  seo: z.object({
    titleTemplate: z.string().includes("%s"),
    defaultOgImage: z.object({ src: path, width: z.number().int().positive(), height: z.number().int().positive(), alt: z.string().min(1) }),
    robots: z.object({ disallow: z.array(path) }),
  }),
  /** Which static routes appear in the sitemap. */
  sitemapPages: z.array(path).min(1),
  /** Shown on project pages: these are concept renders, not delivered client work. */
  projectNote: z.string().min(1),
});

export type PhoneConfig = z.infer<typeof phoneSchema>;
export type LocationConfig = z.infer<typeof locationSchema>;
export type HoursConfig = z.infer<typeof hoursSchema>;
export type BrandConfig = z.infer<typeof brandSchema>;
export type ContactConfig = z.infer<typeof contactSchema>;
export type NavigationConfig = z.infer<typeof navigationSchema>;
export type SiteConfig = z.infer<typeof siteSchema>;
export type SocialConfig = z.infer<typeof socialSchema>;
