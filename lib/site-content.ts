import type { StaticImageData } from "next/image";
import seeYouNext from "@/public/images/zoneg/flyers/see-you-next-service.jpg";
import finisher from "@/public/images/zoneg/flyers/the-finisher.jpg";
import wednesday from "@/public/images/zoneg/flyers/wednesday-service.jpg";
import growthPattern from "@/public/images/zoneg/flyers/growth-pattern.jpg";
import luxuriantGrowth from "@/public/images/zoneg/flyers/luxuriant-growth.jpg";
import nuggets from "@/public/images/zoneg/sunday-nuggets.jpg";
import lift from "@/public/images/zoneg/lift-confirmed.jpg";
import laughingPair from "@/public/images/zoneg/live/laughing-pair.jpg";
import agbadaSmile from "@/public/images/zoneg/live/agbada-smile.jpg";
import singerPink from "@/public/images/zoneg/live/singer-pink.jpg";
import bassist from "@/public/images/zoneg/live/bassist.jpg";
import prayerGlasses from "@/public/images/zoneg/live/prayer-glasses.jpg";
import gelePortrait from "@/public/images/zoneg/live/gele-portrait.jpg";
import worshipEyesClosed from "@/public/images/zoneg/live/worship-eyes-closed.jpg";
import stagePortrait from "@/public/images/zoneg/live/stage-portrait.jpg";
import redShirtWorship from "@/public/images/zoneg/live/red-shirt-worship.jpg";
import worshipHands from "@/public/images/zoneg/live/worship-hands.jpg";
import armsWide from "@/public/images/zoneg/live/arms-wide.jpg";
import worshipLean from "@/public/images/zoneg/live/worship-lean.jpg";
import worshipWhite from "@/public/images/zoneg/live/worship-white.jpg";
import pairPortrait from "@/public/images/zoneg/live/pair-portrait.jpg";
import project6000Worship from "@/public/images/zoneg/live/project6000-worship.jpg";
import dinnerTable from "@/public/images/zoneg/live/dinner-table.jpg";

/*
 * Everything the landing page says about services, audio and events.
 * `placeholder: true` marks a detail not yet confirmed by the ministry.
 * Service times come from the zone's "See you next service" flyer. The gallery's
 * live photos come from lib/gallery-source.ts; GALLERY_FALLBACK is used until then.
 */

export const INSTAGRAM_URL = "https://www.instagram.com/globalzoneg/";

/** A flyer in the "Come worship with us" row, shown whole, never cropped. */
export type WorshipFlyer = {
  flyer: StaticImageData;
  alt: string;
  title: string;
  /** when it happens, as the flyer states it */
  when: string;
};

export const WORSHIP: WorshipFlyer[] = [
  {
    flyer: seeYouNext,
    alt: "See you next service: first Sunday service 7:45 AM, every Sunday 9:45 AM, Wednesday service 6:00 PM, at BLW Auditorium",
    title: "Every Sunday and Wednesday",
    when: "First Sunday 7:45 AM · Sundays 9:45 AM · Wednesdays 6:00 PM",
  },
  {
    flyer: finisher,
    alt: "The Finisher: join us this Sunday with Pastor John Ajimuda, 9:45 AM, BLW Auditorium",
    title: "Sunday Service",
    when: "Sundays, 9:45 AM",
  },
  {
    flyer: wednesday,
    alt: "Join us for our Wednesday Service: The Pattern of Financial Prosperity, 6 PM",
    title: "Wednesday Service",
    when: "Wednesdays, 6:00 PM",
  },
  {
    flyer: growthPattern,
    alt: "The Luxuriant Growth Pattern, a special message series with Pastor John Ajimuda. Sunday service 9:45 AM, mid-week service 6:00 PM",
    title: "The Luxuriant Growth Pattern",
    when: "September message series",
  },
  {
    flyer: luxuriantGrowth,
    alt: "30 Days of Luxuriant Growth with Pastor Dawn: prayer, prophecy and the Word, 21 September to 20 October 2026, 7:00 AM daily",
    title: "30 Days of Luxuriant Growth",
    when: "21 Sep to 20 Oct, 7:00 AM daily",
  },
];

/** Friday cell meetings have no flyer yet; shown as a line under the row. */
export const CELL_MEETINGS = { when: "Fridays", placeholder: true };

export const VENUE = {
  name: "BLW Auditorium",
  address: "Plot 13, beside IBK Filling Station, FUTA Southgate, Akure",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=BLW+Auditorium+FUTA+Southgate+Akure",
};

/** Designed slides from a service: the recap and excerpt carousels the media team posts. */
export type ExcerptSet = {
  title: string;
  note: string;
  /** public paths, in carousel order */
  slides: string[];
};

const slides = (dir: string, n: number) =>
  Array.from({ length: n }, (_, i) => `/images/zoneg/excerpts/${dir}/${String(i + 1).padStart(2, "0")}.jpg`);

export const EXCERPTS: ExcerptSet[] = [
  { title: "Thanksgiving Service", note: "FYB Thanksgiving Sunday recap", slides: slides("thanksgiving", 20) },
  { title: "Get Acquainted", note: "Meet CEPC Akure: the recap", slides: slides("get-acquainted", 17) },
];

export const LISTEN = {
  title: "Sunday Nuggets",
  speaker: "Pastor John Ajimuda",
  artwork: nuggets as StaticImageData,
  artworkAlt: "Sunday Nuggets artwork",
  /** set to an mp3 or stream URL to make the player live */
  src: null as string | null,
  placeholder: true,
};

export const LIVE_EVENT = {
  name: "LIFT",
  expansion: "Launch, Ignite, Forward, Takeover",
  host: "BLW Campus Ministry, Nigeria Region",
  speaker: "Pastor Doyin Dennis Oshideko",
  speakerNote: "Confirmed",
  date: "Date to be announced",
  flyer: lift as StaticImageData,
  flyerAlt: "LIFT flyer: Pastor Doyin Dennis Oshideko confirmed",
  placeholder: true,
};

/** Bundled candid photos: the gallery's fallback until the Drive source is configured. */
export type GalleryItem = {
  src: StaticImageData;
  alt: string;
  /** the event, from the photographer's folder name */
  event: string;
};

export const GALLERY_FALLBACK: GalleryItem[] = [
  { src: worshipEyesClosed, alt: "A young woman worshipping with her eyes closed", event: "Sunday service, 27 September" },
  { src: singerPink, alt: "A singer in a pink dress leading worship", event: "Get Acquainted" },
  { src: prayerGlasses, alt: "A woman in glasses praying with her hands together", event: "Sunday service, 16 August" },
  { src: agbadaSmile, alt: "A young man in a pale blue agbada smiling", event: "FYB Thanksgiving Sunday" },
  { src: worshipHands, alt: "A young man in glasses worshipping with both hands raised", event: "Sunday service, 16 August" },
  { src: armsWide, alt: "A young man worshipping with his arms spread wide", event: "FYB Thanksgiving Sunday" },
  { src: worshipLean, alt: "A young man in a teal shirt leaning forward in prayer", event: "Sunday service, 27 September" },
  { src: worshipWhite, alt: "A young man in a white jacket worshipping under purple light", event: "Sunday service, 16 August" },
  { src: pairPortrait, alt: "A young woman in white and a young man in navy smiling together", event: "Sunday service, 20 September" },
  { src: redShirtWorship, alt: "A young man in a red shirt worshipping with one arm raised", event: "FYB Thanksgiving Sunday" },
  { src: stagePortrait, alt: "A young woman in a white top posing on the blue stage", event: "Get Acquainted" },
  { src: project6000Worship, alt: "A worshipper in a Project 6000 shirt with her eyes closed", event: "Sunday service, 16 August" },
  { src: bassist, alt: "The bass player during worship", event: "FYB Thanksgiving Sunday" },
  { src: laughingPair, alt: "Two young men in caps smiling at the dinner", event: "Get Acquainted" },
  { src: gelePortrait, alt: "A young woman in a white gele and lace outfit", event: "FYB Thanksgiving Sunday" },
  { src: dinnerTable, alt: "A table set with folded napkins and crystal glasses for the dinner", event: "Get Acquainted" },
];
