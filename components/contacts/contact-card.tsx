"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/icons";
import { PhoneSolidIcon } from "@/components/icons/brand";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { LogCallDialog } from "./log-call-dialog";
import { DeleteContactButton } from "./delete-contact-button";
import { useCallerGate } from "@/components/caller/caller-gate";
import type { Contact } from "@/lib/types";

/**
 * Mobile call-queue card. The whole card is one big tap target that opens the
 * progressive call/WhatsApp dialog — built for a caller thumbing down the list.
 */
export function ContactCard({
  contact,
  origin,
  color,
  outcome,
  lastContact,
  eventName,
  inviteTemplate,
  isAdmin = false,
}: {
  contact: { id: string; name: string; phone: string; broughtBy: string; location?: string | null };
  origin: string;
  color: string;
  outcome: Contact["outcome"];
  lastContact: string;
  eventName: string;
  inviteTemplate?: string;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { requireCaller } = useCallerGate();
  return (
    <div className="relative">
      {isAdmin && (
        <DeleteContactButton
          id={contact.id}
          name={contact.name}
          className="absolute top-2 right-2 z-10 size-7 bg-card/80 backdrop-blur"
        />
      )}
      <motion.button
        type="button"
        onClick={() => {
          // Gate: must be signed in as a caller before logging a call.
          if (requireCaller()) setOpen(true);
        }}
        // No entry animation: the list re-mounts on every filter/tab/search
        // navigation, so a staggered fade-in would replay each tap and read as
        // jank. Cards appear instantly; whileTap keeps the touch feedback.
        whileTap={{ scale: 0.98 }}
        className="card-soft bg-card active:bg-secondary/40 flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-colors"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold">{contact.name}</span>
            <StatusBadge outcome={outcome} />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                background: `color-mix(in srgb, ${color} 13%, transparent)`,
                color,
              }}
            >
              {origin}
            </span>
            <span className="text-muted-foreground font-mono tabular-nums">
              {contact.phone}
            </span>
            {contact.location && (
              <span className="text-muted-foreground/80 inline-flex items-center gap-0.5">
                <Icon name="pin" className="size-3 shrink-0" />
                {contact.location}
              </span>
            )}
            <span className="text-muted-foreground/70">· {lastContact}</span>
          </div>
        </div>
        <span className="bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <PhoneSolidIcon className="size-5" />
        </span>
      </motion.button>

      <LogCallDialog
        open={open}
        onOpenChange={setOpen}
        contact={{ id: contact.id, name: contact.name, phone: contact.phone }}
        eventName={eventName}
        inviteTemplate={inviteTemplate}
      />
    </div>
  );
}
