"use client";

import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/**
 * Wraps a cropped flyer or photo; tapping it opens the whole image. When the
 * children are visible text, pass `textLabel` so the button is named by that
 * text rather than by a generated label.
 */
export function FlyerButton({
  photo,
  alt,
  title,
  kind = "flyer",
  textLabel,
  className,
  children,
}: {
  photo: StaticImageData;
  alt: string;
  title: string;
  kind?: "flyer" | "photo";
  textLabel?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={textLabel ? undefined : `View the ${title} ${kind}`}
        className={cn("shrink-0 rounded-full transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]", className)}
      >
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg p-3 pt-14 sm:p-3 sm:pt-14">
        <DialogTitle className="sr-only">
          {title} {kind}
        </DialogTitle>
        <Image src={photo} alt={alt} sizes="(min-width: 640px) 512px, 100vw" className="h-auto w-full rounded-2xl" />
      </DialogContent>
    </Dialog>
  );
}
