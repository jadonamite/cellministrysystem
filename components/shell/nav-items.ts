import type { IconName } from "@/components/icons";

export const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/teams", label: "Teams", icon: "teams" },
  { href: "/follow-ups", label: "Follow-ups", icon: "followups" },
  { href: "/contacts", label: "Contacts", icon: "contacts" },
  { href: "/events", label: "Events", icon: "events" },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
