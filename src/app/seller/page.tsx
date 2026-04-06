import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { products, orders, orderItems } from "@/db/schema";
import { eq, count, sum, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Seller Dashboard" };

export default async function SellerDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const [productCount] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.sellerId, session.user.id));

  const sellerProducts = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.sellerId, session.user.id));

  const productIds = sellerProducts.map((p) => p.id);

  // Recent products
  const recentProducts = await db
    .select()
    .from(products)
    .where(eq(products.sellerId, session.user.id))
    .orderBy(desc(products.createdAt))
    .limit(5);

  const stats = [
    { label: "Total products", value: productCount.count, icon: Package, href: "/seller/products" },
    { label: "Active listings", value: recentProducts.filter((p) => p.isActive).length, icon: TrendingUp, href: "/seller/products" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {session.user.name}</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s an overview of your store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <Link href={href} className="text-xs text-muted-foreground hover:underline mt-1 block">
                View all →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent products */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent products</h2>
        <Button size="sm" asChild>
          <Link href="/seller/products/new">+ Add product</Link>
        </Button>
      </div>

      {recentProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No products yet.</p>
            <Button asChild>
              <Link href="/seller/products/new">Add your first product</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {recentProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border rounded-xl"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${parseFloat(product.price).toFixed(2)} · {product.stock} in stock
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/seller/products/${product.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
