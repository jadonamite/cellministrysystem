"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { LogCallDialog } from "./log-call-dialog";
import { DeleteContactButton } from "./delete-contact-button";
import { useCallerGate } from "@/components/caller/caller-gate";

/** Per-row "Log call" trigger + dialog. Lives client-side so the table stays a server component. */
export function ContactRowActions({
  contact,
  eventName,
  inviteTemplate,
  isAdmin = false,
}: {
  contact: { id: string; name: string; phone: string };
  eventName: string;
  inviteTemplate?: string;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { requireCaller } = useCallerGate();
  return (
    <div className="inline-flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => {
          // Gate: must be signed in as a caller before logging a call.
          if (requireCaller()) setOpen(true);
        }}
        className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
      >
        <Icon name="call" className="size-3.5" /> Log
      </button>
      {isAdmin && <DeleteContactButton id={contact.id} name={contact.name} className="size-8" />}
      <LogCallDialog
        open={open}
        onOpenChange={setOpen}
        contact={contact}
        eventName={eventName}
        inviteTemplate={inviteTemplate}
      />
    </div>
  );
}
