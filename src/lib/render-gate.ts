import { getEnv } from "@/env";

/** The /render/* stage routes exist only for scripts/render-stills.mjs. Off in production unless explicitly enabled. */
export function renderRoutesEnabled(): boolean {
  const env = getEnv();
  return env.NODE_ENV !== "production" || env.ENABLE_RENDER_ROUTES;
}
