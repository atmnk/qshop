import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { orders, orderItems, products, users } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Seller Orders" };

export default async function SellerOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  // Find orders that contain this seller's products
  const sellerProducts = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.sellerId, session.user.id));

  const productIds = sellerProducts.map((p) => p.id);

  if (productIds.length === 0) {
    return (
      <div className="p-8 text-center py-24">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No orders yet. Add products to start selling.</p>
        <Link href="/seller/products/new" className="text-sm underline mt-2 block">
          Add a product
        </Link>
      </div>
    );
  }

  const relevantItems = await db
    .select({ orderId: orderItems.orderId, productId: orderItems.productId })
    .from(orderItems)
    .where(inArray(orderItems.productId, productIds));

  const orderIds = [...new Set(relevantItems.map((i) => i.orderId))];

  if (orderIds.length === 0) {
    return (
      <div className="p-8 text-center py-24">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No orders yet.</p>
      </div>
    );
  }

  const rows = await db
    .select({ order: orders, buyer: users })
    .from(orders)
    .leftJoin(users, eq(orders.buyerId, users.id))
    .where(inArray(orders.id, orderIds))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Orders</h1>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ order, buyer }) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}…</TableCell>
                <TableCell className="text-sm">{buyer?.name ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{order.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${parseFloat(order.totalAmount).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
