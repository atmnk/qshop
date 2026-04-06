"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/cart-context";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  price: string;
  currency: string;
  images: string[];
  category?: string | null;
  stock: number;
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const price = parseFloat(product.price);

  function handleAddToCart() {
    addItem({
      id: product.id,
      name: product.name,
      price,
      image: product.images[0],
    });
    toast.success(`${product.name} added to cart`);
  }

  return (
    <Card className="group overflow-hidden flex flex-col">
      <Link href={`/products/${product.id}`} className="overflow-hidden">
        <div className="relative aspect-square bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>
      </Link>
      <CardContent className="flex-1 p-4">
        {product.category && (
          <Badge variant="secondary" className="mb-2 text-xs">
            {product.category}
          </Badge>
        )}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium leading-tight hover:underline line-clamp-2">{product.name}</h3>
        </Link>
        <p className="mt-2 font-semibold text-lg">
          {product.currency} {price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? "Out of stock" : "Add to cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
