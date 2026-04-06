import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order detail" };

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const { id } = await params;
  const { success } = await searchParams;

  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order || order.buyerId !== session.user.id) notFound();

  const items = await db
    .select({ item: orderItems, product: products })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id));

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to orders
        </Link>
      </Button>

      {success && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-800">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">Payment successful! Your order is confirmed.</p>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order</h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">{order.id}</p>
        </div>
        <Badge>{order.status}</Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map(({ item, product }) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {product?.name ?? "Unknown product"} × {item.quantity}
              </span>
              <span className="font-medium">
                ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment</span>
            <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
              {order.paymentStatus}
            </Badge>
          </div>
          {order.paymentId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-mono text-xs">{order.paymentId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Placed</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          {order.shippingAddress && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ship to</span>
              <span className="text-right max-w-[60%]">{order.shippingAddress}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
