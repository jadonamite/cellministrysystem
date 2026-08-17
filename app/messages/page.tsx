import { cookies } from "next/headers";
import { PageHeader } from "@/components/shell/page-header";
import { BroadcastComposer } from "@/components/messages/broadcast-composer";
import { loadAppData } from "@/lib/page-data";
import { getEvent } from "@/lib/events";

export const metadata = { title: "Send SMS · Outreach Call Center" };

export default async function MessagesPage() {
  const store = await cookies();
  const activeEvent = store.get("active_event")?.value;
  const eventName = getEvent(activeEvent).name;
  const initialTemplate = store.get("invite_template")?.value || undefined;
  const { contacts, rollup, groups, teamOf } = await loadAppData();
  const nameById = new Map(groups.map((g) => [g._id, g.name]));

  const recipients = contacts.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    cell: nameById.get(c.groupId) ?? "",
    teamId: teamOf[c.groupId] ?? "",
    outcome: c.outcome,
  }));

  const teams = rollup
    .filter((r) => r.level === "TEAM")
    .map((t) => ({ id: t.id, name: t.name }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Send SMS"
        subtitle="Personalized invites to a chosen audience — one message per person, valid numbers only"
      />
      <BroadcastComposer
        recipients={recipients}
        teams={teams}
        eventName={eventName}
        initialTemplate={initialTemplate}
      />
    </div>
  );
}
