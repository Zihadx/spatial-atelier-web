import { RENDERS } from "@/data/renders";
import { renderRoutesEnabled } from "@/lib/render-gate";

export const dynamic = "force-dynamic";

export function GET() {
  if (!renderRoutesEnabled()) return new Response("Not found", { status: 404 });
  return Response.json(RENDERS.map((r) => ({ id: r.id, out: r.out })));
}
