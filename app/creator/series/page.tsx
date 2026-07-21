import type { Metadata } from "next";
import { CreatorToolPage } from "@/components/creator-tool-page";

export const metadata: Metadata = {
  title: "시리즈 관리 | Artroom",
};

export default function CreatorSeriesPage() {
  return (
    <CreatorToolPage
      checklist={[
        "시리즈 소개와 대표 이미지를 정리합니다.",
        "회차별 원고, 공개 일정, 판매 방식을 설정합니다.",
        "무료 미리보기와 멤버십 선공개 범위를 확인합니다.",
      ]}
      fields={[
        { label: "운영 중인 시리즈", value: "2개" },
        { label: "예약 회차", value: "3개" },
        { label: "최근 업데이트", value: "어제" },
      ]}
      primaryAction={{
        href: "/creator/artworks/new",
        label: "새 회차 등록하기",
      }}
      summary="장기 작품, 연재물, 설정집처럼 이어지는 콘텐츠의 회차와 공개 일정을 관리합니다."
      title="시리즈 관리"
    />
  );
}
