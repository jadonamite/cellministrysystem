import type { Metadata } from "next";
import { Hero } from "@/components/site/hero";
import { JoinUs } from "@/components/site/join-us";
import { Excerpts } from "@/components/site/excerpts";
import { ListenIn } from "@/components/site/listen-in";
import { LiveEvent } from "@/components/site/live-event";
import { Gallery } from "@/components/site/gallery";
import { SiteFooter } from "@/components/site/footer";
import { galleryNow } from "@/lib/gallery-source";

export const metadata: Metadata = {
  title: "BLWZONEG",
  description: "BLW Campus Ministry, Zone G: services, messages, events and moments from the zone.",
};

// re-rendered hourly, so the gallery picks up new uploads and its next rotation
export const revalidate = 3600;

// the photo hero, then light sections down to a cream footer
export default async function LandingPage() {
  const photos = await galleryNow();
  return (
    <div className="bg-cream">
      <Hero />
      <JoinUs />
      <Excerpts />
      <ListenIn />
      <LiveEvent />
      <Gallery photos={photos} />
      <SiteFooter onWhite />
    </div>
  );
}
