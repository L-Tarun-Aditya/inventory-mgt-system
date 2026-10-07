import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ProductForm } from "@/components/products/product-form";
import { DeleteProduct } from "@/components/products/delete-product";
import { AdjustStockDialog } from "@/components/products/adjust-stock-dialog";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product = null;
  let categories: { id: string; name: string }[] = [];
  let suppliers: { id: string; name: string }[] = [];
  try {
    [product, categories, suppliers] = await Promise.all([
      prisma.product.findUnique({ where: { id }, include: { category: true, supplier: true, transactions: { orderBy: { createdAt: "desc" }, take: 20 } } }),
      prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);
  } catch {
    product = null;
  }
  if (!product) notFound();

  const attrs = (product.attributes as Record<string, unknown> | null) ?? {};

  return (
    <>
      <Header title={product.name} subtitle={`${product.sku} · Updated ${product.updatedAt.toLocaleDateString("en-IN")}`} />
      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/products" className="text-[13px] text-muted-foreground hover:text-foreground">← Back to products</Link>
          <span className="flex-1" />
          <AdjustStockDialog productId={product.id} productName={product.name} currentStock={product.stockQuantity} />
          <DeleteProduct id={product.id} name={product.name} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Product information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[12px] uppercase tracking-wide text-muted-foreground">Category</dt>
                  <dd className="mt-0.5 text-[13.5px] font-medium">{product.category?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[12px] uppercase tracking-wide text-muted-foreground">Supplier</dt>
                  <dd className="mt-0.5 text-[13.5px] font-medium">{product.supplier?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[12px] uppercase tracking-wide text-muted-foreground">Selling price</dt>
                  <dd className="mt-0.5 text-[13.5px] font-medium">{formatPrice(product.price)}</dd>
                </div>
                <div>
                  <dt className="text-[12px] uppercase tracking-wide text-muted-foreground">Cost price</dt>
                  <dd className="mt-0.5 text-[13.5px] font-medium">{formatPrice(product.costPrice)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[12px] uppercase tracking-wide text-muted-foreground">Description</dt>
                  <dd className="mt-0.5 text-[13.5px]">{product.description || "—"}</dd>
                </div>
                {product.tags.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-[12px] uppercase tracking-wide text-muted-foreground">Tags</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {product.tags.map((t) => (
                        <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-[12px]">{t}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <p className="text-[12px] uppercase tracking-wide text-muted-foreground">Stock</p>
                <p className="text-[26px] font-semibold leading-tight">{product.stockQuantity} <span className="text-[13px] font-normal text-muted-foreground">units</span></p>
              </div>
              <StatusBadge status={product.stockQuantity <= 0 ? "OUT_OF_STOCK" : product.stockQuantity <= product.reorderLevel ? "LOW_STOCK" : "IN_STOCK"} />
              <p className="text-[12.5px] text-muted-foreground">Reorder level: {product.reorderLevel} units</p>
              <p className="text-[12.5px] text-muted-foreground">Inventory value: {formatPrice(product.stockQuantity * product.costPrice)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product attributes</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(attrs).length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No custom attributes.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Key</TableHead><TableHead>Value</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(attrs).map(([k, v]) => (
                    <TableRow key={k}>
                      <TableCell className="font-mono text-[12.5px]">{k}</TableCell>
                      <TableCell>{Array.isArray(v) ? v.join(", ") : String(v)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory history</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {product.transactions.length === 0 ? (
              <p className="p-5 text-[13px] text-muted-foreground">No transactions recorded.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Before → After</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.type.replace("_", " ")}</TableCell>
                      <TableCell className="numeric">{t.quantity}</TableCell>
                      <TableCell className="numeric">{t.previousQuantity} → {t.newQuantity}</TableCell>
                      <TableCell className="text-muted-foreground">{t.reason ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{t.createdAt.toLocaleDateString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit product</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              categories={categories}
              suppliers={suppliers}
              productId={product.id}
              initial={{
                name: product.name,
                sku: product.sku,
                description: product.description ?? "",
                categoryId: product.categoryId,
                supplierId: product.supplierId ?? "",
                price: product.price,
                costPrice: product.costPrice,
                stockQuantity: product.stockQuantity,
                reorderLevel: product.reorderLevel,
                tags: product.tags.join(", "),
                attributes: JSON.stringify(attrs, null, 2),
              }}
            />
          </CardContent>
        </Card>

        <div className="flex justify-start">
          <Button variant="outline" asChild><Link href="/products">View inventory</Link></Button>
        </div>
      </div>
    </>
  );
}
