import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="1 October 2026">
      <p>
        Cell Ministry is a tool that cell leaders and ministry administrators use to look after
        the people in their cells. This page explains what it records about those people and
        who can see it.
      </p>

      <h2>What we record</h2>
      <p>For each person in a cell, a leader records:</p>
      <ul>
        <li>their name and phone number</li>
        <li>the cell they belong to</li>
        <li>whether they are an invitee, a new member or a member</li>
        <li>any role they hold in the cell, such as cell secretary</li>
        <li>who brought them, and the dates they joined and changed stage</li>
      </ul>
      <p>
        We also read how many services a person has attended, matched by phone number, from the
        church&apos;s attendance register. We use that count only to show when someone is ready
        to become a member.
      </p>

      <h2>Who can see it</h2>
      <p>
        A cell leader sees the people in their own cell. A leader higher up the structure, for
        example of a senior cell or a team, sees the cells beneath them. Administrators of a zone
        see everything in that zone. One zone cannot see another zone&apos;s records.
      </p>

      <h2>What we do not do</h2>
      <p>
        We do not sell or share anyone&apos;s details, show adverts, or track visitors to this
        website. Phone numbers are used by leaders to stay in touch with their own people and
        for nothing else.
      </p>

      <h2>Keeping and removing records</h2>
      <p>
        When someone leaves a cell, their record is archived rather than shown to leaders. To
        have your record corrected or deleted, ask your cell leader or your zone administrator,
        who can do it directly.
      </p>
    </LegalPage>
  );
}
