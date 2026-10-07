"use client";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="system"
    className="toaster group"
    toastOptions={{
      classNames: {
        toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:rounded-[8px]",
        description: "group-[.toast]:text-muted-foreground",
      },
    }}
    {...props}
  />
);

export { Toaster };
