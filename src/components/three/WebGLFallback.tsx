import Image from "next/image";

/** Static image shown before WebGL boots, when WebGL is unavailable, or when a scene is paused offscreen. */
export default function WebGLFallback({ src, alt, priority = false, sizes = "(min-width: 1024px) 66vw, 100vw" }: { src: string; alt: string; priority?: boolean; sizes?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover"
      draggable={false}
    />
  );
}
