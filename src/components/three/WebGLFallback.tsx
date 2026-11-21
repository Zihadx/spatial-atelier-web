import Image from "next/image";

/** Static image shown before WebGL boots, when WebGL is unavailable, or when a scene is paused offscreen. */
export default function WebGLFallback({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="100vw"
      className="object-cover"
      draggable={false}
    />
  );
}
