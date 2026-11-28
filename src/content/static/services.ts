import type { FaqItem, MethodStep, Service } from "../types";

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

export const METHOD: MethodStep[] = [
  { t: "Listen first", d: "Every project begins with how the space is lived in, not how it looks." },
  { t: "Plan before surface", d: "Proportion, circulation and light are settled before materials are chosen." },
  { t: "Test in real light", d: "Samples and 3D previews are reviewed in the light of the actual room." },
  { t: "Detail with restraint", d: "Fewer, better decisions, carried through every junction and edge." },
];

/** Marked isMock: generic placeholder answers — replace with the studio's real policies before launch. */
export const FAQ: FaqItem[] = [
  { q: "How does a project begin?", a: "With a consultation about the space, the household or brand, and the budget. We then write a short brief that every later decision is checked against.", isMock: true },
  { q: "Do you work remotely?", a: "Yes. Concept, planning and material reviews can be done remotely with 3D previews; site visits are scheduled where the project needs them.", isMock: true },
  { q: "How is pricing structured?", a: "After the first consultation we propose a fee for each stage, so you know what you are committing to before the work begins.", isMock: true },
  { q: "Can you work with existing furniture?", a: "Yes. We assess what you own for quality and fit, and integrate the best pieces into the scheme.", isMock: true },
  { q: "What is included in a 3D preview?", a: "A walkable preview of layout, light and materials, so you can judge the space before work begins.", isMock: true },
];
