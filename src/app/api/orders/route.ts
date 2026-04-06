import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { ok, created, badRequest, handleError } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  shippingAddress: z.string().min(1),
  currency: z.string().default("USD"),
});

export async function GET() {
  try {
    const session = await requireSession();
    const role = session.user.role;

    const rows =
      role === "admin"
        ? await db.select().from(orders)
        : await db.select().from(orders).where(eq(orders.buyerId, session.user.id));

    return ok(rows);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const { items, shippingAddress, currency } = parsed.data;

    // Fetch products and calculate total
    let totalAmount = 0;
    const lineItems: { productId: string; quantity: number; unitPrice: number }[] = [];

    for (const item of items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));

      if (!product || !product.isActive) {
        return badRequest(`Product ${item.productId} is unavailable`);
      }
      if (product.stock < item.quantity) {
        return badRequest(`Insufficient stock for ${product.name}`);
      }

      const unitPrice = parseFloat(product.price);
      totalAmount += unitPrice * item.quantity;
      lineItems.push({ productId: item.productId, quantity: item.quantity, unitPrice });
    }

    const [order] = await db
      .insert(orders)
      .values({
        buyerId: session.user.id,
        totalAmount: totalAmount.toFixed(2),
        currency,
        shippingAddress,
      })
      .returning();

    await db.insert(orderItems).values(
      lineItems.map((li) => ({
        orderId: order.id,
        productId: li.productId,
        quantity: li.quantity,
        unitPrice: li.unitPrice.toFixed(2),
      }))
    );

    return created({ order, items: lineItems });
  } catch (err) {
    return handleError(err);
  }
}
