import type { StaticImageData } from "next/image";
import sundayFlyer from "@/public/images/zoneg/sunday-the-finisher.jpg";
import midweekFlyer from "@/public/images/zoneg/sermon-excerpts.jpg";
import firstSundayFlyer from "@/public/images/zoneg/service-recap.jpg";
import cellFlyer from "@/public/images/zoneg/serve-recap.jpg";
import nuggets from "@/public/images/zoneg/sunday-nuggets.jpg";
import lift from "@/public/images/zoneg/lift-confirmed.jpg";
import sundayPreacher from "@/public/images/zoneg/live/sunday-preacher.jpg";
import firstSundayPrayer from "@/public/images/zoneg/live/first-sunday-prayer.jpg";
import wednesdayWord from "@/public/images/zoneg/live/wednesday-word.jpg";
import cellTable from "@/public/images/zoneg/live/cell-table.jpg";
import auditorium from "@/public/images/zoneg/live/auditorium.jpg";
import worshipHands from "@/public/images/zoneg/live/worship-hands.jpg";
import liftDayTwo from "@/public/images/zoneg/live/lift-day-two.jpg";
import liftFriends from "@/public/images/zoneg/live/lift-friends.jpg";
import thanksgivingCrowd from "@/public/images/zoneg/live/thanksgiving-crowd.jpg";
import laughingPair from "@/public/images/zoneg/live/laughing-pair.jpg";
import agbadaSmile from "@/public/images/zoneg/live/agbada-smile.jpg";
import singerPink from "@/public/images/zoneg/live/singer-pink.jpg";
import bassist from "@/public/images/zoneg/live/bassist.jpg";
import prayerGlasses from "@/public/images/zoneg/live/prayer-glasses.jpg";
import gelePortrait from "@/public/images/zoneg/live/gele-portrait.jpg";
import worshipEyesClosed from "@/public/images/zoneg/live/worship-eyes-closed.jpg";
import stagePortrait from "@/public/images/zoneg/live/stage-portrait.jpg";
import redShirtWorship from "@/public/images/zoneg/live/red-shirt-worship.jpg";
import akureFamily from "@/public/images/zoneg/live/akure-family.jpg";
import project6000Worship from "@/public/images/zoneg/live/project6000-worship.jpg";
import dinnerTable from "@/public/images/zoneg/live/dinner-table.jpg";

/*
 * Everything the landing page says about services, audio and events.
 * `placeholder: true` marks a detail not yet confirmed by the ministry.
 * Service times come from the zone's "See you next service" flyer.
 */

export const INSTAGRAM_URL = "https://www.instagram.com/globalzoneg/";

export type Service = {
  /** first word is highlighted, the rest set plain */
  title: [string, string];
  when: string;
  /** a photo from a real service, shown full-bleed on the panel */
  photo: StaticImageData;
  photoAlt: string;
  flyer: StaticImageData;
  flyerAlt: string;
  placeholder?: boolean;
};

export const SERVICES: Service[] = [
  {
    title: ["Sunday", "Service"],
    when: "Sundays, 9:45 AM",
    photo: sundayPreacher,
    photoAlt: "A minister in a dark suit preaching at the glass pulpit under blue stage light",
    flyer: sundayFlyer,
    flyerAlt: "Flyer for The Finisher, a Sunday service with Pastor John Ajimuda",
  },
  {
    title: ["First", "Sunday"],
    when: "First Sunday of the month, 7:45 AM",
    photo: firstSundayPrayer,
    photoAlt: "A minister in blue aso-oke praying with his eyes closed at the pulpit",
    flyer: firstSundayFlyer,
    flyerAlt: "Service recap flyer showing the pastor preaching",
  },
  {
    title: ["Mid-week", "Service"],
    when: "Wednesdays, 6:00 PM",
    photo: wednesdayWord,
    photoAlt: "A minister in a purple suit teaching on the stage, a Bible in his hand",
    flyer: midweekFlyer,
    flyerAlt: "Sermon excerpts flyer from The Finisher",
  },
  {
    title: ["Cell", "Meetings"],
    when: "Fridays",
    photo: cellTable,
    photoAlt: "Young people talking around a dinner table",
    flyer: cellFlyer,
    flyerAlt: "Serve recap flyer: talk show, prayer, worship and the Word",
    placeholder: true,
  },
];

export const VENUE = {
  name: "BLW Auditorium",
  address: "Plot 13, beside IBK Filling Station, FUTA Southgate, Akure",
  photo: auditorium as StaticImageData,
  photoAlt: "The BLW Auditorium during a service, seen from the back rows towards the lit stage",
};

export const LISTEN = {
  title: "Sunday Nuggets",
  speaker: "Pastor John Ajimuda",
  artwork: nuggets as StaticImageData,
  artworkAlt: "Sunday Nuggets artwork",
  backdrop: worshipHands as StaticImageData,
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
  /** photos from day two of the last LIFT, drifting behind the flyer */
  photos: [
    { src: liftDayTwo as StaticImageData, alt: "Four friends in office wear outside a glass-fronted building at LIFT day two" },
    { src: liftFriends as StaticImageData, alt: "Three young men in suits and a young woman in a white blouse at LIFT day two" },
  ],
  placeholder: true,
};

export type GalleryItem = {
  src: StaticImageData;
  alt: string;
  /** the event, from the photographer's folder name */
  event: string;
};

export const GALLERY: GalleryItem[] = [
  { src: worshipEyesClosed, alt: "A young woman worshipping with her eyes closed", event: "Sunday service, 27 September" },
  { src: thanksgivingCrowd, alt: "A crowd in aso-oke cheering in front of the Welcome banner", event: "FYB Thanksgiving Sunday" },
  { src: singerPink, alt: "A singer in a pink dress leading worship", event: "Get Acquainted" },
  { src: prayerGlasses, alt: "A woman in glasses praying with her hands together", event: "Sunday service, 16 August" },
  { src: agbadaSmile, alt: "A young man in a pale blue agbada smiling", event: "FYB Thanksgiving Sunday" },
  { src: akureFamily, alt: "The CEPC Akure family with hands raised", event: "Get Acquainted, CEPC Akure" },
  { src: redShirtWorship, alt: "A young man in a red shirt worshipping with one arm raised", event: "FYB Thanksgiving Sunday" },
  { src: stagePortrait, alt: "A young woman in a white top posing on the blue stage", event: "Get Acquainted" },
  { src: project6000Worship, alt: "A worshipper in a Project 6000 shirt with her eyes closed", event: "Sunday service, 16 August" },
  { src: bassist, alt: "The bass player during worship", event: "FYB Thanksgiving Sunday" },
  { src: laughingPair, alt: "Two young men in caps smiling at the dinner", event: "Get Acquainted" },
  { src: gelePortrait, alt: "A young woman in a white gele and lace outfit", event: "FYB Thanksgiving Sunday" },
  { src: dinnerTable, alt: "A table set with folded napkins and crystal glasses for the dinner", event: "Get Acquainted" },
];
