import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SupplierDialog, DeleteSupplier } from "@/components/catalog/catalog-dialogs";
import { EmptyState } from "@/components/empty-state";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  let suppliers: { id: string; name: string; email: string | null; phone: string | null; company: string | null; _count: { products: number } }[] = [];
  try {
    suppliers = await prisma.supplier.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } });
  } catch {
    suppliers = [];
  }

  return (
    <>
      <Header title="Suppliers" subtitle="Manage product suppliers." />
      <div className="mt-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground">{suppliers.length} supplier{suppliers.length === 1 ? "" : "s"}</p>
          <SupplierDialog />
        </div>
        {suppliers.length === 0 ? (
          <EmptyState title="No suppliers yet" description="Add your first supplier to link products to sources." />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.company ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{s.email ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{s.phone ?? "—"}</TableCell>
                      <TableCell className="numeric">{s._count.products}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <SupplierDialog id={s.id} initial={{ name: s.name, email: s.email, phone: s.phone, company: s.company }} />
                          <DeleteSupplier id={s.id} name={s.name} />
                        </div>
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
