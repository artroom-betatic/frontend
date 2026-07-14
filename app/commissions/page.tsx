import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { FigmaTag } from "@/components/figma-controls";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";
import { commissions } from "@/lib/artroom-data";

export const metadata: Metadata = {
  title: "커미션 의뢰 현황 | Artroom",
};

const summary = [
  { label: "전체", value: 8 },
  { label: "진행 중", value: 3 },
  { label: "완료", value: 4 },
  { label: "취소", value: 1 },
];

export default function CommissionsPage() {
  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref="/menu"
        title="커미션 의뢰 현황"
      />
      <main className="px-6 pb-8 pt-3.5">
        <ScreenSection title="커미션 의뢰 현황">
          <UiCard>
            <div className="grid grid-cols-3 gap-2">
              {summary.slice(0, 3).map((item) => (
                <div
                  className="rounded-md border border-line bg-panel p-3"
                  key={item.label}
                >
                  <p className="text-xs">{item.label}</p>
                  <p className="mt-3 text-xl font-bold">{item.value}</p>
                </div>
              ))}
              <div className="col-span-3 rounded-md border border-line bg-panel p-3">
                <p className="text-xs">취소</p>
                <p className="mt-3 text-xl font-bold">1</p>
              </div>
            </div>
          </UiCard>
        </ScreenSection>

        <ScreenSection title="의뢰 목록">
          <div className="grid gap-4">
            {commissions.map((commission) => (
              <UiCard className="min-h-24" key={commission.title}>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-normal">
                      {commission.title}
                    </h3>
                    <div className="mt-3 h-3 w-20 rounded bg-line" />
                    <FigmaTag
                      active={commission.status === "진행 중"}
                      className="mt-3"
                    >
                      {commission.status}
                    </FigmaTag>
                  </div>
                  <p className="text-xs">{commission.due}</p>
                </div>
              </UiCard>
            ))}
          </div>
        </ScreenSection>
      </main>
    </AppFrame>
  );
}
