import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { ContentListCard } from "@/components/content-list-card";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { artworkDetails } from "@/lib/catalog-data";

export const metadata: Metadata = {
  title: "갤러리 | Artroom",
  description: "Artroom의 작품 목록입니다.",
};

export default function GalleryPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="갤러리" />
      <main className="px-6 pb-24 pt-5">
        <p className="text-xs leading-5 text-muted">
          구매 가능한 디지털 작품과 설정집을 모아봅니다.
        </p>

        <ScreenSection title="작품">
          <div className="grid gap-4">
            {artworkDetails.map((artwork) => (
              <ContentListCard
                badge={artwork.priceLabel}
                description={artwork.description}
                href={artwork.href}
                imageAlt={artwork.imageAlt}
                imageSrc={artwork.imageSrc}
                key={artwork.slug}
                meta={`@${artwork.creator.username}`}
                subtitle={artwork.subtitle}
                title={artwork.title}
              />
            ))}
          </div>
        </ScreenSection>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
