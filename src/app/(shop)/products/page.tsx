import { ProductCard } from "@/components/products/product-card";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products" };

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home", "Sports", "Other"];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const conditions = [eq(products.isActive, true)];
  if (category) conditions.push(eq(products.category, category));
  if (q) conditions.push(ilike(products.name, `%${q}%`));

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions));

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form className="flex-1">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search products…"
            className="max-w-sm"
          />
        </form>
        <div className="flex flex-wrap gap-2">
          <Link href="/products">
            <Badge variant={!category ? "default" : "outline"} className="cursor-pointer">
              All
            </Badge>
          </Link>
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/products?category=${cat}`}>
              <Badge variant={category === cat ? "default" : "outline"} className="cursor-pointer">
                {cat}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-lg">No products found.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{rows.length} product{rows.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {rows.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
