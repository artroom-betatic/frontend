import type { Metadata } from "next";
import { CreatorToolPage } from "@/components/creator-tool-page";

export const metadata: Metadata = {
  title: "받은 커미션 관리 | Artroom",
};

export default function CreatorCommissionsPage() {
  return (
    <CreatorToolPage
      checklist={[
        "받을 수 있는 의뢰 범위와 작업 기간을 정합니다.",
        "기본 가격과 추가 옵션 기준을 입력합니다.",
        "신청 양식과 안내 문구를 확인합니다.",
      ]}
      fields={[
        { label: "접수 상태", value: "닫힘" },
        { label: "슬롯", value: "0개" },
        { label: "기본 가격", value: "미설정" },
      ]}
      summary="프로필에서 받을 커미션의 슬롯, 가격, 신청 조건을 정리합니다."
      title="받은 커미션 관리"
    />
  );
}
