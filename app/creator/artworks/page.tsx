import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { CreatorArtworksClient } from "@/components/creator-artworks-client";
import { MobileHeader } from "@/components/mobile-header";

export const metadata: Metadata = {
  title: "내 작품 | Artroom",
};

export default function CreatorArtworksPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/my" title="내 작품" />
      <CreatorArtworksClient />
      <BottomNav />
    </AppFrame>
  );
}
