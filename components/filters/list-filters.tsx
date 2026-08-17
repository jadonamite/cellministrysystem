"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterTab {
  value: string;
  label: string;
}

interface Props {
  tabs?: FilterTab[];
  teams: { id: string; name: string }[];
  searchPlaceholder?: string;
}

/** URL-driven filter row: status tabs, team select, debounced search. */
export function ListFilters({ tabs, teams, searchPlaceholder = "Search name or phone…" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = params.get("status") ?? "all";
  const team = params.get("team") ?? "all";
  const [q, setQ] = useState(params.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mark filter navigations as transitions: React keeps the current list
  // interactive and lets us show a pending cue instead of freezing on tap.
  const [isPending, startTransition] = useTransition();

  function push(next: Record<string, string | null>) {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "all" || v === "") p.delete(k);
      else p.set(k, v);
    }
    p.delete("page"); // any filter change resets pagination
    startTransition(() => {
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    });
  }

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  return (
    <div
      aria-busy={isPending}
      className={cn(
        "flex flex-wrap items-center gap-2.5",
        isPending && "opacity-70 transition-opacity"
      )}
    >
      {tabs && (
        <div className="scroll-x -mx-1 flex gap-1.5 px-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => push({ status: t.value })}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors",
                status === t.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <Select value={team} onValueChange={(v) => push({ team: v })}>
        <SelectTrigger className="w-[150px] rounded-full" size="sm">
          <SelectValue placeholder="All teams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All teams</SelectItem>
          {teams.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative ml-auto w-full sm:w-60">
        <Icon name="search" className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (debounce.current) clearTimeout(debounce.current);
            const v = e.target.value;
            debounce.current = setTimeout(() => push({ q: v }), 300);
          }}
          placeholder={searchPlaceholder}
          className="bg-secondary placeholder:text-muted-foreground focus:ring-ring h-9 w-full rounded-full pr-4 pl-10 text-sm font-medium outline-none focus:ring-2"
        />
      </div>
    </div>
  );
}
