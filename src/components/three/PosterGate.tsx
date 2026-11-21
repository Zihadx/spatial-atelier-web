"use client";
import { useState, type ReactNode } from "react";
import { Box } from "lucide-react";
import type { Photo as PhotoData } from "@/data/photos";
import Photo from "@/components/ui/Photo";

/** Poster-first 3D: the heavy scene downloads only after the visitor asks for it. */
export default function PosterGate({ poster, label, hint, children, className }: { poster: PhotoData; label: string; hint: string; children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className={`relative h-full w-full overflow-hidden bg-espresso ${className ?? ""}`}>
      {on ? children : (
        <>
          <Photo photo={poster} sizes="(min-width: 1024px) 66vw, 100vw" />
          <div className="absolute inset-0 bg-charcoal/35" aria-hidden />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-ivory">
            <button type="button" onClick={() => setOn(true)} className="btn btn-solid"><Box size={16} aria-hidden /> {label}</button>
            <p className="max-w-xs text-xs text-sandstone">{hint}</p>
          </div>
        </>
      )}
    </div>
  );
}
