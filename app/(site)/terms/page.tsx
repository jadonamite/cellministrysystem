import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="1 October 2026">
      <p>
        These terms cover anyone who signs in to Cell Ministry: cell leaders, leaders higher up
        the structure, and zone administrators.
      </p>

      <h2>Who can use it</h2>
      <p>
        Accounts are created by a zone administrator for leaders in that zone. Do not share your
        PIN or password. If you stop leading a cell, your administrator will close your access.
      </p>

      <h2>Looking after people&apos;s details</h2>
      <p>
        The names and phone numbers in the app belong to real people who trusted the ministry
        with them. Use them only to care for the people in your cell. Do not copy them into
        other lists, share them outside the ministry, or use them to sell anything.
      </p>

      <h2>Keeping records accurate</h2>
      <p>
        Add people under their own names and correct numbers, and archive anyone who has left.
        Promotions from new member to member are based on attendance counts, so records that
        are out of date will give wrong results.
      </p>

      <h2>Availability</h2>
      <p>
        We work to keep the app running, but it may be unavailable at times for maintenance.
        Keep anything you cannot afford to lose recorded somewhere else as well.
      </p>

      <h2>Changes</h2>
      <p>
        If these terms change, the date at the top of this page changes with them, and leaders
        will be told the next time they sign in.
      </p>
    </LegalPage>
  );
}
