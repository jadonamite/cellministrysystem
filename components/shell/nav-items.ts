import type { IconName } from "@/components/icons";

export const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Overview", icon: "dashboard" },
  { href: "/contacts", label: "Flock Roster", icon: "contacts" },
  { href: "/teams", label: "Hierarchy Tree", icon: "teams" },
  { href: "/follow-ups", label: "Follow-ups", icon: "followups" },
  { href: "/events", label: "Campaigns", icon: "events" },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
