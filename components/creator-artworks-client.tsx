"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { ContentListCard } from "@/components/content-list-card";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";
import {
  defaultCreatorArtworks,
  formatCreatorArtworkPrice,
  getCreatorArtworkSaleTypeLabel,
  getCreatorArtworkStatusLabel,
  readCreatorArtworks,
  removeCreatorArtwork,
  subscribeCreatorArtworksChange,
} from "@/lib/creator-artworks";
import {
  clearRouteToast,
  readRouteToast,
  subscribeRouteToastChange,
} from "@/lib/route-toast";

export function CreatorArtworksClient() {
  const artworks = useSyncExternalStore(
    subscribeCreatorArtworksChange,
    readCreatorArtworks,
    () => defaultCreatorArtworks,
  );
  const toastMessage = useSyncExternalStore(
    subscribeRouteToastChange,
    readRouteToast,
    () => "",
  );
  const publishedCount = artworks.filter(
    (artwork) => artwork.status === "published",
  ).length;
  const draftCount = artworks.filter((artwork) => artwork.status === "draft").length;
  const summary = [
    { label: "공개", value: String(publishedCount) },
    { label: "초안", value: String(draftCount) },
    { label: "전체", value: String(artworks.length) },
  ];

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(clearRouteToast, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  return (
    <main className="px-6 pb-24 pt-5">
      <p className="text-sm font-medium leading-6 text-subtle">
        내가 등록했거나 판매 준비 중인 작품을 확인합니다.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {summary.map((item) => (
          <UiCard className="bg-white p-3 text-center" key={item.label}>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
            <p className="mt-1 text-2xs text-muted">{item.label}</p>
          </UiCard>
        ))}
      </div>

      <ScreenSection title="작품 목록">
        <div className="grid gap-3">
          {artworks.map((artwork) => (
            <div className="grid gap-2" key={artwork.id}>
              <ContentListCard
                badge={getCreatorArtworkStatusLabel(artwork.status)}
                description={artwork.description}
                imageAlt={artwork.imageAlt}
                imageSrc={artwork.imageSrc}
                meta={`${getCreatorArtworkSaleTypeLabel(
                  artwork.saleType,
                )} · ${formatCreatorArtworkPrice(artwork.price)}`}
                title={artwork.title}
              />
              <button
                className="justify-self-end rounded-md bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-panel"
                onClick={() => {
                  if (window.confirm("정말 삭제할 것입니까?")) {
                    removeCreatorArtwork(artwork.id);
                  }
                }}
                type="button"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </ScreenSection>

      <Link
        className="mt-6 flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white"
        href="/creator/artworks/new"
      >
        새 작품 등록하기
      </Link>

      {toastMessage ? (
        <div
          aria-live="polite"
          className="fixed left-1/2 top-1/2 z-40 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-6"
          role="status"
        >
          <div className="rounded-md bg-foreground/65 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </main>
  );
}
