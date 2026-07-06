"use client";

import { useRouter } from "next/navigation";
import { CreatorToolPage } from "@/components/creator-tool-page";
import { activateCreatorMembership } from "@/lib/creator-membership";
import { useCreatorMembershipStatus } from "@/lib/use-creator-membership";

export function CreatorMembershipClient() {
  const router = useRouter();
  const creatorMembershipStatus = useCreatorMembershipStatus();

  if (creatorMembershipStatus === "active") {
    return (
      <CreatorToolPage
        checklist={[
          "등급과 가격을 수정합니다.",
          "멤버십 전용 피드를 업로드합니다.",
          "가입자 혜택과 공지 내용을 점검합니다.",
        ]}
        fields={[
          { label: "공개 상태", value: "공개" },
          { label: "등급", value: "1개" },
          { label: "전용 콘텐츠", value: "0개" },
        ]}
        primaryAction={{ href: "/my", label: "마이페이지로 돌아가기" }}
        summary="프로필에 노출되는 구독 멤버십의 등급, 혜택, 전용 콘텐츠를 관리합니다."
        title="구독 멤버십 관리"
      />
    );
  }

  return (
    <CreatorToolPage
      checklist={[
        "등급별 가격과 혜택을 정합니다.",
        "멤버십 전용 피드에 올릴 첫 게시물을 준비합니다.",
        "공개 전에 정산 정보를 확인합니다.",
      ]}
      fields={[
        { label: "공개 상태", value: "비공개" },
        { label: "등급", value: "미설정" },
        { label: "전용 콘텐츠", value: "0개" },
      ]}
      primaryAction={{
        label: "구독 멤버십 시작하기",
        onClick: () => {
          activateCreatorMembership();
          router.replace("/my");
        },
      }}
      summary="프로필에서 후원 멤버십을 열기 전에 등급, 혜택, 전용 콘텐츠를 정리합니다."
      title="구독 멤버십 만들기"
    />
  );
}
