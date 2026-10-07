import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-transparent bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]",
        warning: "border-transparent bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]",
        destructive: "border-transparent bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] text-[var(--destructive)]",
        outline: "text-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
