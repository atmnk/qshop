"use client";

import Link from "next/link";
import { ShoppingCart, Package, LogOut, User, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/components/cart/cart-context";
import { useSession, signOut } from "@/lib/auth-client";

export function Navbar() {
  const { totalItems } = useCart();
  const { data: session } = useSession();
  type AuthUser = { id: string; name: string; email: string; emailVerified: boolean; role?: string };
  const user = session?.user as AuthUser | undefined;
  const isSeller = user?.role === "seller" || user?.role === "admin";

  const navLinks = (
    <nav className="flex items-center gap-6 text-sm font-medium">
      <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
        Products
      </Link>
      {isSeller && (
        <Link href="/seller" className="text-muted-foreground hover:text-foreground transition-colors">
          Seller Dashboard
        </Link>
      )}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Package className="h-5 w-5" />
          qshop
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex">{navLinks}</div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/cart" className="relative inline-flex">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs pointer-events-none">
                {totalItems}
              </Badge>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/profile" />}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/orders" />}>
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                {isSeller && (
                  <DropdownMenuItem render={<Link href="/seller" />}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Seller Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <button className="md:hidden inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors">
                  <Menu className="h-5 w-5" />
                </button>
              }
            />
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks}
                {!user && (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/sign-in">Sign in</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/sign-up">Sign up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
