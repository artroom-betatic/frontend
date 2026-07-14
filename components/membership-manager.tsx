"use client";

import { useState } from "react";
import { ActionButton } from "@/components/action-button";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";

const renewalDateLabel = "2026년 7월 15일";

export function MembershipManager() {
  const [membershipName, setMembershipName] = useState("프리미엄 플러스");
  const [statusMessage, setStatusMessage] = useState("");
  const [cancelScheduled, setCancelScheduled] = useState(false);

  const changeMembership = () => {
    setMembershipName((current) => {
      const next =
        current === "프리미엄 플러스" ? "스탠다드 멤버십" : "프리미엄 플러스";
      setCancelScheduled(false);
      setStatusMessage(`${next}으로 변경되었습니다.`);
      return next;
    });
  };

  const cancelMembership = () => {
    setCancelScheduled(true);
    setStatusMessage(`${renewalDateLabel} 갱신 전에 구독 해지가 예약되었습니다.`);
  };

  return (
    <>
      <ScreenSection title="가입한 멤버십 관리">
        <UiCard>
          <p className="text-xs">현재 멤버십</p>
          <p className="mt-3 text-xl font-bold">{membershipName}</p>
          <p className="mt-3 text-xs">
            {cancelScheduled ? "해지 예약됨" : "월간 구독"}
          </p>
        </UiCard>
        <UiCard className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs">다음 갱신일</p>
            <p className="text-base font-semibold">{renewalDateLabel}</p>
          </div>
          <p className="mt-2 text-xs">매월 14,900원</p>
        </UiCard>
      </ScreenSection>

      <ScreenSection title="멤버십 혜택">
        <UiCard>
          {["무제한 고화질 감상", "월 5회 커미션 우선권", "광고 제거"].map(
            (benefit) => (
              <p className="text-base font-semibold leading-7" key={benefit}>
                ✓ {benefit}
              </p>
            ),
          )}
        </UiCard>
      </ScreenSection>

      <ScreenSection title="결제 정보">
        <UiCard>
          <div className="flex justify-between text-xs">
            <span>결제 수단</span>
            <span>신용카드 ****2024</span>
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <span>결제일</span>
            <span>매월 15일</span>
          </div>
        </UiCard>
        <div className="mt-5.5 grid gap-3">
          <ActionButton onClick={changeMembership} variant="secondary">
            멤버십 변경
          </ActionButton>
          <ActionButton onClick={cancelMembership} variant="danger">
            구독 해지
          </ActionButton>
        </div>
        <div className="mt-11 flex justify-end">
          <ActionButton
            onClick={() => setStatusMessage("문의가 접수되었습니다.")}
          >
            문의하기
          </ActionButton>
        </div>
        {statusMessage ? (
          <p className="mt-4 text-xs font-medium text-primary">{statusMessage}</p>
        ) : null}
      </ScreenSection>
    </>
  );
}
