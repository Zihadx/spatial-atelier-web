import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RenderStage from "@/components/three/RenderStage";
import { RENDERS, RENDER_BY_ID } from "@/data/renders";

export const metadata: Metadata = { title: "Render stage", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return RENDERS.map((r) => ({ id: r.id }));
}

export default async function RenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const spec = RENDER_BY_ID[id];
  if (!spec) notFound();
  return <RenderStage spec={spec} />;
}
