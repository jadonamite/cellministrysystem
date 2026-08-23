import Link from "next/link";
import { Icon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  adminName: string;
  eventName: string;
  week: number;
  totalWeeks: number;
  contacts: number;
  teams: number;
  target: number;
}

export function DashboardHeader({
  adminName,
  eventName,
  week,
  totalWeeks,
  contacts,
  teams,
  target,
}: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>Good day, {adminName} 👋</span>
          <span>·</span>
          <span className="font-serif italic text-purple-600 dark:text-purple-400 text-sm">
            you are on a course
          </span>
        </div>
        <h1 className="truncate text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          {eventName}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs pt-0.5">
          {contacts.toLocaleString()} souls across {teams} ministry teams · target{" "}
          {target.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="rounded-full border border-zinc-200/80 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-300">
          Week {week} of {totalWeeks}
        </span>
        <Link
          href="/contacts/new"
          className="flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-all cursor-pointer"
        >
          <Icon name="add" className="size-4" />
          <span>Add Soul</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
