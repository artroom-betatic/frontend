"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { AppFrame } from "@/components/app-frame";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { Toggle } from "@/components/toggle";
import { UiCard } from "@/components/ui-card";
import {
  type CreatorCommissionSettings,
  defaultCreatorCommissionSettings,
  formatCreatorCommissionPrice,
  isCreatorCommissionReady,
  readCreatorCommissionSettings,
  saveCreatorCommissionSettings,
  subscribeCreatorCommissionSettingsChange,
} from "@/lib/creator-commission-settings";

const responseTimeOptions = ["24시간 이내", "3일 이내", "7일 이내"];

function serializeSettings(settings: CreatorCommissionSettings) {
  return JSON.stringify(settings);
}

export function CreatorCommissionsClient() {
  const savedSettings = useSyncExternalStore(
    subscribeCreatorCommissionSettingsChange,
    readCreatorCommissionSettings,
    () => defaultCreatorCommissionSettings,
  );
  const [draftOverride, setDraftOverride] =
    useState<CreatorCommissionSettings | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const draft = draftOverride ?? savedSettings;
  const hasPendingChanges =
    draftOverride !== null &&
    serializeSettings(draft) !== serializeSettings(savedSettings);
  const ready = Boolean(isCreatorCommissionReady(draft));
  const checklist = useMemo(
    () => [
      {
        complete: Boolean(draft.scope.trim()),
        detail: draft.scope.trim() ? "입력됨" : "필요",
        title: "받을 수 있는 의뢰 범위를 정합니다.",
      },
      {
        complete: Number(draft.basePrice) > 0,
        detail: formatCreatorCommissionPrice(draft.basePrice),
        title: "기본 가격 기준을 입력합니다.",
      },
      {
        complete: !draft.accepting || Number(draft.slots) > 0,
        detail: draft.accepting ? `${Number(draft.slots) || 0}개` : "접수 닫힘",
        title: "접수 슬롯을 확인합니다.",
      },
      {
        complete: Boolean(draft.guidance.trim()),
        detail: draft.guidance.trim() ? "입력됨" : "필요",
        title: "신청 안내 문구를 준비합니다.",
      },
    ],
    [draft],
  );

  const updateDraft = (nextDraft: Partial<CreatorCommissionSettings>) => {
    setDraftOverride({ ...draft, ...nextDraft });
    setStatusMessage("");
  };

  const saveSettings = () => {
    saveCreatorCommissionSettings(draft);
    setDraftOverride(null);
    setStatusMessage(
      ready
        ? "커미션 설정을 저장했습니다."
        : "설정을 저장했습니다. 공개 전 필요한 항목을 더 채워주세요.",
    );
  };

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/menu" title="받은 커미션 관리" />
      <main className="px-6 pb-8 pt-5">
        <p className="text-sm font-medium leading-6 text-subtle">
          프로필에서 받을 커미션의 슬롯, 가격, 신청 조건을 정리합니다.
        </p>

        <ScreenSection title="기본 설정">
          <div className="grid gap-2">
            <UiCard className="bg-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-subtle">접수 상태</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {draft.accepting ? "열림" : "닫힘"}
                  </p>
                </div>
                <Toggle
                  checked={draft.accepting}
                  label="커미션 접수 상태 전환"
                  onClick={() => updateDraft({ accepting: !draft.accepting })}
                />
              </div>
            </UiCard>

            <UiCard className="bg-white">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-subtle">슬롯</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                    inputMode="numeric"
                    onChange={(event) =>
                      updateDraft({
                        slots: event.target.value.replace(/\D/g, ""),
                      })
                    }
                    value={draft.slots}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-subtle">기본 가격</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                    inputMode="numeric"
                    onChange={(event) =>
                      updateDraft({
                        basePrice: event.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="0"
                    value={draft.basePrice}
                  />
                </label>
              </div>
              <p className="mt-3 text-[10px] font-semibold text-muted">
                {formatCreatorCommissionPrice(draft.basePrice)}
              </p>
            </UiCard>

            <UiCard className="bg-white">
              <label className="block">
                <span className="text-xs font-medium text-subtle">응답 시간</span>
                <select
                  className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                  onChange={(event) =>
                    updateDraft({ responseTime: event.target.value })
                  }
                  value={draft.responseTime}
                >
                  {responseTimeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </UiCard>
          </div>
        </ScreenSection>

        <ScreenSection title="신청 조건">
          <UiCard className="bg-white">
            <label className="block">
              <span className="text-xs font-medium text-subtle">가능한 작업</span>
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-md border border-line bg-panel px-3 py-3 text-sm font-medium leading-5 text-foreground outline-none focus:border-primary"
                onChange={(event) => updateDraft({ scope: event.target.value })}
                value={draft.scope}
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-medium text-subtle">신청 안내</span>
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-md border border-line bg-panel px-3 py-3 text-sm font-medium leading-5 text-foreground outline-none focus:border-primary"
                onChange={(event) => updateDraft({ guidance: event.target.value })}
                value={draft.guidance}
              />
            </label>
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
                    <p className="mt-1 text-[10px] font-semibold text-muted">
                      {item.detail}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${
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

        <button
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
          disabled={!hasPendingChanges}
          onClick={saveSettings}
          type="button"
        >
          커미션 설정 저장
        </button>
        {statusMessage ? (
          <p className="mt-4 text-xs font-semibold text-primary">
            {statusMessage}
          </p>
        ) : null}
      </main>
    </AppFrame>
  );
}
