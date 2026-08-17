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
    <nav className="border-border bg-card/85 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <motion.span
                animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
                transition={spring}
              >
                <Icon name={item.icon} className="size-5" />
              </motion.span>
              {item.label}
              {active && (
                <motion.span
                  layoutId="tab-active"
                  transition={spring}
                  className="bg-primary absolute -top-0.5 h-1 w-6 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
