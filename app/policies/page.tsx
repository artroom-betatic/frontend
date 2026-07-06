import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { MobileHeader } from "@/components/mobile-header";
import { UiCard } from "@/components/ui-card";

export const metadata: Metadata = {
  title: "수수료/정산 정책 안내 | Artroom",
};

const policyCards = [
  {
    title: "작품 판매 수수료",
    subtitle: "Artroom의 수수료 정책",
    label: "거래액의",
    value: "15%",
    description:
      "작품 판매 시 거래액의 15%가 수수료로 적용됩니다. 나머지는 작가님의 정산금으로 입금됩니다.",
  },
  {
    title: "커미션 수수료",
    subtitle: "맞춤형 의뢰 거래 기준",
    label: "거래액의",
    value: "10%",
    description: "커미션은 작품 판매보다 낮은 10% 수수료로 지원합니다.",
  },
  {
    title: "정산 주기",
    label: "매월",
    value: "25일",
    description: "이전 달 1일~말일의 판매액이 그 다음 달 25일에 정산됩니다.",
  },
  {
    title: "최소 정산액",
    label: "₩",
    value: "5,000",
    description:
      "누적 판매액이 5,000원 이상일 때 정산이 진행됩니다. 미만 시 다음 달로 이월됩니다.",
  },
  {
    title: "정산 수단",
    description: "계좌이체로만 지원됩니다. 마이페이지 > 정산 설정에서 계좌를 등록하세요.",
  },
  {
    title: "환불 및 취소 정책",
    description:
      "구매자의 환불 신청 시 플랫폼이 환불액을 처리하며, 이미 지급된 정산금 중 해당 부분은 다음 정산에서 차감됩니다.",
  },
];

export default function PoliciesPage() {
  return (
    <AppFrame>
      <MobileHeader title="수수료/정산 정책 안내" backHref="/menu" />
      <main className="grid gap-5 px-6 pb-8 pt-2">
        {policyCards.map((card) => (
          <UiCard className="grid gap-3" key={card.title}>
            <h2 className="text-base font-semibold">{card.title}</h2>
            {card.subtitle ? <p className="text-xs">{card.subtitle}</p> : null}
            {card.value ? (
              <div className="flex items-center justify-between">
                <p className="text-xs">{card.label}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            ) : null}
            <p className="text-[11px] leading-[18px]">{card.description}</p>
          </UiCard>
        ))}

        <UiCard className="grid gap-3">
          <h2 className="text-base font-semibold">수익 증대 팁</h2>
          <p className="text-base font-semibold">• 정기적 신작 업로드로 노출도 증가</p>
          <p className="text-base font-semibold">• 시리즈물 구성으로 재구매율 높이기</p>
          <p className="text-[11px]">• 팬과의 활발한 상호작용으로 충성도 구축</p>
        </UiCard>
      </main>
    </AppFrame>
  );
}
