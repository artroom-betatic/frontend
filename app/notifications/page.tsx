import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { MobileHeader } from "@/components/mobile-header";
import { NotificationSettingsClient } from "@/components/notification-settings-client";
import { notificationGroups } from "@/lib/artroom-data";

export const metadata: Metadata = {
  title: "알림 설정 | Artroom",
};

export default function NotificationsPage() {
  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref="/menu"
        title="알림 설정"
      />
      <main className="px-6 pb-8 pt-[14px]">
        <NotificationSettingsClient groups={notificationGroups} />
      </main>
    </AppFrame>
  );
}
