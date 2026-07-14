"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AppFrame } from "@/components/app-frame";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";
import {
  activateCreatorMembership,
  type CreatorMembershipContent,
  type CreatorMembershipDraft,
  type CreatorMembershipTier,
  type CreatorMembershipVisibility,
  defaultCreatorMembershipDraft,
  readCreatorMembershipDraft,
  saveCreatorMembershipDraft,
  subscribeCreatorMembershipDraftChange,
} from "@/lib/creator-membership";
import {
  defaultPayoutSettings,
  isPayoutSettingsReady,
  readPayoutSettings,
  subscribePayoutSettingsChange,
} from "@/lib/payout-settings";
import { writeRouteToast } from "@/lib/route-toast";
import { useCreatorMembershipStatus } from "@/lib/use-creator-membership";

const visibilityOptions = [
  { id: "private", label: "비공개" },
  { id: "public", label: "공개" },
] satisfies { id: CreatorMembershipVisibility; label: string }[];

const contentTypeLabels: Record<CreatorMembershipContent["type"], string> = {
  feed: "전용 피드",
  file: "파일 배포",
  process: "작업 과정",
};

const contentStatusLabels: Record<CreatorMembershipContent["status"], string> = {
  scheduled: "예약",
  published: "공개",
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatPrice(price: string) {
  const numericPrice = Number(price.replaceAll(",", ""));

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "가격 미설정";
  }

  return `월 ₩${numericPrice.toLocaleString("ko-KR")}`;
}

function isTierReady(tier: CreatorMembershipTier) {
  return tier.name.trim() && Number(tier.price) > 0 && tier.benefit.trim();
}

function isContentReady(content: CreatorMembershipContent) {
  return content.title.trim();
}

export function CreatorMembershipClient() {
  const router = useRouter();
  const creatorMembershipStatus = useCreatorMembershipStatus();
  const draft = useSyncExternalStore(
    subscribeCreatorMembershipDraftChange,
    readCreatorMembershipDraft,
    () => defaultCreatorMembershipDraft,
  );
  const payoutSettings = useSyncExternalStore(
    subscribePayoutSettingsChange,
    readPayoutSettings,
    () => defaultPayoutSettings,
  );
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const validTierCount = draft.tiers.filter(isTierReady).length;
  const validContentCount = draft.contents.filter(isContentReady).length;
  const payoutReady = isPayoutSettingsReady(payoutSettings);
  const canStartMembership =
    validTierCount > 0 && validContentCount > 0 && payoutReady;
  const isActive = creatorMembershipStatus === "active";
  const title = isActive ? "구독 멤버십 관리" : "구독 멤버십 만들기";
  const summary = isActive
    ? "프로필에 노출되는 구독 멤버십의 등급, 혜택, 전용 콘텐츠를 관리합니다."
    : "프로필에서 후원 멤버십을 열기 전에 등급, 혜택, 전용 콘텐츠를 정리합니다.";
  const checklist = useMemo(
    () => [
      {
        complete: validTierCount > 0,
        detail: `${validTierCount}개 설정됨`,
        title: "등급별 가격과 혜택을 정합니다.",
      },
      {
        complete: validContentCount > 0,
        detail: `${validContentCount}개 준비됨`,
        title: "멤버십 전용 피드에 올릴 첫 게시물을 준비합니다.",
      },
      {
        complete: payoutReady,
        detail: payoutReady ? "등록 완료" : "등록 필요",
        title: "공개 전에 정산 정보를 등록합니다.",
      },
    ],
    [payoutReady, validContentCount, validTierCount],
  );

  const updateDraft = (nextDraft: CreatorMembershipDraft) => {
    saveCreatorMembershipDraft(nextDraft);
    setHasPendingChanges(true);
    setStatusMessage("");
  };

  const updateTier = (
    tierId: string,
    nextTier: Partial<CreatorMembershipTier>,
  ) => {
    updateDraft({
      ...draft,
      tiers: draft.tiers.map((tier) =>
        tier.id === tierId ? { ...tier, ...nextTier } : tier,
      ),
    });
  };

  const addTier = () => {
    updateDraft({
      ...draft,
      tiers: [
        ...draft.tiers,
        {
          benefit: "",
          id: createId("tier"),
          name: "새 등급",
          price: "9900",
        },
      ],
    });
  };

  const removeTier = (tierId: string) => {
    updateDraft({
      ...draft,
      tiers: draft.tiers.filter((tier) => tier.id !== tierId),
    });
  };

  const updateContent = (
    contentId: string,
    nextContent: Partial<CreatorMembershipContent>,
  ) => {
    updateDraft({
      ...draft,
      contents: draft.contents.map((content) =>
        content.id === contentId ? { ...content, ...nextContent } : content,
      ),
    });
  };

  const addContent = () => {
    updateDraft({
      ...draft,
      contents: [
        ...draft.contents,
        {
          id: createId("content"),
          status: "scheduled",
          title: "새 전용 콘텐츠",
          type: "feed",
        },
      ],
    });
  };

  const removeContent = (contentId: string) => {
    updateDraft({
      ...draft,
      contents: draft.contents.filter((content) => content.id !== contentId),
    });
  };

  const saveDraft = () => {
    if (!hasPendingChanges) {
      return;
    }

    saveCreatorMembershipDraft(draft);
    setHasPendingChanges(false);
    writeRouteToast("멤버십 변경사항을 적용했습니다.");
    router.replace("/my");
  };

  const startMembership = () => {
    if (!canStartMembership) {
      return;
    }

    saveCreatorMembershipDraft(draft);
    activateCreatorMembership();
    writeRouteToast("구독 멤버십을 시작했습니다.");
    router.replace("/my");
  };

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/my" title={title} />
      <main className="px-6 pb-8 pt-5">
        <p className="text-sm font-medium leading-6 text-subtle">{summary}</p>

        <ScreenSection title="기본 설정">
          <div className="grid gap-2">
            <UiCard className="bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-subtle">공개 상태</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {draft.visibility === "public" ? "공개" : "비공개"}
                  </p>
                </div>
                <div className="grid w-32 shrink-0 grid-cols-2 gap-1 rounded-md bg-panel p-1">
                  {visibilityOptions.map((option) => {
                    const selected = draft.visibility === option.id;

                    return (
                      <button
                        aria-pressed={selected}
                        className={`min-h-8 rounded-md px-2 text-xs font-semibold ${
                          selected
                            ? "bg-primary text-white"
                            : "bg-white text-muted"
                        }`}
                        key={option.id}
                        onClick={() =>
                          updateDraft({ ...draft, visibility: option.id })
                        }
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="mt-3 text-2xs font-medium leading-4 text-muted">
                공개 전에는 프로필에 노출되지 않습니다.
              </p>
            </UiCard>

            <UiCard className="bg-white">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-subtle">등급</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {validTierCount}개
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-subtle">전용 콘텐츠</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {validContentCount}개
                  </p>
                </div>
              </div>
            </UiCard>
          </div>
        </ScreenSection>

        <ScreenSection title="등급과 혜택">
          <div className="grid gap-3">
            {draft.tiers.map((tier, index) => (
              <UiCard className="bg-white" key={tier.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    등급 {index + 1}
                  </p>
                  <button
                    className="text-xs font-semibold text-muted disabled:text-line"
                    disabled={draft.tiers.length === 1}
                    onClick={() => removeTier(tier.id)}
                    type="button"
                  >
                    삭제
                  </button>
                </div>

                <label className="mt-4 block">
                  <span className="text-xs font-medium text-subtle">등급명</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                    onChange={(event) =>
                      updateTier(tier.id, { name: event.target.value })
                    }
                    value={tier.name}
                  />
                </label>

                <label className="mt-3 block">
                  <span className="text-xs font-medium text-subtle">월 가격</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                    inputMode="numeric"
                    onChange={(event) =>
                      updateTier(tier.id, {
                        price: event.target.value.replace(/\D/g, ""),
                      })
                    }
                    value={tier.price}
                  />
                  <span className="mt-2 block text-2xs font-semibold text-muted">
                    {formatPrice(tier.price)}
                  </span>
                </label>

                <label className="mt-3 block">
                  <span className="text-xs font-medium text-subtle">혜택</span>
                  <textarea
                    className="mt-2 min-h-20 w-full resize-none rounded-md border border-line bg-panel px-3 py-3 text-sm font-medium leading-5 text-foreground outline-none focus:border-primary"
                    onChange={(event) =>
                      updateTier(tier.id, { benefit: event.target.value })
                    }
                    value={tier.benefit}
                  />
                </label>
              </UiCard>
            ))}
            <button
              className="min-h-11 rounded-md border border-line bg-white px-4 text-sm font-semibold text-primary"
              onClick={addTier}
              type="button"
            >
              등급 추가
            </button>
          </div>
        </ScreenSection>

        <ScreenSection title="전용 콘텐츠">
          <div className="grid gap-3">
            {draft.contents.map((content, index) => (
              <UiCard className="bg-white" key={content.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    콘텐츠 {index + 1}
                  </p>
                  <button
                    className="text-xs font-semibold text-muted disabled:text-line"
                    disabled={draft.contents.length === 1}
                    onClick={() => removeContent(content.id)}
                    type="button"
                  >
                    삭제
                  </button>
                </div>

                <label className="mt-4 block">
                  <span className="text-xs font-medium text-subtle">제목</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                    onChange={(event) =>
                      updateContent(content.id, { title: event.target.value })
                    }
                    value={content.title}
                  />
                </label>

                <div className="mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <span className="text-xs font-medium text-subtle">종류</span>
                    <span className="text-xs font-medium text-subtle">상태</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <label className="relative block h-10 rounded-md bg-panel p-1">
                      <span className="sr-only">전용 콘텐츠 종류</span>
                      <select
                        className="h-full w-full appearance-none rounded-md bg-white px-2 pr-6 text-xs font-semibold leading-none text-foreground outline-none focus:ring-1 focus:ring-primary"
                        onChange={(event) =>
                          updateContent(content.id, {
                            type:
                              event.target.value as CreatorMembershipContent["type"],
                          })
                        }
                        value={content.type}
                      >
                        {Object.entries(contentTypeLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-base font-bold leading-none text-muted"
                      >
                        ▾
                      </span>
                    </label>

                    <div className="grid h-10 grid-cols-2 gap-1 rounded-md bg-panel p-1">
                      {Object.entries(contentStatusLabels).map(([value, label]) => {
                        const selected = content.status === value;

                        return (
                          <button
                            aria-pressed={selected}
                            className={`h-full rounded-md px-2 text-xs font-semibold ${
                              selected
                                ? "bg-primary text-white"
                                : "bg-white text-muted"
                            }`}
                            key={value}
                            onClick={() =>
                              updateContent(content.id, {
                                status:
                                  value as CreatorMembershipContent["status"],
                              })
                            }
                            type="button"
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-2xs font-medium leading-4 text-muted">
                  예약은 멤버십 공개 시 함께 노출할 콘텐츠로 대기시키는
                  상태입니다. 공개는 가입자가 바로 볼 수 있는 상태입니다.
                </p>
              </UiCard>
            ))}
            <button
              className="min-h-11 rounded-md border border-line bg-white px-4 text-sm font-semibold text-primary"
              onClick={addContent}
              type="button"
            >
              전용 콘텐츠 추가
            </button>
          </div>
        </ScreenSection>

        <ScreenSection title="정산 확인">
          <UiCard className="bg-white">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  정산 정보 {payoutReady ? "등록 완료" : "등록 필요"}
                </p>
                <p className="mt-2 text-xs leading-5 text-subtle">
                  멤버십 수익을 받을 계좌와 정산 기준이 등록되어야 공개할 수 있습니다.
                </p>
              </div>
              <Link
                className="shrink-0 rounded-md bg-panel px-3 py-2 text-xs font-semibold text-primary"
                href="/creator/payout"
              >
                설정
              </Link>
            </div>
          </UiCard>
        </ScreenSection>

        <ScreenSection title="다음 단계">
          <div className="grid gap-2">
            {checklist.map((item, index) => (
              <UiCard className="bg-white" key={item.title}>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      item.complete
                        ? "bg-primary text-white"
                        : "bg-panel text-muted"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-5 text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 text-2xs font-semibold text-muted">
                      {item.detail}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-1 text-2xs font-semibold ${
                      item.complete
                        ? "bg-panel text-primary"
                        : "bg-panel text-muted"
                    }`}
                  >
                    {item.complete ? "완료" : "필요"}
                  </span>
                </div>
              </UiCard>
            ))}
          </div>
        </ScreenSection>

        <div className="mt-6 grid gap-2">
          <button
            className={`flex min-h-11 w-full items-center justify-center rounded-md px-4 text-sm font-semibold ${
              hasPendingChanges
                ? "bg-primary text-white"
                : "bg-panel text-muted"
            }`}
            disabled={!hasPendingChanges}
            onClick={saveDraft}
            type="button"
          >
            변경사항 저장
          </button>
          {!isActive ? (
            <button
              className="flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
              disabled={!canStartMembership}
              onClick={startMembership}
              type="button"
            >
              구독 멤버십 시작하기
            </button>
          ) : null}
        </div>

        {!isActive && !canStartMembership ? (
          <p className="mt-3 text-xs font-medium leading-5 text-muted">
            등급, 전용 콘텐츠, 정산 정보 등록을 모두 완료하면 멤버십을 시작할 수 있습니다.
          </p>
        ) : null}

        {statusMessage ? (
          <p className="mt-4 text-xs font-semibold text-primary">
            {statusMessage}
          </p>
        ) : null}
      </main>
    </AppFrame>
  );
}
