import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { MyPageClient } from "@/components/my-page-client";
import { getArtistResource } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "마이페이지 | Artroom",
};

const currentUsername = "user_123";

export default async function MyPage() {
  const resource = await getArtistResource(currentUsername);

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="마이페이지" />
      <MyPageClient profile={resource?.profile ?? null} />
      <BottomNav />
    </AppFrame>
  );
}
