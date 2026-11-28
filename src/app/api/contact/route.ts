import { getContactDeps } from "@/server/contact/deps";
import { handleContactRequest } from "@/server/contact/service";

export const dynamic = "force-dynamic";

/** Contact + newsletter endpoint. Contract: API_CONTRACTS.md. All logic lives in server/contact/service.ts. */
export async function POST(req: Request) {
  return handleContactRequest(req, getContactDeps());
}
