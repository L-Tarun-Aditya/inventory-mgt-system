import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryDialog, DeleteCategory } from "@/components/catalog/catalog-dialogs";
import { EmptyState } from "@/components/empty-state";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: { id: string; name: string; description: string | null; _count: { products: number } }[] = [];
  try {
    categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } });
  } catch {
    categories = [];
  }

  return (
    <>
      <Header title="Categories" subtitle="Organize products into categories." />
      <div className="mt-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground">{categories.length} categor{categories.length === 1 ? "y" : "ies"}</p>
          <CategoryDialog />
        </div>
        {categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Create your first category to organize products." />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.description ?? "—"}</TableCell>
                      <TableCell className="numeric">{c._count.products}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <CategoryDialog id={c.id} initial={{ name: c.name, description: c.description }} />
                          <DeleteCategory id={c.id} name={c.name} />
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
