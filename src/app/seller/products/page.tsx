import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Package, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Products" };

export default async function SellerProductsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const rows = await db
    .select()
    .from(products)
    .where(eq(products.sellerId, session.user.id))
    .orderBy(desc(products.createdAt));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/seller/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-24">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No products yet.</p>
          <Button asChild>
            <Link href="/seller/products/new">Add your first product</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category ?? "—"}</TableCell>
                  <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/seller/products/${product.id}/edit`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
