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
      <main className="px-6 pb-[96px] pt-5">
        <p className="text-xs leading-5 text-[#929aa8]">
          감상, 구매, 후원, 커미션, 정산까지 Artroom의 주요 흐름을 한 곳에서
          시작합니다.
        </p>
        <MenuClient />
      </main>
      <BottomNav />
    </AppFrame>
  );
}
