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
      <div className="min-w-0 space-y-1.5">
        <p className="text-muted-foreground text-sm font-medium">
          Hello, {adminName} 👋
        </p>
        <div className="flex items-center gap-2.5">
          <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-2xl">
            <Icon name="calendar" className="size-5.5" />
          </span>
          <h1 className="truncate text-[2rem] leading-none font-bold tracking-tight">
            {eventName}
          </h1>
        </div>
        <p className="text-muted-foreground pt-0.5 text-sm">
          {contacts.toLocaleString()} contacts across {teams} teams · target{" "}
          {target.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="glass-pill text-muted-foreground px-4 py-2 text-[11px] font-bold tracking-widest uppercase">
          Week {week} of {totalWeeks}
        </span>
        <Link
          href="/settings"
          aria-label="Settings"
          className="glass-pill text-muted-foreground hover:text-foreground flex size-10 items-center justify-center transition-colors md:hidden"
        >
          <Icon name="settings" className="size-4.5" />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
