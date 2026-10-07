import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const variant =
    normalized === "OUT_OF_STOCK" ? "destructive" : normalized === "LOW_STOCK" ? "warning" : "success";
  const label =
    normalized === "OUT_OF_STOCK" ? "Out of Stock" : normalized === "LOW_STOCK" ? "Low Stock" : "In Stock";
  const dot =
    normalized === "OUT_OF_STOCK"
      ? "bg-[var(--destructive)]"
      : normalized === "LOW_STOCK"
        ? "bg-[var(--warning)]"
        : "bg-[var(--success)]";
  return (
    <Badge variant={variant} className={cn("gap-1.5")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
      {label}
    </Badge>
  );
}
