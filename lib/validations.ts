import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  sku: z.string().min(1, "SKU is required").max(40),
  description: z.string().max(2000).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  supplierId: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  costPrice: z.coerce.number().min(0, "Cost price must be >= 0"),
  stockQuantity: z.coerce.number().int().min(0),
  reorderLevel: z.coerce.number().int().min(0),
  tags: z.string().optional(),
  attributes: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  description: z.string().max(500).optional().or(z.literal("")),
});

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().max(120).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
});

export const stockAdjustSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["STOCK_IN", "STOCK_OUT", "ADJUSTMENT", "RETURN"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().max(500).optional().or(z.literal("")),
});

export type ProductInput = z.infer<typeof productSchema>;
