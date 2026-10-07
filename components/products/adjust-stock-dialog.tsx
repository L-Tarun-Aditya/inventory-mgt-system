"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adjustStock } from "@/lib/actions/products";

export function AdjustStockDialog({ productId, productName, currentStock }: { productId: string; productName: string; currentStock: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("STOCK_IN");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("productId", productId);
    fd.set("type", type);
    const res = await adjustStock(fd);
    setPending(false);
    if (res.ok) {
      toast.success(`Stock updated to ${res.newQuantity} units`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Adjust Stock</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>Record an inventory movement for this product.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="rounded-[7px] border bg-muted/50 px-3 py-2.5 text-[13px]">
            <p className="font-medium">{productName}</p>
            <p className="text-muted-foreground">Current stock: {currentStock} units</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Action</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="STOCK_IN">Stock In</SelectItem>
                <SelectItem value="STOCK_OUT">Stock Out</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment (set level)</SelectItem>
                <SelectItem value="RETURN">Return</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity">{type === "ADJUSTMENT" ? "New stock level" : "Quantity"}</Label>
            <Input id="quantity" name="quantity" type="number" min={1} step={1} required placeholder="10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" name="reason" placeholder="Supplier delivery" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Updating..." : "Update Stock"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
