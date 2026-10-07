import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductFilters } from "@/components/products/product-filters";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { getProducts } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;
  const result = await getProducts({
    q: sp.q,
    categoryId: sp.categoryId,
    supplierId: sp.supplierId,
    status: (sp.status as "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "") ?? "",
    sort: sp.sort,
    order: sp.order === "asc" ? "asc" : "desc",
    page,
    pageSize: 12,
  });

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

  const qs = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") next.set(k, v);
    next.set("page", String(p));
    return `/products?${next.toString()}`;
  };

  return (
    <>
      <Header title="Products" subtitle="Manage your product catalog and inventory." />
      <div className="mt-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-muted-foreground">
            {result.total} result{result.total === 1 ? "" : "s"} · Page {result.page} of {result.totalPages}
          </p>
          <Button asChild>
            <Link href="/products/new"><Plus className="h-4 w-4" />Add Product</Link>
          </Button>
        </div>

        <ProductFilters
          categories={categories}
          suppliers={suppliers}
          initial={{ q: sp.q ?? "", categoryId: sp.categoryId ?? "", supplierId: sp.supplierId ?? "", status: sp.status ?? "", sort: sp.sort ?? "updated", order: sp.order ?? "desc" }}
        />

        {result.items.length === 0 ? (
          <EmptyState
            title={sp.q ? "No products found" : "No products yet"}
            description={sp.q ? "Try adjusting your search or filters." : "Add your first product to start managing inventory."}
            actionLabel={sp.q ? "Clear filters" : "Add Product"}
            actionHref={sp.q ? "/products" : "/products/new"}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.items.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <Link href={`/products/${p.id}`} className="hover:underline">{p.name}</Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                      <TableCell>{p.category?.name ?? "—"}</TableCell>
                      <TableCell>{p.supplier?.name ?? "—"}</TableCell>
                      <TableCell className="numeric">{formatPrice(p.price)}</TableCell>
                      <TableCell className="numeric">{p.stockQuantity}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.stockQuantity <= 0 ? "OUT_OF_STOCK" : p.stockQuantity <= p.reorderLevel ? "LOW_STOCK" : "IN_STOCK"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {result.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" asChild className={result.page <= 1 ? "pointer-events-none opacity-50" : undefined}>
              <Link href={qs(Math.max(1, result.page - 1))} aria-disabled={result.page <= 1}>Previous</Link>
            </Button>
            <p className="text-[12.5px] text-muted-foreground">Page {result.page} of {result.totalPages}</p>
            <Button variant="outline" size="sm" asChild className={result.page >= result.totalPages ? "pointer-events-none opacity-50" : undefined}>
              <Link href={qs(Math.min(result.totalPages, result.page + 1))} aria-disabled={result.page >= result.totalPages}>Next</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
