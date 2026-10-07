"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { productSchema, stockAdjustSchema } from "@/lib/validations";

function statusFor(stock: number, reorder: number) {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= reorder) return "LOW_STOCK";
  return "IN_STOCK";
}

function parseAttributes(raw?: string) {
  if (!raw || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    return {};
  } catch {
    return null;
  }
}

export async function createProduct(formData: FormData) {
  const parsed = productSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  const attrs = parseAttributes(d.attributes);
  if (attrs === null) return { ok: false as const, error: "Attributes must be valid JSON object" };
  const tags = (d.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const supplierId = d.supplierId && d.supplierId.trim() ? d.supplierId : undefined;

  try {
    const existing = await prisma.product.findUnique({ where: { sku: d.sku } });
    if (existing) return { ok: false as const, error: "SKU already exists" };
    const product = await prisma.product.create({
      data: {
        name: d.name,
        sku: d.sku,
        description: d.description || undefined,
        categoryId: d.categoryId,
        supplierId,
        price: d.price,
        costPrice: d.costPrice,
        stockQuantity: d.stockQuantity,
        reorderLevel: d.reorderLevel,
        status: statusFor(d.stockQuantity, d.reorderLevel),
        attributes: attrs ?? {},
        tags,
      },
    });
    if (d.stockQuantity > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          productId: product.id,
          type: "STOCK_IN",
          quantity: d.stockQuantity,
          previousQuantity: 0,
          newQuantity: d.stockQuantity,
          reason: "Opening stock",
        },
      });
    }
    revalidatePath("/products");
    revalidatePath("/");
    return { ok: true as const, id: product.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create product";
    if (msg.includes("Unique constraint") || msg.includes("unique")) return { ok: false as const, error: "SKU already exists" };
    return { ok: false as const, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const parsed = productSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  const attrs = parseAttributes(d.attributes);
  if (attrs === null) return { ok: false as const, error: "Attributes must be valid JSON object" };
  const tags = (d.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const supplierId = d.supplierId && d.supplierId.trim() ? d.supplierId : null;

  try {
    const conflict = await prisma.product.findUnique({ where: { sku: d.sku } });
    if (conflict && conflict.id !== id) return { ok: false as const, error: "SKU already exists" };
    await prisma.product.update({
      where: { id },
      data: {
        name: d.name,
        sku: d.sku,
        description: d.description || null,
        categoryId: d.categoryId,
        supplierId,
        price: d.price,
        costPrice: d.costPrice,
        stockQuantity: d.stockQuantity,
        reorderLevel: d.reorderLevel,
        status: statusFor(d.stockQuantity, d.reorderLevel),
        attributes: attrs ?? {},
        tags,
      },
    });
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.inventoryTransaction.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    revalidatePath("/products");
    revalidatePath("/");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Failed to delete product" };
  }
}

export async function adjustStock(formData: FormData) {
  const parsed = stockAdjustSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { productId, type, quantity, reason } = parsed.data;
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { ok: false as const, error: "Product not found" };
    let newQty = product.stockQuantity;
    if (type === "STOCK_IN" || type === "RETURN") newQty = product.stockQuantity + quantity;
    else if (type === "STOCK_OUT") newQty = product.stockQuantity - quantity;
    else {
      // ADJUSTMENT: quantity is the target level encoded via reason? No — treat as delta correction:
      // UI sends signed intent via type; for ADJUSTMENT interpret quantity as new absolute level.
      newQty = quantity;
    }
    if (newQty < 0) return { ok: false as const, error: "Adjustment would result in negative inventory" };
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: newQty, status: statusFor(newQty, product.reorderLevel) },
    });
    await prisma.inventoryTransaction.create({
      data: {
        productId,
        type,
        quantity,
        previousQuantity: product.stockQuantity,
        newQuantity: newQty,
        reason: reason || undefined,
      },
    });
    revalidatePath("/stock");
    revalidatePath("/low-stock");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/");
    return { ok: true as const, newQuantity: updated.stockQuantity };
  } catch {
    return { ok: false as const, error: "Failed to adjust stock" };
  }
}
