import type { Metadata } from "next";
import { Suspense } from "react";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { ReportClient } from "@/components/report-client";
import { UiCard } from "@/components/ui-card";

export const metadata: Metadata = {
  title: "신고 | Artroom",
};

function ReportFallback() {
  return (
    <main className="px-6 pb-24 pt-5">
      <UiCard className="bg-white">
        <p className="text-sm font-semibold text-foreground">
          신고 화면을 준비하고 있습니다
        </p>
      </UiCard>
    </main>
  );
}

export default function ReportPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="신고" />
      <Suspense fallback={<ReportFallback />}>
        <ReportClient />
      </Suspense>
      <BottomNav />
    </AppFrame>
  );
}
