import Link from "next/link";
import { Package } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <Package className="h-5 w-5" />
        {process.env.NEXT_PUBLIC_APP_NAME}
      </Link>
      {children}
    </div>
  );
}
