"use client";
import Image, { type ImageLoaderProps } from "next/image";
import { useState } from "react";
import { isRemote, type Photo as PhotoData } from "@/data/photos";

/** Unsplash serves resized, format-negotiated images from its own CDN, so no server-side optimiser is needed. */
const unsplashLoader = ({ src, width, quality }: ImageLoaderProps) => `${src}?auto=format&fit=crop&crop=entropy&w=${width}&q=${quality ?? 72}`;

interface Props {
  photo: PhotoData;
  sizes?: string;
  priority?: boolean;
  className?: string;
  alt?: string;
}

/** Fill-mode photo with automatic local fallback if the remote image fails. Parent must be `position: relative` with a size. */
export default function Photo({ photo, sizes = "100vw", priority, className, alt }: Props) {
  const [failed, setFailed] = useState(false);
  const src = failed ? photo.fallback : photo.src;
  return (
    <Image
      src={src}
      alt={alt ?? photo.alt}
      fill
      sizes={sizes}
      priority={priority}
      loader={isRemote(src) ? unsplashLoader : undefined}
      onError={() => setFailed(true)}
      className={className ?? "object-cover"}
    />
  );
}
