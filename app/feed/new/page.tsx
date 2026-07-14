import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { FeedCreateClient } from "@/components/feed-create-client";
import { MobileHeader } from "@/components/mobile-header";

export const metadata: Metadata = {
  title: "새 피드 | Artroom",
};

export default function FeedCreatePage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="새 피드" />
      <FeedCreateClient />
      <BottomNav />
    </AppFrame>
  );
}
