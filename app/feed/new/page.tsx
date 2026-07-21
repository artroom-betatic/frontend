import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { FeedCreateClient } from "@/components/feed-create-client";
import { MobileHeader } from "@/components/mobile-header";
import { getArtistProfiles, getArtistSocialGraph } from "@/lib/feed-data";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";

export const metadata: Metadata = {
  title: "새 피드 | Artroom",
};

export default function FeedCreatePage() {
  const allProfiles = getArtistProfiles();
  const socialGraph = getArtistSocialGraph(MY_PROFILE_USERNAME);

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="새 피드" />
      <FeedCreateClient allProfiles={allProfiles} socialGraph={socialGraph} />
      <BottomNav />
    </AppFrame>
  );
}
