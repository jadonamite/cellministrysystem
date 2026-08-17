import Link from "next/link";
import { Icon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // extra chips/actions on the right
}

export function PageHeader({ title, subtitle, children }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        {children}
        <Link
          href="/settings"
          aria-label="Settings"
          className="glass-pill text-muted-foreground hover:text-foreground flex size-10 items-center justify-center transition-colors md:hidden"
        >
          <Icon name="settings" className="size-5" />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
