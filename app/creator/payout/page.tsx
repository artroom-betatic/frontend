import type { Metadata } from "next";
import { CreatorToolPage } from "@/components/creator-tool-page";

export const metadata: Metadata = {
  title: "정산 설정 | Artroom",
};

export default function CreatorPayoutPage() {
  return (
    <CreatorToolPage
      checklist={[
        "본인 확인에 필요한 정보를 확인합니다.",
        "수익을 받을 계좌 정보를 준비합니다.",
        "판매 수수료와 정산 주기를 확인합니다.",
      ]}
      fields={[
        { label: "정산 상태", value: "미등록" },
        { label: "정산 주기", value: "월 1회" },
        { label: "다음 정산", value: "정보 등록 후 표시" },
      ]}
      summary="작품 판매, 멤버십, 커미션 수익을 받을 정산 정보를 관리합니다."
      title="정산 설정"
    />
  );
}
