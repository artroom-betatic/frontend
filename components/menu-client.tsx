"use client";

import {
  SettingsListItem,
  type SettingsListItemIconName,
} from "@/components/settings-list-item";

type MenuItem = {
  description: string;
  href: string;
  icon: SettingsListItemIconName;
  title: string;
};

const commissionItems = [
  {
    description: "요청, 진행 중, 완료된 커미션을 확인합니다.",
    href: "/commissions",
    icon: "commission",
    title: "커미션 의뢰 현황",
  },
  {
    description: "커미션 슬롯, 가격, 신청 조건을 관리합니다.",
    href: "/creator/commissions",
    icon: "commission",
    title: "받은 커미션 관리",
  },
] satisfies MenuItem[];

const operationItems = [
  {
    description: "작품 판매, 멤버십, 커미션 수익을 확인합니다.",
    href: "/creator/dashboard",
    icon: "payout",
    title: "내 수익 대시보드",
  },
  {
    description: "수익을 받을 계좌와 정산 상태를 관리합니다.",
    href: "/creator/payout",
    icon: "payout",
    title: "정산 설정",
  },
] satisfies MenuItem[];

const settingItems = [
  {
    description: "알림, 표시, 계정 환경을 한 곳에서 조정합니다.",
    href: "/settings",
    icon: "settings",
    title: "앱 설정",
  },
  {
    description: "팔로우, 구매, 멤버십, 커미션 알림을 관리합니다.",
    href: "/notifications",
    icon: "bell",
    title: "알림 설정",
  },
  {
    description: "작품 판매와 커미션 거래 수수료를 확인합니다.",
    href: "/policies#fees",
    icon: "policy",
    title: "수수료 정책",
  },
  {
    description: "구매 취소와 환불 처리 기준을 확인합니다.",
    href: "/policies#refunds",
    icon: "policy",
    title: "환불 정책",
  },
  {
    description: "업로드 가능한 콘텐츠와 운영 기준을 확인합니다.",
    href: "/policies#content",
    icon: "policy",
    title: "콘텐츠 정책",
  },
] satisfies MenuItem[];

function MenuSection({ items, title }: { items: MenuItem[]; title: string }) {
  return (
    <section className="mt-7">
      <h2 className="text-base font-semibold text-black">{title}</h2>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <SettingsListItem
            description={item.description}
            href={item.href}
            icon={item.icon}
            key={item.href}
            title={item.title}
          />
        ))}
      </div>
    </section>
  );
}

export function MenuClient() {
  return (
    <>
      <MenuSection items={commissionItems} title="커미션" />
      <MenuSection items={operationItems} title="수익/정산" />
      <MenuSection items={settingItems} title="설정/정책" />
    </>
  );
}
