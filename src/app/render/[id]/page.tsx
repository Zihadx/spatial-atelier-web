import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RenderStage from "@/components/three/RenderStage";
import { RENDERS, RENDER_BY_ID } from "@/data/renders";
import { renderRoutesEnabled } from "@/lib/render-gate";

export const metadata: Metadata = { title: "Render stage", robots: { index: false, follow: false } };

/** Internal stage for scripts/render-stills.mjs: not generated, and 404 in production unless ENABLE_RENDER_ROUTES=true. */
export const dynamicParams = false;
export function generateStaticParams() {
  return renderRoutesEnabled() ? RENDERS.map((r) => ({ id: r.id })) : [];
}

export default async function RenderPage({ params }: { params: Promise<{ id: string }> }) {
  if (!renderRoutesEnabled()) notFound();
  const { id } = await params;
  const spec = RENDER_BY_ID[id];
  if (!spec) notFound();
  return <RenderStage spec={spec} />;
}
