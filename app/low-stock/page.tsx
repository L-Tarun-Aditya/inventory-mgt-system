import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LowStockPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> & { supplier?: { name: string } | null }[] = [];
  try {
    const all = await prisma.product.findMany({ include: { supplier: true }, orderBy: { stockQuantity: "asc" } });
    products = all.filter((p) => p.stockQuantity <= p.reorderLevel);
  } catch {
    products = [];
  }

  return (
    <>
      <Header title="Low Stock" subtitle="Products at or below reorder level." />
      <div className="mt-5">
        {products.length === 0 ? (
          <EmptyState title="Stock levels healthy" description="No products are currently at or below reorder level." actionLabel="View all stock" actionHref="/stock" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Reorder</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Suggested Order</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const suggested = Math.max(0, p.reorderLevel * 2 - p.stockQuantity);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <Link href={`/products/${p.id}`} className="hover:underline">{p.name}</Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                        <TableCell className="numeric">{p.stockQuantity}</TableCell>
                        <TableCell className="numeric">{p.reorderLevel}</TableCell>
                        <TableCell>{(p as { supplier?: { name: string } | null }).supplier?.name ?? "—"}</TableCell>
                        <TableCell className="numeric">{suggested}</TableCell>
                        <TableCell>
                          <StatusBadge status={p.stockQuantity <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK"} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
