import type { Metadata } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/shell/sidebar";
import { SidebarProgress, SidebarProgressSkeleton } from "@/components/shell/sidebar-progress";
import { BottomNav } from "@/components/shell/bottom-nav";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Cell Ministry System",
  description: "Monitoring and tracking growth across the cell hierarchy",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const identity = session
    ? { role: session.role, name: session.role === "caller" ? session.name : undefined }
    : null;

  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* ambient light — data never sits on this */}
        <div className="irradiance" aria-hidden />
        <div className="irradiance-veil" aria-hidden />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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
          <div className={cn("relative z-10 flex-1", session && "pb-24 md:pb-0 md:pl-16 lg:pl-60")}>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
