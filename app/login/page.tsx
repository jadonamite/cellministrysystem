import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getSession } from "@/lib/auth";
import { callerRoster } from "@/lib/callers";

export const metadata = { title: "Sign in · Cell Ministry System" };

export default async function LoginPage() {
  // Already signed in? Skip the wall.
  const session = await getSession();
  if (session?.role === "admin") redirect("/");
  if (session?.role === "caller") redirect("/contacts");

  const roster = await callerRoster();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* Soft discrete ambient bloom behind the card */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex w-full flex-col items-center gap-9">
        <div className="text-center space-y-1">
          <h1 className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-400">
            Cell Ministry
          </h1>
          <p className="font-serif italic text-purple-300 text-4xl sm:text-5xl tracking-tight">
            you are on a course
          </p>
        </div>
        <LoginForm roster={roster.map(({ id, name }) => ({ id, name }))} />
      </div>
    </div>
  );
}
