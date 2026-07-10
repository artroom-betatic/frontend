import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import {
  SettingsListItem,
  type SettingsListItemIconName,
} from "@/components/settings-list-item";
import { UiCard } from "@/components/ui-card";

export const metadata: Metadata = {
  title: "앱 설정 | Artroom",
};

const settingLinks = [
  {
    description: "팔로우, 구매, 멤버십, 커미션 알림을 조정합니다.",
    href: "/notifications",
    icon: "bell",
    title: "알림 설정",
  },
  {
    description: "수수료, 환불, 콘텐츠 운영 기준을 확인합니다.",
    href: "/policies",
    icon: "policy",
    title: "정책 보기",
  },
] satisfies {
  description: string;
  href: string;
  icon: SettingsListItemIconName;
  title: string;
}[];

const appSettings = [
  { label: "화면 모드", value: "시스템 설정" },
  { label: "언어", value: "한국어" },
  { label: "콘텐츠 표시", value: "기본" },
];

export default function SettingsPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/menu" title="앱 설정" />
      <main className="px-6 pb-[96px] pt-5">
        <p className="text-sm font-medium leading-6 text-subtle">
          Artroom 사용 환경과 알림, 정책 확인 경로를 관리합니다.
        </p>

        <ScreenSection title="앱 환경">
          <div className="grid gap-2">
            {appSettings.map((item) => (
              <UiCard className="bg-white" key={item.label}>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-subtle">
                    {item.label}
                  </p>
                  <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              </UiCard>
            ))}
          </div>
        </ScreenSection>

        <ScreenSection title="설정 바로가기">
          <div className="grid gap-2">
            {settingLinks.map((item) => (
              <SettingsListItem
                description={item.description}
                href={item.href}
                icon={item.icon}
                key={item.href}
                title={item.title}
              />
            ))}
          </div>
        </ScreenSection>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
