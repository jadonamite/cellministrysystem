import Link from "next/link";
import { Wordmark } from "./cell-mark";
import { SiteFooter } from "./footer";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
    <div className="px-4 pt-[max(16px,env(safe-area-inset-top))] sm:px-10 sm:pt-8">
      <Link href="/" aria-label="BLWZONEG home" className="inline-flex min-h-11 items-center">
        <Wordmark />
      </Link>
      <article className="mx-auto max-w-[68ch] py-16 sm:py-24">
        <h1 className="display text-[clamp(2.5rem,7vw,4.5rem)]">{title}</h1>
        <p className="mt-4 text-[0.9375rem] text-label-2">Last updated {updated}</p>
        <p className="mt-6 rounded-2xl bg-gold-soft px-4 py-3 text-[0.9375rem] leading-[1.45] text-foreground">
          This page has not yet been reviewed by a lawyer. It describes what the system actually
          does today.
        </p>
        <div className="mt-10 space-y-5 text-[1.0625rem] leading-[1.6] text-label-2 [&_h2]:mt-12 [&_h2]:text-[1.1875rem] [&_h2]:font-semibold [&_h2]:leading-[1.13] [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-foreground [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_ul]:space-y-2">
          {children}
        </div>
      </article>
    </div>
    <SiteFooter />
    </>
  );
}
