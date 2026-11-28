import type { ContentSource } from "./source";
import { createStaticContentSource } from "./static";

export type { ContentSource } from "./source";
export * from "./types";

let source: ContentSource | undefined;
/** The active content source. Swap the factory here to move to a CMS or database. */
export function getContent(): ContentSource {
  return (source ??= createStaticContentSource());
}

/** Test seam: replace the source (e.g. with an in-memory fixture). */
export function setContentSource(next: ContentSource | undefined) { source = next; }
