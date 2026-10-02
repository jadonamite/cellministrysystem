import { Suspense } from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { SidebarProgress, SidebarProgressSkeleton } from "@/components/shell/sidebar-progress";
import { BottomNav } from "@/components/shell/bottom-nav";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const identity = session
    ? { role: session.role, name: session.role === "caller" ? session.name : undefined }
    : null;

  return (
    <>
      {session && (
        <>
          <Sidebar
            identity={identity}
            progress={
              <Suspense fallback={<SidebarProgressSkeleton />}>
                <SidebarProgress />
              </Suspense>
            }
          />
          <BottomNav />
        </>
      )}
      <div className={cn("relative flex-1", session && "pb-24 md:pb-0 md:pl-16 lg:pl-60")}>
        {children}
      </div>
    </>
  );
}
