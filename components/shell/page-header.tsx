import Link from "next/link";
import { Icon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  title: string;
  subtitle?: string;
  /** small uppercase line above the title — where the page sits in the tree */
  eyebrow?: string;
  /** handwritten aside, used sparingly for the human note on a page */
  aside?: string;
  children?: React.ReactNode; // extra chips/actions on the right
}

export function PageHeader({ title, subtitle, eyebrow, aside, children }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {eyebrow && <p className="label-caps text-primary mb-1.5">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight uppercase">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p>
        )}
        {aside && (
          <p className="script text-primary/85 mt-1.5 text-xl">{aside}</p>
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
