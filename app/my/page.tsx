import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { MyPageClient } from "@/components/my-page-client";

export const metadata: Metadata = {
  title: "마이페이지 | Artroom",
};

export default function MyPage() {
  return (
    <AppFrame>
      <MobileHeader title="마이페이지" />
      <MyPageClient />
      <BottomNav />
    </AppFrame>
  );
}
