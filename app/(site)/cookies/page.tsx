import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Cookie policy" };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie policy" updated="1 October 2026">
      <p>
        Visiting this website sets no cookies. Cookies are set only when a leader or
        administrator signs in, and every one of them exists to make the app work for that
        person. There are no analytics, advertising or third-party cookies.
      </p>

      <h2>The cookies we set</h2>
      <div className="scroll-x"><table className="w-full min-w-[34rem] text-[0.9375rem]">
        <thead>
          <tr>
            <th>Name</th>
            <th>What it does</th>
            <th>Lasts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>cc_session</td>
            <td>Keeps you signed in</td>
            <td>12 hours</td>
          </tr>
          <tr>
            <td>caller_id, caller_name</td>
            <td>Remember which cell leader is signed in on this device</td>
            <td>1 year</td>
          </tr>
          <tr>
            <td>caller_senior_id, caller_senior_name</td>
            <td>Remember the senior cell that leader belongs to</td>
            <td>1 year</td>
          </tr>
          <tr>
            <td>admin_name</td>
            <td>The name an administrator chose to be greeted by</td>
            <td>1 year</td>
          </tr>
          <tr>
            <td>invite_template</td>
            <td>An administrator&apos;s saved invitation message</td>
            <td>1 year</td>
          </tr>
          <tr>
            <td>active_event</td>
            <td>Which event the dashboard is showing</td>
            <td>90 days</td>
          </tr>
        </tbody>
      </table></div>

      <h2>Stored in your browser</h2>
      <p>
        Your light or dark theme choice, and the fact that you have seen the cookie notice, are
        kept in your browser&apos;s local storage. They never leave your device.
      </p>

      <h2>Removing them</h2>
      <p>
        Signing out removes the session cookie. You can clear the rest at any time from your
        browser&apos;s settings.
      </p>
    </LegalPage>
  );
}
