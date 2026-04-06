import { db } from "@/db";
import { products } from "@/db/schema";
import { ok, noContent, badRequest, notFound, forbidden, handleError } from "@/lib/api-response";
import { requireRole, getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.url()).optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return notFound("Product not found");
    return ok(product);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("seller");
    const { id } = await params;

    const [existing] = await db.select().from(products).where(eq(products.id, id));
    if (!existing) return notFound("Product not found");
    if (existing.sellerId !== session.user.id && session.user.role !== "admin") {
      return forbidden();
    }

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const [updated] = await db
      .update(products)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("seller");
    const { id } = await params;

    const [existing] = await db.select().from(products).where(eq(products.id, id));
    if (!existing) return notFound("Product not found");
    if (existing.sellerId !== session.user.id && session.user.role !== "admin") {
      return forbidden();
    }

    await db.delete(products).where(eq(products.id, id));
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
