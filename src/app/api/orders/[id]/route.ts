import { db } from "@/db";
import { orders } from "@/db/schema";
import { ok, forbidden, notFound, handleError } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return notFound("Order not found");

    if (order.buyerId !== session.user.id && session.user.role !== "admin") {
      return forbidden();
    }

    return ok(order);
  } catch (err) {
    return handleError(err);
  }
}
