"use client";

import { useState, useSyncExternalStore } from "react";
import { AppFrame } from "@/components/app-frame";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { Toggle } from "@/components/toggle";
import { UiCard } from "@/components/ui-card";
import {
  type PayoutSettings,
  defaultPayoutSettings,
  getPayoutStatusLabel,
  getSettlementCycleLabel,
  isPayoutSettingsReady,
  readPayoutSettings,
  savePayoutSettings,
  subscribePayoutSettingsChange,
} from "@/lib/payout-settings";

function serializeSettings(settings: PayoutSettings) {
  return JSON.stringify(settings);
}

export function CreatorPayoutClient() {
  const savedSettings = useSyncExternalStore(
    subscribePayoutSettingsChange,
    readPayoutSettings,
    () => defaultPayoutSettings,
  );
  const [draftOverride, setDraftOverride] = useState<PayoutSettings | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const draft = draftOverride ?? savedSettings;
  const ready = isPayoutSettingsReady(draft);
  const hasPendingChanges =
    draftOverride !== null &&
    serializeSettings(draft) !== serializeSettings(savedSettings);

  const updateDraft = (nextDraft: Partial<PayoutSettings>) => {
    setDraftOverride({ ...draft, ...nextDraft });
    setStatusMessage("");
  };

  const saveSettings = () => {
    savePayoutSettings(draft);
    setDraftOverride(null);
    setStatusMessage(
      ready
        ? "정산 정보를 저장했습니다."
        : "임시 저장했습니다. 등록 완료까지 필요한 항목을 채워주세요.",
    );
  };

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/menu" title="정산 설정" />
      <main className="px-6 pb-8 pt-5">
        <p className="text-sm font-medium leading-6 text-subtle">
          작품 판매, 멤버십, 커미션 수익을 받을 정산 정보를 관리합니다.
        </p>

        <ScreenSection title="기본 설정">
          <div className="grid gap-2">
            <UiCard className="bg-white">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-subtle">정산 상태</p>
                <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-foreground">
                  {getPayoutStatusLabel(draft)}
                </p>
              </div>
            </UiCard>
            <UiCard className="bg-white">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-subtle">정산 주기</p>
                <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-foreground">
                  {getSettlementCycleLabel(draft.settlementCycle)}
                </p>
              </div>
            </UiCard>
            <UiCard className="bg-white">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-subtle">다음 정산</p>
                <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-foreground">
                  {ready ? "2026년 7월 25일" : "정보 등록 후 표시"}
                </p>
              </div>
            </UiCard>
          </div>
        </ScreenSection>

        <ScreenSection title="계좌 정보">
          <UiCard className="bg-white">
            <label className="block">
              <span className="text-xs font-medium text-subtle">예금주</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                onChange={(event) =>
                  updateDraft({ accountHolder: event.target.value })
                }
                placeholder="예금주 입력"
                value={draft.accountHolder}
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-medium text-subtle">은행</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                onChange={(event) =>
                  updateDraft({ bankName: event.target.value })
                }
                placeholder="은행명 입력"
                value={draft.bankName}
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-medium text-subtle">계좌번호</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                inputMode="numeric"
                onChange={(event) =>
                  updateDraft({
                    accountNumber: event.target.value.replace(/[^\d-]/g, ""),
                  })
                }
                placeholder="계좌번호 입력"
                value={draft.accountNumber}
              />
            </label>
          </UiCard>
        </ScreenSection>

        <ScreenSection title="정산 기준">
          <UiCard className="bg-white">
            <label className="block">
              <span className="text-xs font-medium text-subtle">정산 주기</span>
              <select
                className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                onChange={(event) =>
                  updateDraft({
                    settlementCycle:
                      event.target.value as PayoutSettings["settlementCycle"],
                  })
                }
                value={draft.settlementCycle}
              >
                <option value="monthly">월 1회</option>
                <option value="twice-monthly">월 2회</option>
              </select>
            </label>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  세금 및 정산 기준을 확인했습니다.
                </p>
                <p className="mt-2 text-xs leading-5 text-subtle">
                  판매 수수료와 정산 보류 기준을 확인해야 등록 완료로 표시됩니다.
                </p>
              </div>
              <Toggle
                checked={draft.taxConfirmed}
                label="세금 및 정산 기준 확인 상태 전환"
                onClick={() =>
                  updateDraft({ taxConfirmed: !draft.taxConfirmed })
                }
              />
            </div>
          </UiCard>
        </ScreenSection>

        <button
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
          disabled={!hasPendingChanges}
          onClick={saveSettings}
          type="button"
        >
          정산 정보 저장
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
