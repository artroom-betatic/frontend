"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  contentDisplayOptions,
  defaultAppSettings,
  readAppSettings,
  subscribeAppSettingsChange,
  themeModeOptions,
  updateAppSettings,
  type AppThemeMode,
  type ContentDisplayMode,
} from "@/lib/app-settings";
import { ScreenSection } from "./screen-section";
import {
  SettingsListItem,
  type SettingsListItemIconName,
} from "./settings-list-item";
import { UiCard } from "./ui-card";

const settingLinks = [
  {
    description: "팔로우, 구매, 멤버십, 커미션 알림을 조정합니다.",
    href: "/notifications",
    icon: "bell",
    title: "알림 설정",
  },
  {
    description: "수수료, 환불, 콘텐츠 운영 기준을 확인합니다.",
    href: "/policies",
    icon: "policy",
    title: "정책 보기",
  },
] satisfies {
  description: string;
  href: string;
  icon: SettingsListItemIconName;
  title: string;
}[];

function SettingsSummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <UiCard className="bg-white">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium text-subtle">{label}</p>
        <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-foreground">
          {value}
        </p>
      </div>
    </UiCard>
  );
}

export function AppSettingsClient() {
  const settings = useSyncExternalStore(
    subscribeAppSettingsChange,
    readAppSettings,
    () => defaultAppSettings,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const selectedThemeOption = useMemo(
    () =>
      themeModeOptions.find((option) => option.id === settings.themeMode) ??
      themeModeOptions[0],
    [settings.themeMode],
  );
  const selectedContentDisplayOption = useMemo(
    () =>
      contentDisplayOptions.find(
        (option) => option.id === settings.contentDisplay,
      ) ?? contentDisplayOptions[0],
    [settings.contentDisplay],
  );

  const updateThemeMode = (themeMode: AppThemeMode) => {
    updateAppSettings({ themeMode });
    setStatusMessage("화면 모드가 저장되었습니다.");
  };

  const updateContentDisplay = (contentDisplay: ContentDisplayMode) => {
    updateAppSettings({ contentDisplay });
    setStatusMessage("콘텐츠 표시가 저장되었습니다.");
  };

  return (
    <>
      <p className="text-sm font-medium leading-6 text-subtle">
        Artroom 사용 환경과 알림, 정책 확인 경로를 관리합니다.
      </p>

      <ScreenSection title="앱 환경">
        <div className="grid gap-3">
          <UiCard className="bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-subtle">화면 모드</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {selectedThemeOption.label}
                </p>
              </div>
              <span className="rounded-md bg-panel px-2 py-1 text-2xs font-semibold text-primary">
                적용 중
              </span>
            </div>

            <div className="mt-4 grid gap-2">
              {themeModeOptions.map((option) => {
                const active = settings.themeMode === option.id;

                return (
                  <button
                    aria-pressed={active}
                    className={`rounded-md border px-3 py-3 text-left transition-colors ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-line bg-panel"
                    }`}
                    key={option.id}
                    onClick={() => updateThemeMode(option.id)}
                    type="button"
                  >
                    <span className="block text-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-subtle">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </UiCard>

          <UiCard className="bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-subtle">콘텐츠 표시</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {selectedContentDisplayOption.label}
                </p>
              </div>
              <span className="rounded-md bg-panel px-2 py-1 text-2xs font-semibold text-primary">
                홈/검색
              </span>
            </div>

            <div className="mt-4 grid gap-2">
              {contentDisplayOptions.map((option) => {
                const active = settings.contentDisplay === option.id;

                return (
                  <button
                    aria-pressed={active}
                    className={`rounded-md border px-3 py-3 text-left transition-colors ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-line bg-panel"
                    }`}
                    key={option.id}
                    onClick={() => updateContentDisplay(option.id)}
                    type="button"
                  >
                    <span className="block text-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-subtle">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </UiCard>

          <SettingsSummaryRow label="언어" value="한국어" />
        </div>

        {statusMessage ? (
          <p className="mt-3 text-xs font-medium text-primary" role="status">
            {statusMessage}
          </p>
        ) : null}
      </ScreenSection>

      <ScreenSection title="설정 바로가기">
        <div className="grid gap-2">
          {settingLinks.map((item) => (
            <SettingsListItem
              description={item.description}
              href={item.href}
              icon={item.icon}
              key={item.href}
              title={item.title}
            />
          ))}
        </div>
      </ScreenSection>
    </>
  );
}
