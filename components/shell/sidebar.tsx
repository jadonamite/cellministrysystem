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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r border-zinc-200/80 bg-white/80 dark:border-white/[0.08] dark:bg-zinc-950/75 backdrop-blur-2xl md:flex lg:w-64 transition-all">
      
      {/* Brand Header */}
      <Link href="/dashboard" className="flex items-center gap-3 px-4 pt-7 pb-6 lg:px-6">
        <div className="relative size-9 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.25)] shrink-0">
          <svg className="size-5 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="12" cy="12" r="8.5" strokeDasharray="3 3" strokeOpacity="0.6" />
            <circle cx="12" cy="5" r="2" fill="currentColor" />
            <circle cx="5.5" cy="15" r="2" fill="currentColor" />
            <circle cx="18.5" cy="15" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="2.5" fill="#10B981" />
          </svg>
        </div>
        <div className="hidden lg:block">
          <h1 className="text-xs font-extrabold uppercase tracking-[0.2em] text-zinc-950 dark:text-white">
            Cell Ministry
          </h1>
          <p className="font-serif italic text-purple-600 dark:text-purple-400 text-sm -mt-0.5">
            you are on a course
          </p>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="mt-2 flex flex-col gap-1.5 px-2.5 lg:px-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                active
                  ? "bg-zinc-200/80 text-zinc-950 border border-zinc-300/80 dark:bg-zinc-900/90 dark:border-white/10 dark:text-white shadow-sm font-bold"
                  : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <Icon
                name={item.icon}
                className={cn(
                  "size-5 shrink-0 transition-colors",
                  active
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-zinc-400 group-hover:text-purple-500 dark:text-zinc-500 dark:group-hover:text-purple-400"
                )}
              />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="mt-auto flex flex-col gap-1.5 px-2.5 pb-4 lg:px-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all",
            isActive(pathname, "/settings")
              ? "bg-zinc-200/80 text-zinc-950 dark:bg-zinc-900/90 dark:text-white font-bold"
              : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
          )}
        >
          <Icon name="settings" className="size-5 shrink-0 text-zinc-400" />
          <span className="hidden lg:block">Settings</span>
        </Link>

        {identity && (
          <div className="pt-2 border-t border-zinc-200/80 dark:border-white/[0.08]">
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center justify-between p-2 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/5 text-left hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    {identity.name ? identity.name.slice(0, 2).toUpperCase() : "AD"}
                  </div>
                  <div className="hidden lg:block truncate">
                    <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                      {identity.name || "Admin"}
                    </p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
                      {identity.role === "admin" ? "Senior Admin" : "Cell Leader"}
                    </p>
                  </div>
                </div>
                <Icon name="logout" className="size-4 shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-white" />
              </button>
            </form>
          </div>
        )}
      </div>

      {progress && <div className="hidden p-4 lg:block">{progress}</div>}
    </aside>
  );
}
