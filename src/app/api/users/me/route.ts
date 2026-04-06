import { ok, handleError } from "@/lib/api-response";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireSession();
    return ok(session.user);
  } catch (err) {
    return handleError(err);
  }
}
