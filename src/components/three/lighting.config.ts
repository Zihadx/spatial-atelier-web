import type { LightMode, Vec3 } from "@/types";

export interface LightRig {
  sun: string; sunI: number; sunPos: Vec3;
  hemiSky: string; hemiGround: string; hemiI: number;
  env: number; envTint: string;
  skyTop: string; skyMid: string; skyBot: string;
  lamp: number; lampColor: string; exposure: number; fog: string; ambient: number; ceil: number;
}

export const LIGHT: Record<LightMode, LightRig> = {
  natural: {
    sun: "#FFE7C4", sunI: 4.6, sunPos: [14, 9, 3], hemiSky: "#FAF8F4", hemiGround: "#A99B88", hemiI: 0.85,
    env: 1, envTint: "#FFF1DC", skyTop: "#FDF3DF", skyMid: "#F3DCB0", skyBot: "#7A8A62",
    lamp: 0.25, lampColor: "#FFD9A0", exposure: 1, fog: "#E9DFCE", ambient: 0.35, ceil: 0.55,
  },
  warm: {
    sun: "#FFC98A", sunI: 1.9, sunPos: [14, 3.6, 3], hemiSky: "#F3E2C8", hemiGround: "#60432F", hemiI: 0.8,
    env: 0.75, envTint: "#FFC98A", skyTop: "#F6D9A6", skyMid: "#E0A86C", skyBot: "#4F513A",
    lamp: 1, lampColor: "#FFC27A", exposure: 1.05, fog: "#2C241D", ambient: 0.18, ceil: 0.3,
  },
  dusk: {
    sun: "#FF8A4C", sunI: 0.8, sunPos: [14, 2.4, 2], hemiSky: "#5B6285", hemiGround: "#241D1A", hemiI: 0.22,
    env: 0.3, envTint: "#FFA66E", skyTop: "#3A3F5E", skyMid: "#C97B5A", skyBot: "#1D1B20",
    lamp: 2.4, lampColor: "#FFB874", exposure: 1.1, fog: "#201B1A", ambient: 0.05, ceil: 0.08,
  },
};
