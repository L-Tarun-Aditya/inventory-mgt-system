"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function ProductFilters({
  categories,
  suppliers,
  initial,
}: {
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  initial: Record<string, string>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initial.q ?? "");
  const [, start] = useTransition();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    start(() => router.push(`/products?${next.toString()}`));
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            set("q", q);
          }}
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products by name or SKU..."
            aria-label="Search products"
          />
        </form>
        <div className="flex gap-2">
          <Select defaultValue={initial.categoryId ?? "all"} onValueChange={(v) => set("categoryId", v === "all" ? "" : v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select defaultValue={initial.status ?? "all"} onValueChange={(v) => set("status", v === "all" ? "" : v)}>
            <SelectTrigger className="w-[135px]"><SelectValue placeholder="Stock" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stock</SelectItem>
              <SelectItem value="IN_STOCK">In Stock</SelectItem>
              <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select defaultValue={initial.supplierId ?? "all"} onValueChange={(v) => set("supplierId", v === "all" ? "" : v)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Supplier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All suppliers</SelectItem>
            {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select defaultValue={`${initial.sort ?? "updated"}:${initial.order ?? "desc"}`} onValueChange={(v) => { const [sort, order] = v.split(":"); set("sort", sort); const next = new URLSearchParams(params.toString()); next.set("sort", sort); next.set("order", order); next.delete("page"); start(() => router.push(`/products?${next.toString()}`)); }}>
          <SelectTrigger className="w-[165px]"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="updated:desc">Recently updated</SelectItem>
            <SelectItem value="name:asc">Name A–Z</SelectItem>
            <SelectItem value="name:desc">Name Z–A</SelectItem>
            <SelectItem value="price:asc">Price low–high</SelectItem>
            <SelectItem value="price:desc">Price high–low</SelectItem>
            <SelectItem value="stock:desc">Stock high–low</SelectItem>
            <SelectItem value="stock:asc">Stock low–high</SelectItem>
          </SelectContent>
        </Select>
        {(initial.q || initial.categoryId || initial.supplierId || initial.status) && (
          <Button variant="outline" size="sm" onClick={() => start(() => router.push("/products"))}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
