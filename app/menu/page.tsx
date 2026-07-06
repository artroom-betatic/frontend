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
      <MobileHeader title="전체메뉴" />
      <main className="px-6 pb-[96px] pt-5">
        <p className="text-xs leading-5 text-[#929aa8]">
          작가 후원, 작품 구매, 커미션 의뢰, 정산 관리가 한 곳에서 이어지는
          창작자 플랫폼입니다.
        </p>
        <MenuClient />
      </main>
      <BottomNav />
    </AppFrame>
  );
}
