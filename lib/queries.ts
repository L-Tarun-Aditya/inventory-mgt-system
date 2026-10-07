import { prisma } from "@/lib/prisma";

export type ProductFilter = {
  q?: string;
  categoryId?: string;
  supplierId?: string;
  status?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "";
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function getProducts(filter: ProductFilter) {
  const page = Math.max(1, filter.page ?? 1);
  const pageSize = filter.pageSize ?? 12;
  const and: Record<string, unknown>[] = [];

  if (filter.q) {
    and.push({
      OR: [
        { name: { contains: filter.q, mode: "insensitive" } },
        { sku: { contains: filter.q, mode: "insensitive" } },
      ],
    });
  }
  if (filter.categoryId) and.push({ categoryId: filter.categoryId });
  if (filter.supplierId) and.push({ supplierId: filter.supplierId });
  if (filter.minPrice != null || filter.maxPrice != null) {
    const price: Record<string, number> = {};
    if (filter.minPrice != null) price.gte = filter.minPrice;
    if (filter.maxPrice != null) price.lte = filter.maxPrice;
    and.push({ price });
  }

  const where = and.length ? { AND: and } : {};

  const sortMap: Record<string, string> = {
    name: "name",
    price: "price",
    stock: "stockQuantity",
    created: "createdAt",
    updated: "updatedAt",
  };
  const sortField = sortMap[filter.sort ?? ""] ?? "updatedAt";
  const order = filter.order ?? "desc";

  try {
    let all = await prisma.product.findMany({
      where,
      include: { category: true, supplier: true },
      orderBy: { [sortField]: order },
    });

    if (filter.status) {
      all = all.filter((p) => {
        if (filter.status === "OUT_OF_STOCK") return p.stockQuantity <= 0;
        if (filter.status === "LOW_STOCK") return p.stockQuantity > 0 && p.stockQuantity <= p.reorderLevel;
        return p.stockQuantity > p.reorderLevel;
      });
    }

    const total = all.length;
    const items = all.slice((page - 1) * pageSize, page * pageSize);
    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  } catch {
    return { items: [], total: 0, page, pageSize, totalPages: 1 };
  }
}

export async function getDashboardStats() {
  try {
    const [products, transactions] = await Promise.all([
      prisma.product.findMany({ include: { category: true } }),
      prisma.inventoryTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { product: true } }),
    ]);
    const totalProducts = products.length;
    const totalUnits = products.reduce((s, p) => s + p.stockQuantity, 0);
    const lowStock = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.reorderLevel);
    const outOfStock = products.filter((p) => p.stockQuantity <= 0);
    const value = products.reduce((s, p) => s + p.stockQuantity * p.costPrice, 0);

    const byCategory = new Map<string, number>();
    for (const p of products) {
      const name = p.category?.name ?? "Uncategorized";
      byCategory.set(name, (byCategory.get(name) ?? 0) + 1);
    }
    const maxCat = Math.max(1, ...byCategory.values());

    return { totalProducts, totalUnits, lowStock, outOfStock, value, recent: transactions, byCategory: [...byCategory.entries()], maxCat, allLow: lowStock.slice(0, 8) };
  } catch {
    return { totalProducts: 0, totalUnits: 0, lowStock: [], outOfStock: [], value: 0, recent: [], byCategory: [] as [string, number][], maxCat: 1, allLow: [] };
  }
}

export async function getAnalytics() {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    const tx = await prisma.inventoryTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 60 });

    const countByCat = new Map<string, number>();
    const valueByCat = new Map<string, number>();
    for (const p of products) {
      const name = p.category?.name ?? "Uncategorized";
      countByCat.set(name, (countByCat.get(name) ?? 0) + 1);
      valueByCat.set(name, (valueByCat.get(name) ?? 0) + p.stockQuantity * p.costPrice);
    }
    const maxCount = Math.max(1, ...countByCat.values(), 1);
    const maxValue = Math.max(1, ...valueByCat.values(), 1);

    const byDay = new Map<string, number>();
    for (const t of tx) {
      const day = t.createdAt.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + Math.abs(t.quantity));
    }
    const movement = [...byDay.entries()].sort().slice(-14);
    const maxMove = Math.max(1, ...movement.map(([, v]) => v));

    const mostStocked = [...products].sort((a, b) => b.stockQuantity - a.stockQuantity).slice(0, 8);
    const totalValue = products.reduce((s, p) => s + p.stockQuantity * p.costPrice, 0);

    return { countByCat: [...countByCat.entries()], valueByCat: [...valueByCat.entries()], maxCount, maxValue, movement, maxMove, mostStocked, totalValue };
  } catch {
    return { countByCat: [], valueByCat: [], maxCount: 1, maxValue: 1, movement: [], maxMove: 1, mostStocked: [], totalValue: 0 };
  }
}
