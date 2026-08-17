"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon, PhoneSolidIcon } from "@/components/icons";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";
import { logout } from "@/app/login/actions";

interface Props {
  identity?: { role: string; name?: string } | null;
  /** The event-progress card, streamed in via Suspense so it never blocks the shell. */
  progress?: React.ReactNode;
}

export function Sidebar({ identity, progress }: Props) {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r md:flex lg:w-60">
      <Link href="/" className="flex items-center gap-2.5 px-4 pt-6 lg:px-6">
        <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-xl">
          <PhoneSolidIcon className="size-4" />
        </span>
        <span className="hidden text-[15px] font-bold tracking-tight lg:block">
          CallCenter
        </span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1 px-2.5 lg:px-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  transition={spring}
                  className="bg-primary absolute inset-0 -z-10 rounded-2xl"
                />
              )}
              <Icon name={item.icon} className="size-5 shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 px-2.5 pb-2 lg:px-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors",
            isActive(pathname, "/settings")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Icon name="settings" className="size-5 shrink-0" />
          <span className="hidden lg:block">Settings</span>
        </Link>

        {identity && (
          <form action={logout}>
            <button
              type="submit"
              className="text-muted-foreground hover:bg-secondary hover:text-foreground flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors"
            >
              <Icon name="logout" className="size-5 shrink-0" />
              <span className="hidden lg:block">
                Sign out
                <span className="text-muted-foreground/70 ml-1 text-xs font-medium">
                  {identity.role === "admin" ? "· Admin" : identity.name ? `· ${identity.name}` : ""}
                </span>
              </span>
            </button>
          </form>
        )}
      </div>

      {progress && <div className="hidden p-4 lg:block">{progress}</div>}
    </aside>
  );
}
