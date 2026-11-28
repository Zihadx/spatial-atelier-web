import { contactSchema } from "./schema";

/**
 * Contact channels. Every value here is consumed through lib/site.ts — never copy these into components.
 * `isMock: true` marks placeholder details supplied for the project; replace them (or override via env) before launch.
 */
export const contactConfig = contactSchema.parse({
  isMock: true,
  emails: { primary: "nzihad.io@gmail.com", support: "nzihad.io@gmail.com" },
  phones: [{ id: "main", label: "Studio", e164: "+8801304610108", display: "+880 1304 610108" }],
  whatsapp: { e164: "+8801304610108", defaultMessage: "Hello Atelier Verre, I would like to talk about a project." },
  // No social profiles have been supplied. Add { platform, url, label } entries here and the footer renders them.
  social: [],
  form: {
    isMock: true,
    budgetRanges: [
      { value: "discuss", label: "Prefer to discuss" },
      { value: "lt-25l", label: "Under BDT 25 lakh" },
      { value: "25l-60l", label: "BDT 25 – 60 lakh" },
      { value: "60l-1_5cr", label: "BDT 60 lakh – 1.5 crore" },
      { value: "gt-1_5cr", label: "Above BDT 1.5 crore" },
    ],
  },
});
