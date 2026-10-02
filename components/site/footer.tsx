import Link from "next/link";
import { cn } from "@/lib/utils";
import { Wordmark } from "./cell-mark";

const LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/login", label: "Sign in" },
];

/** `onWhite` pins light colours for the landing page, which always ends on cream. */
export function SiteFooter({ onWhite }: { onWhite?: boolean }) {
  return (
    <footer
      className={cn(
        "px-4 pt-8 pb-[max(112px,calc(env(safe-area-inset-bottom)+96px))] sm:px-10",
        onWhite && "bg-cream text-ink",
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between",
          onWhite ? "border-ink/12" : "border-border",
        )}
      >
        <Link href="/" aria-label="BLWZONEG home" className="inline-flex min-h-11 items-center self-start">
          <Wordmark />
        </Link>
        <nav aria-label="Legal and account">
          <ul className="flex flex-wrap gap-x-2 gap-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full px-3 text-[0.9375rem] transition-colors duration-150",
                    onWhite ? "text-ink/75 hover:text-ink" : "text-label-2 hover:text-foreground",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className={cn("mt-4 text-[0.8125rem]", onWhite ? "text-ink/65" : "text-label-3")}>
        © {new Date().getFullYear()} BLWZONEG
      </p>
    </footer>
  );
}
