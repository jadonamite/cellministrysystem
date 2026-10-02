import type { Metadata } from "next";
import { Hero } from "@/components/site/hero";
import { JoinUs } from "@/components/site/join-us";
import { ListenIn } from "@/components/site/listen-in";
import { LiveEvent } from "@/components/site/live-event";
import { Gallery } from "@/components/site/gallery";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "BLWZONEG",
  description: "BLW Campus Ministry, Zone G: services, messages, events and moments from the zone.",
};

// the page flows from the midnight hero down to a cream footer
export default function LandingPage() {
  return (
    <div className="bg-midnight">
      <Hero />
      <JoinUs />
      <ListenIn />
      <LiveEvent />
      <Gallery />
      <SiteFooter onWhite />
    </div>
  );
}
