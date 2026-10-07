import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { AdjustStockDialog } from "@/components/products/adjust-stock-dialog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    products = await prisma.product.findMany({ orderBy: { updatedAt: "desc" }, take: 100 });
  } catch {
    products = [];
  }

  return (
    <>
      <Header title="Stock" subtitle="Current stock levels and adjustments." />
      <div className="mt-5">
        {products.length === 0 ? (
          <EmptyState title="No stock data" description="Add products to start tracking stock." actionLabel="Add Product" actionHref="/products/new" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Reorder Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <Link href={`/products/${p.id}`} className="hover:underline">{p.name}</Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                      <TableCell className="numeric">{p.stockQuantity}</TableCell>
                      <TableCell className="numeric">{p.reorderLevel}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.stockQuantity <= 0 ? "OUT_OF_STOCK" : p.stockQuantity <= p.reorderLevel ? "LOW_STOCK" : "IN_STOCK"} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.updatedAt.toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="text-right">
                        <AdjustStockDialog productId={p.id} productName={p.name} currentStock={p.stockQuantity} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
