import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function HomePage() {
  const featured = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt))
    .limit(8);

  return (
    <div>
      {/* Hero */}
      <section className="bg-muted/40 border-b">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Shop smarter,<br />sell easier.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Discover unique products from independent sellers, all in one place.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button size="lg" asChild>
              <Link href="/products">
                Browse products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-up">Start selling</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Latest products</h2>
          <Button variant="ghost" asChild>
            <Link href="/products">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No products yet. Be the first to sell!</p>
            <Button className="mt-4" asChild>
              <Link href="/sign-up">Start selling</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
