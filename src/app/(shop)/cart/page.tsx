"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart/cart-context";
import type { Metadata } from "next";

export default function CartPage() {
  const { items, totalPrice, updateQty, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started.</p>
        <Button asChild>
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Shopping cart</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-xl">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.id}`}
                  className="font-medium hover:underline line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground mt-0.5">
                  ${item.price.toFixed(2)} each
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearCart}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear cart
          </Button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-xl p-6 sticky top-24 space-y-4">
            <h2 className="font-bold text-lg">Order summary</h2>
            <Separator />
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground line-clamp-1 flex-1 pr-2">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
