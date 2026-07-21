import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ArtistActions } from "@/components/artist-actions";
import { ArtistProfileStats } from "@/components/artist-profile-stats";
import { ArtistProfileTabs } from "@/components/artist-profile-tabs";
import { BottomNav } from "@/components/bottom-nav";
import { CreatorCommissionPublicCard } from "@/components/creator-commission-public-card";
import { FollowListDialog } from "@/components/follow-list-dialog";
import { MobileHeader } from "@/components/mobile-header";
import { ProfileBioText } from "@/components/profile-bio-text";
import { ProfileAvatar } from "@/components/profile-avatar";
import {
  artworkDetails,
  commissionOfferDetails,
  getArtistSeries,
} from "@/lib/catalog-data";
import { getArtistProfiles, getArtistSocialGraph } from "@/lib/feed-data";
import { getArtistResource } from "@/lib/server-data";
import { getTagSearchHref } from "@/lib/tag-search";

type ArtistPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: ArtistPageProps): Promise<Metadata> {
  const { username } = await params;
  const resource = await getArtistResource(decodeURIComponent(username));

  return {
    title: resource ? `${resource.profile.displayName} | Artroom` : "작가 | Artroom",
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { username } = await params;
  const resource = await getArtistResource(decodeURIComponent(username));

  if (!resource) {
    notFound();
  }

  const { posts, profile } = resource;
  const socialGraph = getArtistSocialGraph(profile.username);
  const allProfiles = getArtistProfiles();
  const profileArtworks = artworkDetails.filter(
    (artwork) => artwork.creator.username === profile.username,
  );
  const profileCommissions = commissionOfferDetails.filter(
    (commission) => commission.creator.username === profile.username,
  );
  const profileSeries = getArtistSeries(profile.username);
  const profileEntrypoints = [
    ...(profile.stats.works > 0
      ? [
          {
            description: `등록된 작품 ${profile.stats.works}개`,
            href: "#profile-content",
            title: "작품 보기",
          },
        ]
      : []),
    ...profileCommissions.slice(0, 1).map(() => ({
      description: `열려 있는 커미션 ${profileCommissions.length}개`,
      href: "#profile-commissions",
      title: "커미션 안내",
    })),
  ];

  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref="/search"
        title={profile.displayName}
      />
      <main className="pb-24">
        <section className="bg-white px-6 pb-6 pt-5">
          <div className="flex items-start gap-4">
            <ProfileAvatar size={72} />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-black">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-xs font-medium text-muted">
                @{profile.username}
              </p>
              <FollowListDialog
                allProfiles={allProfiles}
                ownerDisplayName={profile.displayName}
                ownerUsername={profile.username}
                socialGraph={socialGraph}
              />
            </div>
          </div>

          <p className="mt-5 text-sm font-semibold text-black">{profile.coverTitle}</p>
          <ProfileBioText
            className="mt-3 text-xs leading-5 text-foreground"
            fallbackBio={profile.bio}
            username={profile.username}
          />

          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.tags.map((tag) => (
              <Link
                className="flex min-h-7 items-center justify-center rounded-md bg-white px-2 py-1.5 text-sm font-semibold leading-none text-subtle transition-colors hover:bg-panel"
                href={getTagSearchHref(tag)}
                key={tag}
              >
                {tag}
              </Link>
            ))}
          </div>

          <ArtistProfileStats
            artworks={profileArtworks}
            commissionsCount={profileCommissions.length}
            posts={posts}
            profile={profile}
          />

          {profileEntrypoints.length ? (
            <div className="mt-5 grid gap-2">
              {profileEntrypoints.map((entrypoint) => (
                <Link
                  className="flex items-center justify-between gap-3 rounded-md bg-white p-3 transition-colors hover:bg-panel"
                  href={entrypoint.href}
                  key={entrypoint.title}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-black">
                      {entrypoint.title}
                    </span>
                    <span className="mt-1 block truncate text-xs font-medium text-muted">
                      {entrypoint.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    보기
                  </span>
                </Link>
              ))}
            </div>
          ) : null}

          <ArtistActions
            artistUsername={profile.username}
            initialFollowing={profile.isFollowing}
            membershipLabel={profile.membershipLabel}
          />
        </section>

        {profileCommissions.length ? (
          <section className="mt-2 bg-white px-6 py-5" id="profile-commissions">
            <h2 className="text-base font-semibold">커미션 안내</h2>
            <div className="mt-4 grid gap-3">
              {profileCommissions.map((commission) => (
                <Link
                  className="block rounded-md bg-white p-3 transition-colors hover:bg-panel"
                  href={commission.href}
                  key={commission.slug}
                >
                  <p className="truncate text-sm font-semibold text-black">
                    {commission.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {commission.priceLabel}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-foreground">
                    {commission.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <CreatorCommissionPublicCard
          hasStaticCommissions={profileCommissions.length > 0}
          username={profile.username}
        />

        <div id="profile-content">
          <ArtistProfileTabs
            artworks={profileArtworks}
            posts={posts}
            profile={profile}
            series={profileSeries}
          />
        </div>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
