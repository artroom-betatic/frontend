"use client";

import {
  SettingsListItem,
  SettingsListIcon,
  type SettingsListItemIconName,
} from "@/components/settings-list-item";
import { getCreatorMembershipMenuItem } from "@/lib/creator-membership";
import { useCreatorMembershipStatus } from "@/lib/use-creator-membership";
import Link from "next/link";

type MenuItem = {
  description: string;
  href: string;
  icon: SettingsListItemIconName;
  title: string;
};

const quickActions = [
  {
    description: "감상하고 구매할 작품 찾기",
    href: "/search",
    icon: "artwork",
    title: "작품 둘러보기",
  },
  {
    description: "구매한 작품 다시 보기",
    href: "/library",
    icon: "library",
    title: "내 소장함",
  },
  {
    description: "판매할 작품 페이지 준비",
    href: "/creator/artworks/new",
    icon: "artwork",
    title: "작품 등록",
  },
  {
    description: "판매와 후원 수익 확인",
    href: "/creator/dashboard",
    icon: "payout",
    title: "수익 대시보드",
  },
] satisfies MenuItem[];

const fanActivityItems = [
  {
    description: "구매한 디지털 작품과 Ebook을 모아봅니다.",
    href: "/library",
    icon: "library",
    title: "내 소장함",
  },
  {
    description: "후원 중인 작가와 멤버십 혜택을 확인합니다.",
    href: "/membership",
    icon: "membership",
    title: "가입한 멤버십",
  },
  {
    description: "요청, 진행 중, 완료된 커미션을 확인합니다.",
    href: "/commissions",
    icon: "commission",
    title: "내 커미션 의뢰",
  },
  {
    description: "팔로우, 구매, 멤버십, 커미션 알림을 관리합니다.",
    href: "/notifications",
    icon: "bell",
    title: "알림 설정",
  },
] satisfies MenuItem[];

const creatorToolItems = [
  {
    description: "디지털 작품과 Ebook 판매 페이지를 준비합니다.",
    href: "/creator/artworks/new",
    icon: "artwork",
    title: "작품 등록",
  },
  {
    description: "커미션 슬롯, 가격, 신청 조건을 관리합니다.",
    href: "/creator/commissions",
    icon: "commission",
    title: "받은 커미션 관리",
  },
  {
    description: "작품 판매, 멤버십, 커미션 수익을 확인합니다.",
    href: "/creator/dashboard",
    icon: "payout",
    title: "수익 대시보드",
  },
] satisfies MenuItem[];

const policyItems = [
  {
    description: "수익을 받을 계좌와 정산 상태를 관리합니다.",
    href: "/creator/payout",
    icon: "payout",
    title: "정산 설정",
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

function QuickActionCard({ item }: { item: MenuItem }) {
  return (
    <Link
      className="flex min-h-24 flex-col justify-between rounded-md border border-line bg-panel p-3 transition-colors hover:bg-white"
      href={item.href}
    >
      <span className="flex h-9 w-9 items-center justify-center">
        <SettingsListIcon name={item.icon} />
      </span>
      <span>
        <span className="block text-sm font-semibold leading-5 text-black">
          {item.title}
        </span>
        <span className="mt-1 block text-[11px] font-medium leading-4 text-subtle">
          {item.description}
        </span>
      </span>
    </Link>
  );
}

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
  const creatorMembershipStatus = useCreatorMembershipStatus();
  const creatorTools = [
    creatorToolItems[0],
    getCreatorMembershipMenuItem(creatorMembershipStatus),
    ...creatorToolItems.slice(1),
  ];

  return (
    <>
      <section className="mt-6">
        <h2 className="text-base font-semibold text-black">바로 가기</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {quickActions.map((item) => (
            <QuickActionCard item={item} key={item.href} />
          ))}
        </div>
      </section>

      <MenuSection items={fanActivityItems} title="팬 활동" />
      <MenuSection items={creatorTools} title="창작자 도구" />
      <MenuSection items={policyItems} title="정산/정책" />
    </>
  );
}
