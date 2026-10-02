import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getSession } from "@/lib/auth";
import { callerRoster } from "@/lib/callers";

export const metadata = { title: "Sign in · Cell Ministry System" };

export default async function LoginPage() {
  // Already signed in? Skip the wall.
  const session = await getSession();
  if (session?.role === "admin") redirect("/dashboard");
  if (session?.role === "caller") redirect("/contacts");

  const roster = await callerRoster();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* Multi-chroma ambient frosted glow orbs that bleed through the glass */}
      <div
        className="pointer-events-none absolute -top-16 left-1/4 h-[420px] w-[420px] rounded-full bg-purple-600/20 blur-[110px] dark:bg-purple-600/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 h-[380px] w-[380px] rounded-full bg-indigo-500/18 blur-[120px] dark:bg-indigo-500/12"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/3 h-[360px] w-[360px] rounded-full bg-fuchsia-500/15 blur-[100px] dark:bg-fuchsia-500/10"
        aria-hidden
      />

      <div className="relative z-10 flex w-full flex-col items-center gap-9">
        <div className="text-center space-y-1">
          <h1 className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
            Cell Ministry
          </h1>
          <p className="font-serif italic text-purple-600 dark:text-purple-300 text-4xl sm:text-5xl tracking-tight">
            you are on a course
          </p>
        </div>
        <LoginForm roster={roster.map(({ id, name }) => ({ id, name }))} />
      </div>
    </div>
  );
}
