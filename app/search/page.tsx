import type { Metadata } from "next";
import { Suspense } from "react";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { FigmaInput, FigmaTag } from "@/components/figma-controls";
import { MobileHeader } from "@/components/mobile-header";
import { SearchClient } from "@/components/search-client";
import { UiCard } from "@/components/ui-card";

export const metadata: Metadata = {
  title: "검색 | Artroom",
};

function SearchFallback() {
  return (
    <main className="px-6 pb-[96px] pt-5">
      <FigmaInput
        className="w-full"
        disabled
        kind="search"
        placeholder="유저, 작품, 피드 검색"
      />
      <div className="mt-4 flex gap-[6px]">
        <FigmaTag active>전체</FigmaTag>
        <FigmaTag>#판타지</FigmaTag>
        <FigmaTag>#커미션</FigmaTag>
      </div>
      <h2 className="mt-7 text-base font-semibold">추천 결과</h2>
      <div className="mt-4 grid gap-4">
        {[0, 1, 2].map((item) => (
          <UiCard key={item}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[#e5e7eb]" />
              <div className="flex-1">
                <div className="h-3 w-28 rounded-full bg-[#e5e7eb]" />
                <div className="mt-3 h-3 w-40 rounded-full bg-[#eef0f3]" />
              </div>
            </div>
          </UiCard>
        ))}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="검색" />
      <Suspense fallback={<SearchFallback />}>
        <SearchClient />
      </Suspense>
      <BottomNav />
    </AppFrame>
  );
}
