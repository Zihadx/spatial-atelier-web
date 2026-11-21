"use client";
import { createContext, useContext } from "react";
import type { Quality } from "@/lib/webgl";

export const QualityContext = createContext<Quality>("medium");
export const useQuality = () => useContext(QualityContext);
