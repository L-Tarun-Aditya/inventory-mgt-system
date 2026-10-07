import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[8px] border bg-card px-6 py-14 text-center">
      <p className="text-[15px] font-medium">{title}</p>
      <p className="max-w-[360px] text-[13px] text-muted-foreground">{description}</p>
      {actionLabel && actionHref ? (
        <Button asChild variant="outline" className="mt-3">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
