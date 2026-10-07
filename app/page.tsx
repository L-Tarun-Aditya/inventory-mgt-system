import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { getDashboardStats } from "@/lib/queries";
import { formatINR, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const kpis = (s: Awaited<ReturnType<typeof getDashboardStats>>) => [
  { label: "Total Products", value: String(s.totalProducts), hint: "Across all categories" },
  { label: "Inventory Units", value: s.totalUnits.toLocaleString("en-IN"), hint: "Total stock on hand" },
  { label: "Low Stock", value: String(s.lowStock.length), hint: "Requires attention" },
  { label: "Out of Stock", value: String(s.outOfStock.length), hint: "Needs restocking" },
  { label: "Inventory Value", value: formatINR(s.value), hint: "At cost price" },
];

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return (
    <>
      <Header title="Inventory Overview" subtitle="Monitor stock levels, products, and recent inventory activity." />
      <div className="mt-5 flex flex-col gap-6">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5" aria-label="Key metrics">
          {kpis(stats).map((k) => (
            <div key={k.label} className="rounded-[8px] border bg-card px-4 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-[26px] font-semibold leading-none tracking-tight">{k.value}</p>
              <p className="mt-1.5 text-[12px] text-muted-foreground">{k.hint}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Low stock products</CardTitle>
                  <CardDescription>Products at or below reorder level</CardDescription>
                </div>
                <Link href="/low-stock" className="text-[13px] font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats.allLow.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-muted-foreground">Stock levels look healthy. No products need attention.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Reorder</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.allLow.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <Link href={`/products/${p.id}`} className="hover:underline">{p.name}</Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                        <TableCell className="numeric">{p.stockQuantity}</TableCell>
                        <TableCell className="numeric">{p.reorderLevel}</TableCell>
                        <TableCell>
                          <StatusBadge status={p.stockQuantity <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK"} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest stock changes</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recent.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-muted-foreground">No inventory activity yet.</p>
              ) : (
                <ul className="flex flex-col divide-y">
                  {stats.recent.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium">{t.product?.name ?? "Deleted product"}</p>
                        <p className="text-[12px] text-muted-foreground">
                          {t.type.replace("_", " ")} · {t.previousQuantity} → {t.newQuantity} · {t.createdAt.toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <span className="shrink-0 text-[13px] font-medium tabular-nums">
                        {t.quantity > 0 && (t.type === "STOCK_IN" || t.type === "RETURN") ? `+${t.quantity}` : t.type === "ADJUSTMENT" ? `${t.newQuantity}` : `−${t.quantity}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Inventory by category</CardTitle>
            <CardDescription>Number of products in each category</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.byCategory.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-muted-foreground">No category data yet. Seed the database to see the breakdown.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.byCategory.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-[160px] shrink-0 truncate text-[13px]">{name}</span>
                    <div className="h-[10px] flex-1 overflow-hidden rounded-[6px] bg-muted">
                      <div className="h-full rounded-[6px] bg-primary" style={{ width: `${Math.max(4, (count / stats.maxCat) * 100)}%` }} />
                    </div>
                    <span className="w-10 text-right text-[13px] tabular-nums text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-[12px] text-muted-foreground">
              Highest value held: <span className="font-medium text-foreground">{formatPrice(0).slice(0, 1)}{stats.value.toLocaleString("en-IN")}</span> at cost · {formatINR(stats.value)}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
