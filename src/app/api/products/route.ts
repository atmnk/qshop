import { db } from "@/db";
import { products } from "@/db/schema";
import { ok, created, badRequest, handleError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().default("USD"),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.url()).default([]),
  category: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const sellerId = searchParams.get("sellerId");

    const rows = await db
      .select()
      .from(products)
      .where(
        category
          ? eq(products.category, category)
          : sellerId
          ? eq(products.sellerId, sellerId)
          : undefined
      );

    return ok(rows);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("seller");
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) return badRequest(parsed.error.message);

    const [product] = await db
      .insert(products)
      .values({ ...parsed.data, sellerId: session.user.id })
      .returning();

    return created(product);
  } catch (err) {
    return handleError(err);
  }
}
