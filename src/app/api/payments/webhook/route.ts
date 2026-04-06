import { db } from "@/db";
import { orders } from "@/db/schema";
import { ok, badRequest } from "@/lib/api-response";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  const signature = request.headers.get("webhook-signature");

  if (!secret || !signature) {
    return badRequest("Missing webhook signature");
  }

  const rawBody = await request.text();

  // TODO: verify HMAC signature using DODO_WEBHOOK_SECRET
  // Reference: https://docs.dodopayments.com/api-reference/webhooks

  const event = JSON.parse(rawBody);

  if (event.type === "payment.succeeded") {
    const { payment_id, metadata } = event.data;
    const orderId = metadata?.orderId;

    if (orderId) {
      await db
        .update(orders)
        .set({ paymentStatus: "paid", paymentId: payment_id, status: "confirmed", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }
  }

  if (event.type === "payment.failed") {
    const { metadata } = event.data;
    const orderId = metadata?.orderId;

    if (orderId) {
      await db
        .update(orders)
        .set({ paymentStatus: "failed", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }
  }

  return ok({ received: true });
}
