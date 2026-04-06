"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCart } from "@/components/cart/cart-context";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

const schema = z.object({
  shippingAddress: z.string().min(10, "Please enter your full shipping address"),
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shippingAddress: "" },
  });

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-lg text-muted-foreground mb-4">Your cart is empty.</p>
        <Button asChild><Link href="/products">Shop now</Link></Button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-lg text-muted-foreground mb-4">Please sign in to checkout.</p>
        <Button asChild><Link href="/sign-in">Sign in</Link></Button>
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      // 1. Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          shippingAddress: values.shippingAddress,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error ?? "Failed to create order");
      }

      const { data: { order } } = await orderRes.json();

      // 2. Create checkout session
      const payRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          successUrl: `${window.location.origin}/orders/${order.id}?success=1`,
          cancelUrl: `${window.location.origin}/checkout`,
        }),
      });

      if (!payRes.ok) {
        const err = await payRes.json();
        throw new Error(err.error ?? "Failed to create payment");
      }

      const { data: { paymentUrl } } = await payRes.json();
      clearCart();
      window.location.href = paymentUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shipping address</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="123 Main St, City, State, ZIP, Country"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Redirecting to payment…" : "Pay with DodoPayments"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Order summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
