import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { CreatorDashboardClient } from "@/components/creator-dashboard-client";
import { MobileHeader } from "@/components/mobile-header";

export const metadata: Metadata = {
  title: "수익 대시보드 | Artroom",
};

export default function CreatorDashboardPage() {
  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref="/menu"
        title="수익 대시보드"
      />
      <CreatorDashboardClient />
    </AppFrame>
  );
}
