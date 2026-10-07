import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStockStatus(stockQuantity: number, reorderLevel: number) {
  if (stockQuantity <= 0) return "OUT_OF_STOCK" as const;
  if (stockQuantity <= reorderLevel) return "LOW_STOCK" as const;
  return "IN_STOCK" as const;
}

export function stockStatusLabel(status: string) {
  switch (status) {
    case "OUT_OF_STOCK":
      return "Out of Stock";
    case "LOW_STOCK":
      return "Low Stock";
    default:
      return "In Stock";
  }
}
