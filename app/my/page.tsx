import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { MyPageClient } from "@/components/my-page-client";
import { artworkDetails, getArtistSeries } from "@/lib/catalog-data";
import { getArtistProfiles, getArtistSocialGraph } from "@/lib/feed-data";
import { joinedMemberships } from "@/lib/membership-data";
import { getArtistResource } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "마이페이지 | Artroom",
};

const currentUsername = "user_123";

export default async function MyPage() {
  const resource = await getArtistResource(currentUsername);
  const socialGraph = getArtistSocialGraph(currentUsername);
  const allProfiles = getArtistProfiles();
  const profileArtworks = artworkDetails.filter(
    (artwork) => artwork.creator.username === currentUsername,
  );
  const profileSeries = getArtistSeries(currentUsername);

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="마이페이지" />
      <MyPageClient
        allProfiles={allProfiles}
        artworks={profileArtworks}
        collectionCount={artworkDetails.length}
        joinedMembershipCount={joinedMemberships.length}
        posts={resource?.posts ?? []}
        profile={resource?.profile ?? null}
        series={profileSeries}
        socialGraph={socialGraph}
      />
      <BottomNav />
    </AppFrame>
  );
}
