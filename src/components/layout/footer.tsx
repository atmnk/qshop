import Link from "next/link";
import { Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <Package className="h-5 w-5" />
              {process.env.NEXT_PUBLIC_APP_NAME}
            </Link>
            <p className="text-sm text-muted-foreground">
              A marketplace for buyers and sellers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link></li>
              <li><Link href="/orders" className="hover:text-foreground transition-colors">Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Sell</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/sign-up" className="hover:text-foreground transition-colors">Become a Seller</Link></li>
              <li><Link href="/seller" className="hover:text-foreground transition-colors">Seller Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/sign-in" className="hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="/profile" className="hover:text-foreground transition-colors">Profile</Link></li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} qshop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
