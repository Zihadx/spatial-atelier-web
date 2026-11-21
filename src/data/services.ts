export interface Service {
  id: string;
  n: string;
  title: string;
  lead: string;
  body: string;
  scope: string[];
  stage: "residence" | "villa" | "commercial" | "plan" | "styling" | "materials" | "renovation";
  layout: "wide" | "tall" | "offset";
}

export const SERVICES: Service[] = [
  { id: "residential", n: "01", title: "Residential Interior Design", stage: "residence", layout: "wide",
    lead: "Homes planned around the way you live.",
    body: "From first sketch to final styling, one team and one coherent scheme: layouts, joinery, lighting, furnishing and finish.",
    scope: ["Brief and layout", "Joinery and lighting", "Furnishing package"] },
  { id: "villa", n: "02", title: "Luxury Villa Design", stage: "villa", layout: "tall",
    lead: "Interior and landscape sharing one horizon.",
    body: "Large-scale residences where thresholds, courtyards and long sightlines are designed together with the rooms they frame.",
    scope: ["Whole-house concept", "Indoor–outdoor transitions", "Bespoke detailing"] },
  { id: "commercial", n: "03", title: "Commercial Interior Design", stage: "commercial", layout: "offset",
    lead: "Workplaces and hospitality with a calm, durable character.",
    body: "Interiors for offices, suites and public rooms that balance presence, acoustics and day-to-day practicality.",
    scope: ["Space strategy", "Material specification", "Lighting design"] },
  { id: "planning", n: "04", title: "Space Planning", stage: "plan", layout: "wide",
    lead: "Circulation, proportion and light resolved first.",
    body: "Surveys, options and an agreed plan before any surface is chosen, so that every later decision sits on a sound layout.",
    scope: ["Survey and options", "Circulation studies", "Agreed plan"] },
  { id: "styling", n: "05", title: "Furniture & Styling", stage: "styling", layout: "tall",
    lead: "Bespoke and sourced pieces, placed with restraint.",
    body: "Selecting, commissioning and arranging furniture, art and objects so that each piece earns its place.",
    scope: ["Furniture selection", "Bespoke commissions", "Final styling"] },
  { id: "materials", n: "06", title: "Material & Finish Selection", stage: "materials", layout: "offset",
    lead: "Sample boards tested in your own light.",
    body: "Stone, timber, metal and textile chosen together, reviewed in daylight and evening light, and documented in full.",
    scope: ["Palette development", "Physical samples", "Specification schedule"] },
  { id: "renovation", n: "07", title: "Renovation & Consultation", stage: "renovation", layout: "wide",
    lead: "Honest advice on what to keep, change and budget for.",
    body: "A site visit, a clear report and a phased roadmap for existing homes and spaces.",
    scope: ["Site visit", "Written report", "Phased roadmap"] },
];

export const METHOD = [
  { t: "Listen first", d: "Every project begins with how the space is lived in, not how it looks." },
  { t: "Plan before surface", d: "Proportion, circulation and light are settled before materials are chosen." },
  { t: "Test in real light", d: "Samples and 3D previews are reviewed in the light of the actual room." },
  { t: "Detail with restraint", d: "Fewer, better decisions, carried through every junction and edge." },
];

export const FAQ = [
  { q: "How does a project begin?", a: "With a consultation about the space, the household or brand, and the budget. This demonstration site uses placeholder answers; replace them with the studio's real policy." },
  { q: "Do you work remotely?", a: "Placeholder: describe the studio's real remote-working and site-visit policy here." },
  { q: "How is pricing structured?", a: "Placeholder: describe fixed-fee, percentage or hourly options here." },
  { q: "Can you work with existing furniture?", a: "Placeholder: explain how existing pieces are assessed and integrated into a scheme." },
  { q: "What is included in a 3D preview?", a: "The site's 3D scenes illustrate the idea: a walkable preview of layout, light and materials before work begins." },
];
