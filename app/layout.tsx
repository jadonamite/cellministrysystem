import type { Metadata } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/shell/sidebar";
import { SidebarProgress, SidebarProgressSkeleton } from "@/components/shell/sidebar-progress";
import { BottomNav } from "@/components/shell/bottom-nav";
import { getSession } from "@/lib/auth";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Outreach Call Center",
  description: "Follow-up and data collation dashboard",
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
      className={`${bricolage.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Sidebar
            identity={identity}
            progress={
              <Suspense fallback={<SidebarProgressSkeleton />}>
                <SidebarProgress />
              </Suspense>
            }
          />
          <div className="flex-1 pb-24 md:pb-0 md:pl-16 lg:pl-60">{children}</div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
