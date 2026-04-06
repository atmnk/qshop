import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ProductForm } from "@/components/seller/product-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Add product</h1>
      <ProductForm />
    </div>
  );
}
