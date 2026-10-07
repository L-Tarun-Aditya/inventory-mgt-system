"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Boxes,
  AlertTriangle,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Inventory",
    items: [{ href: "/", label: "Overview", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/products", label: "Products", icon: Package },
      { href: "/categories", label: "Categories", icon: Tags },
      { href: "/suppliers", label: "Suppliers", icon: Truck },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/stock", label: "Stock", icon: Boxes },
      { href: "/low-stock", label: "Low Stock", icon: AlertTriangle },
    ],
  },
  {
    label: "Analytics",
    items: [{ href: "/analytics", label: "Analytics", icon: BarChart3 }],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col gap-5 px-3 py-5">
      <Link href="/" className="flex items-center gap-2 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary text-[13px] font-semibold text-primary-foreground">
          IM
        </span>
        <span className="text-[14px] font-semibold tracking-tight">Inventory</span>
      </Link>

      <nav className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.label + group.items[0]?.href} className="flex flex-col gap-1">
            <p className="px-2 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href, (item as { exact?: boolean }).exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[6px] px-2 py-[7px] text-[13.5px] transition-colors",
                    active
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-4">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-[6px] px-2 py-[7px] text-[13.5px] text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </div>
    </div>
  );
}
