import type { Metadata } from "next";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";
import { artworkDetails } from "@/lib/catalog-data";

export const metadata: Metadata = {
  title: "내 소장함 | Artroom",
};

const collectionSummary = [
  { label: "소장 작품", value: "18" },
  { label: "멤버십 콘텐츠", value: "6" },
  { label: "최근 구매", value: "3" },
];

export default function LibraryPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/menu" title="내 소장함" />
      <main className="px-6 pb-[96px] pt-5">
        <p className="text-sm font-medium leading-6 text-subtle">
          구매한 디지털 작품과 멤버십 전용 콘텐츠를 다시 볼 수 있습니다.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {collectionSummary.map((item) => (
            <UiCard className="bg-white p-3 text-center" key={item.label}>
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="mt-1 text-[10px] text-muted">{item.label}</p>
            </UiCard>
          ))}
        </div>

        <ScreenSection title="최근 소장 작품">
          <div className="grid gap-3">
            {artworkDetails.map((artwork) => (
              <Link href={artwork.href} key={artwork.slug}>
                <UiCard className="bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {artwork.title}
                      </p>
                      <p className="mt-1 text-xs font-medium text-muted">
                        {artwork.creator.displayName}
                      </p>
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-subtle">
                        {artwork.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-panel px-2 py-1 text-[10px] font-semibold text-primary">
                      구매 완료
                    </span>
                  </div>
                </UiCard>
              </Link>
            ))}
          </div>
        </ScreenSection>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
