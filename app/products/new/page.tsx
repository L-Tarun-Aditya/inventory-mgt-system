import { Header } from "@/components/layout/header";
import { ProductForm } from "@/components/products/product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  let categories: { id: string; name: string }[] = [];
  let suppliers: { id: string; name: string }[] = [];
  try {
    [categories, suppliers] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);
  } catch {
    categories = [];
    suppliers = [];
  }

  return (
    <>
      <Header title="Add Product" subtitle="Create a new product in the catalog." />
      <div className="mx-auto mt-5 max-w-[760px]">
        {categories.length === 0 ? (
          <p className="rounded-[8px] border bg-card p-5 text-[13.5px] text-muted-foreground">
            No categories found. Please create a category first, then add products.
          </p>
        ) : (
          <ProductForm categories={categories} suppliers={suppliers} />
        )}
      </div>
    </>
  );
}
