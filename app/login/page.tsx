import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getSession } from "@/lib/auth";
import { callerRoster } from "@/lib/callers";

export const metadata = { title: "Sign in · Outreach Call Center" };

export default async function LoginPage() {
  // Already signed in? Skip the wall.
  const session = await getSession();
  if (session?.role === "admin") redirect("/");
  if (session?.role === "caller") redirect("/contacts");

  const roster = await callerRoster();

  return (
    // Fixed overlay so the login wall fully covers the app shell (sidebar / nav)
    // that the root layout renders around every route.
    <div className="bg-background fixed inset-0 z-50 flex items-center justify-center px-6">
      <LoginForm roster={roster.map(({ id, name }) => ({ id, name }))} />
    </div>
  );
}
