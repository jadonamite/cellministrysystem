import { ConsentBanner } from "@/components/site/consent-banner";
import { MotionRoot } from "@/components/site/motion-root";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionRoot>
      <main className="flex-1">{children}</main>
      <ConsentBanner />
    </MotionRoot>
  );
}
