"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/icons";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/90 bg-white/90 dark:border-white/10 dark:bg-zinc-900/90 backdrop-blur-2xl md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-5 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-1 text-[11px] font-bold transition-all",
                active
                  ? "text-purple-600 dark:text-purple-400 font-extrabold"
                  : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              )}
            >
              {active && (
                <motion.span
                  layoutId="bottom-tab-active"
                  transition={spring}
                  className="absolute inset-0 -z-10 rounded-2xl bg-purple-500/12 dark:bg-purple-500/20 border border-purple-500/20 dark:border-purple-500/30"
                />
              )}
              <motion.span
                animate={{ scale: active ? 1.12 : 1, y: active ? -2 : 0 }}
                transition={spring}
                className="relative"
              >
                <Icon
                  name={item.icon}
                  className={cn(
                    "size-7 shrink-0 transition-colors",
                    active
                      ? "text-purple-600 dark:text-purple-400 drop-shadow-[0_2px_8px_rgba(168,85,247,0.4)]"
                      : "text-zinc-400 group-hover:text-purple-500 dark:text-zinc-400 dark:group-hover:text-purple-400"
                  )}
                />
              </motion.span>
              <span className="truncate max-w-[64px] text-center tracking-tight leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
