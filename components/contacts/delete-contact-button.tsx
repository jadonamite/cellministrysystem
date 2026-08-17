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
import { deleteContact } from "@/app/contacts/actions";

/**
 * Admin-only delete for a fake/invalid contact. Opens a confirm dialog, then
 * removes the contact and its call history. Rendered as a sibling of the row/card
 * tap target and stops propagation so it never triggers a call-log.
 */
export function DeleteContactButton({
  id,
  name,
  className = "",
}: {
  id: string;
  name: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    setError(null);
    startTransition(async () => {
      const res = await deleteContact(id);
      if (res.ok) setOpen(false);
      else setError(res.error ?? "Could not delete.");
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Delete ${name}`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        className={`text-muted-foreground hover:bg-destructive hover:text-white inline-flex items-center justify-center rounded-full border border-border transition-colors ${className}`}
      >
        <Icon name="close" className="size-4" />
      </button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setError(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {name}?</DialogTitle>
            <DialogDescription>
              This removes the contact and their call history for good. Use it for
              fake or invalid entries — it can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-3">
            {error ? (
              <span className="text-destructive flex items-center gap-1.5 text-sm font-semibold">
                <Icon name="error" className="size-4" /> {error}
              </span>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:bg-secondary rounded-full border border-border px-4 py-2 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={pending}
                className="bg-destructive inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold text-white disabled:opacity-40"
              >
                {pending && <Spinner className="size-3.5 animate-spin" />}
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
