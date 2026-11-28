import { navigationSchema } from "./schema";

export const navigationConfig = navigationSchema.parse({
  main: [
    { href: "/projects", label: "Projects" },
    { href: "/services", label: "Services" },
    { href: "/studio", label: "Studio" },
    { href: "/materials", label: "Materials" },
    { href: "/journal", label: "Journal" },
    { href: "/contact", label: "Contact" },
  ],
  footerServices: [
    { href: "/services#residential", label: "Residential Interior Design" },
    { href: "/services#villa", label: "Luxury Villa Design" },
    { href: "/services#commercial", label: "Commercial Interiors" },
    { href: "/services#planning", label: "Space Planning" },
    { href: "/services#styling", label: "Furniture & Styling" },
    { href: "/services#materials", label: "Materials & Finishes" },
    { href: "/services#renovation", label: "Renovation & Consultation" },
  ],
});
