"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, Spinner } from "@/components/icons";
import { WhatsappIcon, PhoneSolidIcon } from "@/components/icons/brand";
import { stepVariants, spring } from "@/lib/motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CALL_OUTCOMES,
  DISPOSITIONS,
  type CallOutcome,
  type Disposition,
} from "@/lib/outreach";
import { DEFAULT_INVITE, fillInvite, telLink, waLink } from "@/lib/contact-links";
import { logOutcome } from "@/app/contacts/actions";

/** Outcomes a *call* can end in (messaged is the WhatsApp path). */
const CALL_STEP_OUTCOMES: CallOutcome[] = [
  "answered",
  "no_answer",
  "busy",
  "switched_off",
  "wrong_number",
];

const DISPOSITION_ORDER: Disposition[] = ["coming", "call_back_later", "not_coming"];

type Step = "reach" | "outcome" | "response" | "saved";
type Channel = "call" | "message";
type LogResult = { ok: boolean; error?: string };

function Chip({
  active,
  onClick,
  children,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "good" | "bad";
}) {
  const activeCls =
    tone === "good"
      ? "bg-[var(--team-2)] text-white"
      : tone === "bad"
        ? "bg-destructive text-white"
        : "bg-primary text-primary-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
        active ? activeCls : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
      }`}
    >
      {children}
    </button>
  );
}

export function LogCallDialog({
  open,
  onOpenChange,
  contact,
  eventName,
  inviteTemplate = DEFAULT_INVITE,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contact: { id: string; name: string; phone: string };
  eventName: string;
  /** editable in Settings; falls back to the built-in invite */
  inviteTemplate?: string;
}) {
  const [step, setStep] = useState<Step>("reach");
  const [channel, setChannel] = useState<Channel>("call");
  const [outcome, setOutcome] = useState<CallOutcome | null>(null);
  const [disposition, setDisposition] = useState<Disposition | null>(null);
  const [callBackAt, setCallBackAt] = useState("");
  const [note, setNote] = useState("");
  const [backFromApp, setBackFromApp] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<LogResult | null>(null);
  const savingRef = useRef(false);

  const invite = fillInvite(inviteTemplate, contact.name, eventName);

  function reset() {
    setStep("reach");
    setChannel("call");
    setOutcome(null);
    setDisposition(null);
    setCallBackAt("");
    setNote("");
    setBackFromApp(false);
    setResult(null);
    savingRef.current = false;
  }

  // When the caller returns from the dialer / WhatsApp, gently flag "what happened?".
  useEffect(() => {
    if (!open) return;
    function onVisible() {
      if (document.visibilityState === "visible" && (step === "outcome" || step === "response")) {
        setBackFromApp(true);
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [open, step]);

  function startCall() {
    setChannel("call");
    window.location.href = telLink(contact.phone); // opens the native dialer
    setStep("outcome");
  }

  function startWhatsApp() {
    setChannel("message");
    setOutcome("messaged");
    window.open(waLink(contact.phone, invite), "_blank", "noopener,noreferrer");
    setStep("response");
  }

  function pickOutcome(o: CallOutcome) {
    setOutcome(o);
    if (o === "answered") {
      setStep("response");
    } else {
      // no_answer / busy / switched_off / wrong_number — one tap, done.
      save(o, undefined, undefined);
    }
  }

  function save(o: CallOutcome, disp: Disposition | undefined, cb: string | undefined) {
    if (savingRef.current) return;
    savingRef.current = true;
    setResult(null);
    startTransition(async () => {
      const res = await logOutcome({
        contactId: contact.id,
        outcome: o,
        disposition: disp,
        callBackAt: disp === "call_back_later" ? cb : undefined,
        note: note.trim() || undefined,
      });
      setResult(res);
      if (res.ok) {
        setStep("saved");
        setTimeout(() => {
          onOpenChange(false);
          reset();
        }, 800);
      } else {
        savingRef.current = false;
      }
    });
  }

  function saveResponse() {
    if (!outcome) return;
    if (disposition === "call_back_later" && !callBackAt) return;
    save(outcome, disposition ?? undefined, callBackAt);
  }

  const back = () => {
    setBackFromApp(false);
    setResult(null);
    savingRef.current = false;
    setStep("reach");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== "reach" && step !== "saved" && (
              <button
                type="button"
                onClick={back}
                aria-label="Back"
                className="text-muted-foreground hover:text-foreground -ml-1"
              >
                <Icon name="chevron-left" className="size-5" />
              </button>
            )}
            {contact.name}
          </DialogTitle>
          <DialogDescription className="font-mono tabular-nums">
            {contact.phone}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait" initial={false}>
        {/* STEP 1 — reach out */}
        {step === "reach" && (
          <motion.div
            key="reach"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex items-start justify-center gap-8 py-6"
          >
            <button
              type="button"
              onClick={startCall}
              className="group flex flex-col items-center gap-2.5"
            >
              <span className="bg-primary text-primary-foreground flex size-24 items-center justify-center rounded-full shadow-lg transition-transform group-active:scale-95">
                <PhoneSolidIcon className="size-10" />
              </span>
              <span className="text-sm font-bold">Call</span>
            </button>
            <button
              type="button"
              onClick={startWhatsApp}
              className="group flex flex-col items-center gap-2.5"
            >
              <span className="flex size-24 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform group-active:scale-95">
                <WhatsappIcon className="size-11" />
              </span>
              <span className="text-sm font-bold">WhatsApp</span>
            </button>
          </motion.div>
        )}

        {/* STEP 2 — what happened (call) */}
        {step === "outcome" && (
          <motion.div
            key="outcome"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-3"
          >
            <p className="text-sm font-bold">
              {backFromApp ? "How did the call go?" : "What happened?"}
            </p>
            <div className="flex flex-wrap gap-2">
              {CALL_STEP_OUTCOMES.map((o) => (
                <Chip
                  key={o}
                  active={outcome === o}
                  onClick={() => pickOutcome(o)}
                  tone={o === "wrong_number" ? "bad" : "default"}
                >
                  {CALL_OUTCOMES[o].label}
                </Chip>
              ))}
            </div>
            {pending && (
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <Spinner className="size-3.5" /> Saving…
              </p>
            )}
          </motion.div>
        )}

        {/* STEP 3 — response (answered call OR whatsapp) */}
        {step === "response" && (
          <motion.div
            key="response"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-3"
          >
            <p className="text-sm font-bold">
              {channel === "message" ? "Any reply yet?" : "Are they coming?"}
            </p>
            <div className="flex flex-wrap gap-2">
              {DISPOSITION_ORDER.map((d) => (
                <Chip
                  key={d}
                  active={disposition === d}
                  onClick={() => setDisposition(d)}
                  tone={d === "coming" ? "good" : d === "not_coming" ? "bad" : "default"}
                >
                  {DISPOSITIONS[d]}
                </Chip>
              ))}
              {channel === "message" && (
                <Chip active={disposition === null} onClick={() => setDisposition(null)}>
                  No reply yet
                </Chip>
              )}
            </div>

            {disposition === "call_back_later" && (
              <input
                type="date"
                value={callBackAt}
                onChange={(e) => setCallBackAt(e.target.value)}
                className="bg-secondary focus:ring-ring h-9 rounded-full px-4 text-sm font-medium outline-none focus:ring-2"
              />
            )}

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Note (optional)"
              className="bg-secondary placeholder:text-muted-foreground/60 focus:ring-ring w-full resize-none rounded-2xl p-3 text-sm outline-none focus:ring-2"
            />

            <div className="flex items-center justify-between gap-3">
              {result?.error ? (
                <span className="text-destructive flex items-center gap-1.5 text-xs font-semibold">
                  <Icon name="error" className="size-4" /> {result.error}
                </span>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={saveResponse}
                disabled={pending || (disposition === "call_back_later" && !callBackAt)}
                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-40"
              >
                {pending && <Spinner className="size-3.5" />}
                {pending ? "Saving…" : "Save log"}
              </button>
            </div>
          </motion.div>
        )}

        {/* saved confirmation */}
        {step === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: spring }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-6 text-[var(--team-2)]"
          >
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0, transition: { ...spring, delay: 0.05 } }}
            >
              <Icon name="success" className="size-10" />
            </motion.span>
            <span className="text-sm font-bold">Logged</span>
          </motion.div>
        )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
