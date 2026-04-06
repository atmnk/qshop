import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductForm } from "@/components/seller/product-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, id));

  if (!product || product.sellerId !== session.user.id) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Edit product</h1>
      <ProductForm
        productId={product.id}
        defaultValues={{
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          stock: product.stock,
          category: product.category ?? "",
          isActive: product.isActive,
        }}
      />
    </div>
  );
}
