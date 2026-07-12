import type { Metadata } from "next";
import { AppSettingsClient } from "@/components/app-settings-client";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";

export const metadata: Metadata = {
  title: "앱 설정 | Artroom",
};

export default function SettingsPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/menu" title="앱 설정" />
      <main className="px-6 pb-[96px] pt-5">
        <AppSettingsClient />
      </main>
      <BottomNav />
    </AppFrame>
  );
}
