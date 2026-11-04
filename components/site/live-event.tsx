import Image from "next/image";
import { INSTAGRAM_URL, LIVE_EVENT } from "@/lib/site-content";
import { FlyerButton } from "./flyer-button";

/** The next event: its flyer beside the details. */
export function LiveEvent() {
  const e = LIVE_EVENT;
  return (
    <section id="live-event" className="scroll-mt-4 bg-cream px-4 pb-24 text-ink sm:px-10 sm:pb-32">
      <div className="mx-auto max-w-5xl">
        <h2 className="display text-[clamp(2.5rem,7vw,5.5rem)]">
          Live <span className="serif-highlight text-ink">event</span>
        </h2>

        <div className="card-3d card-3d-hover mt-12 grid overflow-hidden rounded-[32px] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <FlyerButton photo={e.flyer} alt={e.flyerAlt} title={e.name} className="block w-full rounded-none hover:scale-100 active:scale-100">
            <span className="relative block aspect-[566/640] w-full md:h-full">
              <Image src={e.flyer} alt={e.flyerAlt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </span>
          </FlyerButton>

          <div className="flex flex-col justify-center gap-6 p-6 sm:p-10">
            <span className="inline-flex self-start rounded-full bg-ink px-4 py-1.5 text-[0.875rem] font-semibold text-white">
              Coming up
            </span>
            <div>
              <p className="display text-[clamp(3.5rem,9vw,6.5rem)]">{e.name}</p>
              <p className="serif-highlight mt-2 text-[clamp(1.375rem,2.6vw,1.875rem)] text-ink/80">{e.expansion}</p>
            </div>
            <dl className="grid gap-4 text-[1rem]">
              <div>
                <dt className="text-[0.8125rem] font-semibold text-ink/65">Hosted by</dt>
                <dd className="mt-1">{e.host}</dd>
              </div>
              <div>
                <dt className="text-[0.8125rem] font-semibold text-ink/65">Ministering</dt>
                <dd className="mt-1">
                  {e.speaker}
                  <span className="ml-2 rounded-full bg-ink/10 px-2.5 py-0.5 text-[0.8125rem] font-semibold text-ink">
                    {e.speakerNote}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[0.8125rem] font-semibold text-ink/65">When</dt>
                <dd className="mt-1">{e.date}</dd>
              </div>
            </dl>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center self-start rounded-full bg-ink px-6 text-[0.9375rem] font-semibold text-white transition-opacity duration-150 hover:bg-black"
            >
              Follow for updates
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
