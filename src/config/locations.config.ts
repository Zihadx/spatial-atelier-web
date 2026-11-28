import { z } from "zod";
import { locationSchema } from "./schema";

const sunToThu = ["sun", "mon", "tue", "wed", "thu"] as const;

/**
 * Studio locations. Both are MOCK: area-level only, with no street address on purpose.
 * When a real address exists, fill `addressLines` (and `geo`), then set `isMock: false` — structured data (JSON-LD)
 * only ever includes locations that are not mock.
 */
export const locationsConfig = z.array(locationSchema).min(1).parse([
  {
    id: "gulshan-studio", type: "studio", name: "Gulshan Studio", area: "Gulshan", city: "Dhaka", region: "Dhaka Division",
    country: "Bangladesh", countryCode: "BD", addressLines: [], addressNote: "Exact address shared when you book a visit.",
    timezone: "Asia/Dhaka", hours: [{ days: sunToThu, opens: "10:00", closes: "18:00" }, { days: ["sat"], opens: "11:00", closes: "15:00", note: "By appointment" }],
    phoneId: "main", appointmentOnly: true, primary: true, isMock: true,
  },
  {
    id: "dhanmondi-showroom", type: "showroom", name: "Dhanmondi Showroom", area: "Dhanmondi", city: "Dhaka", region: "Dhaka Division",
    country: "Bangladesh", countryCode: "BD", addressLines: [], addressNote: "Exact address shared when you book a visit.",
    timezone: "Asia/Dhaka", hours: [{ days: ["sat", ...sunToThu], opens: "11:00", closes: "19:00" }],
    phoneId: "main", appointmentOnly: false, primary: false, isMock: true,
  },
]);
