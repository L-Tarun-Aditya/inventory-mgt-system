"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categorySchema, supplierSchema } from "@/lib/validations";

export async function createCategory(formData: FormData) {
  const parsed = categorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    await prisma.category.create({ data: { name: parsed.data.name, description: parsed.data.description || undefined } });
    revalidatePath("/categories");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Category name already exists or creation failed" };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const parsed = categorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  try {
    await prisma.category.update({ where: { id }, data: { name: parsed.data.name, description: parsed.data.description || null } });
    revalidatePath("/categories");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) return { ok: false as const, error: `Cannot delete: ${count} product(s) use this category` };
    await prisma.category.delete({ where: { id } });
    revalidatePath("/categories");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Failed to delete category" };
  }
}

export async function createSupplier(formData: FormData) {
  const parsed = supplierSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;
  try {
    await prisma.supplier.create({
      data: {
        name: d.name,
        email: d.email || undefined,
        phone: d.phone || undefined,
        company: d.company || undefined,
        address: d.address ? { line: d.address } : undefined,
      },
    });
    revalidatePath("/suppliers");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Failed to create supplier (email may already exist)" };
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  const parsed = supplierSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  const d = parsed.data;
  try {
    await prisma.supplier.update({
      where: { id },
      data: {
        name: d.name,
        email: d.email || null,
        phone: d.phone || null,
        company: d.company || null,
        address: d.address ? { line: d.address } : null,
      },
    });
    revalidatePath("/suppliers");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Failed to update supplier" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    const count = await prisma.product.count({ where: { supplierId: id } });
    if (count > 0) {
      // Detach instead of blocking: set supplier to null, then delete.
      await prisma.product.updateMany({ where: { supplierId: id }, data: { supplierId: null } });
    }
    await prisma.supplier.delete({ where: { id } });
    revalidatePath("/suppliers");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Failed to delete supplier" };
  }
}
