import type { PhilosophyItem, ProcessStage, TeamMember, Testimonial, ValueItem } from "../types";

export const PHILOSOPHY: PhilosophyItem[] = [
  { n: "01", t: "Timelessness", d: "Rooms designed to feel right in twenty years, not just this season." },
  { n: "02", t: "Material honesty", d: "Stone, timber and metal shown for what they are, finished by hand." },
  { n: "03", t: "Functional elegance", d: "Beauty that makes daily life easier, never harder." },
  { n: "04", t: "Natural light", d: "Plans built around the sun's path and the hour a room is used." },
  { n: "05", t: "Spatial harmony", d: "Proportion and circulation resolved before decoration begins." },
  { n: "06", t: "Thoughtful detailing", d: "Fewer junctions, cleaner edges, shadow gaps instead of trims." },
];

export const PROCESS: ProcessStage[] = [
  { n: "01", t: "Discovery & Consultation", d: "A site visit, a conversation about how you live, and an honest budget discussion.", out: "Written brief" },
  { n: "02", t: "Concept Development", d: "Mood, massing and a first spatial idea, shown as sketches and a rough 3D model.", out: "Concept presentation" },
  { n: "03", t: "Spatial Planning", d: "Plans, circulation and furniture layouts tested in a walkable 3D preview.", out: "Agreed floor plan" },
  { n: "04", t: "Material Selection", d: "Stone, timber, metal and textile chosen together and viewed in real light.", out: "Material boards" },
  { n: "05", t: "Design Development", d: "Joinery, lighting and technical details drawn and coordinated.", out: "Technical drawings" },
  { n: "06", t: "Execution & Styling", d: "Coordination with trades on site, then furniture, art and final styling.", out: "Site supervision" },
  { n: "07", t: "Final Handover", d: "A walk-through, a care guide and a snagging list closed out together.", out: "Care guide" },
];

export const VALUES: ValueItem[] = [
  { t: "Calm over noise", d: "We remove before we add." },
  { t: "Touch matters", d: "Every surface is chosen to be felt as well as seen." },
  { t: "Light first", d: "We design for daylight, then for evening." },
  { t: "Built to last", d: "Craft, repair and patina over disposability." },
];

/** Roles only — no invented people. isMock: replace with the real team (names, portraits) before launch. */
export const TEAM: TeamMember[] = [
  { role: "Creative Director", note: "Sets the design direction for every project.", tone: "walnut", isMock: true },
  { role: "Principal Architect", note: "Resolves structure, plan and proportion.", tone: "travertine", isMock: true },
  { role: "Senior Interior Designer", note: "Develops rooms, joinery and lighting.", tone: "stone", isMock: true },
  { role: "Materials & Styling Lead", note: "Selects finishes and styles the final scheme.", tone: "plaster", isMock: true },
];

/** Illustrative quotes, not verified client feedback (isMock). The UI keeps a small "Illustrative" marker on them. */
export const TESTIMONIALS: Testimonial[] = [
  { quote: "A calm, beautifully resolved home — every room feels like it has always been there.", by: "Residential client", isMock: true },
  { quote: "The 3D preview let us understand the space long before building began.", by: "Villa client", isMock: true },
  { quote: "Materials, light and furniture were treated as a single idea.", by: "Hospitality client", isMock: true },
];
