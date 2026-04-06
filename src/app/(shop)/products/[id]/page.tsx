"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart/cart-context";
import { toast } from "sonner";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  images: string[];
  category: string | null;
  stock: number;
  isActive: boolean;
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((json) => setProduct(json.data))
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-12 w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-lg text-muted-foreground">Product not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  const price = parseFloat(product.price);

  return (
    <div className="container mx-auto px-4 py-10">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to products
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.category && (
            <Badge variant="secondary">{product.category}</Badge>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-3xl font-semibold">
            {product.currency} {price.toFixed(2)}
          </p>

          {product.description && (
            <>
              <Separator />
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </>
          )}

          <Separator />

          <div className="flex items-center gap-2 text-sm">
            <span
              className={product.stock > 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={product.stock === 0}
            onClick={() => {
              addItem({ id: product.id, name: product.name, price, image: product.images[0] });
              toast.success("Added to cart");
            }}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stock === 0 ? "Out of stock" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
