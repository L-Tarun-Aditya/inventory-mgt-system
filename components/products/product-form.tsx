"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { createProduct, updateProduct } from "@/lib/actions/products";

type Option = { id: string; name: string };

export function ProductForm({
  categories,
  suppliers,
  initial,
  productId,
}: {
  categories: Option[];
  suppliers: Option[];
  initial?: Record<string, string | number>;
  productId?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [categoryId, setCategoryId] = useState(String(initial?.categoryId ?? categories[0]?.id ?? ""));
  const [supplierId, setSupplierId] = useState(String(initial?.supplierId ?? ""));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("categoryId", categoryId);
    fd.set("supplierId", supplierId);
    const res = productId ? await updateProduct(productId, fd) : await createProduct(fd);
    setPending(false);
    if (res.ok) {
      toast.success(productId ? "Product updated" : "Product created");
      router.push(productId ? `/products/${productId}` : "/products");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <section className="rounded-[8px] border bg-card p-5">
        <h2 className="text-[15px] font-semibold">Basic Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" defaultValue={initial?.name ?? ""} required placeholder="Sony WH-1000XM6" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" defaultValue={initial?.sku ?? ""} required placeholder="SON-006" />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={initial?.description ?? ""} placeholder="Short product description" />
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border bg-card p-5">
        <h2 className="text-[15px] font-semibold">Classification</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><span>{categories.find((c) => c.id === categoryId)?.name ?? "Select"}</span></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Supplier</Label>
            <Select value={supplierId || "none"} onValueChange={(v) => setSupplierId(v === "none" ? "" : v)}>
              <SelectTrigger><span>{suppliers.find((s) => s.id === supplierId)?.name ?? "No supplier"}</span></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No supplier</SelectItem>
                {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" defaultValue={initial?.tags ?? ""} placeholder="audio, anc, wireless" />
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border bg-card p-5">
        <h2 className="text-[15px] font-semibold">Pricing</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Selling Price (₹)</Label>
            <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={initial?.price ?? ""} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="costPrice">Cost Price (₹)</Label>
            <Input id="costPrice" name="costPrice" type="number" min={0} step="0.01" defaultValue={initial?.costPrice ?? ""} required />
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border bg-card p-5">
        <h2 className="text-[15px] font-semibold">Inventory</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stockQuantity">Current Stock</Label>
            <Input id="stockQuantity" name="stockQuantity" type="number" min={0} step={1} defaultValue={initial?.stockQuantity ?? 0} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reorderLevel">Reorder Level</Label>
            <Input id="reorderLevel" name="reorderLevel" type="number" min={0} step={1} defaultValue={initial?.reorderLevel ?? 10} required />
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border bg-card p-5">
        <h2 className="text-[15px] font-semibold">Attributes</h2>
        <p className="mt-1 text-[12.5px] text-muted-foreground">Flexible key/value data stored in the product document. Must be a valid JSON object.</p>
        <div className="mt-3 flex flex-col gap-1.5">
          <Label htmlFor="attributes">Custom attributes (JSON)</Label>
          <Textarea id="attributes" name="attributes" rows={5} defaultValue={initial?.attributes ?? "{}"} className="font-mono text-[12.5px]" />
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>Cancel</Button>
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : productId ? "Save changes" : "Add Product"}</Button>
      </div>
    </form>
  );
}
