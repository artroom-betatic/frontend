"use client";

import { useSyncExternalStore } from "react";
import { ScreenSection } from "@/components/screen-section";
import {
  SettingsListItem,
  type SettingsListItemIconName,
} from "@/components/settings-list-item";
import { UiCard } from "@/components/ui-card";
import {
  defaultPayoutSettings,
  getPayoutStatusLabel,
  isPayoutSettingsReady,
  readPayoutSettings,
  subscribePayoutSettingsChange,
} from "@/lib/payout-settings";

const revenueChannels = [
  {
    description: "디지털 작품과 Ebook 판매",
    label: "작품 판매",
    value: "₩132,000",
  },
  {
    description: "구독 멤버십 후원",
    label: "멤버십",
    value: "₩76,000",
  },
  {
    description: "완료된 커미션 정산",
    label: "커미션",
    value: "₩40,000",
  },
];

const dashboardLinks = [
  {
    href: "/creator/payout",
    icon: "payout",
    title: "정산 설정",
  },
  {
    description: "수수료, 환불, 콘텐츠 정책을 확인합니다.",
    href: "/policies",
    icon: "policy",
    title: "정산/정책 보기",
  },
] satisfies {
  description?: string;
  href: string;
  icon: SettingsListItemIconName;
  title: string;
}[];

export function CreatorDashboardClient() {
  const payoutSettings = useSyncExternalStore(
    subscribePayoutSettingsChange,
    readPayoutSettings,
    () => defaultPayoutSettings,
  );
  const payoutReady = isPayoutSettingsReady(payoutSettings);
  const revenueSummary = [
    { label: "이번 달 수익", value: "₩248,000", note: "+18%" },
    { label: "판매 건수", value: "32", note: "작품 18건" },
    {
      label: "정산 예정",
      note: payoutReady ? "25일" : "설정 필요",
      value: payoutReady ? "₩211,000" : "대기 중",
    },
  ];

  return (
    <main className="px-6 pb-8 pt-5">
      <p className="text-sm font-medium leading-6 text-subtle">
        작품 판매, 멤버십, 커미션 수익을 한눈에 확인하고 정산 준비 상태를
        점검합니다.
      </p>

      <div className="mt-5 grid gap-3">
        {revenueSummary.map((item) => (
          <UiCard className="bg-white" key={item.label}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {item.value}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-panel px-3 py-2 text-xs font-semibold text-primary">
                {item.note}
              </span>
            </div>
          </UiCard>
        ))}
      </div>

      <ScreenSection title="수익 흐름">
        <div className="grid gap-2">
          {revenueChannels.map((item) => (
            <UiCard className="bg-white" key={item.label}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted">
                    {item.description}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-foreground">
                  {item.value}
                </p>
              </div>
            </UiCard>
          ))}
        </div>
      </ScreenSection>

      <ScreenSection title="정산 관리">
        <div className="grid gap-2">
          {dashboardLinks.map((item) => (
            <SettingsListItem
              description={
                item.description ??
                `현재 정산 상태: ${getPayoutStatusLabel(payoutSettings)}`
              }
              href={item.href}
              icon={item.icon}
              key={item.href}
              title={item.title}
            />
          ))}
        </div>
      </ScreenSection>
    </main>
  );
}
