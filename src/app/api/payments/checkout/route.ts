import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { ok, badRequest, forbidden, notFound, handleError } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { dodo } from "@/lib/dodo";
import { eq } from "drizzle-orm";
import { z } from "zod";

const checkoutSchema = z.object({
  orderId: z.string(),
  successUrl: z.string(),
  cancelUrl: z.string(),
});

/**
 * Ensures the product exists in DodoPayments and returns its dodo product id.
 * Creates the product on first checkout and caches the id for future payments.
 */
async function ensureDodoProduct(product: {
  id: string;
  name: string;
  description: string | null;
  price: string;
  dodoProductId: string | null;
}): Promise<string> {
  if (product.dodoProductId) return product.dodoProductId;

  const priceInCents = Math.round(parseFloat(product.price) * 100);

  const dodoProduct = await dodo.products.create({
    name: product.name,
    description: product.description ?? undefined,
    price: {
      currency: "USD",
      discount: 0,
      price: priceInCents,
      purchasing_power_parity: false,
      type: "one_time_price",
    },
    tax_category: "saas",
  });

  await db
    .update(products)
    .set({ dodoProductId: dodoProduct.product_id, updatedAt: new Date() })
    .where(eq(products.id, product.id));

  return dodoProduct.product_id;
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const { orderId, successUrl, cancelUrl } = parsed.data;

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return notFound("Order not found");
    if (order.buyerId !== session.user.id) return forbidden();
    if (order.paymentStatus === "paid") return badRequest("Order already paid");

    // Fetch order items with their products
    const items = await db
      .select({ item: orderItems, product: products })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    // Lazily create any missing DodoPayments products
    const productCart: { product_id: string; quantity: number }[] = [];
    for (const { item, product } of items) {
      if (!product) continue;
      const dodoProductId = await ensureDodoProduct(product);
      productCart.push({ product_id: dodoProductId, quantity: item.quantity });
    }

    if (productCart.length === 0) return badRequest("No valid products in order");

    const checkoutSession = await dodo.checkoutSessions.create({
      product_cart: productCart,
      customer: {
        email: session.user.email,
        name: session.user.name,
      },
      return_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orderId },
    });

    // Store the session id so the webhook can match it back to the order
    await db
      .update(orders)
      .set({ paymentId: checkoutSession.session_id, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    return ok({
      paymentUrl: checkoutSession.checkout_url,
      sessionId: checkoutSession.session_id,
    });
  } catch (err) {
    return handleError(err);
  }
}
