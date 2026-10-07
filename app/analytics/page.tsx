import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAnalytics } from "@/lib/queries";
import { formatINR, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const a = await getAnalytics();
  return (
    <>
      <Header title="Inventory Analytics" subtitle="Category breakdowns and stock movement from MongoDB aggregation." />
      <div className="mt-5 flex flex-col gap-4">
        <div className="rounded-[8px] border bg-card px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Inventory Value</p>
          <p className="mt-1 text-[26px] font-semibold leading-none">{formatINR(a.totalValue)}</p>
          <p className="mt-1.5 text-[12px] text-muted-foreground">Valued at cost price across all products</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Products by category</CardTitle>
              <CardDescription>Category → number of products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {a.countByCat.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-[150px] shrink-0 truncate text-[13px]">{name}</span>
                    <div className="h-[10px] flex-1 overflow-hidden rounded-[6px] bg-muted">
                      <div className="h-full rounded-[6px] bg-primary" style={{ width: `${Math.max(4, (count / a.maxCount) * 100)}%` }} />
                    </div>
                    <span className="w-10 text-right text-[13px] tabular-nums text-muted-foreground">{count}</span>
                  </div>
                ))}
                {a.countByCat.length === 0 && <p className="text-[13px] text-muted-foreground">No data.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory value by category</CardTitle>
              <CardDescription>Category → sum of stock × cost</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {a.valueByCat.map(([name, value]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-[150px] shrink-0 truncate text-[13px]">{name}</span>
                    <div className="h-[10px] flex-1 overflow-hidden rounded-[6px] bg-muted">
                      <div className="h-full rounded-[6px] bg-[var(--chart-2)]" style={{ width: `${Math.max(4, (value / a.maxValue) * 100)}%` }} />
                    </div>
                    <span className="w-[72px] text-right text-[12.5px] tabular-nums text-muted-foreground">{formatINR(value)}</span>
                  </div>
                ))}
                {a.valueByCat.length === 0 && <p className="text-[13px] text-muted-foreground">No data.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stock movement</CardTitle>
            <CardDescription>Units moved per day, last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {a.movement.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No movement recorded.</p>
            ) : (
              <div className="flex h-[140px] items-end gap-1.5">
                {a.movement.map(([day, v]) => (
                  <div key={day} className="flex flex-1 flex-col items-center gap-1" title={`${day}: ${v}`}>
                    <div className="w-full rounded-[6px] bg-primary/80" style={{ height: `${Math.max(4, (v / a.maxMove) * 120)}px` }} />
                    <span className="text-[10px] text-muted-foreground">{day.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most stocked products</CardTitle>
            <CardDescription>Highest inventory quantity on hand</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.mostStocked.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/products/${p.id}`} className="hover:underline">{p.name}</Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="numeric">{p.stockQuantity}</TableCell>
                    <TableCell className="numeric">{formatPrice(p.stockQuantity * p.costPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
