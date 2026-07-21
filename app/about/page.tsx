import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";

export const metadata: Metadata = {
  title: "Artroom 소개 | Artroom",
  description: "Artroom이 작품, 작가, 팬을 연결하는 방식입니다.",
};

const principles = [
  "작품을 먼저 볼 수 있도록 화면의 흐름을 단순하게 유지합니다.",
  "작가의 판매, 커미션, 멤버십 도구를 한곳에서 이어지게 만듭니다.",
  "팬이 소장한 콘텐츠와 팔로우한 작가의 활동을 다시 찾기 쉽게 정리합니다.",
];

const aboutItems = [
  { label: "Focus", value: "작품 판매, 커미션, 멤버십" },
  { label: "Format", value: "모바일 중심 창작자 마켓" },
  { label: "Contact", value: "studio@artroom.example" },
];

export default function AboutPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/menu" title="Artroom 소개" />
      <main className="px-6 pb-24 pt-5">
        <p className="text-xs leading-5 text-muted">
          Artroom은 작가가 작품과 창작 활동을 안정적으로 공개하고, 팬이 좋아하는
          콘텐츠를 소장하며 다시 찾아볼 수 있는 모바일 중심 공간입니다.
        </p>

        <ScreenSection title="운영 원칙">
          <div className="grid gap-3">
            {principles.map((principle, index) => (
              <UiCard key={principle}>
                <p className="text-2xs font-semibold text-primary">
                  0{index + 1}
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                  {principle}
                </p>
              </UiCard>
            ))}
          </div>
        </ScreenSection>

        <ScreenSection title="기본 정보">
          <div className="grid gap-3">
            {aboutItems.map((item) => (
              <div
                className="flex items-center justify-between gap-4 border-b border-line py-3"
                key={item.label}
              >
                <p className="text-xs font-semibold text-muted">{item.label}</p>
                <p className="text-right text-sm font-semibold text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </ScreenSection>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
