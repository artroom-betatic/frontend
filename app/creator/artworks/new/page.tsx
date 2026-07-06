import type { Metadata } from "next";
import { CreatorToolPage } from "@/components/creator-tool-page";

export const metadata: Metadata = {
  title: "작품 등록하기 | Artroom",
};

export default function NewCreatorArtworkPage() {
  return (
    <CreatorToolPage
      checklist={[
        "판매할 파일과 대표 이미지를 준비합니다.",
        "작품 소개, 태그, 가격을 입력합니다.",
        "구매자가 받을 파일 구성을 확인합니다.",
      ]}
      fields={[
        { label: "등록 상태", value: "초안" },
        { label: "판매 유형", value: "디지털 작품" },
        { label: "가격", value: "미설정" },
      ]}
      summary="디지털 작품이나 Ebook을 판매하기 전에 작품 정보와 파일 구성을 정리합니다."
      title="작품 등록하기"
    />
  );
}
