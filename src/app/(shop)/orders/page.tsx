import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Orders" };

const STATUS_COLORS: Record<string, string> = {
  pending: "secondary",
  confirmed: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "outline",
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.buyerId, session.user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My orders</h1>

      {rows.length === 0 ? (
        <div className="text-center py-24">
          <Package className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <p className="text-lg text-muted-foreground mb-4">No orders yet.</p>
          <Button asChild><Link href="/products">Start shopping</Link></Button>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}…</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={(STATUS_COLORS[order.status] as "default" | "secondary" | "destructive" | "outline") ?? "secondary"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/orders/${order.id}`}>View</Link>
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
