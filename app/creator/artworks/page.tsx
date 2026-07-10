import type { Metadata } from "next";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { ContentListCard } from "@/components/content-list-card";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";

export const metadata: Metadata = {
  title: "내 작품 | Artroom",
};

const myArtworkSummary = [
  { label: "공개", value: "2" },
  { label: "초안", value: "1" },
  { label: "시리즈", value: "1" },
];

const myArtworks = [
  {
    description: "캐릭터 시트와 세계관 메모를 묶은 디지털 작품입니다.",
    imageAlt: "달빛 기사 연대기 설정 노트 대표 이미지",
    imageSrc: "/figma/post-hamster-red.png",
    status: "공개",
    title: "달빛 기사 연대기 설정 노트",
  },
  {
    description: "멤버십 선공개 후 판매 전환을 준비 중입니다.",
    imageAlt: "은색 문장 러프 모음 대표 이미지",
    imageSrc: "/figma/post-hamster-mono.png",
    status: "초안",
    title: "은색 문장 러프 모음",
  },
];

export default function CreatorArtworksPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/my" title="내 작품" />
      <main className="px-6 pb-[96px] pt-5">
        <p className="text-sm font-medium leading-6 text-subtle">
          내가 등록했거나 판매 준비 중인 작품을 확인합니다.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {myArtworkSummary.map((item) => (
            <UiCard className="bg-white p-3 text-center" key={item.label}>
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="mt-1 text-[10px] text-muted">{item.label}</p>
            </UiCard>
          ))}
        </div>

        <ScreenSection title="작품 목록">
          <div className="grid gap-3">
            {myArtworks.map((artwork) => (
              <ContentListCard
                badge={artwork.status}
                description={artwork.description}
                imageAlt={artwork.imageAlt}
                imageSrc={artwork.imageSrc}
                key={artwork.title}
                title={artwork.title}
              />
            ))}
          </div>
        </ScreenSection>

        <Link
          className="mt-6 flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white"
          href="/creator/artworks/new"
        >
          새 작품 등록하기
        </Link>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
