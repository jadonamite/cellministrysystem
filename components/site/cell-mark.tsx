import Image from "next/image";
import badge from "@/public/images/blw-badge.png";
import { cn } from "@/lib/utils";

/** Public-site brand: BLW badge and the zone name. The app itself is "Cell Ministry". */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image src={badge} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full" />
      <span className="text-[1.0625rem] font-bold tracking-tight">BLWZONEG</span>
    </span>
  );
}
