"use client";

import { useState, useTransition } from "react";
import { Icon, Spinner } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { saveEvent } from "@/app/events/actions";
import type { OutreachEvent } from "@/lib/events";

/** Pull yyyy-mm-dd / HH:mm straight from the offset ISO (avoids TZ drift). */
function parts(e?: OutreachEvent) {
  if (!e) return { date: "", start: "", end: "" };
  return {
    date: e.eventStart.slice(0, 10),
    start: e.eventStart.slice(11, 16),
    end: e.eventEnd.slice(11, 16),
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "bg-secondary placeholder:text-muted-foreground/60 focus:ring-ring h-9 rounded-xl px-3 text-sm font-medium outline-none focus:ring-2";

export function EventFormDialog({
  event,
  mode,
}: {
  event?: OutreachEvent;
  mode: "add" | "edit";
}) {
  const p = parts(event);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(event?.name ?? "");
  const [admin, setAdmin] = useState(event?.admin ?? "");
  const [target, setTarget] = useState(event ? String(event.target) : "");
  const [eventDate, setEventDate] = useState(p.date);
  const [startTime, setStartTime] = useState(p.start);
  const [endTime, setEndTime] = useState(p.end);
  const [campaignStart, setCampaignStart] = useState(event?.campaignStart ?? "");
  const [campaignDays, setCampaignDays] = useState(event ? String(event.campaignDays) : "14");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveEvent({
        id: event?.id,
        name,
        admin,
        target: Number(target),
        eventDate,
        startTime,
        endTime,
        campaignStart,
        campaignDays: Number(campaignDays),
      });
      if (res.ok) setOpen(false);
      else setError(res.error ?? "Could not save.");
    });
  }

  return (
    <>
      {mode === "add" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
        >
          <Icon name="add" className="size-3.5" /> New event
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
        >
          <Icon name="edit" className="size-3.5" /> Edit
        </button>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setError(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "New event" : `Edit ${event?.name}`}</DialogTitle>
            <DialogDescription>
              Each event runs its own outreach campaign.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Event name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Impact Service"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Admin">
              <input
                value={admin}
                onChange={(e) => setAdmin(e.target.value)}
                placeholder="Admin name"
                className={inputCls}
              />
            </Field>
            <Field label="Reach target">
              <input
                inputMode="numeric"
                value={target}
                onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))}
                placeholder="560"
                className={`${inputCls} tabular-nums`}
              />
            </Field>
            <Field label="Event date">
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="End">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Campaign start">
              <input
                type="date"
                value={campaignStart}
                onChange={(e) => setCampaignStart(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Campaign length (days)">
              <input
                inputMode="numeric"
                value={campaignDays}
                onChange={(e) => setCampaignDays(e.target.value.replace(/\D/g, ""))}
                placeholder="14"
                className={`${inputCls} tabular-nums`}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-3">
            {error ? (
              <span className="text-destructive flex items-center gap-1.5 text-xs font-semibold">
                <Icon name="error" className="size-4" /> {error}
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-40"
            >
              {pending && <Spinner className="size-3.5 animate-spin" />}
              {pending ? "Saving…" : mode === "add" ? "Create event" : "Save changes"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
