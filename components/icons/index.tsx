import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import { SOLAR_ICONS, type IconName } from "./solar-icons";

export type { IconName };
export { WhatsappIcon, PhoneSolidIcon } from "./brand";

/**
 * Single entry point for iconography. Renders vendored Solar (duotone/linear)
 * marks — swap the whole app's icon language here, not per-file. Colour follows
 * `currentColor`; duotone secondaries carry their own 0.5 opacity.
 */
export function Icon({
  name,
  className,
  ...props
}: { name: IconName; className?: string } & Omit<SVGProps<SVGSVGElement>, "dangerouslySetInnerHTML">) {
  const icon = SOLAR_ICONS[name];
  return (
    <svg
      viewBox={`0 0 ${icon.w} ${icon.h}`}
      className={cn("size-5 shrink-0", className)}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: icon.body }}
      {...props}
    />
  );
}

/** Loading spinner in the same visual language (no lucide). */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("size-4 shrink-0 animate-spin", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity=".25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
