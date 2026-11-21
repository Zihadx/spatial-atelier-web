import { RENDERS } from "@/data/renders";

export function GET() {
  return Response.json(RENDERS.map((r) => ({ id: r.id, out: r.out })));
}
