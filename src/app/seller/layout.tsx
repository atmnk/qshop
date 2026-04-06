import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Package, LayoutDashboard, ShoppingBag, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";

const navItems = [
  { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/orders", label: "Orders", icon: ShoppingBag },
];

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "seller" && session.user.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-muted/30 flex flex-col">
        <div className="p-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Package className="h-5 w-5" />
            {process.env.NEXT_PUBLIC_APP_NAME}
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Seller portal</p>
        </div>
        <Separator />
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="p-3">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            Back to shop
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
