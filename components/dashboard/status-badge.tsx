import { Badge } from "@/components/ui/badge";
import type { Contact } from "@/lib/types";

const OUTCOME_BADGE: Record<
  Contact["outcome"],
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  answered: { label: "Answered", variant: "default" },
  no_answer: { label: "No answer", variant: "destructive" },
  messaged_only: { label: "Messaged", variant: "secondary" },
  not_contacted: { label: "Pending", variant: "outline" },
};

export function StatusBadge({ outcome }: { outcome: Contact["outcome"] }) {
  const badge = OUTCOME_BADGE[outcome];
  return (
    <Badge className="rounded-full" variant={badge.variant}>
      {badge.label}
    </Badge>
  );
}
