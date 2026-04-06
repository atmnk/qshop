import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-context";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Qshop";
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "A marketplace for buyers and sellers.";

export const metadata: Metadata = {
  title: { default: appName, template: `%s | ${appName}` },
  description: appDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          {children}
          <Toaster richColors position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
