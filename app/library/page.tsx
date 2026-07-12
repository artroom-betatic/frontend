import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { LibraryClient } from "@/components/library-client";
import { MobileHeader } from "@/components/mobile-header";
import { artworkDetails } from "@/lib/catalog-data";
import { getFeedPosts } from "@/lib/feed-data";

export const metadata: Metadata = {
  title: "내 소장함 | Artroom",
};

export default function LibraryPage() {
  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/my" title="내 소장함" />
      <LibraryClient artworks={artworkDetails} feedPosts={getFeedPosts()} />
      <BottomNav />
    </AppFrame>
  );
}
