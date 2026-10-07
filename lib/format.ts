export function formatINR(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function statusFromStock(stock: number, reorder: number) {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= reorder) return "LOW_STOCK";
  return "IN_STOCK";
}
