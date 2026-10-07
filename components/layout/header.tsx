"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [q, setQ] = useState("");
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95">
      <div className="flex h-[60px] items-center gap-3 px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden" aria-label="Open navigation">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[19px] font-semibold leading-tight md:text-[22px]">{title}</h1>
          {subtitle ? (
            <p className="truncate text-[12.5px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <form
          action="/products"
          method="get"
          className="relative hidden w-[260px] sm:block"
          role="search"
        >
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="pl-8"
            aria-label="Search products"
          />
        </form>

        <ThemeToggle />
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-[7px] border bg-card text-[13px] font-medium"
          aria-label="Profile"
        >
          OP
        </Link>
      </div>
    </header>
  );
}
