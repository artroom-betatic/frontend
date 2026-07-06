"use client";

import { useState } from "react";
import { ActionButton } from "@/components/action-button";
import { ScreenSection } from "@/components/screen-section";
import { Toggle } from "@/components/toggle";
import { UiCard } from "@/components/ui-card";
import type { NotificationGroup } from "@/lib/artroom-data";

type NotificationSettingsClientProps = {
  groups: NotificationGroup[];
};

export function NotificationSettingsClient({
  groups: initialGroups,
}: NotificationSettingsClientProps) {
  const [groups, setGroups] = useState(initialGroups);
  const [statusMessage, setStatusMessage] = useState("");
  const allEnabled = groups.every((group) =>
    group.items.every((item) => item.enabled),
  );

  const toggleAll = () => {
    const nextEnabled = !allEnabled;
    setGroups((currentGroups) =>
      currentGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item, enabled: nextEnabled })),
      })),
    );
    setStatusMessage(nextEnabled ? "전체 알림을 켰습니다." : "전체 알림을 껐습니다.");
  };

  const toggleItem = (groupLabel: string, itemTitle: string) => {
    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.label === groupLabel
          ? {
              ...group,
              items: group.items.map((item) =>
                item.title === itemTitle
                  ? { ...item, enabled: !item.enabled }
                  : item,
              ),
            }
          : group,
      ),
    );
    setStatusMessage("");
  };

  return (
    <>
      <ScreenSection title="알림 설정">
        <UiCard>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">전체 알림</p>
            <div className="flex items-center gap-3">
              <span className="text-sm">전체 알림</span>
              <Toggle
                checked={allEnabled}
                label="전체 알림 전환"
                onClick={toggleAll}
              />
            </div>
          </div>
        </UiCard>
      </ScreenSection>

      {groups.map((group) => (
        <ScreenSection label={group.label} key={group.label}>
          <UiCard className="grid gap-3">
            {group.items.map((item) => (
              <div className="flex items-center justify-between gap-3" key={item.title}>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{item.title}</h2>
                  <p className="mt-3 truncate text-xs">{item.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-sm sm:inline">{item.title}</span>
                  <Toggle
                    checked={item.enabled}
                    label={`${item.title} 알림 전환`}
                    onClick={() => toggleItem(group.label, item.title)}
                  />
                </div>
              </div>
            ))}
          </UiCard>
        </ScreenSection>
      ))}

      <div className="mt-9 flex justify-end">
        <ActionButton onClick={() => setStatusMessage("변경사항을 저장했습니다.")}>
          변경사항 저장
        </ActionButton>
      </div>
      {statusMessage ? (
        <p className="mt-4 text-xs font-medium text-[#307cff]">{statusMessage}</p>
      ) : null}
    </>
  );
}
