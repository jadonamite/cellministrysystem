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
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12">
      <div className="relative z-10 flex w-full flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-[0.16em] uppercase text-foreground">
            Cell Ministry
          </h1>
          <p className="font-serif italic text-primary mt-1 text-3xl sm:text-4xl">
            you are on a course
          </p>
        </div>
        <LoginForm roster={roster.map(({ id, name }) => ({ id, name }))} />
      </div>
    </div>
  );
}
