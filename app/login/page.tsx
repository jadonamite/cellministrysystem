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
    // Fixed overlay so the login wall covers the app shell (sidebar / nav) the
    // root layout renders around every route. The background is painted here
    // rather than left opaque, with its own irradiance above it — an opaque
    // sheet would hide the ambient layer the rest of the app sits in.
    <div className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center px-6">
      <div className="irradiance" aria-hidden />
      <div className="relative z-10 flex w-full flex-col items-center gap-7">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-[0.16em] uppercase">
            Cell Ministry
          </h1>
          <p className="script text-primary mt-1 text-3xl">you are on a course</p>
        </div>
        <LoginForm roster={roster.map(({ id, name }) => ({ id, name }))} />
      </div>
    </div>
  );
}
