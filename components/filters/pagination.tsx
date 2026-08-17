import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  basePath: string;
  params: URLSearchParams;
}

export function Pagination({ page, totalPages, basePath, params }: Props) {
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const next = new URLSearchParams(params);
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-xs font-medium">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          aria-disabled={page <= 1}
          href={href(page - 1)}
          className={cn(
            "bg-secondary rounded-full px-4 py-2 text-xs font-bold",
            page <= 1 && "pointer-events-none opacity-40"
          )}
        >
          ← Prev
        </Link>
        <Link
          aria-disabled={page >= totalPages}
          href={href(page + 1)}
          className={cn(
            "bg-secondary rounded-full px-4 py-2 text-xs font-bold",
            page >= totalPages && "pointer-events-none opacity-40"
          )}
        >
          Next →
        </Link>
      </div>
    </div>
  );
}
