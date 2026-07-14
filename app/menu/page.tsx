import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MenuClient } from "@/components/menu-client";
import { MobileHeader } from "@/components/mobile-header";

export const metadata: Metadata = {
  title: "전체메뉴 | Artroom",
};

export default function MenuPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="전체메뉴" />
      <main className="px-6 pb-24 pt-5">
        <p className="text-xs leading-5 text-muted">
          커미션, 정산, 수익, 앱 설정처럼 관리가 필요한 기능을 모아둡니다.
        </p>
        <MenuClient />
      </main>
      <BottomNav />
    </AppFrame>
  );
}
